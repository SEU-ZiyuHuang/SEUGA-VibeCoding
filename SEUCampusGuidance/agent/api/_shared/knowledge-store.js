import { get, list, put } from "@vercel/blob";
import {
  baselineKnowledge,
  emptyKnowledgeOverlay,
  mergeKnowledgeOverlay,
  sanitizeKnowledgeOverlay,
  validateKnowledgeOverlay,
} from "../../lib/knowledge-overlay.mjs";

export const KNOWLEDGE_DRAFT_PATH = "agent-knowledge/draft.json";
export const KNOWLEDGE_RELEASE_PREFIX = "agent-knowledge/releases/";
export const KNOWLEDGE_BLOB_ACCESS = "private";
export const MAX_KNOWLEDGE_RELEASES_LISTED = 30;
const CACHE_TTL_MS = 60_000;
const CACHE_RETRY_MS = 5_000;

export const KNOWLEDGE_DRAFT_WRITE_OPTIONS = Object.freeze({
  access: KNOWLEDGE_BLOB_ACCESS,
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json; charset=utf-8",
  cacheControlMaxAge: 60,
});

export const KNOWLEDGE_RELEASE_WRITE_OPTIONS = Object.freeze({
  access: KNOWLEDGE_BLOB_ACCESS,
  addRandomSuffix: false,
  contentType: "application/json; charset=utf-8",
  cacheControlMaxAge: 31_536_000,
});

export function knowledgeStorageConfigured(env = process.env) {
  return Boolean(env.BLOB_STORE_ID || env.BLOB_READ_WRITE_TOKEN);
}

export function isKnowledgeReleasePath(pathname) {
  return typeof pathname === "string" && pathname.startsWith(KNOWLEDGE_RELEASE_PREFIX);
}

export async function readKnowledgeBlobJson(pathname, getter = get) {
  const result = await getter(pathname, { access: KNOWLEDGE_BLOB_ACCESS, useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) throw new Error(`Knowledge blob read failed: ${result?.statusCode || 404}`);
  return new Response(result.stream).json();
}

function releaseOf(blob) {
  return { pathname: blob.pathname, uploadedAt: blob.uploadedAt, etag: blob.etag };
}

async function listReleaseBlobs() {
  const result = await list({ prefix: KNOWLEDGE_RELEASE_PREFIX, limit: 1000 });
  return result.blobs.slice().sort((left, right) => right.pathname.localeCompare(left.pathname));
}

export async function listKnowledgeReleases() {
  if (!knowledgeStorageConfigured()) return [];
  return (await listReleaseBlobs()).slice(0, MAX_KNOWLEDGE_RELEASES_LISTED).map(releaseOf);
}

export async function readPublishedKnowledgeOverlay() {
  if (!knowledgeStorageConfigured()) return { overlay: emptyKnowledgeOverlay(), release: null, configured: false };
  const [latest] = await listReleaseBlobs();
  if (!latest) return { overlay: emptyKnowledgeOverlay(), release: null, configured: true };
  return { overlay: sanitizeKnowledgeOverlay(await readKnowledgeBlobJson(latest.pathname)), release: releaseOf(latest), configured: true };
}

export async function readKnowledgeRelease(pathname) {
  const target = (await listReleaseBlobs()).find((blob) => blob.pathname === pathname);
  return target ? sanitizeKnowledgeOverlay(await readKnowledgeBlobJson(target.pathname)) : null;
}

export async function readKnowledgeDraft() {
  if (!knowledgeStorageConfigured()) return { overlay: emptyKnowledgeOverlay(), exists: false, configured: false };
  const result = await list({ prefix: KNOWLEDGE_DRAFT_PATH, limit: 1 });
  const draft = result.blobs.find((blob) => blob.pathname === KNOWLEDGE_DRAFT_PATH);
  if (draft) return { overlay: sanitizeKnowledgeOverlay(await readKnowledgeBlobJson(draft.pathname)), exists: true, configured: true };
  const published = await readPublishedKnowledgeOverlay();
  return { overlay: published.overlay, exists: false, configured: true };
}

export async function writeKnowledgeDraft(value) {
  if (!knowledgeStorageConfigured()) throw new Error("KNOWLEDGE_STORAGE_NOT_CONFIGURED");
  const rawCount = Object.keys(value?.campusChanges || {}).length + Object.keys(value?.chunkChanges || {}).length;
  if (rawCount > 200 || JSON.stringify(value || {}).length > 400_000) throw new Error("KNOWLEDGE_DRAFT_TOO_LARGE");
  const overlay = sanitizeKnowledgeOverlay(value);
  await put(KNOWLEDGE_DRAFT_PATH, JSON.stringify(overlay), { ...KNOWLEDGE_DRAFT_WRITE_OPTIONS });
  return overlay;
}

export async function publishKnowledge(value) {
  if (!knowledgeStorageConfigured()) throw new Error("KNOWLEDGE_STORAGE_NOT_CONFIGURED");
  const checked = validateKnowledgeOverlay(value);
  if (!checked.ok) throw new Error(`KNOWLEDGE_INVALID: ${checked.problems.join("；")}`);
  const overlay = { ...checked.overlay, updatedAt: new Date().toISOString() };
  const blob = await put(`${KNOWLEDGE_RELEASE_PREFIX}${Date.now()}-${crypto.randomUUID()}.json`, JSON.stringify(overlay), {
    ...KNOWLEDGE_RELEASE_WRITE_OPTIONS,
  });
  await writeKnowledgeDraft(overlay);
  invalidateKnowledgeCache();
  return { overlay, release: { pathname: blob.pathname, uploadedAt: overlay.updatedAt, etag: blob.etag } };
}

let cache = null;

export async function readActiveKnowledge() {
  const now = Date.now();
  if (cache && now < cache.expiresAt) return cache.value;
  if (!knowledgeStorageConfigured()) {
    const value = { knowledge: baselineKnowledge(), overlay: emptyKnowledgeOverlay(), release: null, configured: false, usingBaseline: true, degraded: false, warnings: [] };
    cache = { value, expiresAt: now + CACHE_TTL_MS };
    return value;
  }
  try {
    const published = await readPublishedKnowledgeOverlay();
    const checked = validateKnowledgeOverlay(published.overlay);
    const compatibilityOnly = checked.problems.length > 0 && checked.problems.every((problem) =>
      /不在静态基线中|无法合并到当前知识基线|不是可停用的页面/.test(problem));
    if (!checked.ok && !compatibilityOnly) throw new Error(`Published knowledge is invalid: ${checked.problems.join("; ")}`);
    const value = {
      knowledge: checked.knowledge,
      overlay: checked.overlay,
      release: published.release,
      configured: true,
      usingBaseline: !published.release || !checked.knowledge.overlayApplied,
      degraded: false,
      warnings: compatibilityOnly ? [...checked.warnings, ...checked.problems] : checked.warnings,
    };
    cache = { value, expiresAt: now + CACHE_TTL_MS };
    return value;
  } catch (error) {
    console.error("Knowledge read failed, serving baseline", error);
    const value = { knowledge: baselineKnowledge(), overlay: emptyKnowledgeOverlay(), release: null, configured: true, usingBaseline: true, degraded: true, warnings: ["线上知识读取或校验失败，正在使用静态基线"] };
    cache = { value, expiresAt: now + CACHE_RETRY_MS };
    return value;
  }
}

export function invalidateKnowledgeCache() {
  cache = null;
}
