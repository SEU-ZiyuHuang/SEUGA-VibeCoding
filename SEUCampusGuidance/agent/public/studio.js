// 调试台前端。零依赖、零构建，和 chat.js 一样是直接 <script> 引入的普通脚本。
//
// 一条贯穿始终的原则：页面只负责编辑和展示，所有校验以服务端为准。
// 这里的 maxlength、range 上下界只是提前告诉用户「大概到头了」，
// 真正拦住越界数据的是 lib/agent-config.mjs 的 validateConfig。

const elements = {
  topbarActions: document.getElementById("topbarActions"),
  stateChip: document.getElementById("stateChip"),
  saveButton: document.getElementById("saveButton"),
  publishButton: document.getElementById("publishButton"),
  logoutButton: document.getElementById("logoutButton"),

  loginView: document.getElementById("loginView"),
  loginForm: document.getElementById("loginForm"),
  loginButton: document.getElementById("loginButton"),
  passwordInput: document.getElementById("passwordInput"),
  loginNotice: document.getElementById("loginNotice"),

  editorView: document.getElementById("editorView"),
  storageWarning: document.getElementById("storageWarning"),
  identity: document.getElementById("fieldIdentity"),
  rulesList: document.getElementById("rulesList"),
  ruleCountHint: document.getElementById("ruleCountHint"),
  addRuleButton: document.getElementById("addRuleButton"),
  lockedRules: document.getElementById("lockedRules"),
  retrieval: document.getElementById("fieldRetrieval"),
  model: document.getElementById("fieldModel"),
  temperature: document.getElementById("fieldTemperature"),
  temperatureAuto: document.getElementById("temperatureAuto"),
  temperatureValue: document.getElementById("temperatureValue"),
  tokens: document.getElementById("fieldTokens"),
  tokensValue: document.getElementById("tokensValue"),
  note: document.getElementById("fieldNote"),
  resetButton: document.getElementById("resetButton"),

  previewCampus: document.getElementById("previewCampus"),
  clearPreviewButton: document.getElementById("clearPreviewButton"),
  previewLog: document.getElementById("previewLog"),
  previewForm: document.getElementById("previewForm"),
  previewInput: document.getElementById("previewInput"),
  previewSend: document.getElementById("previewSend"),

  releaseList: document.getElementById("releaseList"),
  releaseHint: document.getElementById("releaseHint"),
  toast: document.getElementById("toast"),
};

const state = {
  rules: [],
  published: null,
  defaults: null,
  limits: { ruleCount: 20, ruleChars: 500 },
  storageConfigured: false,
  busy: false,
  previewBusy: false,
  previewHistory: [],
  abort: null,
};

let toastTimer = null;

function toast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, isError ? 5200 : 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // 空响应体
  }
  if (!response.ok) throw new Error(payload.error || `请求失败（${response.status}）`);
  return payload;
}

/* ---------- 编辑器读写 ---------- */

/** 把页面上的内容收成一个配置对象。这是唯一的「当前草稿」来源。 */
function readEditor() {
  return {
    schemaVersion: 1,
    identity: elements.identity.value,
    rules: state.rules.map((rule) => rule.trim()).filter(Boolean),
    retrievalDiscipline: elements.retrieval.value,
    model: elements.model.value,
    temperature: elements.temperatureAuto.checked ? null : Number(elements.temperature.value),
    maxAnswerTokens: Number(elements.tokens.value),
    note: elements.note.value,
  };
}

function fillEditor(config) {
  elements.identity.value = config.identity || "";
  state.rules = Array.isArray(config.rules) ? [...config.rules] : [];
  elements.retrieval.value = config.retrievalDiscipline || "";
  elements.model.value = config.model || "";
  const auto = config.temperature === null || config.temperature === undefined;
  elements.temperatureAuto.checked = auto;
  elements.temperature.value = auto ? 0.2 : config.temperature;
  elements.tokens.value = config.maxAnswerTokens || 1400;
  elements.note.value = config.note || "";
  renderRules();
  renderParams();
}

/** 比较用的规范形式：去掉备注和时间戳，它们不影响 Agent 行为。 */
function comparable(config) {
  if (!config) return "";
  return JSON.stringify({
    identity: (config.identity || "").trim(),
    rules: (config.rules || []).map((rule) => rule.trim()).filter(Boolean),
    retrievalDiscipline: (config.retrievalDiscipline || "").trim(),
    model: config.model || "",
    temperature: config.temperature ?? null,
    maxAnswerTokens: config.maxAnswerTokens,
  });
}

function refreshState() {
  const dirty = comparable(readEditor()) !== comparable(state.published);
  elements.stateChip.textContent = dirty ? "草稿与线上不一致" : "与线上一致";
  elements.stateChip.className = `state-chip ${dirty ? "dirty" : "synced"}`;
  elements.publishButton.disabled = state.busy || !state.storageConfigured;
  elements.saveButton.disabled = state.busy || !state.storageConfigured;
}

/* ---------- 规则列表 ---------- */

/** 条款长短差得远（几十字到两百多字），固定行数不是截断就是留白，让它跟着内容长。 */
function autoGrow(textarea) {
  // 宽度为 0 时（元素还没布局，或页面在不可见的容器里）量出来的 scrollHeight 是
  // 按每行一两个字折行算的，会得到几千像素。这种时候不如不量，等 resize 再补。
  if (!textarea.clientWidth) return;
  textarea.style.height = "auto";
  // 全局是 box-sizing: border-box，而 scrollHeight 含 padding 不含 border，
  // 直接赋值会矮掉一个边框的高度，最后一行仍被切掉一点。补回上下边框。
  const border = textarea.offsetHeight - textarea.clientHeight;
  textarea.style.height = `${textarea.scrollHeight + border}px`;
}

function regrowRules() {
  elements.rulesList.querySelectorAll("textarea").forEach(autoGrow);
}

function renderRules() {
  elements.rulesList.textContent = "";
  state.rules.forEach((rule, index) => {
    const item = document.createElement("li");
    const row = document.createElement("div");
    row.className = "rule-row";

    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    textarea.value = rule;
    textarea.maxLength = state.limits.ruleChars;
    textarea.addEventListener("input", () => {
      state.rules[index] = textarea.value;
      autoGrow(textarea);
      refreshState();
    });

    const tools = document.createElement("div");
    tools.className = "rule-tools";
    tools.append(
      toolButton("↑", "上移", index === 0, () => moveRule(index, -1)),
      toolButton("↓", "下移", index === state.rules.length - 1, () => moveRule(index, 1)),
      toolButton("×", "删除这条", state.rules.length <= 1, () => removeRule(index), "remove"),
    );

    row.append(textarea, tools);
    item.append(row);
    elements.rulesList.append(item);
  });
  elements.ruleCountHint.textContent = `${state.rules.length} / ${state.limits.ruleCount} 条，可增删排序`;
  elements.addRuleButton.disabled = state.rules.length >= state.limits.ruleCount;
  // 撑高要等元素进 DOM 之后量 scrollHeight，所以放在整个列表渲染完再统一做。
  regrowRules();
}

function toolButton(label, title, disabled, onClick, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.title = title;
  button.disabled = disabled;
  if (extraClass) button.className = extraClass;
  button.addEventListener("click", onClick);
  return button;
}

function moveRule(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= state.rules.length) return;
  [state.rules[index], state.rules[target]] = [state.rules[target], state.rules[index]];
  renderRules();
  refreshState();
}

function removeRule(index) {
  state.rules.splice(index, 1);
  renderRules();
  refreshState();
}

function renderParams() {
  const auto = elements.temperatureAuto.checked;
  elements.temperature.disabled = auto;
  elements.temperatureValue.textContent = auto ? "模型默认" : Number(elements.temperature.value).toFixed(2);
  elements.tokensValue.textContent = `${elements.tokens.value} tokens`;
}

/* ---------- 历史版本 ---------- */

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderReleases(releases, currentPathname) {
  elements.releaseList.textContent = "";
  if (!releases.length) {
    const empty = document.createElement("li");
    empty.className = "release-empty";
    empty.textContent = state.storageConfigured
      ? "还没有发布过。线上正在用代码里的默认规则。"
      : "配置存储未接入，历史版本不可用。";
    elements.releaseList.append(empty);
    elements.releaseHint.textContent = "";
    return;
  }
  elements.releaseHint.textContent = `最近 ${releases.length} 次`;
  releases.forEach((release) => {
    const isCurrent = release.pathname === currentPathname;
    const item = document.createElement("li");

    const meta = document.createElement("div");
    meta.className = "release-meta";
    const time = document.createElement("span");
    time.className = "release-time";
    time.textContent = formatTime(release.uploadedAt) || release.pathname;
    meta.append(time);
    if (isCurrent) {
      const current = document.createElement("span");
      current.className = "release-current";
      current.textContent = "● 线上正在用";
      meta.append(current);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = isCurrent ? "当前" : "回退到这版";
    button.disabled = isCurrent || state.busy;
    button.addEventListener("click", () => rollback(release));

    item.append(meta, button);
    elements.releaseList.append(item);
  });
}

/* ---------- 载入与保存 ---------- */

async function loadConfig() {
  const data = await api("/api/admin/config");
  state.storageConfigured = data.storageConfigured;
  state.defaults = data.defaults;
  state.limits = data.limits;
  state.published = data.published;

  elements.model.textContent = "";
  const follow = document.createElement("option");
  follow.value = "";
  follow.textContent = "跟随服务器设置（推荐）";
  elements.model.append(follow);
  data.modelOptions.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    elements.model.append(option);
  });

  elements.lockedRules.textContent = "";
  data.lockedRules.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    elements.lockedRules.append(item);
  });

  fillEditor(data.draft);
  renderReleases(data.releases, data.publishedRelease?.pathname);

  elements.storageWarning.hidden = state.storageConfigured;
  if (!state.storageConfigured) {
    elements.storageWarning.textContent = "配置存储（BLOB_READ_WRITE_TOKEN）尚未接入，"
      + "现在只能查看和试聊，保存与发布都不可用。线上 Agent 正在使用代码里的默认规则。";
  }
  refreshState();
}

async function save() {
  if (state.busy) return;
  state.busy = true;
  refreshState();
  try {
    await api("/api/admin/config", { method: "PUT", body: JSON.stringify({ config: readEditor() }) });
    toast("草稿已保存，线上还没变");
  } catch (error) {
    toast(error.message, true);
  } finally {
    state.busy = false;
    refreshState();
  }
}

async function publish() {
  if (state.busy) return;
  if (!window.confirm("发布之后，线上所有用户在一分钟内都会用上这套规则。确定发布吗？")) return;
  state.busy = true;
  refreshState();
  try {
    const data = await api("/api/admin/config", {
      method: "POST",
      body: JSON.stringify({ action: "publish", config: readEditor() }),
    });
    state.published = data.published;
    renderReleases(data.releases, data.publishedRelease?.pathname);
    toast("已发布，最长一分钟全量生效");
  } catch (error) {
    toast(error.message, true);
  } finally {
    state.busy = false;
    refreshState();
  }
}

async function rollback(release) {
  if (state.busy) return;
  if (!window.confirm(`把 ${formatTime(release.uploadedAt)} 那一版重新发布到线上？当前草稿会被它覆盖。`)) return;
  state.busy = true;
  refreshState();
  try {
    const data = await api("/api/admin/config", {
      method: "POST",
      body: JSON.stringify({ action: "rollback", pathname: release.pathname }),
    });
    state.published = data.published;
    fillEditor(data.draft);
    renderReleases(data.releases, data.publishedRelease?.pathname);
    toast("已回退并重新发布");
  } catch (error) {
    toast(error.message, true);
  } finally {
    state.busy = false;
    refreshState();
  }
}

/* ---------- 试聊 ---------- */

/** SSE 帧解析。与 chat.js 同一套实现：EventSource 不支持 POST，只能自己拆帧。 */
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

function addBubble(kind, text) {
  elements.previewLog.querySelector(".preview-empty")?.remove();
  const bubble = document.createElement("div");
  bubble.className = `bubble ${kind}`;
  bubble.textContent = text;
  elements.previewLog.append(bubble);
  elements.previewLog.scrollTop = elements.previewLog.scrollHeight;
  return bubble;
}

function addTrace() {
  const trace = document.createElement("div");
  trace.className = "trace";
  trace.textContent = "正在检索…";
  elements.previewLog.append(trace);
  elements.previewLog.scrollTop = elements.previewLog.scrollHeight;
  return trace;
}

function setPreviewBusy(busy) {
  state.previewBusy = busy;
  elements.previewSend.disabled = busy;
  elements.previewInput.disabled = busy;
}

async function preview(question) {
  if (state.previewBusy) return;
  setPreviewBusy(true);
  addBubble("user", question);
  const trace = addTrace();
  const bubble = addBubble("agent", "");
  let answer = "";

  state.abort = new AbortController();
  const watchdog = setTimeout(() => state.abort?.abort(), 70_000);

  try {
    const response = await fetch("/api/admin/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: state.abort.signal,
      body: JSON.stringify({
        message: question,
        campus: elements.previewCampus.value || null,
        history: state.previewHistory.slice(-6),
        config: readEditor(),
      }),
    });

    if (!response.ok || !response.body) {
      let detail = `请求失败（${response.status}）`;
      try {
        detail = (await response.json()).error || detail;
      } catch {
        // 没有 JSON 响应体
      }
      trace.remove();
      bubble.remove();
      addBubble("error", detail);
      return;
    }

    for await (const { event, data } of readSse(response)) {
      if (event === "meta") {
        trace.textContent = `校区：${data.campusName}（${data.version} 指南）`;
      } else if (event === "tool_result") {
        const label = data.auto ? "预检索" : "检索";
        trace.textContent += data.count
          ? ` · ${label}命中 ${data.count} 节`
          : ` · ${label}未命中`;
      } else if (event === "token") {
        answer += data.t;
        bubble.textContent = answer;
        elements.previewLog.scrollTop = elements.previewLog.scrollHeight;
      } else if (event === "error") {
        addBubble("error", data.message);
      }
    }

    if (answer) {
      state.previewHistory.push({ role: "user", content: question }, { role: "assistant", content: answer });
      state.previewHistory = state.previewHistory.slice(-6);
    } else {
      bubble.remove();
    }
  } catch (error) {
    trace.remove();
    bubble.remove();
    addBubble("error", state.abort?.signal.aborted ? "试聊超时或被中断。" : `试聊失败：${error.message}`);
  } finally {
    clearTimeout(watchdog);
    setPreviewBusy(false);
    elements.previewInput.focus();
  }
}

/* ---------- 登录 ---------- */

function showEditor() {
  elements.loginView.hidden = true;
  elements.editorView.hidden = false;
  elements.topbarActions.hidden = false;
}

async function boot() {
  try {
    const session = await api("/api/admin/session");
    if (!session.configured) {
      elements.loginNotice.textContent = "服务器还没有配置 ADMIN_ACCESS_TOKEN，调试台暂时无法使用。";
      elements.loginButton.disabled = true;
      return;
    }
    if (session.authenticated) {
      showEditor();
      await loadConfig();
    }
  } catch (error) {
    elements.loginNotice.textContent = error.message;
  }
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.loginNotice.textContent = "";
  elements.loginButton.disabled = true;
  try {
    await api("/api/admin/session", {
      method: "POST",
      body: JSON.stringify({ password: elements.passwordInput.value }),
    });
    elements.passwordInput.value = "";
    showEditor();
    await loadConfig();
  } catch (error) {
    elements.loginNotice.textContent = error.message;
  } finally {
    elements.loginButton.disabled = false;
  }
});

elements.logoutButton.addEventListener("click", async () => {
  await fetch("/api/admin/session", { method: "DELETE" });
  window.location.reload();
});

/* ---------- 事件绑定 ---------- */

elements.identity.addEventListener("input", refreshState);
elements.retrieval.addEventListener("input", refreshState);
elements.model.addEventListener("change", refreshState);
elements.note.addEventListener("input", refreshState);

elements.temperature.addEventListener("input", () => { renderParams(); refreshState(); });
elements.temperatureAuto.addEventListener("change", () => { renderParams(); refreshState(); });
elements.tokens.addEventListener("input", () => { renderParams(); refreshState(); });

elements.addRuleButton.addEventListener("click", () => {
  if (state.rules.length >= state.limits.ruleCount) return;
  state.rules.push("");
  renderRules();
  refreshState();
  elements.rulesList.querySelector("li:last-child textarea")?.focus();
});

elements.resetButton.addEventListener("click", () => {
  if (!state.defaults) return;
  if (!window.confirm("把编辑区恢复成代码里的默认规则？未保存的改动会丢失。（线上不受影响，除非你之后点发布）")) return;
  fillEditor({ ...state.defaults, note: elements.note.value });
  refreshState();
  toast("已恢复默认，尚未发布");
});

elements.saveButton.addEventListener("click", save);
elements.publishButton.addEventListener("click", publish);

// 换了窗口宽度，折行数就变了，之前算出的高度不再准。
window.addEventListener("resize", regrowRules);

elements.previewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = elements.previewInput.value.trim();
  if (!question) return;
  elements.previewInput.value = "";
  preview(question);
});

elements.previewInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    elements.previewForm.requestSubmit();
  }
});

elements.clearPreviewButton.addEventListener("click", () => {
  state.previewHistory = [];
  elements.previewLog.textContent = "";
  const empty = document.createElement("p");
  empty.className = "preview-empty";
  empty.textContent = "对话已清空。继续提问看看改完的规则效果如何。";
  elements.previewLog.append(empty);
});

// 有未发布改动时刷新或关页面给个提醒——草稿存在浏览器里，不点保存就没了。
window.addEventListener("beforeunload", (event) => {
  if (elements.editorView.hidden) return;
  if (comparable(readEditor()) === comparable(state.published)) return;
  event.preventDefault();
  event.returnValue = "";
});

boot();
