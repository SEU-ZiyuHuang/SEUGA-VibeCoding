// 章节级关键词检索。默认使用静态知识，也可为线上修订创建隔离的检索器。

import { baselineKnowledge } from "./knowledge-overlay.mjs";

const BASELINE_CHARS = 900;
const TITLE_WEIGHT = 1.6;
const KEYWORD_WEIGHT = 1.2;
const SUMMARY_WEIGHT = 0.5;
const LENGTH_B = 0.45;
const MAX_TERM_HITS = 3;

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

export function createRetriever(knowledge = baselineKnowledge()) {
  const chunks = Array.isArray(knowledge?.chunks) ? knowledge.chunks : [];
  const campuses = Array.isArray(knowledge?.campuses) ? knowledge.campuses : [];
  const aliases = knowledge?.aliases && typeof knowledge.aliases === "object" ? knowledge.aliases : {};
  const byCampus = new Map();
  const byId = new Map();
  const campusById = new Map(campuses.map((campus) => [campus.slug, campus]));
  for (const chunk of chunks) {
    if (!byCampus.has(chunk.campus)) byCampus.set(chunk.campus, []);
    byCampus.get(chunk.campus).push(chunk);
    byId.set(chunk.id, chunk);
  }

  const searchIndex = new Map(chunks.map((chunk) => {
    const innerHeadings = (chunk.text.match(/^#{3,4}\s+.+$/gm) || []).join(" ");
    return [chunk.id, {
      title: `${chunk.sectionPath} ${innerHeadings}`.toLowerCase(),
      keywords: (chunk.keywords || []).join(" ").toLowerCase(),
      summary: String(chunk.summary || "").toLowerCase(),
      body: chunk.text.toLowerCase(),
      norm: 1 - LENGTH_B + LENGTH_B * (chunk.text.length / BASELINE_CHARS),
    }];
  }));
  const aliasIndex = Object.entries(aliases)
    .map(([spoken, written]) => ({ spoken: spoken.toLowerCase(), written: Array.isArray(written) ? written : [] }))
    .sort((a, b) => b.spoken.length - a.spoken.length);

  function expandQuery(query) {
    const text = String(query || "");
    const haystack = text.toLowerCase();
    const extra = new Set();
    for (const { spoken, written } of aliasIndex) {
      if (!haystack.includes(spoken)) continue;
      for (const word of written) extra.add(word);
    }
    return extra.size ? `${text} ${[...extra].join(" ")}` : text;
  }

  function scoreChunk(chunk, terms) {
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

  function rank(pool, terms, k) {
    if (!terms.length) return [];
    return pool
      .map((chunk) => ({ chunk, score: scoreChunk(chunk, terms) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((entry) => ({ ...entry.chunk, score: Number(entry.score.toFixed(2)) }));
  }

  function searchGuide({ campus, query, topK = 3 }) {
    const pool = byCampus.get(campus) || [];
    const k = Math.max(1, Math.min(topK, 8));
    const literal = rank(pool, tokenize(query), k);
    if (literal.length) return literal;
    const expanded = expandQuery(query);
    if (expanded === query) return [];
    return rank(pool, tokenize(expanded), k).map((hit) => ({ ...hit, expanded: true }));
  }

  function listSections(campus) {
    return (byCampus.get(campus) || []).map((chunk) => ({
      id: chunk.id,
      sectionPath: chunk.sectionPath,
      summary: chunk.summary || "",
      pages: chunk.pages,
    }));
  }

  function relatedOf(id) {
    const chunk = byId.get(id);
    if (!chunk) return [];
    return (chunk.related || []).map((target) => byId.get(target)).filter(Boolean)
      .map((target) => ({ id: target.id, sectionPath: target.sectionPath, summary: target.summary || "" }));
  }

  return {
    knowledge,
    expandQuery,
    scoreChunk,
    searchGuide,
    listSections,
    relatedOf,
    getChunk: (id) => byId.get(id) || null,
    countChunks: (campus) => (byCampus.get(campus) || []).length,
    getCampus: (campus) => campusById.get(campus) || null,
    versionOf: (campus) => campusById.get(campus)?.version || "未知版本",
  };
}

const defaultRetriever = createRetriever();

export const expandQuery = (...args) => defaultRetriever.expandQuery(...args);
export const scoreChunk = (...args) => defaultRetriever.scoreChunk(...args);
export const searchGuide = (...args) => defaultRetriever.searchGuide(...args);
export const listSections = (...args) => defaultRetriever.listSections(...args);
export const relatedOf = (...args) => defaultRetriever.relatedOf(...args);
export const getChunk = (...args) => defaultRetriever.getChunk(...args);
export const countChunks = (...args) => defaultRetriever.countChunks(...args);
export const versionOf = (...args) => defaultRetriever.versionOf(...args);
