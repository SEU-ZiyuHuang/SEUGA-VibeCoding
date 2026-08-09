(function () {
  "use strict";

  const draftStorageKey = "seu-campus-content-draft-v1";
  const state = {
    kind: "feature",
    selectedId: null,
    query: "",
    content: { schemaVersion: 1, featureOverrides: {}, workflowOverrides: {} },
    publishedContent: { schemaVersion: 1, featureOverrides: {}, workflowOverrides: {} },
    storageConfigured: false,
    dirty: false,
  };

  const elements = {
    loginView: document.querySelector("#loginView"),
    editorView: document.querySelector("#editorView"),
    loginForm: document.querySelector("#loginForm"),
    passwordInput: document.querySelector("#passwordInput"),
    loginButton: document.querySelector("#loginButton"),
    loginNotice: document.querySelector("#loginNotice"),
    logoutButton: document.querySelector("#logoutButton"),
    publishState: document.querySelector("#publishState"),
    contentSearch: document.querySelector("#contentSearch"),
    contentList: document.querySelector("#contentList"),
    contentForm: document.querySelector("#contentForm"),
    editorEyebrow: document.querySelector("#editorEyebrow"),
    editorTitle: document.querySelector("#editorTitle"),
    overrideBadge: document.querySelector("#overrideBadge"),
    featureFields: document.querySelector("#featureFields"),
    workflowFields: document.querySelector("#workflowFields"),
    fieldTitle: document.querySelector("#fieldTitle"),
    fieldSummary: document.querySelector("#fieldSummary"),
    fieldLocation: document.querySelector("#fieldLocation"),
    fieldHours: document.querySelector("#fieldHours"),
    fieldPreparation: document.querySelector("#fieldPreparation"),
    fieldSteps: document.querySelector("#fieldSteps"),
    fieldNotice: document.querySelector("#fieldNotice"),
    restoreEntry: document.querySelector("#restoreEntry"),
    featureChangeCount: document.querySelector("#featureChangeCount"),
    workflowChangeCount: document.querySelector("#workflowChangeCount"),
    lastPublishedAt: document.querySelector("#lastPublishedAt"),
    publishButton: document.querySelector("#publishButton"),
    discardDraft: document.querySelector("#discardDraft"),
    publishNotice: document.querySelector("#publishNotice"),
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function buildFeatures() {
    const manual = Array.isArray(window.MANUAL_POI) ? window.MANUAL_POI : [];
    const imported = Array.isArray(window.IMPORTED_ANNOTATIONS) ? window.IMPORTED_ANNOTATIONS : [];
    const replacements = new Map([...manual, ...imported].filter((item) => item.replacesId).map((item) => [item.replacesId, item]));
    const base = (window.MAP_FEATURES || []).map((feature) => ({ ...feature, ...(replacements.get(feature.id) || {}), id: feature.id }));
    return [...base, ...manual.filter((item) => !item.replacesId), ...imported.filter((item) => !item.replacesId)]
      .filter((item) => item.id && item.name)
      .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));
  }

  const features = buildFeatures();
  const workflows = Array.isArray(window.SERVICE_WORKFLOWS) ? window.SERVICE_WORKFLOWS : [];
  const featureById = Object.fromEntries(features.map((item) => [item.id, item]));
  const workflowById = Object.fromEntries(workflows.map((item) => [item.id, item]));

  function activeCollection() {
    return state.kind === "workflow" ? workflows : features;
  }

  function overridesForKind(kind = state.kind) {
    return kind === "workflow" ? state.content.workflowOverrides : state.content.featureOverrides;
  }

  function baseItem() {
    return state.kind === "workflow" ? workflowById[state.selectedId] : featureById[state.selectedId];
  }

  function effectiveItem() {
    const base = baseItem();
    return base ? { ...base, ...(overridesForKind()[base.id] || {}) } : null;
  }

  function setNotice(element, message, tone = "") {
    element.textContent = message;
    element.className = `form-notice${tone ? ` ${tone}` : ""}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function updateMeta() {
    const featureCount = Object.keys(state.content.featureOverrides || {}).length;
    const workflowCount = Object.keys(state.content.workflowOverrides || {}).length;
    elements.featureChangeCount.textContent = String(featureCount);
    elements.workflowChangeCount.textContent = String(workflowCount);
    const lastPublished = state.publishedContent.updatedAt;
    elements.lastPublishedAt.textContent = lastPublished
      ? new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(lastPublished))
      : "尚未发布";
    elements.publishState.textContent = state.dirty ? "有未发布改动" : "内容已同步";
    elements.publishState.classList.toggle("dirty", state.dirty);
    elements.publishButton.disabled = !state.storageConfigured || !state.dirty;
  }

  function renderList() {
    const query = state.query.toLowerCase();
    const items = activeCollection().filter((item) => !query || JSON.stringify(item).toLowerCase().includes(query));
    if (!state.selectedId || !items.some((item) => item.id === state.selectedId)) state.selectedId = items[0]?.id || null;
    const overrides = overridesForKind();
    elements.contentList.innerHTML = items.map((item) => `
      <button class="content-item ${state.selectedId === item.id ? "active" : ""} ${overrides[item.id] ? "changed" : ""}" type="button" data-content-id="${escapeHtml(item.id)}">
        <span class="content-item-icon">${escapeHtml(item.icon || (state.kind === "workflow" ? "办" : "点"))}</span>
        <span><strong>${escapeHtml(item.title || item.name)}</strong><small>${escapeHtml(item.category || item.location || "校园内容")}</small></span>
        <em aria-label="${overrides[item.id] ? "已有改动" : "未改动"}"></em>
      </button>
    `).join("") || `<p class="form-notice">没有匹配的内容。</p>`;
    renderEditor();
  }

  function renderEditor() {
    const item = effectiveItem();
    const base = baseItem();
    elements.contentForm.hidden = !item;
    if (!item || !base) {
      elements.editorTitle.textContent = "没有可编辑内容";
      return;
    }
    const isWorkflow = state.kind === "workflow";
    const changed = Boolean(overridesForKind()[item.id]);
    elements.editorEyebrow.textContent = isWorkflow ? "WORKFLOW" : "PLACE";
    elements.editorTitle.textContent = item.title || item.name;
    elements.overrideBadge.textContent = changed ? "已加入发布草稿" : "使用指南原文";
    elements.overrideBadge.classList.toggle("changed", changed);
    elements.featureFields.hidden = isWorkflow;
    elements.workflowFields.hidden = !isWorkflow;
    elements.fieldTitle.value = item.title || item.name || "";
    elements.fieldSummary.value = item.summary || item.description || "";
    elements.fieldLocation.value = item.location || "";
    elements.fieldHours.value = item.hours || "";
    elements.fieldPreparation.value = Array.isArray(item.preparation) ? item.preparation.join("\n") : "";
    elements.fieldSteps.value = Array.isArray(item.steps) ? item.steps.join("\n") : "";
    elements.fieldNotice.value = item.notice || "";
  }

  function persistDraft() {
    localStorage.setItem(draftStorageKey, JSON.stringify(state.content));
  }

  function saveCurrentEntry(event) {
    event.preventDefault();
    const base = baseItem();
    if (!base) return;
    const override = state.kind === "workflow" ? {
      title: elements.fieldTitle.value.trim(),
      summary: elements.fieldSummary.value.trim(),
      preparation: elements.fieldPreparation.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      steps: elements.fieldSteps.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      notice: elements.fieldNotice.value.trim(),
    } : {
      name: elements.fieldTitle.value.trim(),
      description: elements.fieldSummary.value.trim(),
      location: elements.fieldLocation.value.trim(),
      hours: elements.fieldHours.value.trim(),
    };
    overridesForKind()[base.id] = override;
    state.dirty = JSON.stringify(state.content) !== JSON.stringify(state.publishedContent);
    persistDraft();
    renderList();
    updateMeta();
    setNotice(elements.publishNotice, "当前条目已保存到发布草稿。", "success");
  }

  function restoreCurrentEntry() {
    const base = baseItem();
    if (!base) return;
    delete overridesForKind()[base.id];
    state.dirty = JSON.stringify(state.content) !== JSON.stringify(state.publishedContent);
    persistDraft();
    renderList();
    updateMeta();
    setNotice(elements.publishNotice, "已恢复指南原文，发布后生效。", "success");
  }

  async function loadContent() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (response.status === 401) throw new Error("UNAUTHENTICATED");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "读取内容失败");
    state.storageConfigured = Boolean(result.storageConfigured);
    state.publishedContent = clone(result.content || state.publishedContent);
    const localDraft = localStorage.getItem(draftStorageKey);
    state.content = localDraft ? JSON.parse(localDraft) : clone(state.publishedContent);
    state.dirty = JSON.stringify(state.content) !== JSON.stringify(state.publishedContent);
    if (!state.storageConfigured) {
      setNotice(elements.publishNotice, "内容存储尚未连接；可以编辑草稿，但暂时不能发布。", "error");
    }
    state.selectedId = activeCollection()[0]?.id || null;
    renderList();
    updateMeta();
  }

  async function showEditor() {
    elements.loginView.hidden = true;
    elements.editorView.hidden = false;
    elements.logoutButton.hidden = false;
    await loadContent();
  }

  async function login(event) {
    event.preventDefault();
    elements.loginButton.disabled = true;
    setNotice(elements.loginNotice, "正在验证…");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: elements.passwordInput.value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "登录失败");
      elements.passwordInput.value = "";
      await showEditor();
    } catch (error) {
      setNotice(elements.loginNotice, error.message, "error");
    } finally {
      elements.loginButton.disabled = false;
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    elements.editorView.hidden = true;
    elements.logoutButton.hidden = true;
    elements.loginView.hidden = false;
    elements.passwordInput.focus();
  }

  async function publish() {
    elements.publishButton.disabled = true;
    elements.publishButton.textContent = "正在发布…";
    setNotice(elements.publishNotice, "正在发布并刷新网站内容…");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.content),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "发布失败");
      state.content = clone(result.content);
      state.publishedContent = clone(result.content);
      state.dirty = false;
      localStorage.removeItem(draftStorageKey);
      updateMeta();
      renderList();
      setNotice(elements.publishNotice, "发布成功，网站将在一分钟内读取到新内容。", "success");
    } catch (error) {
      setNotice(elements.publishNotice, error.message, "error");
      updateMeta();
    } finally {
      elements.publishButton.textContent = "发布到网站";
    }
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", login);
    elements.logoutButton.addEventListener("click", logout);
    elements.contentSearch.addEventListener("input", (event) => { state.query = event.target.value.trim(); renderList(); });
    elements.contentList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-content-id]");
      if (!button) return;
      state.selectedId = button.dataset.contentId;
      renderList();
    });
    document.querySelectorAll("[data-content-kind]").forEach((button) => button.addEventListener("click", () => {
      state.kind = button.dataset.contentKind === "workflow" ? "workflow" : "feature";
      state.selectedId = activeCollection()[0]?.id || null;
      document.querySelectorAll("[data-content-kind]").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      renderList();
    }));
    elements.contentForm.addEventListener("submit", saveCurrentEntry);
    elements.restoreEntry.addEventListener("click", restoreCurrentEntry);
    elements.publishButton.addEventListener("click", publish);
    elements.discardDraft.addEventListener("click", () => {
      if (!window.confirm("确定放弃全部未发布改动吗？")) return;
      state.content = clone(state.publishedContent);
      state.dirty = false;
      localStorage.removeItem(draftStorageKey);
      renderList();
      updateMeta();
      setNotice(elements.publishNotice, "未发布改动已放弃。", "success");
    });
  }

  async function initialize() {
    bindEvents();
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const result = await response.json();
      if (!result.configured) setNotice(elements.loginNotice, "管理后台尚未配置访问口令。", "error");
      if (result.authenticated) await showEditor();
      else elements.passwordInput.focus();
    } catch {
      setNotice(elements.loginNotice, "暂时无法连接管理服务，请稍后重试。", "error");
    }
  }

  initialize();
})();
