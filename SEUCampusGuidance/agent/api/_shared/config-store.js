// 运行配置的 Blob 存储。
//
// Vercel 的函数文件系统只读，配置改不回 lib/prompt.mjs，只能放外部存储。
// 这里复用 web/ 那套 Vercel Blob 的做法，靠路径前缀和地图后台的内容互不干扰：
//
//   agent-config/draft.json                    草稿，固定路径反复覆盖
//   agent-config/releases/<时间戳>-<uuid>.json  每次发布追加一份，天然是版本历史
//
// 发布 = 把草稿复制进 releases/。回退 = 把某个历史版本当成新配置再发布一次，
// 只往前追加、不删历史，这样「回退之后又想退回来」也成立。
//
// 读取路径必须能降级：Blob 没配置、读失败、内容坏掉，一律回落到代码里的默认
// 配置让 agent 照常回答。云存储挂掉不能把 /api/chat 一起拖下水。

import { list, put } from "@vercel/blob";
import { defaultConfig, sanitizeConfig } from "../../lib/agent-config.mjs";

const DRAFT_PATH = "agent-config/draft.json";
const RELEASE_PREFIX = "agent-config/releases/";

// /api/chat 是流式接口，走不了 CDN 缓存。每次提问都拉一趟 Blob 会平白多
// 100~300ms，所以在实例内存里缓存一分钟——发布后最长一分钟全量生效。
const CACHE_TTL_MS = 60_000;
// 读失败时用更短的 TTL，让它尽快重试，而不是把降级状态锁定一分钟。
const CACHE_RETRY_MS = 5_000;

const MAX_RELEASES_SCANNED = 1000;
export const MAX_RELEASES_LISTED = 30;

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** 回退接口收到的 pathname 来自请求体，先确认它指向发布目录再拿去查。 */
export function isReleasePath(pathname) {
  return typeof pathname === "string" && pathname.startsWith(RELEASE_PREFIX);
}

async function fetchJson(url, etag) {
  const response = await fetch(`${url}?etag=${encodeURIComponent(etag || "latest")}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Blob read failed: ${response.status}`);
  return response.json();
}

function releaseOf(blob) {
  return { pathname: blob.pathname, uploadedAt: blob.uploadedAt, etag: blob.etag };
}

/** 按文件名倒序取最新。文件名以 Date.now() 打头，比 uploadedAt 更不容易并列。 */
async function listReleaseBlobs() {
  const result = await list({ prefix: RELEASE_PREFIX, limit: MAX_RELEASES_SCANNED });
  return result.blobs.slice().sort((left, right) => right.pathname.localeCompare(left.pathname));
}

/** 历史版本列表，只带元数据不带正文——列表页不需要把每份配置都下载下来。 */
export async function listReleases() {
  if (!storageConfigured()) return [];
  const blobs = await listReleaseBlobs();
  return blobs.slice(0, MAX_RELEASES_LISTED).map(releaseOf);
}

export async function readPublished() {
  if (!storageConfigured()) return { config: defaultConfig(), release: null, configured: false };
  const [latest] = await listReleaseBlobs();
  if (!latest) return { config: defaultConfig(), release: null, configured: true };
  return {
    config: sanitizeConfig(await fetchJson(latest.url, latest.etag)),
    release: releaseOf(latest),
    configured: true,
  };
}

/** 读指定历史版本。pathname 必须来自 listReleases，调用方要先校验前缀。 */
export async function readRelease(pathname) {
  const blobs = await listReleaseBlobs();
  const target = blobs.find((blob) => blob.pathname === pathname);
  if (!target) return null;
  return sanitizeConfig(await fetchJson(target.url, target.etag));
}

/** 草稿不存在时回落到已发布版本——第一次打开调试台就能看到线上正在用的配置。 */
export async function readDraft() {
  if (!storageConfigured()) return { config: defaultConfig(), exists: false, configured: false };
  const result = await list({ prefix: DRAFT_PATH, limit: 1 });
  const draft = result.blobs.find((blob) => blob.pathname === DRAFT_PATH);
  if (!draft) {
    const published = await readPublished();
    return { config: published.config, exists: false, configured: true };
  }
  return { config: sanitizeConfig(await fetchJson(draft.url, draft.etag)), exists: true, configured: true };
}

export async function writeDraft(value) {
  if (!storageConfigured()) throw new Error("CONFIG_STORAGE_NOT_CONFIGURED");
  const config = sanitizeConfig({ ...value, updatedAt: new Date().toISOString() });
  await put(DRAFT_PATH, JSON.stringify(config), {
    access: "public",
    addRandomSuffix: false,
    // 固定路径反复覆盖必须显式开这个开关，否则 @vercel/blob v2 会直接抛错。
    // web/ 那边每次都是新文件名，所以没踩到这一条。
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 0,
  });
  return config;
}

export async function publish(value) {
  if (!storageConfigured()) throw new Error("CONFIG_STORAGE_NOT_CONFIGURED");
  const config = sanitizeConfig({ ...value, updatedAt: new Date().toISOString() });
  const blob = await put(`${RELEASE_PREFIX}${Date.now()}-${crypto.randomUUID()}.json`, JSON.stringify(config), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 31_536_000,
  });
  // 发布后草稿跟随，避免页面上「草稿」和「已发布」显示成两份不同内容。
  await writeDraft(config);
  invalidateConfigCache();
  return { config, release: { pathname: blob.pathname, uploadedAt: config.updatedAt, etag: blob.etag } };
}

let cache = { config: null, release: null, expiresAt: 0 };

/**
 * 生产读取入口：/api/chat 用它拿当前生效配置。永远不抛错。
 * 注意 Vercel 是多实例的，这个缓存只对当前实例有效；发布后全量生效靠的是 TTL 到期。
 */
export async function readActiveConfig() {
  const now = Date.now();
  if (cache.config && now < cache.expiresAt) return { config: cache.config, release: cache.release };

  if (!storageConfigured()) {
    cache = { config: defaultConfig(), release: null, expiresAt: now + CACHE_TTL_MS };
    return { config: cache.config, release: cache.release };
  }

  try {
    const published = await readPublished();
    cache = { config: published.config, release: published.release, expiresAt: now + CACHE_TTL_MS };
  } catch (error) {
    console.error("Agent config read failed, serving fallback", error);
    // 保住上一次成功读到的值；从没成功过就用代码里的默认配置。
    cache = {
      config: cache.config || defaultConfig(),
      release: cache.release || null,
      expiresAt: now + CACHE_RETRY_MS,
    };
  }
  return { config: cache.config, release: cache.release };
}

/** 本地开发是单进程，发布后清一下缓存就能立刻生效。线上多实例只能等 TTL。 */
export function invalidateConfigCache() {
  cache = { config: null, release: null, expiresAt: 0 };
}
