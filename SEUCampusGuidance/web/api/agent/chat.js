// Keep the map drawer's legacy contract available from the web deployment.
// This endpoint intentionally reads the checked-in shared knowledge baseline:
// the standalone Agent app still owns mutable Blob overlays, while the map app
// must also work when only the web package is installed by Vercel.

import { answerLegacy } from "../../../agent/lib/legacy.mjs";
import { isConfigured } from "../../../agent/lib/deepseek.mjs";

function json(payload, status = 200) {
  return Response.json(payload, { status, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!isConfigured()) return json({ error: "DEEPSEEK_API_KEY is not configured" }, 503);
    try {
      const input = await request.json();
      const message = String(input.message || "").trim();
      if (!message) return json({ error: "message is required" }, 400);
      return json(await answerLegacy(message, { signal: request.signal }));
    } catch (error) {
      console.error(error);
      return json({ error: "Agent service temporarily unavailable" }, 500);
    }
  },
};
