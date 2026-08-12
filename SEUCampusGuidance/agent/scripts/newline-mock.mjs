import assert from "node:assert/strict";
import { normalizeNewlines } from "./guide-source.mjs";

const expected = "第一行\n第二行\n第三行\n";

assert.equal(normalizeNewlines(expected), expected, "LF 应保持不变");
assert.equal(normalizeNewlines("第一行\r\n第二行\r\n第三行\r\n"), expected, "CRLF 应转换为 LF");
assert.equal(normalizeNewlines("第一行\r第二行\r第三行\r"), expected, "CR 应转换为 LF");
assert.equal(normalizeNewlines("第一行\r\n第二行\r第三行\n"), expected, "混合换行应统一为 LF");

console.log("✓ LF / CRLF / CR 换行归一化全部通过");
