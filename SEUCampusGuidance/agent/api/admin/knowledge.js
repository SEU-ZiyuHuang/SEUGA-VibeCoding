import { hasValidOrigin, isAdminRequest, json } from "../_shared/admin-auth.js";
import {
  MAX_KNOWLEDGE_RELEASES_LISTED,
  isKnowledgeReleasePath,
  knowledgeStorageConfigured,
  listKnowledgeReleases,
  publishKnowledge,
  readKnowledgeDraft,
  readKnowledgeRelease,
  readPublishedKnowledgeOverlay,
  writeKnowledgeDraft,
} from "../_shared/knowledge-store.js";
import {
  KNOWLEDGE_LIMITS,
  baselineKnowledge,
  knowledgeCatalog,
  validateKnowledgeOverlay,
} from "../../lib/knowledge-overlay.mjs";
import { runRetrievalRegression } from "../../lib/retrieval-regression.mjs";

async function readState() {
  const [draft, published, releases] = await Promise.all([
    readKnowledgeDraft(),
    readPublishedKnowledgeOverlay(),
    listKnowledgeReleases(),
  ]);
  const checked = validateKnowledgeOverlay(draft.overlay);
  return {
    ok: true,
    storageConfigured: knowledgeStorageConfigured(),
    draft: draft.overlay,
    draftExists: draft.exists,
    published: published.overlay,
    publishedRelease: published.release,
    releases,
    maxReleasesListed: MAX_KNOWLEDGE_RELEASES_LISTED,
    limits: KNOWLEDGE_LIMITS,
    catalog: knowledgeCatalog(draft.overlay),
    campuses: checked.knowledge.campuses,
    baseCampuses: baselineKnowledge().campuses,
    warnings: checked.warnings,
  };
}

export default {
  async fetch(request) {
    if (!(await isAdminRequest(request))) return json({ error: "请先登录调试台。" }, 401);
    if (request.method === "GET") {
      try {
        return json(await readState());
      } catch (error) {
        console.error("Admin knowledge read failed", error);
        return json({ error: "暂时无法读取知识库。", storageConfigured: knowledgeStorageConfigured() }, 502);
      }
    }
    if (request.method !== "PUT" && request.method !== "POST") return json({ error: "Method not allowed" }, 405, { Allow: "GET, PUT, POST" });
    if (!hasValidOrigin(request)) return json({ error: "请求来源校验失败。" }, 403);
    if (!knowledgeStorageConfigured()) return json({ error: "知识存储尚未接入，无法保存。" }, 503);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }
    if (JSON.stringify(body || {}).length > KNOWLEDGE_LIMITS.maxSerializedChars + 20_000) return json({ error: "请求内容超过大小限制。" }, 413);

    if (request.method === "PUT") {
      try {
        const draft = await writeKnowledgeDraft(body?.overlay);
        return json({ ok: true, draft, catalog: knowledgeCatalog(draft) });
      } catch (error) {
        console.error("Knowledge draft save failed", error);
        return json({ error: "知识草稿保存失败，请稍后重试。" }, 502);
      }
    }

    const action = body?.action;
    if (action !== "publish" && action !== "rollback") return json({ error: "不支持的操作。" }, 400);
    try {
      let target;
      if (action === "rollback") {
        if (!isKnowledgeReleasePath(body?.pathname)) return json({ error: "历史版本编号不正确。" }, 400);
        target = await readKnowledgeRelease(body.pathname);
        if (!target) return json({ error: "找不到该历史版本。" }, 404);
        target.releaseNote = `回退到 ${body.pathname}`;
      } else {
        target = body?.overlay;
        const current = await readPublishedKnowledgeOverlay();
        const removedManaged = Object.keys(current.overlay.chunkChanges || {}).filter((id) =>
          /\/managed-/.test(id) && !Object.prototype.hasOwnProperty.call(target?.chunkChanges || {}, id));
        if (removedManaged.length) {
          return json({ error: "已发布的新增页面不能物理删除，请改为停用。", problems: removedManaged }, 400);
        }
      }

      const checked = validateKnowledgeOverlay(target);
      if (!checked.ok) return json({ error: "知识校验未通过。", problems: checked.problems, warnings: checked.warnings }, 400);
      const regressions = runRetrievalRegression(checked.knowledge).filter((item) => !item.passed);
      if (regressions.length && !body?.confirmRegressions) {
        return json({
          error: "检索基线发生变化，请确认后再发布。",
          requiresConfirmation: true,
          regressions,
          warnings: checked.warnings,
        }, 409);
      }
      if (regressions.length && !checked.overlay.releaseNote) {
        return json({ error: "确认检索变化时必须填写发布备注。", regressions }, 400);
      }
      await publishKnowledge(checked.overlay);
      return json({ ...(await readState()), regressions });
    } catch (error) {
      console.error("Knowledge publish failed", error);
      return json({ error: "知识发布失败，请稍后重试。" }, 502);
    }
  },
};
