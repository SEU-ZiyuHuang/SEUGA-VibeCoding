// 多轮工具调用循环。async generator，yield 的就是 SSE 事件对象。
//
// 结构上分两段，这是为了规避一个协议层的不确定性：
//   决策轮  stream:false + 带 tools   —— 工具调用一次性拿全，没有分片拼装风险
//   生成轮  stream:true  + 不带 tools —— 纯文本 delta，最标准的用法
// DeepSeek 官方文档列出的 streaming delta 字段只有 content/reasoning_content/role/logprobs，
// 没有 tool_calls，也没承诺流式下会返回工具调用，所以不赌它。
//
// 进循环前先做一次确定性预检索：本地关键词检索约 1ms、零 API 成本，作用是
//   ① 保证至少有一次召回，模型一次工具都不调也能答；
//   ② 常见问题被压到只需 1 次 API 调用。
// 这比 tool_choice:"required" 可靠，也不会逼着「你好」「我同学晕倒了」去检索。

import { complete, streamText } from "./deepseek.mjs";
import { TOOLS, executeTool, safeParseArgs, renderSearchResult } from "./tools.mjs";
import { searchGuide, versionOf } from "./retrieve.mjs";
import { campusName, detectCampus, detectAllCampuses, isCampusSlug, DEFAULT_CAMPUS } from "./campus.mjs";
import { buildSystemPrompt, isEmergency } from "./prompt.mjs";
import { promptOverridesFrom } from "./agent-config.mjs";

const MAX_TOOL_ROUNDS = 4;
const MAX_TOOL_CHARS = 9000; // 全流程注入给模型的检索正文总预算
const DECISION_MAX_TOKENS = 500;
const ANSWER_MAX_TOKENS = 1400;
const HISTORY_LIMIT = 6;
const DEADLINE_MS = 50_000; // 到点强制收尾，留出余量给生成轮
const MAX_SOURCES = 6;
const REPLAY_SLICE = 24;
const DECISION_TIMEOUT_MS = 20_000; // 决策轮比全局 35s 更早放弃，见 deepseek.complete 的说明

// 快路径阈值。实测标定，不是拍脑袋定的——22 条标注样本（scripts/fastpath-mock.mjs）上 0 误判。
//
// wiki 化 + keywords/summary 参与打分之后，两类问题的得分被拉开得很干净：
//   该走多轮的最高分 26.87（「水电费怎么交」）
//   该走快路径的最低分 74.76（「图书馆几点关门」）
// 中间是一段没有样本的空隙，取 50 落在正中，两侧各有约 2 倍余量。
//
// 区分度只留作并列时的弱保护：分数下限已经能完全分开两类，所以从 1.2 放宽到 1.05
// ——之前 1.2 会误伤「图书馆几点关门」（top1/top2 = 1.11，但 74.76 分已经足够确定）。
// 改动这两个数请重跑 npm run test:fastpath。
const FAST_PATH_MIN_SCORE = 50;
const FAST_PATH_MIN_MARGIN = 1.05;

function event(name, data) {
  return { event: name, data };
}

function clampHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-HISTORY_LIMIT)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 1500) }));
}

function buildSources(seen) {
  return [...seen.values()]
    .sort((a, b) => (b.round ?? 0) - (a.round ?? 0) || (b.score ?? 0) - (a.score ?? 0))
    .slice(0, MAX_SOURCES)
    .map((chunk) => ({
      id: chunk.id,
      campus: chunk.campus,
      campusName: chunk.campusName,
      section: chunk.sectionPath,
      pages: chunk.pages,
      version: chunk.version,
    }));
}

function* sliceForReplay(text) {
  for (let at = 0; at < text.length; at += REPLAY_SLICE) yield text.slice(at, at + REPLAY_SLICE);
}

/**
 * 预检索是否已经好到可以跳过决策轮，直接进流式生成。
 *
 * 动机：决策轮是非流式的，一次往返就是几秒钟的静默，而这段时间里预检索
 * （本地关键词、约 1ms、零成本）其实已经把答案所在的章节拿到手了。命中足够
 * 确定时省掉这一轮，首字延迟直接少一次 API 往返。
 *
 * 代价：跳过决策轮 = 模型失去「换个词再检一次」的机会。所以门槛定得偏保守，
 * 宁可多走几次多轮，也不要把该重检的问题草率答了。
 * 出问题时用 AGENT_FAST_PATH=0 立刻整体关掉。
 */
export function shouldFastPath({ message, seed, emergency }) {
  if (process.env.AGENT_FAST_PATH === "0") return false;
  if (emergency) return false; // 急救问题永远走完整流程
  if (detectAllCampuses(message).length > 1) return false; // 跨校区要分别检索两个校区
  if (!seed.length) return false;

  const top = seed[0].score ?? 0;
  const second = seed[1]?.score ?? 0;
  if (top < FAST_PATH_MIN_SCORE) return false;
  if (second > 0 && top / second < FAST_PATH_MIN_MARGIN) return false;
  return true;
}

/**
 * config 是调试台发布的运行配置（lib/agent-config.mjs 的形状），传 null 就全用代码默认值。
 * 生产从已发布版本读，调试台预览从请求体读——两条路径共用这一个函数，
 * 否则「在调试台试通了、线上还是另一套行为」是迟早的事。
 */
export async function* runAgent({ message, campus: campusLock = null, history = [], signal, config = null } = {}) {
  const startedAt = Date.now();
  const locked = isCampusSlug(campusLock);
  let campus = locked ? campusLock : (detectCampus(message) || DEFAULT_CAMPUS);

  const model = config?.model || undefined;
  const temperature = typeof config?.temperature === "number" ? config.temperature : undefined;
  const answerMaxTokens = Number.isFinite(config?.maxAnswerTokens) ? config.maxAnswerTokens : ANSWER_MAX_TOKENS;

  yield event("meta", {
    campus,
    campusName: campusName(campus),
    version: versionOf(campus),
    locked,
  });

  const seen = new Map();
  const calls = new Set();
  const budget = { remaining: MAX_TOOL_CHARS };

  // ① 确定性预检索
  yield event("phase", { phase: "retrieving" });
  const seed = searchGuide({ campus, query: message, topK: 3 });
  const seedText = renderSearchResult(seed, { campus, query: message, seen });
  budget.remaining -= seedText.length;
  for (const hit of seed) seen.set(hit.id, { ...hit, round: 0 });
  yield event("tool_result", {
    round: 0,
    name: "search_guide",
    auto: true,
    count: seed.length,
    sections: seed.map((hit) => hit.sectionPath),
  });

  const emergency = isEmergency(message);
  const messages = [
    {
      role: "system",
      content: buildSystemPrompt({
        campus,
        campusLock: locked,
        emergency,
        overrides: promptOverridesFrom(config),
      }),
    },
    ...clampHistory(history),
    { role: "user", content: `用户问题：${message}\n\n【系统预检索结果 · ${campusName(campus)}】\n${seedText}` },
  ];

  // ② 决策轮。预检索已经足够确定时整轮跳过，直接去生成。
  let round = 0;
  let directAnswer = null;
  let hitLimit = false;
  const fastPath = shouldFastPath({ message, seed, emergency });

  while (!fastPath && round < MAX_TOOL_ROUNDS) {
    if (Date.now() - startedAt > DEADLINE_MS) {
      hitLimit = true;
      break;
    }
    round += 1;

    // 决策轮是非流式的，这一段用户什么都看不到——必须告诉前端「还在想」，
    // 否则等待期只有一个不动的圆点，体感就是卡死了。
    yield event("phase", { phase: "thinking", round });

    const reply = await complete({
      messages,
      tools: TOOLS,
      toolChoice: "auto",
      maxTokens: DECISION_MAX_TOKENS,
      model,
      temperature,
      signal,
      timeoutMs: DECISION_TIMEOUT_MS,
    });
    const choice = reply.choices?.[0] || {};
    const assistant = choice.message || {};
    const toolCalls = assistant.tool_calls || [];

    if (!toolCalls.length) {
      // 模型认为资料够了。若它已经写出完整答案（不是被 max_tokens 截断），直接复用，省一次调用。
      const content = String(assistant.content || "").trim();
      if (content.length > 40 && choice.finish_reason === "stop") directAnswer = content;
      round -= 1; // 这一轮没调用工具，不计入工具轮数
      break;
    }

    messages.push({ role: "assistant", content: assistant.content ?? null, tool_calls: toolCalls });

    yield event("phase", { phase: "reading", round });

    for (const call of toolCalls) {
      const name = call.function?.name || "";
      const args = safeParseArgs(call.function?.arguments, { campus, message });
      yield event("tool_call", { round, name, args });

      const at = Date.now();
      const { text, hits } = executeTool(name, args, { seen, calls, budget });
      for (const hit of hits) seen.set(hit.id, { ...hit, round });

      // 模型改判了校区（跨校区问题的第二次检索），跟着走，除非用户锁定了校区。
      if (!locked && isCampusSlug(args.campus) && args.campus !== campus) campus = args.campus;

      yield event("tool_result", {
        round,
        name,
        count: hits.length,
        sections: hits.map((hit) => hit.sectionPath),
        tookMs: Date.now() - at,
      });
      messages.push({ role: "tool", tool_call_id: call.id, content: text });
    }

    if (round >= MAX_TOOL_ROUNDS) hitLimit = true;
  }

  // ③ 生成轮
  yield event("phase", { phase: "writing" });
  if (directAnswer) {
    for (const piece of sliceForReplay(directAnswer)) yield event("token", { t: piece });
  } else {
    if (hitLimit) {
      messages.push({
        role: "system",
        content: "已达到检索次数上限。请立即基于上文已检索到的内容作答；缺失的部分明确说明指南未覆盖，并引导用户查官方渠道。不要再尝试调用工具。",
      });
    }
    let streamed = false;
    try {
      for await (const delta of streamText({ messages, maxTokens: answerMaxTokens, model, temperature, signal })) {
        streamed = true;
        yield event("token", { t: delta });
      }
    } catch (error) {
      if (streamed) throw error; // 已经吐了一半，不能再重来
      console.error("流式生成失败，回退非流式：", error.message);
    }
    if (!streamed) {
      // 降级：非流式补一次，按片回放，前端无感。
      const reply = await complete({ messages, maxTokens: answerMaxTokens, model, temperature, signal });
      const content = String(reply.choices?.[0]?.message?.content || "").trim()
        || "抱歉，这次没能生成回答，请再试一次。";
      for (const piece of sliceForReplay(content)) yield event("token", { t: piece });
    }
  }

  yield event("sources", { sources: buildSources(seen) });
  yield event("done", {
    campus,
    campusName: campusName(campus),
    rounds: round,
    tookMs: Date.now() - startedAt,
    fastPath, // 供 A/B 与线上排查：这次有没有跳过决策轮
    placeIds: [], // 地图联动是 P2，字段先占位
  });
}
