"use strict";
(() => {

const CAMPUS_NAMES = {
  jiulonghu: "九龙湖", sipailou: "四牌楼", dingjiaqiao: "丁家桥",
  suzhou: "苏州", jiangbei: "江北", wuxi: "无锡",
};

// 按校区给的高频问题。选「自动判断」时用通用的一组。
const SUGGESTIONS = {
  auto: ["九龙湖梅园的床帘要买多大？", "四牌楼沙塘园的快递寄到哪？", "从丁家桥怎么去九龙湖？", "无锡校区怎么去地铁站？"],
  jiulonghu: ["梅园的床帘要买多大？", "兰台线节假日几点有车？", "图书馆几点关门？", "桃园食堂有夜宵吗？", "快递寄到哪个驿站？", "游泳馆怎么办卡？"],
  sipailou: ["沙塘园的快递寄到哪？", "文昌各宿舍是几人间？", "图书馆怎么预约座位？", "校医院在哪、几点开？", "怎么去浮桥地铁站？", "一卡通怎么充值？"],
  dingjiaqiao: ["求恩宿舍卫浴条件如何？", "医林食堂几点开饭？", "驿收发能取什么快递？", "怎么去九龙湖校区？", "中大医院门诊时间？", "通宵自习室在哪？"],
  suzhou: ["文荟人才公寓住宿条件？", "水电费怎么交？", "外卖和快递地址怎么填？", "怎么去松涛街地铁站？", "附近有哪些吃饭的地方？", "打印在哪里、多少钱？"],
  jiangbei: ["桃园宿舍床要买多大的？", "食堂几点开门？", "菜鸟驿站在哪？", "怎么去禄口机场？", "怎么去四牌楼校区？", "校内医务室在哪？"],
  wuxi: ["榴园宿舍是几人间？", "食堂供餐时间？", "无人小巴几点发车？", "怎么去长广溪地铁站？", "图书馆研讨室怎么预约？", "菜鸟驿站几点关？"],
};

// 后端 phase 事件 → 标题。data.phase 是未知值时回落成通用文案，
// 这样后端加新阶段不会让前端显示空白。
const PHASE_TITLES = {
  retrieving: (campusName) => `正在翻${campusName || ""}指南`,
  thinking: () => "正在判断要查哪几节",
  reading: () => "正在读检索到的章节",
  writing: () => "正在组织答案",
};

// 等待期轮播的副标题。写的都是该阶段系统确实在做的事——不编造具体发现
// （不写「已找到梅园的数据」），出错时才不会变成误导。
const PHASE_HINTS = {
  retrieving: ["在全部章节里做关键词匹配…"],
  thinking: ["在判断哪些章节真的相关…", "在确认问题指向哪个校区…", "在决定要不要换个说法再查一次…"],
  reading: ["在读章节原文…", "在对照原图页码…", "在核对指南的时效提醒…"],
  writing: ["在按指南原文组织措辞…", "在标注版本口径…", "在把时刻和票价整理成表格…"],
};

const HINT_INTERVAL_MS = 2200;

const elements = {
  list: document.getElementById("messageList"),
  announcer: document.getElementById("srAnnouncer"),
  form: document.getElementById("chatForm"),
  input: document.getElementById("chatInput"),
  send: document.getElementById("sendButton"),
  campusBar: document.getElementById("campusBar"),
  suggestions: document.getElementById("suggestions"),
  template: document.getElementById("turnTemplate"),
  aboutButton: document.getElementById("aboutButton"),
  aboutModal: document.getElementById("aboutModal"),
  aboutBody: document.getElementById("aboutBody"),
  aboutClose: document.getElementById("aboutClose"),
};

const state = {
  campus: localStorage.getItem("seu-agent-campus") || "auto",
  busy: false,
  abort: null,
  history: [],
};

/**
 * 默认「粘底」，但用户已经翻上去看历史时就别拽他回来——
 * 流式答案每帧都会触发一次滚动，不加这道判断就没法边生成边往回读。
 * force 用于用户自己发消息这种确实该跳到底的时刻。
 */
function scrollToBottom(force) {
  const list = elements.list;
  if (!force && list.scrollHeight - list.scrollTop - list.clientHeight > 120) return;
  list.scrollTop = list.scrollHeight;
}

function dropIntro() {
  const intro = elements.list.querySelector(".intro");
  if (intro) intro.remove();
}

function appendUser(text) {
  dropIntro();
  const node = document.createElement("div");
  node.className = "message user";
  node.textContent = text;
  elements.list.append(node);
  scrollToBottom(true); // 自己刚发的消息，一定跳到底
}

function appendTurn() {
  dropIntro();
  const fragment = elements.template.content.cloneNode(true);
  const turn = fragment.querySelector(".turn");
  elements.list.append(fragment);
  scrollToBottom(true);
  return {
    root: turn,
    trace: turn.querySelector(".turn-trace"),
    toggle: turn.querySelector(".trace-toggle"),
    title: turn.querySelector(".trace-title"),
    timer: turn.querySelector(".trace-timer"),
    hint: turn.querySelector(".trace-hint"),
    spinner: turn.querySelector(".spinner"),
    steps: turn.querySelector(".trace-steps"),
    skeleton: turn.querySelector(".answer-skeleton"),
    body: turn.querySelector(".turn-body"),
    sources: turn.querySelector(".turn-sources"),
  };
}

/**
 * 等待期的状态机。驱动标题、副标题轮播、计时器和骨架屏。
 *
 * 存在的理由：决策轮是非流式的，首个 token 之前可能要静默好几秒。这段时间里
 * 只有一个不动的圆点，体感就是卡死了。阶段来自后端真实的 phase 事件，
 * 副标题只是把该阶段在做的事说得具体一点。
 */
function createStatus(turn) {
  const startedAt = Date.now();
  let phase = null;
  let hintAt = 0;
  let hintTimer = 0;
  let campusName = "";

  const ticker = setInterval(() => {
    const seconds = (Date.now() - startedAt) / 1000;
    turn.timer.textContent = seconds >= 1 ? `已用 ${seconds.toFixed(1)}s` : "";
  }, 100);

  function showHint() {
    const hints = PHASE_HINTS[phase];
    if (!hints || !hints.length) {
      turn.hint.textContent = "";
      return;
    }
    turn.hint.textContent = hints[hintAt % hints.length];
    hintAt += 1;
    // 重启入场动画：改 textContent 不会自动重放 CSS animation
    turn.hint.style.animation = "none";
    void turn.hint.offsetWidth;
    turn.hint.style.animation = "";
  }

  const status = {
    setCampus(name) {
      campusName = name;
      if (phase) status.title();
    },
    title() {
      const build = PHASE_TITLES[phase];
      turn.title.textContent = build ? build(campusName) : "正在查询…";
    },
    set(next) {
      turn.trace.hidden = false;
      if (next === phase) return;
      phase = next;
      hintAt = 0;
      status.title();
      showHint();
      clearInterval(hintTimer);
      hintTimer = setInterval(showHint, HINT_INTERVAL_MS);
    },
    /** 第一个 token 到了：撤掉骨架屏，停掉安抚文案，剩下的交给流式正文。 */
    answering() {
      turn.skeleton.hidden = true;
      clearInterval(hintTimer);
      hintTimer = 0;
      turn.hint.textContent = "";
      turn.body.classList.add("streaming");
    },
    stop() {
      clearInterval(hintTimer);
      clearInterval(ticker);
      turn.skeleton.hidden = true;
      turn.hint.textContent = "";
      turn.timer.textContent = "";
      turn.body.classList.remove("streaming");
    },
  };
  return status;
}

function setTraceTitle(turn, text) {
  turn.trace.hidden = false;
  turn.title.textContent = text;
}

function addStep(turn, html) {
  turn.trace.hidden = false;
  const item = document.createElement("li");
  item.innerHTML = html;
  turn.steps.append(item);
  scrollToBottom();
}

function finishTrace(turn, data) {
  turn.spinner.hidden = true;
  const seconds = data.tookMs ? (data.tookMs / 1000).toFixed(1) : null;
  const steps = turn.steps.children.length;
  if (!steps) {
    turn.trace.hidden = true;
    return;
  }
  turn.title.textContent = `查了 ${steps} 步${seconds ? ` · ${seconds}s` : ""}（点开看过程）`;
}

function renderSources(turn, sources) {
  if (!sources || !sources.length) return;
  turn.sources.hidden = false;
  turn.sources.querySelector(".sources-count").textContent = `${sources.length} 个章节`;
  const list = turn.sources.querySelector(".sources-list");
  list.replaceChildren();
  for (const source of sources) {
    const item = document.createElement("li");
    item.textContent = `${source.campusName} · ${source.version} · ${source.section}`;
    if (source.pages && source.pages.length) {
      const tag = document.createElement("span");
      tag.className = "page-tag";
      tag.textContent = `源图 ${source.pages.join("、")}`;
      item.append(tag);
    }
    if (source.managed && source.sourceLabel) {
      const label = document.createElement(source.sourceUrl ? "a" : "span");
      label.className = "page-tag managed-source";
      label.textContent = `线上核验：${source.sourceLabel}${source.verifiedAt ? `（${source.verifiedAt}）` : ""}`;
      if (source.sourceUrl) {
        label.href = source.sourceUrl;
        label.target = "_blank";
        label.rel = "noopener noreferrer";
      }
      item.append(label);
    }
    list.append(item);
  }
}

/**
 * 往屏幕阅读器播报区写一次。先清空再写，是为了让内容相同的两次回答也能被重新播报。
 * 这里刻意用 setTimeout 而不是 requestAnimationFrame：标签页在后台时 rAF 不会触发，
 * 那样播报就永远丢了。
 */
function announce(text) {
  if (!elements.announcer) return;
  elements.announcer.textContent = "";
  setTimeout(() => { elements.announcer.textContent = text; }, 50);
}

function showError(turn, message, retryable, retry) {
  turn.spinner.hidden = true;
  turn.skeleton.hidden = true;
  turn.hint.textContent = "";
  turn.timer.textContent = "";
  announce(message);
  if (!turn.steps.children.length) turn.trace.hidden = true;
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.textContent = message;
  if (retryable && retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "重试";
    button.addEventListener("click", () => {
      banner.remove();
      retry();
    });
    banner.append(button);
  }
  turn.root.append(banner);
  scrollToBottom();
}

/** SSE 帧解析。EventSource 不支持 POST，所以只能用 fetch + ReadableStream 自己拆帧。 */
async function* readSse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let cut;
    while ((cut = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      if (frame.startsWith(":")) continue; // 心跳
      let name = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) name = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        yield { event: name, data: JSON.parse(data) };
      } catch {
        // 半包，丢弃
      }
    }
  }
}

/**
 * 建立答案区的流式 Markdown 渲染器。
 * markdown.js 没加载成功时退回纯文本——渲染器挂了不该连答案都看不到。
 */
function startAnswer(turn) {
  if (!window.SEUMarkdown) {
    let text = "";
    turn.body.style.whiteSpace = "pre-wrap";
    return {
      push(delta) { text += delta; turn.body.textContent = text; scrollToBottom(); },
      finish() {},
    };
  }
  const stream = window.SEUMarkdown.createStream(turn.body);
  stream.onPaint(() => scrollToBottom());
  return stream;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

function setBusy(busy) {
  state.busy = busy;
  elements.send.disabled = busy;
  elements.list.setAttribute("aria-busy", busy ? "true" : "false");
}

async function ask(question) {
  if (state.busy) return;
  setBusy(true);
  appendUser(question);
  const turn = appendTurn();
  const status = createStatus(turn);
  setTraceTitle(turn, "正在查询…");
  turn.skeleton.hidden = false;

  state.abort = new AbortController();
  const watchdog = setTimeout(() => state.abort?.abort(), 60_000);
  let answer = "";
  let stream = null;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: state.abort.signal,
      body: JSON.stringify({
        message: question,
        campus: state.campus === "auto" ? null : state.campus,
        history: state.history.slice(-6),
      }),
    });

    if (response.status === 503) {
      showError(turn, "Agent 服务尚未配置模型 Key，暂时无法回答。", false);
      return;
    }
    if (response.status === 429) {
      showError(turn, "提问太频繁了，请稍等一会儿再试。", true, () => ask(question));
      return;
    }
    if (!response.ok || !response.body) {
      showError(turn, `请求失败（${response.status}），请稍后重试。`, true, () => ask(question));
      return;
    }

    for await (const { event, data } of readSse(response)) {
      if (event === "meta") {
        status.setCampus(`${data.campusName}（${data.version}指南）`);
        if (state.campus === "auto") markAutoCampus(data.campus);
      } else if (event === "phase") {
        status.set(data.phase);
      } else if (event === "tool_call") {
        const keyword = data.args?.query || data.args?.section_id || "";
        addStep(turn, `检索 <code>${escapeHtml(keyword)}</code>`);
      } else if (event === "tool_result") {
        const label = data.auto ? "预检索" : "结果";
        addStep(turn, data.count
          ? `${label}命中 ${data.count} 节：${escapeHtml(data.sections.slice(0, 2).join("；"))}`
          : `${label}未命中，换个说法再试…`);
      } else if (event === "token") {
        answer += data.t;
        // 首个 token 才建流：在此之前 .turn-body 保持 :empty，气泡不显示
        if (!stream) {
          status.answering();
          stream = startAnswer(turn);
        }
        stream.push(data.t);
      } else if (event === "sources") {
        renderSources(turn, data.sources);
      } else if (event === "error") {
        showError(turn, data.message, data.retryable, () => ask(question));
      } else if (event === "done") {
        finishTrace(turn, data);
      }
    }

    if (!answer) {
      showError(turn, "没有收到回答，请重试。", true, () => ask(question));
    } else {
      // 先给渲染器收尾，再从 DOM 取纯文本播报：直接播 answer 会把 ** 和 | 念出来
      if (stream) stream.finish();
      announce(turn.body.textContent || answer);
      state.history.push({ role: "user", content: question }, { role: "assistant", content: answer });
      state.history = state.history.slice(-6);
    }
  } catch (error) {
    const aborted = error.name === "AbortError";
    showError(turn, aborted ? "这次查询超时了，请再试一次。" : "网络异常，请检查连接后重试。",
      true, () => ask(question));
  } finally {
    // 中途报错/中断也要收尾：否则最后一块内容会停在 .md-tail 里当纯文本显示
    if (stream) stream.finish();
    status.stop();
    clearTimeout(watchdog);
    state.abort = null;
    setBusy(false);
  }
}

/** 「自动判断」模式下，把服务端实际采用的校区显示出来，但不改变用户的选择。 */
function markAutoCampus(slug) {
  const autoChip = elements.campusBar.querySelector('[data-campus="auto"]');
  if (!autoChip) return;
  autoChip.classList.add("auto-hint");
  autoChip.dataset.hint = CAMPUS_NAMES[slug] || slug;
}

function renderSuggestions() {
  const items = SUGGESTIONS[state.campus] || SUGGESTIONS.auto;
  elements.suggestions.replaceChildren();
  for (const text of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-suggestion";
    button.textContent = text;
    button.addEventListener("click", () => {
      elements.input.value = text;
      elements.form.requestSubmit();
    });
    elements.suggestions.append(button);
  }
}

function selectCampus(slug) {
  state.campus = slug;
  localStorage.setItem("seu-agent-campus", slug);
  for (const chip of elements.campusBar.querySelectorAll(".campus-chip")) {
    chip.classList.toggle("active", chip.dataset.campus === slug);
  }
  const autoChip = elements.campusBar.querySelector('[data-campus="auto"]');
  if (slug !== "auto" && autoChip) {
    autoChip.classList.remove("auto-hint");
    delete autoChip.dataset.hint;
  }
  renderSuggestions();
}

function autoGrow() {
  elements.input.style.height = "auto";
  elements.input.style.height = `${Math.min(elements.input.scrollHeight, 130)}px`;
}

async function renderAbout() {
  elements.aboutBody.innerHTML = "<p>加载中…</p>";
  let health = null;
  try {
    health = await (await fetch("/api/health")).json();
  } catch {
    // 拿不到就只显示静态说明
  }
  const campusRows = health?.knowledge?.campuses
    ? health.knowledge.campuses.map((c) => `<li>${c.name} —— ${c.version}</li>`).join("")
    : "";
  elements.aboutBody.innerHTML = `
    <h3>这是什么</h3>
    <p>东南大学六校区新生生活信息问答。你问一句，它会去 2025 版《东南大学新生实用信息简明指南》里检索相关章节，再据此回答，并标出用了哪几节、对应原图第几页。</p>
    <h3>知识来源与版本</h3>
    <ul>${campusRows || "<li>九龙湖 / 四牌楼 / 丁家桥 / 苏州 / 江北 / 无锡</li>"}</ul>
    ${health?.knowledge ? `<p>知识库共 ${health.knowledge.chunks} 个章节，构建于 ${String(health.knowledge.generatedAt).slice(0, 10)}。</p>` : ""}
    <h3>重要提醒</h3>
    <p>本站是<strong>学生社团作品，不是东南大学官方服务</strong>，也不代表校方立场。指南是静态资料，营业时间、班次、电话、收费、门禁、商户都可能已经变了，出门前请以现场公告或官方渠道为准。</p>
    <p>遇到急病、受伤、火灾、治安问题，请直接拨打 120／119／110 并联系保卫处或现场工作人员，不要等这里的答案。</p>
    <h3>版权与署名</h3>
    <p>原指南由<strong>东南大学地理协会（@东奔南走）</strong>制作发布，以 CC BY-SA 4.0 许可共享。本站为基于原指南的衍生应用，保留原作者署名与相同方式共享要求。各校区指南的完整制作名单见原图末页。</p>
    <h3>发现答案有误？</h3>
    <p>欢迎通过 @东奔南走 各平台账号反馈，我们会核对原图后修正知识库。</p>
  `;
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = elements.input.value.trim();
  if (!question || state.busy) return;
  elements.input.value = "";
  autoGrow();
  ask(question);
});

elements.input.addEventListener("input", autoGrow);
elements.input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.form.requestSubmit();
  }
});

elements.campusBar.addEventListener("click", (event) => {
  const chip = event.target.closest(".campus-chip");
  if (chip) selectCampus(chip.dataset.campus);
});

elements.list.addEventListener("click", (event) => {
  const toggle = event.target.closest(".trace-toggle");
  if (!toggle) return;
  const steps = toggle.parentElement.querySelector(".trace-steps");
  const open = steps.hidden;
  steps.hidden = !open;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

elements.aboutButton.addEventListener("click", () => {
  elements.aboutModal.hidden = false;
  renderAbout();
});
elements.aboutClose.addEventListener("click", () => { elements.aboutModal.hidden = true; });
elements.aboutModal.addEventListener("click", (event) => {
  if (event.target === elements.aboutModal) elements.aboutModal.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!elements.aboutModal.hidden) elements.aboutModal.hidden = true;
  else if (state.busy) state.abort?.abort();
});

selectCampus(state.campus);

})();
