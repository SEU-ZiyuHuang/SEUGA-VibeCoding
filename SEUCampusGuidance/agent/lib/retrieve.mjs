// 章节级关键词检索。默认使用静态知识，也可为线上修订创建隔离的检索器。

import { baselineKnowledge } from "./knowledge-overlay.mjs";

const BASELINE_CHARS = 900;
const TITLE_WEIGHT = 1.6;
const KEYWORD_WEIGHT = 1.2;
const SUMMARY_WEIGHT = 0.5;
const LENGTH_B = 0.45;
const MAX_TERM_HITS = 3;
const PRIMARY_TITLE_WEIGHT = 3.2;
const TIME_INTENT_PATTERN = /几点|时间|开门|关门|开放|营业|什么时候|几点钟/;
const SCHEDULE_FACT_PATTERN = /(?:[01]?\d|2[0-3])[:：][0-5]\d|开放时间|办理时间|工作日|周[一二三四五六日天]/;

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

function compactSearchText(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
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
      primaryTitle: compactSearchText(String(chunk.sectionPath || "").split("｜").at(-1)),
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

  function scoreChunk(chunk, terms, query = "") {
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
    const compactQuery = compactSearchText(query);
    if (index.primaryTitle.length >= 2 && compactQuery.includes(index.primaryTitle)) {
      score += Math.min(Array.from(index.primaryTitle).length, 8) ** 2 * PRIMARY_TITLE_WEIGHT;
    }
    const intentFactor = TIME_INTENT_PATTERN.test(String(query)) && !SCHEDULE_FACT_PATTERN.test(index.body) ? 0.55 : 1;
    return (score / index.norm) * intentFactor;
  }

  function rank(pool, terms, k, query) {
    if (!terms.length) return [];
    return pool
      .map((chunk) => ({ chunk, score: scoreChunk(chunk, terms, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((entry) => ({ ...entry.chunk, score: Number(entry.score.toFixed(2)) }));
  }

  function searchGuide({ campus, query, topK = 3 }) {
    const pool = byCampus.get(campus) || [];
    const k = Math.max(1, Math.min(topK, 8));
    const literal = rank(pool, tokenize(query), k, query);
    if (literal.length) return literal;
    const expanded = expandQuery(query);
    if (expanded === query) return [];
    return rank(pool, tokenize(expanded), k, expanded).map((hit) => ({ ...hit, expanded: true }));
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
