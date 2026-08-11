"use strict";
// 极小 Markdown 渲染器。和 chat.js 一样是零依赖、零构建的普通 <script>。
//
// 只实现答案里真会出现的语法：GFM 管道表格、有序/无序列表、加粗、行内代码、
// 代码块、引用、小标题、链接。指南知识库通篇是表格（食堂时间、地铁票价、
// 跨校区路线），不渲染表格等于这类问题没法看。
//
// 安全模型：先把整段文本做实体转义，之后只拼我们自己生成的标签，任何情况下
// 都不透传原始 HTML。所以「模型把 <script> 写进答案」只会显示成文本。这比事后
// 用 DOMPurify 清洗更强——压根不存在 HTML 通道。链接额外做协议白名单，
// javascript: / data: 一律降级成纯文本。
//
// 流式渲染见 createStream：committed 段只追加不重建，tail 段是还没写完的块。
// 这样长答案不会每来一个 token 就重排整棵子树，写到一半的表格也不会闪。
(() => {

// 占位符哨兵。渲染前会先把输入里的 U+0000 剔掉，所以不会和正文冲突。
const NUL = "\u0000";

const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ENTITIES[char]);
}

/** 协议白名单。传进来的已经是转义过的文本，不合法就返回 null，调用方回落成纯文本。 */
function safeUrl(raw) {
  const url = String(raw).trim();
  return /^(https?:\/\/|mailto:|tel:)/i.test(url) ? url : null;
}

function anchor(href, label, external) {
  const attrs = external ? ' rel="noreferrer noopener" target="_blank"' : "";
  return `<a href="${href}"${attrs}>${label}</a>`;
}

// ---------- 行内 ----------

/**
 * 行内标记。生成好的 <a> / <code> 立刻换成占位符，避免后面的规则再去匹配它们的
 * 内部——否则 href 里的数字会被电话号码规则二次注入。
 */
function renderInline(text) {
  const holds = [];
  const hold = (html) => `${NUL}${holds.push(html) - 1}${NUL}`;

  let out = escapeHtml(text);

  // 行内代码最先抽走：里面的 ** 和链接都应当原样显示
  out = out.replace(/`([^`\n]+)`/g, (_, code) => hold(`<code class="md-code">${code}</code>`));

  out = out.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (whole, label, url) => {
    const href = safeUrl(url);
    return href ? hold(anchor(href, label, true)) : whole;
  });

  // 裸 URL。排除中英文括号和中文标点，否则「详见 https://x.com（原图 P04）」会把括号吃进去；
  // 结尾的英文句读再单独剥掉，「见 https://x.com。」和「见 https://x.com.」都要断干净。
  out = out.replace(/https?:\/\/[^\s<>"'()（）【】，。；、：！？]+/g, (url) => {
    const trailing = (url.match(/[.,!?]+$/) || [""])[0];
    const clean = trailing ? url.slice(0, -trailing.length) : url;
    const href = safeUrl(clean);
    return href ? hold(anchor(href, clean, true)) + trailing : url;
  });

  // 电话。只认区号座机和手机号——指南里 "07:00—20:00"、"¥40"、"105 min" 到处都是，
  // 宽松的数字规则会把它们全变成拨号链接。
  out = out.replace(/(^|[^\d-])(\d{3,4}-\d{7,8}|1[3-9]\d{9})(?![\d-])/g, (_, before, phone) =>
    `${before}${hold(anchor(`tel:${phone.replace(/-/g, "")}`, phone, false))}`);

  out = out.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

  return out.replace(new RegExp(`${NUL}(\\d+)${NUL}`, "g"), (_, index) => holds[Number(index)]);
}

function inlineWithBreaks(text) {
  return renderInline(text).replace(/\n/g, "<br />");
}

// ---------- 表格 ----------

function splitRow(line) {
  let row = line.trim();
  if (row.startsWith("|")) row = row.slice(1);
  if (row.endsWith("|")) row = row.slice(0, -1);
  return row.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line) {
  if (!line || !line.includes("-") || !line.includes("|")) return false;
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

function alignOf(cell) {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "";
}

function renderTable(block) {
  const header = splitRow(block[0]);
  const aligns = splitRow(block[1]).map(alignOf);
  const cell = (text, tag, align) =>
    `<${tag}${align ? ` style="text-align:${align}"` : ""}>${renderInline(text)}</${tag}>`;

  const head = header.map((text, at) => cell(text, "th", aligns[at])).join("");
  // 按表头列数对齐，避免某一行多写少写一个 | 就把整张表撑歪
  const body = block.slice(2).map((line) => {
    const cells = splitRow(line);
    return `<tr>${header.map((_, at) => cell(cells[at] ?? "", "td", aligns[at])).join("")}</tr>`;
  }).join("");

  return `<div class="md-table-wrap"><table class="md-table">`
    + `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

// ---------- 列表 ----------

function buildList(items, start) {
  const base = items[start].indent;
  const tag = items[start].ordered ? "ol" : "ul";
  const parts = [];
  let at = start;

  while (at < items.length && items[at].indent >= base) {
    if (items[at].indent > base && parts.length) {
      const nested = buildList(items, at);
      parts[parts.length - 1] = parts[parts.length - 1].replace(/<\/li>$/, `${nested.html}</li>`);
      at = nested.next;
      continue;
    }
    parts.push(`<li>${inlineWithBreaks(items[at].text)}</li>`);
    at += 1;
  }

  return { html: `<${tag} class="md-list">${parts.join("")}</${tag}>`, next: at };
}

function renderList(lines) {
  const items = [];
  for (const line of lines) {
    const matched = line.match(LIST_ITEM);
    if (matched) {
      items.push({ indent: matched[1].length, ordered: /^\d/.test(matched[2]), text: matched[3] });
    } else if (items.length) {
      items[items.length - 1].text += `\n${line.trim()}`; // 列表项的续行
    }
  }
  return items.length ? buildList(items, 0).html : "";
}

// ---------- 块级 ----------

function isBlockStart(line) {
  return LIST_ITEM.test(line)
    || /^\s{0,3}>/.test(line)
    || /^\s{0,3}#{1,6}\s/.test(line)
    || /^\s*```/.test(line);
}

function toHtml(source) {
  const lines = String(source).replace(/\u0000/g, "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let at = 0;

  while (at < lines.length) {
    const line = lines[at];

    if (!line.trim()) {
      at += 1;
      continue;
    }

    if (/^\s*```/.test(line)) {
      const body = [];
      at += 1;
      while (at < lines.length && !/^\s*```/.test(lines[at])) {
        body.push(lines[at]);
        at += 1;
      }
      at += 1; // 结束栅栏
      out.push(`<pre class="md-pre"><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
    if (heading) {
      // 气泡里不该出现 h1/h2 那么大的字，统一降到 h4—h6
      const level = heading[1].length;
      const tag = level <= 2 ? "h4" : level <= 4 ? "h5" : "h6";
      out.push(`<${tag} class="md-h">${renderInline(heading[2].trim())}</${tag}>`);
      at += 1;
      continue;
    }

    if (/^\s{0,3}([-*_])\s*(\1\s*){2,}$/.test(line)) {
      out.push('<hr class="md-hr" />');
      at += 1;
      continue;
    }

    if (line.includes("|") && isTableSeparator(lines[at + 1])) {
      const block = [];
      while (at < lines.length && lines[at].trim() && lines[at].includes("|")) {
        block.push(lines[at]);
        at += 1;
      }
      out.push(renderTable(block));
      continue;
    }

    if (/^\s{0,3}>/.test(line)) {
      const block = [];
      while (at < lines.length && /^\s{0,3}>/.test(lines[at])) {
        block.push(lines[at].replace(/^\s{0,3}>\s?/, ""));
        at += 1;
      }
      out.push(`<blockquote class="md-quote">${toHtml(block.join("\n"))}</blockquote>`);
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const block = [];
      while (at < lines.length && lines[at].trim() && (LIST_ITEM.test(lines[at]) || /^\s{2,}\S/.test(lines[at]))) {
        block.push(lines[at]);
        at += 1;
      }
      out.push(renderList(block));
      continue;
    }

    const paragraph = [];
    while (at < lines.length && lines[at].trim() && !isBlockStart(lines[at])) {
      paragraph.push(lines[at].trim());
      at += 1;
    }
    out.push(`<p class="md-p">${inlineWithBreaks(paragraph.join("\n"))}</p>`);
  }

  return out.join("");
}

/** 渲染成 DocumentFragment。字符串已全程转义，这里用 <template> 解析是安全的。 */
function render(source) {
  const template = document.createElement("template");
  template.innerHTML = toHtml(source);
  return template.content;
}

// ---------- 流式 ----------

/**
 * 找可以「定稿」的切点：最后一个空行，且不在未闭合的代码块里。
 * 切点之前的块不会再变，可以一次性渲染完就不动了。
 */
function lastSafeCut(text, from) {
  let at = text.lastIndexOf("\n\n");
  while (at >= from) {
    const fences = (text.slice(0, at).match(/^\s*```/gm) || []).length;
    if (fences % 2 === 0) return at + 2;
    at = text.lastIndexOf("\n\n", at - 1);
  }
  return -1;
}

/**
 * 松散列表（项之间有空行）会被切成多个单项 <ul>。这里把同类型的相邻列表并回去，
 * 否则「1. 2. 3.」会渲染成三个各自从 1 开始的列表。
 */
function mergeAdjacentList(container, fragment) {
  const last = container.lastElementChild;
  const first = fragment.firstElementChild;
  if (!last || !first) return;
  if (last.tagName !== first.tagName) return;
  if (last.tagName !== "UL" && last.tagName !== "OL") return;
  last.append(...first.children);
  first.remove();
}

/**
 * 增量渲染。push 每个 token，finish 收尾。
 * committed 只追加已定稿的块；tail 是还没写完的那一块，先按纯文本显示，
 * 等块完整了再「升级」成表格/列表。
 */
function createStream(container) {
  const committed = document.createElement("div");
  committed.className = "md-body";
  const tail = document.createElement("div");
  tail.className = "md-tail";
  container.append(committed, tail);

  let raw = "";
  let renderedUpTo = 0;
  let frame = 0;
  let painted = null;

  function commit(source) {
    const fragment = render(source);
    mergeAdjacentList(committed, fragment);
    committed.append(fragment);
  }

  function paint() {
    frame = 0;
    const cut = lastSafeCut(raw, renderedUpTo);
    if (cut > renderedUpTo) {
      commit(raw.slice(renderedUpTo, cut));
      renderedUpTo = cut;
    }
    tail.textContent = raw.slice(renderedUpTo);
    if (painted) painted();
  }

  return {
    push(delta) {
      if (!delta) return;
      raw += delta;
      // rAF 合并：一帧最多重排一次，而不是每个 token 一次
      if (!frame) frame = requestAnimationFrame(paint);
    },
    finish() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      const rest = raw.slice(renderedUpTo);
      if (rest.trim()) commit(rest);
      renderedUpTo = raw.length;
      tail.remove();
      if (painted) painted();
    },
    /** 每次重绘后回调，供调用方决定要不要跟着滚动到底。 */
    onPaint(fn) { painted = fn; },
    get text() { return raw; },
  };
}

window.SEUMarkdown = { render, toHtml, createStream, escapeHtml };

})();
