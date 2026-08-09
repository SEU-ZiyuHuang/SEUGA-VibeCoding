import { list, put } from "@vercel/blob";

const releasePrefix = "campus-content/releases/";

export const emptyContent = Object.freeze({
  schemaVersion: 2,
  featureOverrides: {},
  workflowOverrides: {},
  customFeatures: [],
  customWorkflows: [],
});

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeContent(value) {
  const content = value && typeof value === "object" ? value : {};
  return {
    schemaVersion: 2,
    featureOverrides: content.featureOverrides && typeof content.featureOverrides === "object" ? content.featureOverrides : {},
    workflowOverrides: content.workflowOverrides && typeof content.workflowOverrides === "object" ? content.workflowOverrides : {},
    customFeatures: Array.isArray(content.customFeatures) ? content.customFeatures : [],
    customWorkflows: Array.isArray(content.customWorkflows) ? content.customWorkflows : [],
    updatedAt: typeof content.updatedAt === "string" ? content.updatedAt : null,
  };
}

export async function readPublishedContent() {
  if (!storageConfigured()) return { content: { ...emptyContent }, release: null, configured: false };
  const result = await list({ prefix: releasePrefix, limit: 100 });
  const latest = result.blobs
    .slice()
    .sort((left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime())[0];
  if (!latest) return { content: { ...emptyContent }, release: null, configured: true };
  const response = await fetch(`${latest.url}?etag=${encodeURIComponent(latest.etag || "latest")}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Blob content read failed: ${response.status}`);
  return {
    content: normalizeContent(await response.json()),
    release: { pathname: latest.pathname, uploadedAt: latest.uploadedAt, etag: latest.etag },
    configured: true,
  };
}

export async function publishContent(value) {
  if (!storageConfigured()) throw new Error("CONTENT_STORAGE_NOT_CONFIGURED");
  const content = normalizeContent({ ...value, updatedAt: new Date().toISOString() });
  const releaseId = `${Date.now()}-${crypto.randomUUID()}.json`;
  const blob = await put(`${releasePrefix}${releaseId}`, JSON.stringify(content), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 31536000,
  });
  return {
    content,
    release: { pathname: blob.pathname, uploadedAt: content.updatedAt, etag: blob.etag },
  };
}
