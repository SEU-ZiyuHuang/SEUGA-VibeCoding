import { hasValidOrigin, isAdminRequest, json } from "../_shared/admin-auth.js";
import { publishContent, readPublishedContent, storageConfigured } from "../_shared/content-store.js";

const allowedFeatureFields = new Set([
  "name", "description", "location", "hours", "category", "icon", "lat", "lng",
  "coordinateSystem", "tags", "knowledgeOnly",
]);
const allowedWorkflowFields = new Set([
  "title", "summary", "notice", "preparation", "steps", "category", "icon", "mapFeatureIds", "agentPrompt",
]);
const allowedCategories = new Set(["study", "dining", "dorm", "office", "sports", "service", "medical", "transport", "nearby"]);
const allowedCoordinateSystems = new Set(["GCJ-02", "WGS84"]);
const campusRegion = { south: 31.95, north: 32.16, west: 118.65, east: 118.95 };

function cleanString(value, maximumLength) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function cleanId(value, prefix) {
  const id = cleanString(value, 80);
  return new RegExp(`^${prefix}-[a-z0-9-]{6,72}$`, "i").test(id) ? id : "";
}

function cleanStringList(value, maximumItems = 20, maximumLength = 120) {
  return Array.isArray(value)
    ? value.slice(0, maximumItems).map((item) => cleanString(item, maximumLength)).filter(Boolean)
    : [];
}

function cleanCategory(value, fallback = "service") {
  const category = cleanString(value, 30);
  return allowedCategories.has(category) ? category : fallback;
}

function cleanCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function isCoordinateInRegion(latitude, longitude) {
  return latitude >= campusRegion.south && latitude <= campusRegion.north
    && longitude >= campusRegion.west && longitude <= campusRegion.east;
}

function cleanOverrides(value, allowedFields, limits) {
  const result = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  Object.entries(value).slice(0, 500).forEach(([id, fields]) => {
    if (!/^[a-z0-9-]{1,80}$/i.test(id) || !fields || typeof fields !== "object" || Array.isArray(fields)) return;
    const cleaned = {};
    Object.entries(fields).forEach(([field, fieldValue]) => {
      if (!allowedFields.has(field)) return;
      if (["steps", "preparation", "tags", "mapFeatureIds"].includes(field) && Array.isArray(fieldValue)) {
        const maximumLength = field === "tags" ? 60 : field === "mapFeatureIds" ? 80 : 500;
        cleaned[field] = fieldValue.slice(0, 20).map((item) => cleanString(item, maximumLength)).filter(Boolean);
        if (field === "mapFeatureIds") cleaned[field] = cleaned[field].filter((idValue) => /^[a-z0-9-]{1,80}$/i.test(idValue));
      } else if (field === "lat" || field === "lng") {
        const coordinate = cleanCoordinate(fieldValue);
        if (coordinate !== null) cleaned[field] = coordinate;
      } else if (field === "knowledgeOnly") {
        cleaned[field] = Boolean(fieldValue);
      } else if (field === "coordinateSystem") {
        cleaned[field] = allowedCoordinateSystems.has(fieldValue) ? fieldValue : "GCJ-02";
      } else if (field === "category" && allowedFields === allowedFeatureFields) {
        cleaned[field] = cleanCategory(fieldValue);
      } else {
        cleaned[field] = cleanString(fieldValue, limits[field] || 500);
      }
    });
    if (Object.keys(cleaned).length) result[id] = cleaned;
  });
  return result;
}

function cleanCustomFeatures(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 250).map((item) => {
    const id = cleanId(item?.id, "custom-place");
    const knowledgeOnly = Boolean(item?.knowledgeOnly);
    const latitude = cleanCoordinate(item?.lat);
    const longitude = cleanCoordinate(item?.lng);
    if (!id || !cleanString(item?.name, 80)) return null;
    if (!knowledgeOnly && (latitude === null || longitude === null || !isCoordinateInRegion(latitude, longitude))) return null;
    return {
      id,
      name: cleanString(item.name, 80),
      category: cleanCategory(item.category),
      icon: cleanString(item.icon, 8) || "点",
      description: cleanString(item.description, 800),
      location: cleanString(item.location, 200),
      hours: cleanString(item.hours, 160),
      tags: cleanStringList(item.tags, 20, 60),
      knowledgeOnly,
      ...(knowledgeOnly ? {} : {
        lat: latitude,
        lng: longitude,
        coordinateSystem: allowedCoordinateSystems.has(item.coordinateSystem) ? item.coordinateSystem : "GCJ-02",
      }),
      status: "unknown",
      verified: false,
      managed: true,
    };
  }).filter(Boolean);
}

function cleanCustomWorkflows(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((item) => {
    const id = cleanId(item?.id, "custom-workflow");
    const title = cleanString(item?.title, 80);
    const steps = cleanStringList(item?.steps, 20, 500);
    if (!id || !title || !steps.length) return null;
    return {
      id,
      title,
      category: cleanString(item.category, 40) || "校园服务",
      icon: cleanString(item.icon, 8) || "办",
      summary: cleanString(item.summary, 300),
      preparation: cleanStringList(item.preparation, 20, 500),
      steps,
      notice: cleanString(item.notice, 500),
      mapFeatureIds: cleanStringList(item.mapFeatureIds, 20, 80).filter((idValue) => /^[a-z0-9-]{1,80}$/i.test(idValue)),
      agentPrompt: cleanString(item.agentPrompt, 300),
      managed: true,
    };
  }).filter(Boolean);
}

function validateContent(value) {
  const customFeatures = Array.isArray(value?.customFeatures) ? value.customFeatures : [];
  const customWorkflows = Array.isArray(value?.customWorkflows) ? value.customWorkflows : [];
  if (customFeatures.length > 250 || customWorkflows.length > 100) return "新增内容数量超过上限。";
  if (new Set(customFeatures.map((item) => item?.id)).size !== customFeatures.length) return "新增地点存在重复编号。";
  if (new Set(customWorkflows.map((item) => item?.id)).size !== customWorkflows.length) return "新增办事流程存在重复编号。";
  if (cleanCustomFeatures(customFeatures).length !== customFeatures.length) return "有新增地点缺少名称、有效坐标或必要信息。";
  if (cleanCustomWorkflows(customWorkflows).length !== customWorkflows.length) return "有新增办事流程缺少标题或办理步骤。";
  for (const fields of Object.values(value?.featureOverrides || {})) {
    if (!fields || typeof fields !== "object" || fields.knowledgeOnly) continue;
    const hasLatitude = fields.lat !== undefined;
    const hasLongitude = fields.lng !== undefined;
    if (hasLatitude !== hasLongitude) return "地点坐标必须同时包含纬度和经度。";
    if (hasLatitude && !isCoordinateInRegion(Number(fields.lat), Number(fields.lng))) return "有地点坐标超出南京服务范围。";
  }
  return "";
}

function sanitizeContent(value) {
  return {
    schemaVersion: 2,
    featureOverrides: cleanOverrides(value?.featureOverrides, allowedFeatureFields, {
      name: 80, description: 800, location: 200, hours: 160, category: 30, icon: 8, coordinateSystem: 10,
    }),
    workflowOverrides: cleanOverrides(value?.workflowOverrides, allowedWorkflowFields, {
      title: 80, summary: 300, notice: 500, category: 40, icon: 8, agentPrompt: 300,
    }),
    customFeatures: cleanCustomFeatures(value?.customFeatures),
    customWorkflows: cleanCustomWorkflows(value?.customWorkflows),
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
    const validationError = validateContent(body);
    if (validationError) return json({ error: validationError }, 400);
    try {
      const published = await publishContent(sanitizeContent(body));
      return json({ ok: true, content: published.content, release: published.release });
    } catch (error) {
      console.error("Admin content publish failed", error);
      return json({ error: "发布失败，请稍后重试。" }, 502);
    }
  },
};
