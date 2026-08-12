import { KNOWLEDGE_BUILD, CAMPUSES, CHUNKS, ALIASES } from "../data/knowledge.mjs";

export const KNOWLEDGE_LIMITS = Object.freeze({
  maxChanges: 200,
  maxSerializedChars: 400_000,
  maxTextChars: 12_000,
  minSummaryChars: 20,
  maxSummaryChars: 200,
  maxKeywords: 20,
  maxAliasPairs: 20,
  maxRelated: 8,
});

const CAMPUS_IDS = new Set(CAMPUSES.map((campus) => campus.slug));
const BASE_CHUNK_IDS = new Set(CHUNKS.map((chunk) => chunk.id));
const MANAGED_ID = /^([a-z0-9-]+)\/managed-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function cleanString(value, maximum = 12_000) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function cleanList(value, maximum, itemMaximum = 160) {
  return Array.isArray(value)
    ? [...new Set(value.slice(0, maximum).map((item) => cleanString(item, itemMaximum)).filter(Boolean))]
    : [];
}

function cleanAudit(value) {
  const audit = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    sourceLabel: cleanString(audit.sourceLabel, 300),
    sourceUrl: cleanString(audit.sourceUrl, 800),
    verifiedAt: cleanString(audit.verifiedAt, 20),
    verifiedBy: cleanString(audit.verifiedBy, 100),
    note: cleanString(audit.note, 500),
  };
}

function cleanAliasPairs(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, KNOWLEDGE_LIMITS.maxAliasPairs).map((pair) => ({
    spoken: cleanString(pair?.spoken, 80),
    written: cleanString(pair?.written, 80),
  })).filter((pair) => pair.spoken || pair.written);
}

export function emptyKnowledgeOverlay() {
  return {
    schemaVersion: 1,
    baseGeneratedAt: KNOWLEDGE_BUILD.generatedAt,
    campusChanges: {},
    chunkChanges: {},
    releaseNote: "",
  };
}

/**
 * 草稿允许不完整，因此这里只做形状收敛和大小上限裁剪，不替发布做强校验。
 */
export function sanitizeKnowledgeOverlay(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = emptyKnowledgeOverlay();
  result.baseGeneratedAt = cleanString(input.baseGeneratedAt, 80) || KNOWLEDGE_BUILD.generatedAt;
  result.releaseNote = cleanString(input.releaseNote, 500);

  for (const [campus, raw] of Object.entries(input.campusChanges || {}).slice(0, KNOWLEDGE_LIMITS.maxChanges)) {
    if (!CAMPUS_IDS.has(campus) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    result.campusChanges[campus] = {
      version: cleanString(raw.version, 80),
      notice: cleanString(raw.notice, 4_000),
      audit: cleanAudit(raw.audit),
    };
  }

  const remaining = KNOWLEDGE_LIMITS.maxChanges - Object.keys(result.campusChanges).length;
  for (const [id, raw] of Object.entries(input.chunkChanges || {}).slice(0, Math.max(0, remaining))) {
    if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(id) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const action = raw.action === "disable" ? "disable" : "upsert";
    result.chunkChanges[id] = {
      action,
      campus: cleanString(raw.campus, 40),
      title: cleanString(raw.title, 120),
      version: cleanString(raw.version, 80),
      summary: cleanString(raw.summary, KNOWLEDGE_LIMITS.maxSummaryChars),
      keywords: cleanList(raw.keywords, KNOWLEDGE_LIMITS.maxKeywords, 80),
      aliasPairs: cleanAliasPairs(raw.aliasPairs),
      related: cleanList(raw.related, KNOWLEDGE_LIMITS.maxRelated, 100),
      pages: cleanList(raw.pages, 20, 40),
      text: cleanString(raw.text, KNOWLEDGE_LIMITS.maxTextChars),
      audit: cleanAudit(raw.audit),
    };
  }
  return result;
}

export function baselineKnowledge() {
  return {
    build: { ...KNOWLEDGE_BUILD },
    campuses: CAMPUSES.map((campus) => ({ ...campus })),
    chunks: CHUNKS.map((chunk) => ({ ...chunk, keywords: [...(chunk.keywords || [])], related: [...(chunk.related || [])], pages: [...(chunk.pages || [])], managed: false })),
    aliases: Object.fromEntries(Object.entries(ALIASES).map(([key, values]) => [key, [...values]])),
    warnings: [],
    overlayApplied: false,
  };
}

function auditProblems(audit, label) {
  const problems = [];
  if (!audit.sourceLabel) problems.push(`${label}缺少来源说明`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(audit.verifiedAt) || Number.isNaN(Date.parse(`${audit.verifiedAt}T00:00:00Z`))) {
    problems.push(`${label}核验日期格式应为 YYYY-MM-DD`);
  }
  if (!audit.verifiedBy) problems.push(`${label}缺少核验人`);
  if (!audit.note) problems.push(`${label}缺少变更备注`);
  if (audit.sourceUrl) {
    try {
      const url = new URL(audit.sourceUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocol");
    } catch {
      problems.push(`${label}来源链接必须是 HTTP(S) 地址`);
    }
  }
  return problems;
}

/** 合并永远尽力而为；失效修订跳过并形成 warnings，保证线上可以退回安全基线。 */
export function mergeKnowledgeOverlay(value) {
  const overlay = sanitizeKnowledgeOverlay(value);
  const base = baselineKnowledge();
  const warnings = [];
  const campusMap = new Map(base.campuses.map((campus) => [campus.slug, campus]));
  const chunkMap = new Map(base.chunks.map((chunk) => [chunk.id, chunk]));

  if (overlay.baseGeneratedAt !== KNOWLEDGE_BUILD.generatedAt) {
    warnings.push(`修订基于 ${overlay.baseGeneratedAt}，当前静态基线为 ${KNOWLEDGE_BUILD.generatedAt}`);
  }

  for (const [campusId, change] of Object.entries(overlay.campusChanges)) {
    const campus = campusMap.get(campusId);
    if (!campus) {
      warnings.push(`校区修订 ${campusId} 已失效，已跳过`);
      continue;
    }
    if (change.version) campus.version = change.version;
    if (change.notice) campus.notice = change.notice;
    campus.managed = true;
    campus.audit = change.audit;
  }

  for (const [id, change] of Object.entries(overlay.chunkChanges)) {
    const current = chunkMap.get(id);
    if (change.action === "disable") {
      if (!current && !MANAGED_ID.test(id)) warnings.push(`停用目标 ${id} 在当前基线中不存在，已跳过`);
      else chunkMap.delete(id);
      continue;
    }

    const managedMatch = MANAGED_ID.exec(id);
    if (!current && !managedMatch) {
      warnings.push(`页面修订 ${id} 在当前基线中不存在且不是 managed ID，已跳过`);
      continue;
    }
    const campusId = current?.campus || change.campus || managedMatch?.[1];
    const campus = campusMap.get(campusId);
    if (!campus) {
      warnings.push(`页面 ${id} 的校区 ${campusId || "（空）"} 无效，已跳过`);
      continue;
    }
    const next = {
      ...(current || {}),
      id,
      campus: campusId,
      campusName: campus.name,
      version: change.version || current?.version || campus.version,
      sectionPath: change.title || current?.sectionPath || "",
      chunkKey: current?.chunkKey || id.split("/")[1].replace(/^managed-/, "managed_"),
      summary: change.summary || current?.summary || "",
      keywords: change.keywords.length ? change.keywords : (current?.keywords || []),
      related: change.related,
      pages: change.pages,
      text: change.text || current?.text || "",
      managed: true,
      sourceLabel: change.audit.sourceLabel,
      sourceUrl: change.audit.sourceUrl,
      verifiedAt: change.audit.verifiedAt,
      audit: change.audit,
      aliasPairs: change.aliasPairs,
    };
    chunkMap.set(id, next);
  }

  const activeIds = new Set(chunkMap.keys());
  for (const chunk of chunkMap.values()) {
    const campusChange = overlay.campusChanges[chunk.campus];
    const chunkChange = overlay.chunkChanges[chunk.id];
    if (campusChange?.version && !(chunkChange?.action === "upsert" && chunkChange.version)) chunk.version = campusChange.version;
    chunk.related = (chunk.related || []).filter((target) => {
      const targetChunk = chunkMap.get(target);
      return activeIds.has(target) && targetChunk?.campus === chunk.campus;
    });
  }

  const aliases = Object.fromEntries(Object.entries(base.aliases).map(([key, values]) => [key, [...values]]));
  for (const chunk of chunkMap.values()) {
    for (const pair of chunk.aliasPairs || []) {
      if (!pair.spoken || !pair.written || pair.spoken === pair.written || !chunk.text.includes(pair.written)) continue;
      aliases[pair.spoken] = [...new Set([...(aliases[pair.spoken] || []), pair.written])].slice(0, 6);
    }
    delete chunk.aliasPairs;
  }

  const chunks = [...chunkMap.values()];
  return {
    build: {
      ...base.build,
      chunkCount: chunks.length,
      chunkChars: chunks.reduce((sum, chunk) => sum + chunk.text.length, 0),
      aliasCount: Object.keys(aliases).length,
    },
    campuses: [...campusMap.values()],
    chunks,
    aliases,
    warnings,
    overlayApplied: Object.keys(overlay.campusChanges).length > 0 || Object.keys(overlay.chunkChanges).length > 0,
  };
}

export function validateKnowledgeOverlay(value) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const overlay = sanitizeKnowledgeOverlay(value);
  const problems = [];
  const warnings = [];
  const count = Object.keys(raw.campusChanges || {}).length + Object.keys(raw.chunkChanges || {}).length;
  if (count > KNOWLEDGE_LIMITS.maxChanges) problems.push(`修订总数不能超过 ${KNOWLEDGE_LIMITS.maxChanges} 项`);
  if (JSON.stringify(raw).length > KNOWLEDGE_LIMITS.maxSerializedChars) problems.push("知识草稿超过 400 KB");
  if (overlay.baseGeneratedAt !== KNOWLEDGE_BUILD.generatedAt) warnings.push("静态知识基线已更新，请检查旧修订是否仍适用");

  for (const [campus, change] of Object.entries(overlay.campusChanges)) {
    if (!CAMPUS_IDS.has(campus)) problems.push(`未知校区：${campus}`);
    if (!change.version && !change.notice) problems.push(`${campus} 的校区修订没有实际内容`);
    problems.push(...auditProblems(change.audit, `${campus}：`));
  }

  const preliminary = mergeKnowledgeOverlay(overlay);
  warnings.push(...preliminary.warnings);
  const effectiveMap = new Map(preliminary.chunks.map((chunk) => [chunk.id, chunk]));
  for (const [id, change] of Object.entries(overlay.chunkChanges)) {
    problems.push(...auditProblems(change.audit, `${id}：`));
    if (change.action === "disable") {
      if (!BASE_CHUNK_IDS.has(id) && !MANAGED_ID.test(id)) problems.push(`${id} 不是可停用的页面`);
      continue;
    }
    const current = CHUNKS.find((chunk) => chunk.id === id);
    const managed = MANAGED_ID.exec(id);
    if (!current && !managed) problems.push(`${id} 不在静态基线中，也不是合法的 managed ID`);
    const campus = current?.campus || change.campus || managed?.[1];
    if (!CAMPUS_IDS.has(campus)) problems.push(`${id} 的校区无效`);
    if (managed && managed[1] !== campus) problems.push(`${id} 的 ID 与校区字段不一致`);
    const effective = effectiveMap.get(id);
    if (!effective) {
      problems.push(`${id} 无法合并到当前知识基线`);
      continue;
    }
    if (!effective.sectionPath) problems.push(`${id} 缺少标题`);
    if (!effective.version) problems.push(`${id} 缺少版本`);
    if (effective.summary.length < KNOWLEDGE_LIMITS.minSummaryChars || effective.summary.length > KNOWLEDGE_LIMITS.maxSummaryChars) {
      problems.push(`${id} 的摘要应为 ${KNOWLEDGE_LIMITS.minSummaryChars}—${KNOWLEDGE_LIMITS.maxSummaryChars} 字`);
    }
    if (!effective.text || effective.text.length > KNOWLEDGE_LIMITS.maxTextChars) problems.push(`${id} 的正文应为 1—${KNOWLEDGE_LIMITS.maxTextChars} 字`);
    if (!effective.keywords.length || effective.keywords.length > KNOWLEDGE_LIMITS.maxKeywords) problems.push(`${id} 应填写 1—${KNOWLEDGE_LIMITS.maxKeywords} 个关键词`);
    for (const keyword of effective.keywords) if (!effective.text.includes(keyword)) problems.push(`${id} 的关键词「${keyword}」未出现在正文中`);
    for (const pair of change.aliasPairs) {
      if (!pair.spoken || !pair.written) problems.push(`${id} 有不完整的口语别名`);
      else if (pair.spoken === pair.written) problems.push(`${id} 的口语词「${pair.spoken}」不能映射到自己`);
      else if (!effective.text.includes(pair.written)) problems.push(`${id} 的书面词「${pair.written}」未出现在正文中`);
    }
    if (change.related.length > KNOWLEDGE_LIMITS.maxRelated) problems.push(`${id} 的相关页不能超过 ${KNOWLEDGE_LIMITS.maxRelated} 个`);
    for (const target of change.related) {
      const related = effectiveMap.get(target);
      if (!related) problems.push(`${id} 的相关页 ${target} 不存在或已停用`);
      else if (related.campus !== campus) problems.push(`${id} 的相关页 ${target} 不属于同一校区`);
    }
  }

  return { ok: problems.length === 0, overlay, problems: [...new Set(problems)], warnings: [...new Set(warnings)], knowledge: preliminary };
}

export function knowledgeCatalog(overlay = emptyKnowledgeOverlay()) {
  const normalized = sanitizeKnowledgeOverlay(overlay);
  const merged = mergeKnowledgeOverlay(normalized);
  const mergedMap = new Map(merged.chunks.map((chunk) => [chunk.id, chunk]));
  const baseMap = new Map(CHUNKS.map((chunk) => [chunk.id, chunk]));
  const ids = new Set([...baseMap.keys(), ...Object.keys(normalized.chunkChanges)]);
  return [...ids].map((id) => {
    const base = baseMap.get(id) || null;
    const effective = mergedMap.get(id) || null;
    const change = normalized.chunkChanges[id] || null;
    return {
      id,
      status: change?.action === "disable" ? "disabled" : !base ? "added" : change ? "revised" : "original",
      base,
      effective,
      change,
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
}
