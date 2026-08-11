// 把 原校区指南-md文档整理/ 的六份长文档重排成 原校区指南-wiki/ 的一页一主题结构。
//
//   node scripts/migrate-to-wiki.mjs --dry-run    # 只看分页方案，不写文件
//   node scripts/migrate-to-wiki.mjs              # 真正写出 wiki
//   node scripts/migrate-to-wiki.mjs --model=deepseek-reasoner
//
// 需要 DEEPSEEK_API_KEY（一次性，产物提交进仓库，线上运行时不调模型）。
//
// ── 安全底线：模型只做分类和写元数据，绝不碰正文 ──────────────────
// 正文由脚本按 unit 下标从源文件**逐字复制**。源文档每条事实都带 [源图 Pxx] 溯源、
// 并列保留了矛盾信息（江北菜鸟驿站两处位置）、有 2 人评审流程——让模型复述正文
// 等于把这些质量保证全部作废。模型输出只用于：分到哪一页、标题、摘要、关键词、
// 别名、相关页。分完之后 verify-wiki.mjs 会逐字比对回源文件。
//
// ── 为什么拆成两次调用 ────────────────────────────────────────
// ① 分页：输出只有 key + 下标，很短，不会被 max_tokens 截断。
// ② 元数据：每页一次，喂**整页正文**而不是 180 字预览——摘要和别名的质量差别很大。
// 一次调用全做完的话，47 个单元的校区会把输出撑爆（实测 finish_reason=length）。

import fs from "node:fs/promises";
import path from "node:path";
import { complete } from "../lib/deepseek.mjs";
import { listLegacyGuides, wikiDir, keyToSlug, extractPages } from "./guide-source.mjs";

const dryRun = process.argv.includes("--dry-run");
const modelArg = process.argv.find((a) => a.startsWith("--model="))?.split("=")[1];
// 默认用非推理模型：这是结构化分类任务，推理 token 只会挤占输出预算
const MODEL = modelArg || "deepseek-chat";

const ASSIGN_SYSTEM = [
  "你在把一份校园生活指南重排成 wiki 结构。这一步只做分类，不要写任何正文。",
  "把给定的内容单元分配到给定的知识分块（chunk key）上。",
  "",
  "硬性要求：",
  "1. 每个单元下标必须且只能出现在一个页面的 units 里，不得遗漏、不得重复。全部下标都要分掉。",
  "2. 优先使用「已声明的分块」列表里的 key。只有当某些单元确实不属于任何已声明 key 时，才新增 key（小写下划线命名）。",
  "3. 同一页里的单元应当在原文里语义相邻、主题一致。",
  "4. chunk_key 不能重复，一个 key 只能出现一次。",
  "5. 已声明的分块只是**建议**。如果原文实际不是按那个维度组织的（例如声明了按宿舍区分的三个 key，",
  "   但原文的宿舍章节是按「床品/热水/门禁」这类主题写的、并不分区），就不要硬拆，也**绝对不要**把同一批",
  "   单元重复分给多个 key。这种情况下合成一页，并选一个能概括全部内容的 key（可以是新 key）。",
  "   宁可少用几个已声明的 key，也不要重复分配或起误导性的名字。",
  "",
  '只输出 JSON：{"pages":[{"chunk_key":"...","units":[0,1]}]}',
].join("\n");

const META_SYSTEM = [
  "你在为一个校园指南 wiki 页面写检索元数据。**不要复述、改写或总结正文**，只输出下面这些字段。",
  "",
  "- title：中文短标题，不超过 20 字，不带章节编号。",
  "- summary：一句话，40—70 字，必须写进这一页最关键的**具体事实**（楼栋名、时间、价格、线路名等）。",
  "  它的用途是让检索和模型快速判断该不该翻开这一页，所以不要写「本页介绍了……」这种空话。",
  "- keywords：6—12 个名词，必须是正文里**真实出现**的词（地点名、设施名、线路名）。",
  "- alias_pairs：4—10 组「学生口语说法 → 这一页正文里对应的书面词」，用于检索同义词扩展。",
  "  系统会在检索前把 spoken 替换/补成 written 再去匹配，所以这是一一对应的**词义**关系，",
  "  不是「本页相关词」的罗列。配错会直接把检索引到无关章节上。",
  "  · written 必须是本页正文里**真实出现**的词，且与 spoken 指同一件事；",
  "  · spoken 必须是正文里**没有**、但学生真的会用的说法；",
  "  · 本页没有对应概念就不要硬凑，宁可少给几组。",
  '  例：{"spoken":"剪头发","written":"理发"}、{"spoken":"洗澡","written":"浴室"}、',
  '      {"spoken":"床帘多大","written":"床铺尺寸"}、{"spoken":"网速","written":"校园网"}。',
  '  反例（严禁）：{"spoken":"剪头发","written":"外卖"}——两者毫无关系，只是碰巧同页。',
  "- related：1—3 个其他 chunk key（只能从给定的候选列表里选），指向学生大概率接着会问的页面。",
  "",
  '只输出 JSON：{"title":"...","summary":"...","keywords":[],"alias_pairs":[{"spoken":"...","written":"..."}],"related":[]}',
].join("\n");

function parseJson(text, label) {
  const cleaned = String(text || "").replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  if (!cleaned) throw new Error(`${label}: 模型返回空内容（多半是 max_tokens 不够）`);
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`${label}: 返回的不是合法 JSON（${error.message}）\n${cleaned.slice(0, 300)}`);
  }
}

async function ask({ system, user, maxTokens, label }) {
  const reply = await complete({
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    maxTokens,
    temperature: 0.2,
    timeoutMs: 180_000,
    model: MODEL,
    responseFormat: { type: "json_object" },
  });
  const choice = reply.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error(`${label}: 输出被 max_tokens 截断，调大再试`);
  }
  return parseJson(choice?.message?.content, label);
}

function buildAssignPrompt(guide) {
  const units = guide.units.map((unit, index) => {
    const preview = unit.text.replace(/\s+/g, " ").slice(0, 180);
    return `[${index}] 章节「${unit.sectionTitle}」${unit.subTitle ? ` / 小节「${unit.subTitle}」` : "（章节引言）"}\n     ${preview}`;
  });
  return [
    `校区：${guide.campus.name}（${guide.version}）`,
    "",
    `已声明的知识分块（共 ${guide.chunkKeys.length} 个，来自原文「建议的知识分块」一节）：`,
    ...guide.chunkKeys.map((key) => `  - ${key}`),
    "",
    `内容单元（共 ${guide.units.length} 个，下标 0—${guide.units.length - 1}）：`,
    ...units,
  ].join("\n");
}

function buildMetaPrompt(guide, page, body, candidateKeys) {
  return [
    `校区：${guide.campus.name}（${guide.version}）`,
    `本页 chunk key：${page.chunk_key}`,
    "",
    `related 只能从这些 key 里选（不含本页自己）：`,
    candidateKeys.filter((key) => key !== page.chunk_key).join("、"),
    "",
    "本页正文：",
    "---",
    body.slice(0, 6000),
    "---",
  ].join("\n");
}

/**
 * 校验并修复模型的分配结果。
 * 漏分/重复分是常态，不能直接信；但也不该整轮失败——自动补齐并把补了什么打出来，人可复核。
 */
function reconcile(guide, rawPages) {
  const issues = [];
  const assigned = new Map();

  // 先按 chunk_key 合并：同名页会写到同一个文件名，不合并就是后者覆盖前者、内容静默丢失。
  const pages = [];
  const byKey = new Map();
  for (const page of rawPages) {
    const key = String(page.chunk_key || "").trim();
    if (!key) continue;
    const existing = byKey.get(key);
    if (existing) {
      existing.units = [...(existing.units || []), ...(page.units || [])];
      issues.push(`两个页面都叫 ${key}，已合并（否则会覆盖同一个文件）`);
      continue;
    }
    const copy = { ...page, chunk_key: key };
    byKey.set(key, copy);
    pages.push(copy);
  }

  for (const page of pages) {
    page.units = (Array.isArray(page.units) ? page.units : [])
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 0 && n < guide.units.length);
    for (const index of [...page.units]) {
      if (assigned.has(index)) {
        issues.push(`单元 ${index} 被重复分配（${assigned.get(index).chunk_key} / ${page.chunk_key}），保留前者`);
        page.units = page.units.filter((n) => n !== index);
        continue;
      }
      assigned.set(index, page);
    }
  }

  for (let index = 0; index < guide.units.length; index += 1) {
    if (assigned.has(index)) continue;
    const unit = guide.units[index];
    const sibling = pages.find((page) =>
      page.units.some((n) => guide.units[n].sectionTitle === unit.sectionTitle));
    if (sibling) {
      sibling.units.push(index);
      assigned.set(index, sibling);
      issues.push(`单元 ${index}（${unit.subTitle ?? unit.sectionTitle}）漏分，已并入 ${sibling.chunk_key}`);
    } else {
      const fallback = {
        chunk_key: `section_${String(index).padStart(2, "0")}`,
        units: [index],
      };
      pages.push(fallback);
      assigned.set(index, fallback);
      issues.push(`单元 ${index}（${unit.subTitle ?? unit.sectionTitle}）漏分且无同章节页面，已单独成页 ${fallback.chunk_key}`);
    }
  }

  // 单元按原文顺序排，页面按各自最小单元下标排——wiki 的阅读顺序跟着原文走
  for (const page of pages) page.units.sort((a, b) => a - b);
  const ordered = pages.filter((page) => page.units.length).sort((a, b) => a.units[0] - b.units[0]);

  const declared = new Set(guide.chunkKeys);
  for (const page of ordered) {
    if (!declared.has(page.chunk_key)) issues.push(`新增了原文未声明的 key：${page.chunk_key}`);
  }
  for (const key of guide.chunkKeys) {
    if (!ordered.some((page) => page.chunk_key === key)) issues.push(`已声明但没有页面使用：${key}`);
  }
  return { pages: ordered, issues };
}

function yamlList(values) {
  return `[${(values || []).map((v) => JSON.stringify(String(v))).join(", ")}]`;
}

function renderPage(guide, page) {
  const front = [
    "---",
    `id: ${guide.campus.slug}/${keyToSlug(page.chunk_key)}`,
    `campus: ${guide.campus.slug}`,
    `chunk_key: ${page.chunk_key}`,
    `title: ${JSON.stringify(String(page.title || keyToSlug(page.chunk_key)))}`,
    `summary: ${JSON.stringify(String(page.summary || ""))}`,
    `keywords: ${yamlList(page.keywords)}`,
    `alias_pairs: ${JSON.stringify(page.aliasPairs || [])}`,
    `pages: ${yamlList(extractPages(page.body))}`,
    `related: ${yamlList((page.related || []).map((key) => `${guide.campus.slug}/${keyToSlug(key)}`))}`,
    // --metadata-only 模式下没有 units，直接沿用页面里已有的 source_sections
    `source_sections: ${yamlList(page.units
      ? [...new Set(page.units.map((i) => guide.units[i].sectionTitle))]
      : (page.sourceSections || []))}`,
    "---",
    "",
  ].join("\n");
  return `${front}${page.body}\n`;
}

function renderCampusHome(guide) {
  const front = [
    "---",
    `campus: ${guide.campus.slug}`,
    `name: ${JSON.stringify(guide.campus.name)}`,
    `version: ${JSON.stringify(guide.version)}`,
    `aliases: ${yamlList(guide.campus.aliases)}`,
    `license: ${JSON.stringify(guide.meta.license)}`,
    `source_author: ${JSON.stringify(guide.meta.source_author)}`,
    `source_file: ${JSON.stringify(guide.file)}`,
    "---",
    "",
  ].join("\n");
  const parts = [front, `# ${guide.campus.name}`, ""];
  if (guide.notice) parts.push("## 时效提醒", "", guide.notice, "");
  if (guide.answerRules) parts.push("## 回答规则", "", guide.answerRules, "");
  if (guide.templates) parts.push("## 推荐回答模板", "", guide.templates, "");
  if (guide.credits) parts.push("## 版权与署名", "", guide.credits, "");
  return `${parts.join("\n")}\n`;
}

function renderIndex(all) {
  const lines = [
    "---", "kind: index", "---", "",
    "# 东南大学六校区指南 wiki", "",
    "由 scripts/migrate-to-wiki.mjs 从 原校区指南-md文档整理/ 生成。",
    "正文逐字来自原指南；元数据（摘要/关键词/别名/相关页）由模型生成，需人工复核。",
    "校验：node scripts/verify-wiki.mjs", "",
  ];
  for (const { guide, pages } of all) {
    lines.push(`## ${guide.campus.name}（${guide.version}）`, "");
    for (const page of pages) {
      lines.push(`- [${page.title}](${guide.campus.slug}/${keyToSlug(page.chunk_key)}.md) — ${page.summary || "（无摘要）"}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

/**
 * 别名表：口语词 → 指南用词。检索期用它做查询扩展，治「剪头发」查不到「理发」。
 *
 * 只收模型明确给出的一一对应词对，并且要求 written 确实出现在该页正文里——
 * 早期版本图省事，把别名映射到「本页全部 keywords」，结果
 * 「剪头发 → 外卖/万购/中超」这种噪声进了表，查询扩展反而会把检索带偏。
 */
async function readSeedAliases() {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(wikiDir, "aliases.seed.json"), "utf8"));
    return Object.fromEntries(Object.entries(raw).filter(([key]) => !key.startsWith("_")));
  } catch {
    return {};
  }
}

function buildAliases(all, seed = {}) {
  // 种子表先进，且后面不允许被模型的词对覆盖——它是人工维护的既定结论
  const table = Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, [...v]]));
  const seeded = new Set(Object.keys(table));
  let rejected = 0;
  for (const { pages } of all) {
    for (const page of pages) {
      for (const pair of page.aliasPairs || []) {
        const spoken = String(pair.spoken || "").trim();
        const written = String(pair.written || "").trim();
        if (spoken.length < 2 || written.length < 2 || spoken === written) {
          rejected += 1;
          continue;
        }
        // written 必须真的在正文里，否则扩展出来的词在知识库里根本匹配不到
        if (!page.body.includes(written)) {
          rejected += 1;
          continue;
        }
        if (seeded.has(spoken)) continue; // 人工结论优先
        const merged = new Set([...(table[spoken] || []), written]);
        table[spoken] = [...merged].slice(0, 6);
      }
    }
  }
  const sorted = Object.fromEntries(Object.entries(table).sort(([a], [b]) => a.localeCompare(b, "zh")));
  return { table: sorted, rejected, seededCount: seeded.size };
}

function applyMeta(page, meta, candidateKeys) {
  page.title = meta.title;
  page.summary = meta.summary;
  page.keywords = Array.isArray(meta.keywords) ? meta.keywords : [];
  page.aliasPairs = Array.isArray(meta.alias_pairs) ? meta.alias_pairs : [];
  page.related = (Array.isArray(meta.related) ? meta.related : [])
    .filter((key) => candidateKeys.includes(key) && key !== page.chunk_key);
}

/**
 * 只重算元数据，不动分页。
 *
 * 分页方案一旦被 verify-wiki 逐字校验通过就是可信的，不该为了改摘要/别名的写法
 * 重跑一遍分类——重跑意味着重新赌一次分页质量。这个模式读回已有的 wiki 页面，
 * 正文和 chunk_key 原样保留，只重新生成 front-matter。
 */
async function metadataOnly() {
  const guides = await listLegacyGuides();
  const all = [];
  for (const guide of guides) {
    const dir = path.join(wikiDir, guide.campus.slug);
    const names = (await fs.readdir(dir)).filter((n) => n.endsWith(".md") && n !== "_campus.md").sort();
    const pages = [];
    for (const name of names) {
      const raw = await fs.readFile(path.join(dir, name), "utf8");
      const matched = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
      if (!matched) throw new Error(`${guide.campus.slug}/${name}: 缺少 front-matter`);
      const keyLine = /^chunk_key:\s*(.+)$/m.exec(matched[1]);
      const sectionsLine = /^source_sections:\s*(.+)$/m.exec(matched[1]);
      pages.push({
        chunk_key: keyLine ? keyLine[1].trim() : path.basename(name, ".md").replace(/-/g, "_"),
        sourceSections: sectionsLine ? JSON.parse(sectionsLine[1]) : [],
        body: raw.slice(matched[0].length).trim(),
      });
    }
    const candidateKeys = pages.map((page) => page.chunk_key);
    console.log(`\n【${guide.campus.name}】${pages.length} 页，重算元数据…`);
    for (const page of pages) {
      const meta = await ask({
        system: META_SYSTEM,
        user: buildMetaPrompt(guide, page, page.body, candidateKeys),
        maxTokens: 1200,
        label: `${guide.campus.name}/${page.chunk_key} 元数据`,
      });
      applyMeta(page, meta, candidateKeys);
      const pairs = (page.aliasPairs || []).map((p) => `${p.spoken}→${p.written}`).join(" ");
      console.log(`   ${keyToSlug(page.chunk_key).padEnd(34)} ${page.title}`);
      if (pairs) console.log(`      别名 ${pairs}`);
    }
    all.push({ guide, pages });
  }
  return all;
}

async function writeAll(all, { rewriteHomes }) {
  for (const { guide, pages } of all) {
    const dir = path.join(wikiDir, guide.campus.slug);
    await fs.mkdir(dir, { recursive: true });
    if (rewriteHomes) await fs.writeFile(path.join(dir, "_campus.md"), renderCampusHome(guide), "utf8");
    for (const page of pages) {
      await fs.writeFile(path.join(dir, `${keyToSlug(page.chunk_key)}.md`), renderPage(guide, page), "utf8");
    }
  }
  await fs.writeFile(path.join(wikiDir, "_index.md"), renderIndex(all), "utf8");
  // 别名表不在这里落盘：它由 build-knowledge.mjs 从各页的 alias_pairs + aliases.seed.json
  // 合成进 data/knowledge.mjs。少一份中间产物，改种子表也不用重跑模型。
  const { table, rejected } = buildAliases(all, await readSeedAliases());
  return { aliasCount: Object.keys(table).length, rejected };
}

async function main() {
  if (process.argv.includes("--metadata-only")) {
    const all = await metadataOnly();
    const { aliasCount, rejected } = await writeAll(all, { rewriteHomes: false });
    console.log(`\n元数据已重写。别名表 ${aliasCount} 条（丢弃 ${rejected} 组不合格词对）。`);
    console.log("下一步：node scripts/verify-wiki.mjs && npm run build:knowledge");
    return;
  }

  const guides = await listLegacyGuides();
  const all = [];
  const allIssues = [];

  for (const guide of guides) {
    process.stdout.write(`\n【${guide.campus.name}】${guide.units.length} 个单元 → 分页…`);
    const assigned = await ask({
      system: ASSIGN_SYSTEM,
      user: buildAssignPrompt(guide),
      maxTokens: 4000,
      label: `${guide.campus.name} 分页`,
    });

    const { pages, issues } = reconcile(guide, Array.isArray(assigned.pages) ? assigned.pages : []);
    console.log(` ${pages.length} 页`);
    for (const issue of issues) {
      console.log(`   ⚠ ${issue}`);
      allIssues.push(`${guide.campus.slug}: ${issue}`);
    }

    const candidateKeys = pages.map((page) => page.chunk_key);
    for (const page of pages) {
      page.body = page.units.map((index) => guide.units[index].text).join("\n\n");
      if (dryRun) {
        page.title = page.chunk_key;
        page.summary = "";
        continue;
      }
      const meta = await ask({
        system: META_SYSTEM,
        user: buildMetaPrompt(guide, page, page.body, candidateKeys),
        maxTokens: 1200,
        label: `${guide.campus.name}/${page.chunk_key} 元数据`,
      });
      applyMeta(page, meta, candidateKeys);
      console.log(`   ${keyToSlug(page.chunk_key).padEnd(34)} ${String(page.units.length).padStart(2)}单元 ${String(page.body.length).padStart(5)}字  ${page.title}`);
    }
    if (dryRun) {
      for (const page of pages) {
        console.log(`   ${keyToSlug(page.chunk_key).padEnd(34)} ${String(page.units.length).padStart(2)}单元 ${String(page.body.length).padStart(5)}字  ← ${page.units.map((i) => guide.units[i].subTitle ?? "引言").join(" / ")}`);
      }
    }
    all.push({ guide, pages });
  }

  if (dryRun) {
    console.log("\n--dry-run：未写任何文件，也未生成元数据。");
    return;
  }

  await fs.rm(wikiDir, { recursive: true, force: true });
  await fs.mkdir(wikiDir, { recursive: true });
  const { aliasCount, rejected } = await writeAll(all, { rewriteHomes: true });

  const fileCount = all.reduce((n, item) => n + item.pages.length + 1, 0) + 2;
  console.log(`\n写出 ${fileCount} 个文件到 ${path.relative(process.cwd(), wikiDir)}/`);
  console.log(`别名表 ${aliasCount} 条（丢弃 ${rejected} 组不合格词对）。`);
  if (allIssues.length) console.log(`\n${allIssues.length} 处需要人工复核（见上面的 ⚠）。`);
  console.log("下一步：node scripts/verify-wiki.mjs —— 逐字比对回源文件，不通过不要提交。");
}

await main();
