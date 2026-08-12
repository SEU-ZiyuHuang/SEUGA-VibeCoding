import { complete, isConfigured } from "../../lib/deepseek.mjs";
import { hasValidOrigin, isAdminRequest, json } from "../_shared/admin-auth.js";

function parseJson(text) {
  return JSON.parse(String(text || "").replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
    if (!(await isAdminRequest(request))) return json({ error: "请先登录调试台。" }, 401);
    if (!hasValidOrigin(request)) return json({ error: "请求来源校验失败。" }, 403);
    if (!isConfigured()) return json({ error: "DEEPSEEK_API_KEY 尚未配置。" }, 503);
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }
    const text = typeof body?.text === "string" ? body.text.trim().slice(0, 12_000) : "";
    if (!text) return json({ error: "请先填写正文。" }, 400);
    try {
      const reply = await complete({
        messages: [
          {
            role: "system",
            content: [
              "你为校园指南知识页生成检索元数据，不得改写正文，也不得添加正文没有的事实。",
              "summary 为 40—70 字，包含最关键的具体事实。",
              "keywords 为 6—12 个正文中逐字出现的名词。",
              "aliasPairs 为学生口语到正文书面词的一一对应；written 必须逐字出现在正文中。",
              '只输出 JSON：{"summary":"...","keywords":[],"aliasPairs":[{"spoken":"...","written":"..."}]}',
            ].join("\n"),
          },
          { role: "user", content: `标题：${String(body?.title || "").slice(0, 120)}\n\n正文：\n${text}` },
        ],
        maxTokens: 900,
        temperature: 0.2,
        timeoutMs: 60_000,
        responseFormat: { type: "json_object" },
      });
      const parsed = parseJson(reply.choices?.[0]?.message?.content);
      const keywords = Array.isArray(parsed.keywords) ? parsed.keywords.map(String).filter((word) => text.includes(word)).slice(0, 20) : [];
      const aliasPairs = Array.isArray(parsed.aliasPairs) ? parsed.aliasPairs.map((pair) => ({
        spoken: String(pair?.spoken || "").trim(),
        written: String(pair?.written || "").trim(),
      })).filter((pair) => pair.spoken && pair.written && pair.spoken !== pair.written && text.includes(pair.written)).slice(0, 20) : [];
      return json({ ok: true, candidates: { summary: String(parsed.summary || "").trim().slice(0, 200), keywords, aliasPairs } });
    } catch (error) {
      console.error("Knowledge metadata generation failed", error);
      return json({ error: "元数据生成失败，请稍后重试。" }, 502);
    }
  },
};
