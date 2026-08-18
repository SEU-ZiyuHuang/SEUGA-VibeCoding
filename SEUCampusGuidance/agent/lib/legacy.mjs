// 旧契约实现：POST /api/agent/chat → { message, placeIds }
//
// web/ 的地图抽屉（web/app.js:256-288）依赖这个形态，web/server.mjs:41-56 正往这里代理。
// 请求字段、响应字段和状态码都已冻结，改动会弄坏那个应用。新功能一律走 /api/chat。
//
// 与新版的区别：单轮、非流式、由模型返回 JSON（因为要给出地图点位 id）。

import { MAP_FEATURES } from "../data/map-features.mjs";
import { SHARED_MAP_FEATURES } from "../data/shared-knowledge.mjs";
import { createRetriever, tokenize } from "./retrieve.mjs";
import { detectCampus } from "./campus.mjs";
import { buildLegacySystemPrompt } from "./prompt.mjs";
import { complete } from "./deepseek.mjs";

// 地图抽屉只服务四牌楼校区，所以问题里认不出校区时落到四牌楼，而不是全局默认的九龙湖。
const LEGACY_CAMPUS = "sipailou";
const sharedFeatureById = new Map(SHARED_MAP_FEATURES.map((feature) => [feature.id, feature]));
const baseFeatureIds = new Set(MAP_FEATURES.map((feature) => feature.id));
const ALL_MAP_FEATURES = [
  ...MAP_FEATURES.map((feature) => {
    const shared = sharedFeatureById.get(feature.id);
    return shared ? { ...feature, ...shared, id: feature.id, tags: [...new Set([...(feature.tags || []), ...(shared.tags || [])])] } : feature;
  }),
  ...SHARED_MAP_FEATURES.filter((feature) => !baseFeatureIds.has(feature.id)),
];

function scoreFeature(feature, terms) {
  const haystack = JSON.stringify(feature).toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? Math.min(term.length, 4) : 0), 0);
}

function findRelevantContext(message, campus, retriever) {
  const terms = tokenize(message);
  const features = ALL_MAP_FEATURES
    .map((feature) => ({ feature, score: scoreFeature(feature, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((entry) => entry.feature);
  const guideSections = retriever.searchGuide({ campus, query: message, topK: 4 }).map((chunk) => ({
    section: chunk.sectionPath,
    version: chunk.version,
    pages: chunk.pages,
    text: chunk.text,
  }));
  return { mapFeatures: features, guideSections };
}

function buildExtractiveFallback(context) {
  const top = context.guideSections[0];
  if (!top?.text) {
    return "在线模型没有生成完整回答，请换一种问法，或直接使用页面顶部搜索查看校园地点与办事信息。";
  }

  const lines = String(top.text)
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line && !/^来源：?$/.test(line));
  const sourceIndex = lines.findIndex((line) => /^- .+https?:\/\//.test(line));
  const answerLines = sourceIndex >= 0 ? lines.slice(0, sourceIndex) : lines;
  const answer = answerLines.join("\n").replace(/^#\s+/, "").slice(0, 5_000).trim();
  const version = top.version ? `（依据${top.version}；办公地点、电话和时间等易变信息请在出发前复核。）` : "";
  return `${answer}\n\n${version}`.trim();
}

export async function answerLegacy(message, { signal, knowledge = null } = {}) {
  const campus = detectCampus(message) || LEGACY_CAMPUS;
  const retriever = createRetriever(knowledge || undefined);
  const context = findRelevantContext(message, campus, retriever);
  const payload = await complete({
    messages: [
      { role: "system", content: buildLegacySystemPrompt({ campus, campusMeta: retriever.getCampus(campus) }) },
      { role: "user", content: `用户问题：${message}\n\n可用校园数据：${JSON.stringify(context)}` },
    ],
    maxTokens: 900,
    signal,
  });

  const content = payload.choices?.[0]?.message?.content || "";
  try {
    const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
    return {
      message: String(parsed.message || buildExtractiveFallback(context)),
      placeIds: Array.isArray(parsed.placeIds)
        ? parsed.placeIds.filter((id) => ALL_MAP_FEATURES.some((feature) => feature.id === id))
        : [],
    };
  } catch {
    return { message: content || buildExtractiveFallback(context), placeIds: [] };
  }
}
