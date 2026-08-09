// POST /api/chat —— SSE 流式的多轮问答接口。
//
// 状态码只在开流之前用（405/400/429/503）；一旦 Response 返回就改不了状态码，
// 所以流中出现的错误一律以 error 事件下发，不能 throw。
//
// 运行配置只从「已发布版本」读，绝不接受请求体传入。validateChatInput 的白名单
// （message / campus / history）就是这道闸——放行 prompt 字段等于把 agent 的全部
// 安全规则和 API key 开放给任何人 curl。调试台要改配置走 /api/admin/*，那边要登录。

import { runAgent } from "../lib/agent-loop.mjs";
import { formatSse, errorEvent, SSE_HEADERS, HEARTBEAT_MS } from "../lib/sse.mjs";
import { isConfigured } from "../lib/deepseek.mjs";
import { checkRateLimit, clientIp } from "../lib/ratelimit.mjs";
import { validateChatInput } from "../lib/validate.mjs";
import { readActiveConfig } from "./_shared/config-store.js";

function json(payload, status) {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!isConfigured()) return json({ error: "DEEPSEEK_API_KEY is not configured" }, 503);
    // 频控放在解析 body 之前，畸形请求的刷量也一并挡住。
    if (!checkRateLimit(clientIp(request.headers))) return json({ error: "too many requests" }, 429);

    let input;
    try {
      input = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400);
    }

    const checked = validateChatInput(input);
    if (!checked.ok) return json({ error: checked.error }, checked.status);

    // 永不抛错：存储没配置或读失败都会降级到代码里的默认配置。
    const { config } = await readActiveConfig();

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
          for await (const item of runAgent({ ...checked.value, config, signal: abort.signal })) {
            send(formatSse(item));
          }
        } catch (error) {
          console.error(error);
          const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
          send(formatSse(errorEvent(
            timedOut ? "timeout" : "upstream_error",
            timedOut ? "这次查询超时了，请再试一次。" : "模型服务暂时不可用，请稍后重试。",
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
