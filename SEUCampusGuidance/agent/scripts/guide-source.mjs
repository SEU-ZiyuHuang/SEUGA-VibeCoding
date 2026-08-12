// 原始指南 md 的解析器。
//
// 迁移脚本和校验脚本必须用**同一套**解析逻辑读源文件，否则「校验通过」只能证明
// 两个 bug 长得一样。所以这里单独成一个模块，两边都 import 它。
//
// 解析逻辑沿用 scripts/build-knowledge.mjs 里已经验证过的那套（frontmatter、
// 时效提醒、## / ### 两级切分、[源图 Pxx] 提取），行为保持一致。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
export const agentDir = path.resolve(scriptDir, "..");
export const repoDir = path.resolve(agentDir, "..");
export const legacySourceDir = path.join(repoDir, "原校区指南-md文档整理");
export const wikiDir = path.join(repoDir, "原校区指南-wiki");

/**
 * Git 工作区在 Windows 上可能使用 CRLF，而 macOS / Linux 通常使用 LF。
 * 所有需要逐字比较或进入构建产物的文本都先走这里，保证结果与操作系统无关。
 */
export function normalizeNewlines(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n");
}

export const CAMPUS_TABLE = [
  { slug: "jiulonghu", key: "九龙湖", name: "九龙湖校区", aliases: ["九龙湖", "江宁校区"] },
  { slug: "sipailou", key: "四牌楼", name: "四牌楼校区", aliases: ["四牌楼", "本部", "老校区"] },
  { slug: "dingjiaqiao", key: "丁家桥", name: "丁家桥校区", aliases: ["丁家桥", "丁桥"] },
  { slug: "suzhou", key: "苏州", name: "苏州校区", aliases: ["苏州"] },
  { slug: "jiangbei", key: "江北", name: "江北校区", aliases: ["江北", "浦口", "成贤学院"] },
  { slug: "wuxi", key: "无锡", name: "无锡校区", aliases: ["无锡", "滨湖"] },
];

// 不进检索的章节。「已识别的差异」必须保留——它是「差异项并列呈现」这条回答规范的唯一事实来源。
const EXCLUDE_SECTION = /^目录$|Agent\s*使用建议/;
const EXCLUDE_SUB = /来源页对应关系|版权与署名|关于原发布方/;

export function parseFrontmatter(source, file) {
  const matched = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!matched) throw new Error(`${file}: 缺少 YAML frontmatter`);
  const meta = {};
  for (const line of matched[1].split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at < 0) continue;
    meta[line.slice(0, at).trim()] = line.slice(at + 1).trim().replace(/^["']|["']$/g, "");
  }
  for (const field of ["title", "campus", "source_version", "license", "source_author"]) {
    if (!meta[field]) throw new Error(`${file}: frontmatter 缺字段 ${field}`);
  }
  return [meta, source.slice(matched[0].length)];
}

export function versionLabel(raw) {
  const head = String(raw).split(/[（(]/)[0].trim();
  return /版$/.test(head) ? head : `${head} 版`;
}

export function extractNotice(body) {
  const lines = [];
  for (const line of body.split(/\r?\n/)) {
    if (/^##\s/.test(line)) break;
    if (/^>\s?/.test(line)) lines.push(line.replace(/^>\s?/, "").trim());
  }
  return lines.filter(Boolean).join("\n").trim();
}

export function splitHeadings(body) {
  const nodes = [];
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    const matched = /^(#{2,4})\s+(.+)$/.exec(line);
    if (matched) {
      current = { level: matched[1].length, title: matched[2].trim(), lines: [] };
      nodes.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }
  const sections = [];
  for (const node of nodes) {
    if (node.level === 2) sections.push({ title: node.title, own: node.lines, subs: [] });
    else if (sections.length) sections.at(-1).subs.push(node);
  }
  return sections;
}

export function parseAgentSection(section) {
  if (!section) return { answerRules: "", chunkKeys: [], templates: "" };
  const keysNode = section.subs.find((sub) => /建议的知识分块/.test(sub.title));
  const chunkKeys = (keysNode ? keysNode.lines.join("\n").match(/`([a-z0-9_]+)`/g) || [] : [])
    .map((token) => token.replace(/`/g, ""));
  // 四牌楼没有「推荐回答模板」小节，所以只能按标题筛，不能按「切到模板为止」来切。
  const templateNodes = section.subs.filter((sub) => /推荐回答模板/.test(sub.title) || sub.level === 4);
  return {
    answerRules: section.own.join("\n").trim(),
    chunkKeys,
    templates: templateNodes
      .map((sub) => `${"#".repeat(sub.level)} ${sub.title}\n${sub.lines.join("\n")}`)
      .join("\n").trim(),
  };
}

export function extractCredits(sections) {
  const lines = [];
  for (const section of sections) {
    for (const sub of section.subs) {
      if (/版权与署名|关于原发布方/.test(sub.title)) lines.push(sub.lines.join("\n").trim());
    }
  }
  return lines.filter(Boolean).join("\n\n").trim();
}

export function extractPages(text) {
  const pages = new Set();
  for (const marker of text.matchAll(/\[源图\s*([^\]]+)\]/g)) {
    for (const part of marker[1].split(/[、,，/]/)) {
      const range = /P(\d{1,2})\s*[—–\-~至到]\s*P?(\d{1,2})/.exec(part);
      if (range) {
        for (let page = Number(range[1]); page <= Number(range[2]); page += 1) {
          pages.add(`P${String(page).padStart(2, "0")}`);
        }
        continue;
      }
      const single = /P(\d{1,2})(?!\d)/.exec(part);
      if (single) pages.add(`P${String(Number(single[1])).padStart(2, "0")}`);
    }
  }
  if (pages.size === 0) {
    for (const bare of text.matchAll(/(?:^|[^A-Za-z])P(\d{2})(?!\d)/g)) pages.add(`P${bare[1]}`);
  }
  return [...pages].sort();
}

export function tidy(text) {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * 把一份指南拆成「内容单元」——迁移和校验共同的最小单位。
 *
 * 单元 = 一个 ### 小节（其后的 #### 并进来，"工作日时刻/节假日时刻" 这种成对的
 * 必须待在一起），或者 ## 章节里 ### 之前的引言段。单元文本**包含自己的标题行**，
 * 这样迁移后能原样比对回来。
 *
 * 校验就是靠它做逐字比对：每个源单元必须在 wiki 里恰好出现一次。
 * 这比「字符覆盖率 ≥99%」强得多——覆盖率过得去也可能把一张表拆坏。
 */
export function extractUnits(sections) {
  const units = [];
  for (const section of sections) {
    if (EXCLUDE_SECTION.test(section.title)) continue;

    const lead = tidy(section.own.join("\n"));
    if (lead) {
      units.push({ sectionTitle: section.title, subTitle: null, heading: null, text: lead });
    }

    let current = null;
    for (const sub of section.subs) {
      if (EXCLUDE_SUB.test(sub.title)) {
        current = null;
        continue;
      }
      if (sub.level === 4 && current) {
        current.parts.push(`#### ${sub.title}`, ...sub.lines);
        continue;
      }
      current = { sectionTitle: section.title, subTitle: sub.title, level: sub.level, parts: [`### ${sub.title}`, ...sub.lines] };
      units.push(current);
    }
  }
  return units
    .map((unit) => ({
      sectionTitle: unit.sectionTitle,
      subTitle: unit.subTitle ?? null,
      heading: unit.subTitle ? `### ${unit.subTitle}` : null,
      text: unit.parts ? tidy(unit.parts.join("\n")) : unit.text,
    }))
    .filter((unit) => unit.text.length > 0);
}

/** 读一份源指南，返回校区元数据 + 内容单元。 */
export async function readLegacyGuide(file) {
  const raw = normalizeNewlines(await fs.readFile(path.join(legacySourceDir, file), "utf8"));
  const [meta, body] = parseFrontmatter(raw, file);
  const campus = CAMPUS_TABLE.find((entry) => String(meta.campus).includes(entry.key));
  if (!campus) throw new Error(`${file}: 无法从 campus="${meta.campus}" 识别校区`);

  const sections = splitHeadings(body);
  const agent = parseAgentSection(sections.find((section) => /Agent\s*使用建议/.test(section.title)));

  return {
    file,
    campus,
    meta,
    version: versionLabel(meta.source_version),
    notice: extractNotice(body),
    credits: extractCredits(sections),
    answerRules: agent.answerRules,
    templates: agent.templates,
    chunkKeys: agent.chunkKeys,
    units: extractUnits(sections),
  };
}

export async function listLegacyGuides() {
  const files = (await fs.readdir(legacySourceDir)).filter((name) => name.endsWith(".md")).sort();
  const guides = await Promise.all(files.map(readLegacyGuide));
  // 输出顺序固定成 CAMPUS_TABLE 的顺序，构建产物的 diff 才稳定
  return guides.sort((a, b) =>
    CAMPUS_TABLE.findIndex((c) => c.slug === a.campus.slug) - CAMPUS_TABLE.findIndex((c) => c.slug === b.campus.slug));
}

export function keyToSlug(chunkKey) {
  return String(chunkKey).replace(/_/g, "-");
}
