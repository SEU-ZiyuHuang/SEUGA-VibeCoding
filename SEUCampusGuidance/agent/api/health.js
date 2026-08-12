// GET /api/health —— 部署自检。不泄露 Key 本身，只报是否配置。

import { isConfigured } from "../lib/deepseek.mjs";
import { KNOWLEDGE_BUILD, CAMPUSES } from "../data/knowledge.mjs";
import { storageConfigured } from "./_shared/config-store.js";
import { readActiveKnowledge, knowledgeStorageConfigured } from "./_shared/knowledge-store.js";

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    const activeKnowledge = await readActiveKnowledge();
    return Response.json({
      status: "ok",
      agentEnabled: isConfigured(),
      configStorageConfigured: storageConfigured(),
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      knowledgeStorageConfigured: knowledgeStorageConfigured(),
      knowledge: {
        generatedAt: KNOWLEDGE_BUILD.generatedAt,
        chunks: activeKnowledge.knowledge.build.chunkCount,
        campuses: activeKnowledge.knowledge.campuses.map((campus) => ({ slug: campus.slug, name: campus.name, version: campus.version })),
        release: activeKnowledge.release?.pathname || null,
        usingBaseline: activeKnowledge.usingBaseline,
        degraded: activeKnowledge.degraded,
        warnings: activeKnowledge.warnings,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  },
};
