import { hasValidOrigin, isAdminRequest, json } from "../_shared/admin-auth.js";
import { publishContent, readPublishedContent, storageConfigured } from "../_shared/content-store.js";

const allowedFeatureFields = new Set(["name", "description", "location", "hours"]);
const allowedWorkflowFields = new Set(["title", "summary", "notice", "preparation", "steps"]);

function cleanString(value, maximumLength) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function cleanOverrides(value, allowedFields, limits) {
  const result = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  Object.entries(value).slice(0, 500).forEach(([id, fields]) => {
    if (!/^[a-z0-9-]{1,80}$/i.test(id) || !fields || typeof fields !== "object" || Array.isArray(fields)) return;
    const cleaned = {};
    Object.entries(fields).forEach(([field, fieldValue]) => {
      if (!allowedFields.has(field)) return;
      if ((field === "steps" || field === "preparation") && Array.isArray(fieldValue)) {
        cleaned[field] = fieldValue.slice(0, 20).map((item) => cleanString(item, 500)).filter(Boolean);
      } else {
        cleaned[field] = cleanString(fieldValue, limits[field] || 500);
      }
    });
    if (Object.keys(cleaned).length) result[id] = cleaned;
  });
  return result;
}

function sanitizeContent(value) {
  return {
    schemaVersion: 1,
    featureOverrides: cleanOverrides(value?.featureOverrides, allowedFeatureFields, {
      name: 80, description: 800, location: 200, hours: 160,
    }),
    workflowOverrides: cleanOverrides(value?.workflowOverrides, allowedWorkflowFields, {
      title: 80, summary: 300, notice: 500,
    }),
  };
}

export default {
  async fetch(request) {
    if (!(await isAdminRequest(request))) return json({ error: "请先登录管理后台。" }, 401);
    if (request.method === "GET") {
      try {
        const published = await readPublishedContent();
        return json({ ok: true, storageConfigured: published.configured, content: published.content, release: published.release });
      } catch (error) {
        console.error("Admin content read failed", error);
        return json({ error: "暂时无法读取已发布内容。", storageConfigured: storageConfigured() }, 502);
      }
    }
    if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405, { Allow: "GET, PUT" });
    if (!hasValidOrigin(request)) return json({ error: "请求来源校验失败。" }, 403);
    if (!storageConfigured()) return json({ error: "内容存储尚未配置。" }, 503);
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }
    const serializedLength = JSON.stringify(body || {}).length;
    if (serializedLength > 200_000) return json({ error: "发布内容超过大小限制。" }, 413);
    try {
      const published = await publishContent(sanitizeContent(body));
      return json({ ok: true, content: published.content, release: published.release });
    } catch (error) {
      console.error("Admin content publish failed", error);
      return json({ error: "发布失败，请稍后重试。" }, 502);
    }
  },
};
