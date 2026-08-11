// 章节级关键词检索。
//
// 分词与打分沿用原 chat.js 的思路（中文 2—4 字滑窗 n-gram + 子串命中计分），
// 在此基础上加四件事，否则长章节会恒定压过短章节、而短章节又会被归一化捧过头：
//   1. 长词平方加权 —— 「无线谷线」比「线」有判别力得多
//   2. 标题命中 ×1.6，且标题索引含章节内部的 ### / #### 小标题 ——
//      四牌楼第 2 章叫「学习与研究」，「图书馆」只出现在它的 2.1 小标题里，
//      只看 sectionPath 的话「图书馆几点关门」根本吃不到标题加权
//   3. 词频加成（封顶 3 次）—— 通篇讲图书馆的章节应当赢过顺带提一句的章节
//   4. BM25 式的柔性长度归一 —— 开方归一太猛，会把 238 字的差异项小块捧到第一
//
// wiki 化之后又加了两件事：
//   5. 别名扩展 —— 检索前把口语词补成指南用词。「哪里能剪头发」在六份指南里字面 0 命中，
//      但「理发」能命中；以前只能靠工具描述教模型自己改写，现在检索层直接兜住。
//   6. keywords / summary 参与打分 —— 它们是每页人工复核过的精选词，判别力比正文高，
//      所以权重给得比标题还重。

import { CHUNKS, ALIASES } from "../data/knowledge.mjs";
import { getCampus } from "./campus.mjs";

const BASELINE_CHARS = 900; // 归一化基准，接近 chunk 长度中位数
const TITLE_WEIGHT = 1.6;
// 权重是消融实测出来的，不是估的（16 条回归查询 + 3 条零命中查询）：
//   基线（都不加）              16/16
//   kw 2.4 / sum 1.0          15/16 —— 太重，「图书馆几点关门」被差异项小块顶掉
//   kw 1.2 / sum 0.5          16/16 —— 取这个
// 改这两个数请重跑 npm run suite。
const KEYWORD_WEIGHT = 1.2;
const SUMMARY_WEIGHT = 0.5;
const LENGTH_B = 0.45; // 0=完全不归一，1=完全按长度线性归一
const MAX_TERM_HITS = 3;

const byCampus = new Map();
const byId = new Map();
for (const chunk of CHUNKS) {
  if (!byCampus.has(chunk.campus)) byCampus.set(chunk.campus, []);
  byCampus.get(chunk.campus).push(chunk);
  byId.set(chunk.id, chunk);
}

// 预算小写副本，避免每次检索都重复 toLowerCase 整个知识库。
const searchIndex = new Map(CHUNKS.map((chunk) => {
  const innerHeadings = (chunk.text.match(/^#{3,4}\s+.+$/gm) || []).join(" ");
  return [chunk.id, {
    title: `${chunk.sectionPath} ${innerHeadings}`.toLowerCase(),
    keywords: (chunk.keywords || []).join(" ").toLowerCase(),
    summary: String(chunk.summary || "").toLowerCase(),
    body: chunk.text.toLowerCase(),
    norm: 1 - LENGTH_B + LENGTH_B * (chunk.text.length / BASELINE_CHARS),
  }];
}));

// 别名按长度倒序：「床帘多大」要先于「床帘」命中，否则长词永远轮不到
const aliasIndex = Object.entries(ALIASES)
  .map(([spoken, written]) => ({ spoken: spoken.toLowerCase(), written }))
  .sort((a, b) => b.spoken.length - a.spoken.length);

/**
 * 查询扩展：把口语说法补上指南里的书面词。
 * 只做「补」不做「替」——原词留着，万一指南里真有这个词也不会漏掉。
 *
 * 注意它是 searchGuide 的**兜底**手段，不是默认行为。实测无条件扩展会把
 * 回归套件从 16/16 打到 12/16：补进来的词参与打分，会跟用户真正问的词抢排名
 * （「兰台线节假日几点有车」被扩展词带偏到「兰台公寓」）。只有字面 0 命中时才值得扩。
 */
export function expandQuery(query) {
  const text = String(query || "");
  const haystack = text.toLowerCase();
  const extra = new Set();
  for (const { spoken, written } of aliasIndex) {
    if (!haystack.includes(spoken)) continue;
    for (const word of written) extra.add(word);
  }
  return extra.size ? `${text} ${[...extra].join(" ")}` : text;
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let at = haystack.indexOf(needle);
  while (at >= 0 && count < MAX_TERM_HITS) {
    count += 1;
    at = haystack.indexOf(needle, at + needle.length);
  }
  return count;
}

/** 中文按 2—4 字滑窗切；英文数字整词保留。 */
export function tokenize(value) {
  const chunks = String(value).toLowerCase().match(/[\p{Script=Han}]+|[a-z0-9]+/gu) || [];
  const terms = new Set();
  for (const piece of chunks) {
    if (!/^[\p{Script=Han}]+$/u.test(piece)) {
      terms.add(piece);
      continue;
    }
    const characters = Array.from(piece);
    if (characters.length <= 4) terms.add(piece);
    for (let size = 2; size <= Math.min(4, characters.length); size += 1) {
      for (let start = 0; start <= characters.length - size; start += 1) {
        terms.add(characters.slice(start, start + size).join(""));
      }
    }
  }
  return [...terms];
}

export function scoreChunk(chunk, terms) {
  const index = searchIndex.get(chunk.id);
  if (!index) return 0;
  let score = 0;
  for (const term of terms) {
    const weight = Math.min(term.length, 4) ** 2;
    if (index.keywords.includes(term)) score += weight * KEYWORD_WEIGHT;
    if (index.summary.includes(term)) score += weight * SUMMARY_WEIGHT;
    if (index.title.includes(term)) score += weight * TITLE_WEIGHT;
    const hits = countOccurrences(index.body, term);
    if (hits) score += weight * (1 + (hits - 1) * 0.35);
  }
  return score / index.norm;
}

/**
 * 在单个校区内检索章节。
 * 返回 [{...chunk, score}]，按分数降序。无命中时返回空数组——这是有意义的信号，
 * 调用方应据此提示模型换关键词，而不是硬凑结果。
 */
function rank(pool, terms, k) {
  if (!terms.length) return [];
  return pool
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((entry) => ({ ...entry.chunk, score: Number(entry.score.toFixed(2)) }));
}

export function searchGuide({ campus, query, topK = 3 }) {
  const pool = byCampus.get(campus) || [];
  const k = Math.max(1, Math.min(topK, 8));

  // 先按字面检索。查得到就到此为止——扩展只会引入噪声。
  const literal = rank(pool, tokenize(query), k);
  if (literal.length) return literal;

  // 字面 0 命中才动用别名表。「哪里能剪头发」正是这条路径救回来的：
  // 六份指南里都没有「剪头发」，但「理发」有。
  const expanded = expandQuery(query);
  if (expanded === query) return [];
  return rank(pool, tokenize(expanded), k).map((hit) => ({ ...hit, expanded: true }));
}

/**
 * 某校区的 wiki 索引：标题 + 一句话摘要。
 * 带上摘要之后，模型花一次调用就能看懂这个校区覆盖了什么，
 * 不用再拿光秃秃的标题去猜哪一节可能有答案。
 */
export function listSections(campus) {
  return (byCampus.get(campus) || []).map((chunk) => ({
    id: chunk.id,
    sectionPath: chunk.sectionPath,
    summary: chunk.summary || "",
    pages: chunk.pages,
  }));
}

/** 某页的相关页面（wiki 双链），用于让模型顺着导航补充上下文。 */
export function relatedOf(id) {
  const chunk = byId.get(id);
  if (!chunk) return [];
  return (chunk.related || [])
    .map((target) => byId.get(target))
    .filter(Boolean)
    .map((target) => ({ id: target.id, sectionPath: target.sectionPath, summary: target.summary || "" }));
}

export function getChunk(id) {
  return byId.get(id) || null;
}

export function countChunks(campus) {
  return (byCampus.get(campus) || []).length;
}

/** 校区版本号，用于回答口径（「2025.09 版指南显示…」）。 */
export function versionOf(campus) {
  return getCampus(campus).version;
}
