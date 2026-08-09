import {
  adminConfigured,
  clearSessionCookie,
  createSessionCookie,
  credentialsMatch,
  hasValidOrigin,
  isAdminRequest,
  json,
} from "../_shared/admin-auth.js";

export default {
  async fetch(request) {
    if (request.method === "GET") {
      return json({ configured: adminConfigured(), authenticated: await isAdminRequest(request) });
    }
    if (!hasValidOrigin(request)) return json({ error: "请求来源校验失败。" }, 403);
    if (request.method === "DELETE") {
      return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { Allow: "GET, POST, DELETE" });
    if (!adminConfigured()) return json({ error: "管理后台尚未配置访问口令。" }, 503);
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }
    if (!(await credentialsMatch(body?.password))) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      return json({ error: "访问口令不正确。" }, 401);
    }
    return json({ ok: true, authenticated: true }, 200, { "Set-Cookie": await createSessionCookie() });
  },
};
