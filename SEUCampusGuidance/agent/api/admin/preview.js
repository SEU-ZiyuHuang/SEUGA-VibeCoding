// POST /api/admin/preview —— 调试台的试聊，SSE，需登录。
//
// 与 /api/chat 的唯一区别是配置来源：这里用请求体里的草稿，那里用已发布版本。
// 两者都调同一个 runAgent——如果各写一份执行逻辑，「调试台试通了、线上还是另一套
// 行为」是迟早的事，那正是这个页面要解决的问题本身。
//
// 没有接频控：它在登录之后，而 lib/ratelimit.mjs 是给公开端点挡刷量的。
// 代价是试聊会真实调用 DeepSeek、真实花钱，README 的成本一节有提示。

import { runAgent } from "../../lib/agent-loop.mjs";
import { formatSse, errorEvent, SSE_HEADERS, HEARTBEAT_MS } from "../../lib/sse.mjs";
import { isConfigured } from "../../lib/deepseek.mjs";
import { validateChatInput } from "../../lib/validate.mjs";
import { sanitizeConfig, validateConfig } from "../../lib/agent-config.mjs";
import { hasValidOrigin, isAdminRequest, json } from "../_shared/admin-auth.js";
import { mergeKnowledgeOverlay, validateKnowledgeOverlay } from "../../lib/knowledge-overlay.mjs";

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
    if (!(await isAdminRequest(request))) return json({ error: "请先登录调试台。" }, 401);
    if (!hasValidOrigin(request)) return json({ error: "请求来源校验失败。" }, 403);
    if (!isConfigured()) return json({ error: "DEEPSEEK_API_KEY 尚未配置。" }, 503);

    let input;
    try {
      input = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }

    const checked = validateChatInput(input);
    if (!checked.ok) return json({ error: checked.error }, checked.status);

    const problem = validateConfig(input?.config);
    if (problem) return json({ error: problem }, 400);
    const config = sanitizeConfig(input.config);
    const knowledgeCheck = validateKnowledgeOverlay(input?.knowledgeOverlay);
    if (!knowledgeCheck.ok) return json({ error: "知识草稿校验未通过。", problems: knowledgeCheck.problems }, 400);
    const knowledge = mergeKnowledgeOverlay(knowledgeCheck.overlay);

    const abort = new AbortController();
    request.signal?.addEventListener("abort", () => abort.abort());

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (chunk) => {
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch {
            // 客户端已断开
          }
        };
        const heartbeat = setInterval(() => send(":\n\n"), HEARTBEAT_MS);
        try {
          for await (const item of runAgent({ ...checked.value, config, knowledge, signal: abort.signal })) {
            send(formatSse(item));
          }
        } catch (error) {
          console.error(error);
          const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
          send(formatSse(errorEvent(
            timedOut ? "timeout" : "upstream_error",
            // 调试台是给自己人用的，把上游报错原文带出来，省得去翻日志。
            timedOut ? "这次查询超时了，请再试一次。" : `模型服务报错：${String(error?.message || error).slice(0, 300)}`,
          )));
        } finally {
          clearInterval(heartbeat);
          try {
            controller.close();
          } catch {
            // 已关闭
          }
        }
      },
      cancel() {
        abort.abort();
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  },
};
