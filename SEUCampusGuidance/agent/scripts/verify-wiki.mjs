// 原校区指南-wiki/ 的安全闸门：逐字比对回 原校区指南-md文档整理/。
//
//   node scripts/verify-wiki.mjs
//
// 迁移的真正风险不是报错，是**静默丢内容**——少一行表格、漏一个 [源图 Pxx] 溯源标记，
// 跑起来一切正常，只是 agent 从此答不出那条事实。所以校验必须是机械的、逐字的。
//
// 核心断言：把源文件切成内容单元后，每个单元的正文必须在 wiki 里**一字不差地出现恰好一次**。
// 这比「字符覆盖率 ≥ 99%」强得多：覆盖率 99% 也可能是一张表被拦腰截断。

import fs from "node:fs/promises";
import path from "node:path";
import { listLegacyGuides, wikiDir, extractPages } from "./guide-source.mjs";

const problems = [];
const notes = [];
let checks = 0;

function fail(message) {
  problems.push(message);
}

function pass() {
  checks += 1;
}

/** 极简 front-matter 解析。只需要支持迁移脚本自己写出来的那几种形态。 */
function parseFront(source, file) {
  const matched = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!matched) return [null, source];
  const meta = {};
  for (const line of matched[1].split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at < 0) continue;
    const key = line.slice(0, at).trim();
    const raw = line.slice(at + 1).trim();
    if (raw.startsWith("[")) {
      try {
        meta[key] = JSON.parse(raw);
      } catch {
        fail(`${file}: front-matter 字段 ${key} 不是合法数组：${raw.slice(0, 60)}`);
        meta[key] = [];
      }
    } else if (raw.startsWith('"')) {
      try {
        meta[key] = JSON.parse(raw);
      } catch {
        meta[key] = raw.replace(/^"|"$/g, "");
      }
    } else {
      meta[key] = raw;
    }
  }
  return [meta, source.slice(matched[0].length)];
}

async function readWikiPages() {
  let entries;
  try {
    entries = await fs.readdir(wikiDir, { withFileTypes: true });
  } catch {
    console.error(`找不到 ${wikiDir}\n先跑：node scripts/migrate-to-wiki.mjs`);
    process.exit(1);
  }
  const pages = [];
  const homes = new Map();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(wikiDir, entry.name);
    for (const name of (await fs.readdir(dir)).sort()) {
      if (!name.endsWith(".md")) continue;
      const file = path.join(entry.name, name);
      const source = await fs.readFile(path.join(dir, name), "utf8");
      const [meta, body] = parseFront(source, file);
      if (!meta) {
        fail(`${file}: 缺少 front-matter`);
        continue;
      }
      if (name === "_campus.md") homes.set(entry.name, { file, meta, body });
      else pages.push({ file, campus: entry.name, meta, body: body.trim() });
    }
  }
  return { pages, homes };
}

const guides = await listLegacyGuides();
const { pages, homes } = await readWikiPages();

// ── 1. 每个校区都有首页，且元数据对得上 ────────────────────────
for (const guide of guides) {
  const home = homes.get(guide.campus.slug);
  if (!home) {
    fail(`${guide.campus.slug}: 缺少 _campus.md`);
    continue;
  }
  pass();
  if (home.meta.version !== guide.version) {
    fail(`${guide.campus.slug}/_campus.md: version 是「${home.meta.version}」，源文件是「${guide.version}」`);
  } else pass();

  // 时效提醒和回答规则会被注入 system prompt，丢了 agent 的行为会静默变化
  for (const [label, text] of [["时效提醒", guide.notice], ["回答规则", guide.answerRules]]) {
    if (!text) continue;
    if (!home.body.includes(text)) fail(`${guide.campus.slug}/_campus.md: ${label}与源文件不一致`);
    else pass();
  }
}

// ── 2. 核心断言：每个源单元在 wiki 里逐字出现恰好一次 ──────────
const bodiesByCampus = new Map();
for (const page of pages) {
  if (!bodiesByCampus.has(page.campus)) bodiesByCampus.set(page.campus, []);
  bodiesByCampus.get(page.campus).push(page);
}

let unitTotal = 0;
for (const guide of guides) {
  const campusPages = bodiesByCampus.get(guide.campus.slug) || [];
  if (!campusPages.length) {
    fail(`${guide.campus.slug}: 一个内容页都没有`);
    continue;
  }
  for (const [index, unit] of guide.units.entries()) {
    unitTotal += 1;
    const hits = campusPages.filter((page) => page.body.includes(unit.text));
    const label = `${guide.campus.slug} 单元 ${index}「${unit.subTitle ?? unit.sectionTitle}」`;
    if (hits.length === 1) {
      pass();
      continue;
    }
    if (hits.length === 0) {
      // 分不清是丢了还是被改了，给出最接近的页面帮助定位
      const head = unit.text.slice(0, 40);
      const near = campusPages.find((page) => page.body.includes(head));
      fail(`${label} 在 wiki 里找不到逐字副本${near ? `（${near.file} 里有开头 40 字，正文中途被改动）` : "（整段缺失）"}`);
    } else {
      fail(`${label} 出现在 ${hits.length} 个页面里：${hits.map((h) => h.file).join("、")}`);
    }
  }
}

// ── 3. 反向：wiki 里不能有源文件没有的正文 ─────────────────────
for (const guide of guides) {
  const campusPages = bodiesByCampus.get(guide.campus.slug) || [];
  const sourceBlob = guide.units.map((unit) => unit.text).join("\n\n");
  for (const page of campusPages) {
    // 逐段比对，定位比整页比对精确
    for (const block of page.body.split(/\n{2,}/)) {
      const text = block.trim();
      if (text.length < 24) continue; // 跳过短行，噪声太大
      if (sourceBlob.includes(text)) continue;
      fail(`${page.file}: 有一段正文在源文件里找不到 —— ${text.slice(0, 60).replace(/\n/g, " ")}…`);
    }
  }
}

// ── 4. 溯源标记一个都不能少 ───────────────────────────────────
for (const guide of guides) {
  const campusPages = bodiesByCampus.get(guide.campus.slug) || [];
  const wikiBlob = campusPages.map((page) => page.body).join("\n");
  const sourceMarkers = guide.units.flatMap((unit) => [...unit.text.matchAll(/\[源图[^\]]*\]/g)].map((m) => m[0]));
  const missing = new Map();
  for (const marker of sourceMarkers) {
    const inSource = sourceMarkers.filter((m) => m === marker).length;
    const inWiki = wikiBlob.split(marker).length - 1;
    if (inWiki < inSource) missing.set(marker, `${inWiki}/${inSource}`);
  }
  if (missing.size) {
    for (const [marker, ratio] of missing) fail(`${guide.campus.slug}: 溯源标记 ${marker} 只剩 ${ratio}`);
  } else pass();
}

// ── 5. 表格行一行都不能少 ────────────────────────────────────
for (const guide of guides) {
  const campusPages = bodiesByCampus.get(guide.campus.slug) || [];
  const wikiBlob = campusPages.map((page) => page.body).join("\n");
  let rows = 0;
  let lost = 0;
  for (const unit of guide.units) {
    for (const line of unit.text.split("\n")) {
      if (!/^\s*\|.*\|\s*$/.test(line)) continue;
      rows += 1;
      if (!wikiBlob.includes(line.trim())) {
        lost += 1;
        if (lost <= 3) fail(`${guide.campus.slug}: 表格行丢失 —— ${line.trim().slice(0, 70)}`);
      }
    }
  }
  if (!lost) pass();
  else if (lost > 3) fail(`${guide.campus.slug}: 共 ${lost}/${rows} 行表格丢失（只列出前 3 条）`);
  notes.push(`${guide.campus.slug} 表格行 ${rows - lost}/${rows}`);
}

// ── 6. front-matter 结构合法 ─────────────────────────────────
const idSet = new Set();
for (const page of pages) {
  const meta = page.meta;
  for (const field of ["id", "campus", "chunk_key", "title", "summary"]) {
    if (!meta[field]) fail(`${page.file}: front-matter 缺 ${field}`);
  }
  for (const field of ["keywords", "alias_pairs", "pages", "related"]) {
    if (!Array.isArray(meta[field])) fail(`${page.file}: ${field} 应当是数组`);
  }
  if (meta.campus !== page.campus) fail(`${page.file}: campus 字段「${meta.campus}」与目录名不符`);
  if (idSet.has(meta.id)) fail(`id 重复：${meta.id}`);
  idSet.add(meta.id);
  if (meta.summary && String(meta.summary).length < 10) {
    fail(`${page.file}: summary 太短（「${meta.summary}」），检索时起不到作用`);
  }
  // pages 字段必须和正文里真实的 [源图 Pxx] 一致，否则「答案标注了第几页」就是错的
  const actual = extractPages(page.body).join(",");
  const declared = (meta.pages || []).join(",");
  if (actual !== declared) fail(`${page.file}: pages 声明 [${declared}]，正文实际是 [${actual}]`);
}
if (pages.length) pass();

// ── 7. related 链接必须指向真实存在的页面 ─────────────────────
for (const page of pages) {
  for (const target of page.meta.related || []) {
    if (!idSet.has(target)) fail(`${page.file}: related 指向不存在的页面 ${target}`);
  }
  if (!(page.meta.related || []).length) {
    notes.push(`${page.file} 没有 related（不致命，但少了导航）`);
  }
}
pass();

// ── 8. 别名种子表可用，且核心用例还在 ─────────────────────────
try {
  const seedRaw = JSON.parse(await fs.readFile(path.join(wikiDir, "aliases.seed.json"), "utf8"));
  const seed = Object.fromEntries(Object.entries(seedRaw).filter(([key]) => !key.startsWith("_")));
  // 这几条是 tools.mjs / prompt.mjs 里点名的真实痛点，丢了等于检索层退回改动前
  for (const term of ["剪头发", "洗澡", "网速", "床帘多大"]) {
    if (!Array.isArray(seed[term]) || !seed[term].length) {
      fail(`aliases.seed.json 缺少核心用例「${term}」——它是 tools.mjs 注释里点名的痛点`);
    } else pass();
  }
  for (const [term, targets] of Object.entries(seed)) {
    if (!Array.isArray(targets) || !targets.length) fail(`aliases.seed.json:「${term}」没有目标词`);
    if (targets.includes(term)) fail(`aliases.seed.json:「${term}」映射到了自己`);
  }
  notes.push(`别名种子表 ${Object.keys(seed).length} 条`);
} catch (error) {
  fail(`读不到 aliases.seed.json：${error.message}`);
}

const pairCount = pages.reduce((n, page) => n + (page.meta.alias_pairs || []).length, 0);
if (pairCount < 100) fail(`各页 alias_pairs 合计只有 ${pairCount} 组，太少`);
else pass();
notes.push(`各页 alias_pairs 合计 ${pairCount} 组`);

// ── 报告 ─────────────────────────────────────────────────────
console.log(`wiki 校验：${pages.length} 个内容页 / ${homes.size} 个校区首页 / ${unitTotal} 个源单元`);
for (const note of notes.slice(0, 12)) console.log(`  · ${note}`);
if (notes.length > 12) console.log(`  · …另有 ${notes.length - 12} 条`);

if (problems.length) {
  console.error(`\n✗ ${problems.length} 个问题：\n`);
  for (const problem of problems.slice(0, 40)) console.error(`  - ${problem}`);
  if (problems.length > 40) console.error(`  …另有 ${problems.length - 40} 条`);
  console.error("\n不要提交，先修迁移脚本。");
  process.exit(1);
}

console.log(`\n✓ 全部通过（${checks} 项断言）。wiki 内容与源文件逐字一致。`);
