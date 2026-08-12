import assert from "node:assert/strict";
import { CHUNKS, KNOWLEDGE_BUILD } from "../data/knowledge.mjs";
import {
  emptyKnowledgeOverlay,
  mergeKnowledgeOverlay,
  validateKnowledgeOverlay,
} from "../lib/knowledge-overlay.mjs";
import { createRetriever } from "../lib/retrieve.mjs";
import { runAgent } from "../lib/agent-loop.mjs";

const audit = {
  sourceLabel: "学校现场公告",
  sourceUrl: "https://example.edu/notice",
  verifiedAt: "2026-08-12",
  verifiedBy: "测试维护员",
  note: "验证线上知识修订",
};
const base = CHUNKS.find((chunk) => chunk.id === "wuxi/autonomous-shuttle");
assert.ok(base, "测试基线页面存在");

const revised = emptyKnowledgeOverlay();
revised.campusChanges.wuxi = { version: "2026.08 核验版", notice: "班次可能调整，请以现场公告为准。", audit };
revised.chunkChanges[base.id] = {
  action: "upsert",
  campus: "wuxi",
  title: "无人小巴最新核验",
  version: "2026.08 核验版",
  summary: "无人小巴试运行信息已经现场核验，具体发车时间仍需以当天站牌和运营公告为准。",
  keywords: ["无人小巴", "发车"],
  aliasPairs: [{ spoken: "豆豆车", written: "无人小巴" }],
  related: [],
  pages: ["P07"],
  text: `${base.text}\n\n补充核验：无人小巴发车安排以当天公告为准。`,
  audit,
};
const checked = validateKnowledgeOverlay(revised);
assert.equal(checked.ok, true, checked.problems.join("；"));
assert.equal(checked.knowledge.campuses.find((campus) => campus.slug === "wuxi").version, "2026.08 核验版");
const revisedChunk = checked.knowledge.chunks.find((chunk) => chunk.id === base.id);
assert.equal(revisedChunk.sectionPath, "无人小巴最新核验");
assert.equal(revisedChunk.managed, true);
assert.equal(revisedChunk.sourceLabel, audit.sourceLabel);
assert.equal(createRetriever(checked.knowledge).searchGuide({ campus: "wuxi", query: "豆豆车", topK: 1 })[0]?.id, base.id, "线上别名应参与检索");

const originalFetch = globalThis.fetch;
const originalKey = process.env.DEEPSEEK_API_KEY;
process.env.DEEPSEEK_API_KEY = "knowledge-test-key";
globalThis.fetch = async () => new Response('data: {"choices":[{"delta":{"content":"测试回答"}}]}\n\ndata: [DONE]\n\n', {
  status: 200,
  headers: { "Content-Type": "text/event-stream" },
});
const events = [];
for await (const event of runAgent({ message: "无人小巴几点发车", campus: "wuxi", knowledge: checked.knowledge })) events.push(event);
const managedSource = events.find((event) => event.event === "sources")?.data.sources.find((source) => source.id === base.id);
assert.equal(managedSource?.managed, true, "Agent 来源应标记线上修订");
assert.equal(managedSource?.sourceLabel, audit.sourceLabel, "Agent 来源应携带公开来源说明");
assert.equal(managedSource?.verifiedAt, audit.verifiedAt, "Agent 来源应携带核验日期");
assert.equal("verifiedBy" in managedSource, false, "Agent 来源不得暴露核验人");
globalThis.fetch = originalFetch;
if (originalKey === undefined) delete process.env.DEEPSEEK_API_KEY;
else process.env.DEEPSEEK_API_KEY = originalKey;

const addedId = "wuxi/managed-12345678-1234-4123-8123-123456789abc";
revised.chunkChanges[addedId] = {
  action: "upsert", campus: "wuxi", title: "临时服务点", version: "2026.08 核验版",
  summary: "临时服务点位于测试楼一层大厅，开放安排以现场公告为准，适合验证线上新增知识。",
  keywords: ["临时服务点", "测试楼"], aliasPairs: [{ spoken: "临时点", written: "临时服务点" }], related: [base.id], pages: [],
  text: "临时服务点位于测试楼一层大厅，开放安排以现场公告为准。", audit,
};
assert.equal(validateKnowledgeOverlay(revised).ok, true, "合法 managed 页面应可新增");
assert.equal(mergeKnowledgeOverlay(revised).chunks.some((chunk) => chunk.id === addedId), true);

revised.chunkChanges[addedId] = { ...revised.chunkChanges[addedId], action: "disable" };
const disabled = validateKnowledgeOverlay(revised);
assert.equal(disabled.ok, true, disabled.problems.join("；"));
assert.equal(disabled.knowledge.chunks.some((chunk) => chunk.id === addedId), false, "停用页不得进入运行时知识");

delete revised.chunkChanges[base.id];
assert.equal(mergeKnowledgeOverlay(revised).chunks.find((chunk) => chunk.id === base.id).sectionPath, base.sectionPath, "移除覆盖应恢复静态基线");

const broken = emptyKnowledgeOverlay();
broken.chunkChanges[base.id] = {
  action: "upsert", campus: "wuxi", title: base.sectionPath, version: base.version,
  summary: "这是一条满足长度要求、但故意包含错误关联页面的测试摘要，用来验证发布安全闸门。",
  keywords: ["无人小巴"], aliasPairs: [{ spoken: "坏别名", written: "正文不存在" }], related: ["wuxi/missing"], pages: base.pages, text: base.text, audit,
};
const brokenCheck = validateKnowledgeOverlay(broken);
assert.equal(brokenCheck.ok, false);
assert.ok(brokenCheck.problems.some((problem) => problem.includes("书面词")));
assert.ok(brokenCheck.problems.some((problem) => problem.includes("相关页")));

const stale = emptyKnowledgeOverlay();
stale.baseGeneratedAt = "2000-01-01T00:00:00.000Z";
stale.chunkChanges["wuxi/deleted-from-baseline"] = { action: "disable", audit };
const staleCheck = validateKnowledgeOverlay(stale);
assert.equal(staleCheck.ok, false);
assert.ok(staleCheck.warnings.length > 0);
assert.equal(KNOWLEDGE_BUILD.chunkCount, mergeKnowledgeOverlay(emptyKnowledgeOverlay()).chunks.length, "空修订必须保持原知识块数");

console.log("✓ 知识修订合并、校验、动态检索与兼容性测试全部通过");
