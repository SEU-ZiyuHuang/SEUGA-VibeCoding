// 调试台的配置读写。
//
//   GET   取草稿、已发布版本、历史列表，外加页面渲染需要的元数据
//   PUT   保存草稿（不影响线上）
//   POST  { action: "publish" } 发布当前草稿
//         { action: "rollback", pathname } 把某个历史版本重新发布一次
//
// 回退不删历史，只是把旧配置当成新配置再发一遍，这样「退回去之后又想退回来」
// 一样成立。

import { hasValidOrigin, isAdminRequest, json } from "../_shared/admin-auth.js";
import {
  MAX_RELEASES_LISTED,
  isReleasePath,
  listReleases,
  publish,
  readDraft,
  readPublished,
  readRelease,
  storageConfigured,
  writeDraft,
} from "../_shared/config-store.js";
import {
  LIMITS,
  defaultConfig,
  modelOptions,
  validateConfig,
} from "../../lib/agent-config.mjs";
import { LOCKED_RULES } from "../../lib/prompt.mjs";

async function readState() {
  const [draft, published, releases] = await Promise.all([readDraft(), readPublished(), listReleases()]);
  return {
    ok: true,
    storageConfigured: storageConfigured(),
    draft: draft.config,
    draftExists: draft.exists,
    published: published.config,
    publishedRelease: published.release,
    releases,
    maxReleasesListed: MAX_RELEASES_LISTED,
    // 页面要展示但不可编辑的部分，以及各项上限，都由服务端给，避免两边写死两套。
    lockedRules: LOCKED_RULES,
    modelOptions: modelOptions(),
    defaults: defaultConfig(),
    limits: LIMITS,
  };
}

export default {
  async fetch(request) {
    if (!(await isAdminRequest(request))) return json({ error: "请先登录调试台。" }, 401);

    if (request.method === "GET") {
      try {
        return json(await readState());
      } catch (error) {
        console.error("Admin config read failed", error);
        return json({ error: "暂时无法读取配置。", storageConfigured: storageConfigured() }, 502);
      }
    }

    if (request.method !== "PUT" && request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, { Allow: "GET, PUT, POST" });
    }
    if (!hasValidOrigin(request)) return json({ error: "请求来源校验失败。" }, 403);
    if (!storageConfigured()) return json({ error: "配置存储尚未接入，无法保存。" }, 503);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }

    if (request.method === "PUT") {
      const problem = validateConfig(body?.config);
      if (problem) return json({ error: problem }, 400);
      try {
        const config = await writeDraft(body.config);
        return json({ ok: true, draft: config });
      } catch (error) {
        console.error("Draft save failed", error);
        return json({ error: "草稿保存失败，请稍后重试。" }, 502);
      }
    }

    const action = body?.action;
    if (action !== "publish" && action !== "rollback") {
      return json({ error: "不支持的操作。" }, 400);
    }

    try {
      let target;
      if (action === "publish") {
        const problem = validateConfig(body?.config);
        if (problem) return json({ error: problem }, 400);
        target = body.config;
      } else {
        if (!isReleasePath(body?.pathname)) return json({ error: "历史版本编号不正确。" }, 400);
        target = await readRelease(body.pathname);
        if (!target) return json({ error: "找不到该历史版本。" }, 404);
      }
      await publish(target);
      return json(await readState());
    } catch (error) {
      console.error("Publish failed", error);
      return json({ error: "发布失败，请稍后重试。" }, 502);
    }
  },
};
