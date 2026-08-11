// public/markdown.js 的断言测试。
//
// 渲染器是普通 <script>（挂 window，不是 module），所以这里造一个假 window 再 eval 它。
// toHtml 是纯字符串函数、不碰 DOM，能在 Node 里直接测；render/createStream 需要真 DOM，
// 按 README 的验证清单在浏览器里手测。
//
// 重点覆盖两类：① 表格（知识库通篇是表格，切坏了最难发现）；② 转义（答案里混进
// HTML 就是 XSS）。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "public", "markdown.js"), "utf8");

const window = {};
new Function("window", source)(window);
const { toHtml } = window.SEUMarkdown;

let passed = 0;
const failures = [];

function check(name, actual, expected) {
  const ok = typeof expected === "function" ? expected(actual) : actual === expected;
  if (ok) {
    passed += 1;
    return;
  }
  failures.push({ name, actual, expected: typeof expected === "function" ? "(谓词)" : expected });
}

const has = (needle) => (actual) => actual.includes(needle);
const lacks = (needle) => (actual) => !actual.includes(needle);

// ---------- 转义与注入 ----------

check("script 标签被转义", toHtml("<script>alert(1)</script>"), lacks("<script>"));
check("script 内容以文本呈现", toHtml("<script>alert(1)</script>"), has("&lt;script&gt;"));
check("img onerror 被转义", toHtml('<img src=x onerror=alert(1)>'), lacks("<img"));
check("javascript: 链接降级为文本", toHtml("[点我](javascript:alert(1))"), lacks("<a "));
check("data: 链接降级为文本", toHtml("[点我](data:text/html,<script>)"), lacks("<a "));
check("https 链接正常", toHtml("[东大](https://seu.edu.cn)"), has('href="https://seu.edu.cn"'));
check("外链带 rel", toHtml("[东大](https://seu.edu.cn)"), has('rel="noreferrer noopener"'));
check("表格单元格里的 HTML 也转义", toHtml("| a |\n| --- |\n| <b>x</b> |"), lacks("<b>x</b>"));

// ---------- 表格 ----------

const table = toHtml([
  "| 目的地 | 路线 | 耗时 | 票价 |",
  "| --- | --- | ---: | ---: |",
  "| 南京站 | M3 直达 | 35 min | ¥4 |",
  "| 禄口机场 | M3 转 S1 | 105 min | ¥10 |",
].join("\n"));

check("表格生成 table", table, has("<table"));
check("表格有横滚容器", table, has("md-table-wrap"));
check("表头进 thead", table, has("<thead><tr><th>目的地</th>"));
check("右对齐生效", table, has('style="text-align:right"'));
check("数据行数正确", table, (html) => (html.match(/<tr>/g) || []).length === 3);
check("单元格内容保留", table, has("<td>禄口机场</td>"));

// 少一列的行不该把表撑歪
const ragged = toHtml("| a | b | c |\n| --- | --- | --- |\n| 1 | 2 |");
check("缺列补空单元格", ragged, (html) => (html.match(/<td/g) || []).length === 3);

// 没有分隔行就不是表格
check("无分隔行不当表格", toHtml("| 这不是表格 |\n就是段落"), lacks("<table"));

// ---------- 行内 ----------

check("加粗", toHtml("**梅园**"), has("<strong>梅园</strong>"));
check("行内代码", toHtml("`jiulonghu/09/2`"), has("<code"));
check("代码内的星号不解析", toHtml("`**x**`"), lacks("<strong>"));
check("代码内的尖括号转义", toHtml("`<b>`"), has("&lt;b&gt;"));

// 电话识别：真号码要认，时间和价格不能认
check("座机变拨号链接", toHtml("电话 025-83792114"), has('href="tel:02583792114"'));
check("手机号变拨号链接", toHtml("联系 13812345678"), has('href="tel:13812345678"'));
check("营业时间不当电话", toHtml("07:00—20:00 开放"), lacks("tel:"));
check("票价不当电话", toHtml("票价 ¥10，耗时 105 min"), lacks("tel:"));
check("裸 URL 自动链接", toHtml("见 https://seu.edu.cn 官网"), has('href="https://seu.edu.cn"'));
check("URL 不吞中文左括号", toHtml("见 https://seu.edu.cn（原图 P04）"), has('href="https://seu.edu.cn"'));
check("URL 不吞中文句号", toHtml("见 https://seu.edu.cn。"), has('href="https://seu.edu.cn"'));
check("URL 不吞英文句号", toHtml("见 https://seu.edu.cn."), has('href="https://seu.edu.cn"'));
check("剥掉的句号仍然显示", toHtml("见 https://seu.edu.cn."), has("</a>."));
check("URL 保留查询串", toHtml("见 https://x.com/a?b=1&c=2 完"), has("b=1&amp;c=2"));

// ---------- 块级 ----------

check("无序列表", toHtml("- 甲\n- 乙"), has("<ul"));
check("有序列表", toHtml("1. 甲\n2. 乙"), has("<ol"));
check("列表项数", toHtml("- 甲\n- 乙\n- 丙"), (html) => (html.match(/<li>/g) || []).length === 3);
check("嵌套列表", toHtml("- 甲\n  - 甲一\n- 乙"), has("<ul class=\"md-list\"><li>甲<ul"));
check("引用", toHtml("> 时效提醒"), has("<blockquote"));
check("代码块", toHtml("```\nplain\n```"), has("<pre"));
check("代码块内不解析 markdown", toHtml("```\n**x**\n```"), lacks("<strong>"));
check("小标题降级到 h4", toHtml("# 大标题"), has("<h4"));
check("三级标题降到 h5", toHtml("### 三级"), has("<h5"));
check("段落", toHtml("就是一段话"), has("<p class=\"md-p\">就是一段话</p>"));
check("段内换行变 br", toHtml("第一行\n第二行"), has("<br />"));
check("空输入不炸", toHtml(""), "");
check("纯空白不炸", toHtml("\n\n  \n"), "");

// 混排：表格后面接段落，是答案里最常见的形状
const mixed = toHtml("**江北到禄口机场**\n\n| 方式 | 耗时 |\n| --- | --- |\n| 地铁 | 105 min |\n\n班次可能已调整。");
check("混排出表格", mixed, has("<table"));
check("混排出段落", mixed, has("班次可能已调整。"));
check("混排出加粗", mixed, has("<strong>江北到禄口机场</strong>"));

// ---------- 报告 ----------

if (failures.length) {
  console.error(`markdown 渲染器：${passed} 通过，${failures.length} 失败\n`);
  for (const failure of failures) {
    console.error(`  ✗ ${failure.name}`);
    console.error(`    期望：${failure.expected}`);
    console.error(`    实际：${failure.actual}\n`);
  }
  process.exit(1);
}

console.log(`markdown 渲染器：${passed} 项断言全部通过`);
