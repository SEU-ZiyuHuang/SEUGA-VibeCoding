// 运行配置的 schema、默认值、校验与清洗。
//
// 纯逻辑，不碰网络——Blob 读写在 api/_shared/config-store.js。这样分层是因为
// 校验规则要被三处共用：管理端保存草稿、发布，以及读取路径上对存量数据的兜底。
//
// 两个函数分工不同，都要：
//   validateConfig  给人看的中文报错，管理端保存前调用，让用户知道哪里超了
//   sanitizeConfig  沉默兜底，读取路径调用——线上存量数据格式不对时要降级而不是 500
//
// 默认值必须等于「没有这套配置时的现有行为」，否则加个管理页面会顺手改掉线上表现：
//   model        ""   → 跟随 DEEPSEEK_MODEL 环境变量
//   temperature  null → 不传给 API，用模型自己的默认值（agent-loop 原本就没传）
//   maxAnswerTokens 1400 → 等于原 ANSWER_MAX_TOKENS 常量

import {
  DEFAULT_IDENTITY,
  DEFAULT_RETRIEVAL_DISCIPLINE,
  DEFAULT_RULES,
} from "./prompt.mjs";

export const CONFIG_SCHEMA_VERSION = 1;

export const LIMITS = Object.freeze({
  identityChars: 1000,
  ruleChars: 500,
  ruleCount: 20,
  retrievalChars: 2000,
  noteChars: 200,
  answerTokensMin: 200,
  answerTokensMax: 2000,
  payloadBytes: 50_000,
});

// 手工维护的白名单。写死是刻意的：模型名填错会让整个 agent 报 400，
// 而这个页面的使用者不一定看得懂上游错误。留空表示跟随环境变量。
const KNOWN_MODELS = ["deepseek-v4-flash", "deepseek-chat", "deepseek-reasoner"];

/** 可选模型列表。环境变量里配的那个一定在列，否则页面会显示不出当前值。 */
export function modelOptions() {
  const configured = (process.env.DEEPSEEK_MODEL || "").trim();
  return [...new Set([...(configured ? [configured] : []), ...KNOWN_MODELS])];
}

export const DEFAULT_CONFIG = Object.freeze({
  schemaVersion: CONFIG_SCHEMA_VERSION,
  identity: DEFAULT_IDENTITY,
  rules: [...DEFAULT_RULES],
  retrievalDiscipline: DEFAULT_RETRIEVAL_DISCIPLINE,
  model: "",
  temperature: null,
  maxAnswerTokens: 1400,
  note: "",
  updatedAt: null,
});

/** 深拷贝一份默认配置，避免调用方改到冻结对象里的数组。 */
export function defaultConfig() {
  return { ...DEFAULT_CONFIG, rules: [...DEFAULT_CONFIG.rules] };
}

function text(value, maxChars, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxChars) : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

/**
 * 沉默兜底：无论输入多脏都返回一个完整合法的配置对象。
 * 读取路径专用——存量数据格式不对时应当降级到默认值，而不是把 /api/chat 打挂。
 */
export function sanitizeConfig(value) {
  const input = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rules = Array.isArray(input.rules)
    ? input.rules
      .slice(0, LIMITS.ruleCount)
      .map((rule) => text(rule, LIMITS.ruleChars))
      .filter(Boolean)
    : [];
  const model = text(input.model, 80);
  return {
    schemaVersion: CONFIG_SCHEMA_VERSION,
    identity: text(input.identity, LIMITS.identityChars, DEFAULT_CONFIG.identity),
    rules: rules.length ? rules : [...DEFAULT_CONFIG.rules],
    retrievalDiscipline: text(input.retrievalDiscipline, LIMITS.retrievalChars, DEFAULT_CONFIG.retrievalDiscipline),
    model: modelOptions().includes(model) ? model : "",
    temperature: input.temperature === null || input.temperature === undefined || input.temperature === ""
      ? null
      : Number(clampNumber(input.temperature, 0, 1, 0).toFixed(2)),
    maxAnswerTokens: Math.round(
      clampNumber(input.maxAnswerTokens, LIMITS.answerTokensMin, LIMITS.answerTokensMax, DEFAULT_CONFIG.maxAnswerTokens),
    ),
    note: text(input.note, LIMITS.noteChars),
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : null,
  };
}

/** 给人看的校验。返回中文错误信息，通过则返回空字符串。 */
export function validateConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "配置格式不正确。";
  if (JSON.stringify(value).length > LIMITS.payloadBytes) return "配置内容超过大小限制。";

  if (typeof value.identity !== "string" || !value.identity.trim()) return "身份说明不能为空。";
  if (value.identity.length > LIMITS.identityChars) return `身份说明超过 ${LIMITS.identityChars} 字。`;

  if (!Array.isArray(value.rules)) return "回答规范格式不正确。";
  const rules = value.rules.filter((rule) => typeof rule === "string" && rule.trim());
  if (!rules.length) return "回答规范至少要保留一条。";
  if (value.rules.length > LIMITS.ruleCount) return `回答规范最多 ${LIMITS.ruleCount} 条。`;
  if (rules.some((rule) => rule.length > LIMITS.ruleChars)) return `单条回答规范不能超过 ${LIMITS.ruleChars} 字。`;

  if (typeof value.retrievalDiscipline !== "string" || !value.retrievalDiscipline.trim()) return "检索纪律不能为空。";
  if (value.retrievalDiscipline.length > LIMITS.retrievalChars) return `检索纪律超过 ${LIMITS.retrievalChars} 字。`;

  const model = typeof value.model === "string" ? value.model.trim() : "";
  if (model && !modelOptions().includes(model)) return "选择的模型不在允许列表内。";

  if (value.temperature !== null && value.temperature !== undefined && value.temperature !== "") {
    const temperature = Number(value.temperature);
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1) return "发挥程度必须在 0 到 1 之间。";
  }

  const tokens = Number(value.maxAnswerTokens);
  if (!Number.isFinite(tokens) || tokens < LIMITS.answerTokensMin || tokens > LIMITS.answerTokensMax) {
    return `回答长度上限必须在 ${LIMITS.answerTokensMin} 到 ${LIMITS.answerTokensMax} 之间。`;
  }

  if (typeof value.note === "string" && value.note.length > LIMITS.noteChars) {
    return `备注不能超过 ${LIMITS.noteChars} 字。`;
  }
  return "";
}

/** 取出 buildSystemPrompt 需要的那三项。锁定条款不在其中，由 prompt.mjs 自己拼。 */
export function promptOverridesFrom(config) {
  if (!config) return null;
  return {
    identity: config.identity,
    rules: config.rules,
    retrievalDiscipline: config.retrievalDiscipline,
  };
}
