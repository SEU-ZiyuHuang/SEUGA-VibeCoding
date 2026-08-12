import assert from "node:assert/strict";
import {
  BLOB_ACCESS,
  DRAFT_WRITE_OPTIONS,
  RELEASE_WRITE_OPTIONS,
  readBlobJson,
  storageConfigured,
} from "../api/_shared/config-store.js";

assert.equal(storageConfigured({}), false, "没有 Blob 连接信息时应回落默认配置");
assert.equal(storageConfigured({ BLOB_READ_WRITE_TOKEN: "legacy-token" }), true, "应兼容旧式读写 Token");
assert.equal(storageConfigured({ BLOB_STORE_ID: "store_oidc" }), true, "应识别新的 OIDC Blob 连接");

assert.equal(BLOB_ACCESS, "private", "配置必须写入私有 Blob");
assert.equal(DRAFT_WRITE_OPTIONS.access, "private");
assert.equal(DRAFT_WRITE_OPTIONS.allowOverwrite, true, "草稿固定路径必须允许覆盖");
assert.ok(DRAFT_WRITE_OPTIONS.cacheControlMaxAge >= 60, "Blob 缓存时间不能低于平台下限");
assert.equal(RELEASE_WRITE_OPTIONS.access, "private");
assert.equal(RELEASE_WRITE_OPTIONS.allowOverwrite, undefined, "历史版本必须保持不可覆盖");

let observed = null;
const expected = { identity: "测试配置", rules: ["只依据指南回答"] };
const actual = await readBlobJson("agent-config/draft.json", async (pathname, options) => {
  observed = { pathname, options };
  const encoded = new TextEncoder().encode(JSON.stringify(expected));
  return {
    statusCode: 200,
    stream: new ReadableStream({
      start(controller) {
        controller.enqueue(encoded);
        controller.close();
      },
    }),
  };
});

assert.deepEqual(actual, expected, "应从私有 Blob 流中解析 JSON");
assert.deepEqual(observed, {
  pathname: "agent-config/draft.json",
  options: { access: "private", useCache: false },
}, "私有读取必须走 SDK 鉴权并绕过缓存");

await assert.rejects(
  () => readBlobJson("missing.json", async () => null),
  /Blob read failed: 404/,
  "不存在的 Blob 应明确失败",
);

console.log("✓ Vercel 私有 Blob / OIDC 配置测试全部通过");
