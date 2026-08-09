(function () {
  "use strict";

  const draftStorageKey = "seu-campus-content-draft-v2";
  const emptyContent = () => ({
    schemaVersion: 2,
    featureOverrides: {},
    workflowOverrides: {},
    customFeatures: [],
    customWorkflows: [],
  });
  const campusRegion = { south: 31.95, north: 32.16, west: 118.65, east: 118.95 };
  const state = {
    kind: "feature",
    selectedId: null,
    query: "",
    content: emptyContent(),
    publishedContent: emptyContent(),
    storageConfigured: false,
    dirty: false,
    formTouched: false,
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
    addContentButton: document.querySelector("#addContentButton"),
    addContentLabel: document.querySelector("#addContentLabel"),
    contentForm: document.querySelector("#contentForm"),
    editorEyebrow: document.querySelector("#editorEyebrow"),
    editorTitle: document.querySelector("#editorTitle"),
    overrideBadge: document.querySelector("#overrideBadge"),
    featureFields: document.querySelector("#featureFields"),
    workflowFields: document.querySelector("#workflowFields"),
    fieldTitle: document.querySelector("#fieldTitle"),
    fieldSummary: document.querySelector("#fieldSummary"),
    fieldCategory: document.querySelector("#fieldCategory"),
    fieldIcon: document.querySelector("#fieldIcon"),
    fieldLocation: document.querySelector("#fieldLocation"),
    fieldHours: document.querySelector("#fieldHours"),
    fieldTags: document.querySelector("#fieldTags"),
    fieldKnowledgeOnly: document.querySelector("#fieldKnowledgeOnly"),
    coordinateFields: document.querySelector("#coordinateFields"),
    fieldCoordinateSystem: document.querySelector("#fieldCoordinateSystem"),
    fieldLatitude: document.querySelector("#fieldLatitude"),
    fieldLongitude: document.querySelector("#fieldLongitude"),
    coordinateNotice: document.querySelector("#coordinateNotice"),
    useCurrentLocation: document.querySelector("#useCurrentLocation"),
    fieldWorkflowCategory: document.querySelector("#fieldWorkflowCategory"),
    fieldWorkflowIcon: document.querySelector("#fieldWorkflowIcon"),
    fieldPreparation: document.querySelector("#fieldPreparation"),
    fieldSteps: document.querySelector("#fieldSteps"),
    fieldNotice: document.querySelector("#fieldNotice"),
    fieldMapFeatureIds: document.querySelector("#fieldMapFeatureIds"),
    fieldAgentPrompt: document.querySelector("#fieldAgentPrompt"),
    entryPreview: document.querySelector("#entryPreview"),
    entryNotice: document.querySelector("#entryNotice"),
    restoreEntry: document.querySelector("#restoreEntry"),
    deleteEntry: document.querySelector("#deleteEntry"),
    featureChangeCount: document.querySelector("#featureChangeCount"),
    featureAddCount: document.querySelector("#featureAddCount"),
    workflowChangeCount: document.querySelector("#workflowChangeCount"),
    workflowAddCount: document.querySelector("#workflowAddCount"),
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

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeContent(value) {
    const content = value && typeof value === "object" ? value : {};
    return {
      schemaVersion: 2,
      featureOverrides: content.featureOverrides && typeof content.featureOverrides === "object" && !Array.isArray(content.featureOverrides) ? content.featureOverrides : {},
      workflowOverrides: content.workflowOverrides && typeof content.workflowOverrides === "object" && !Array.isArray(content.workflowOverrides) ? content.workflowOverrides : {},
      customFeatures: Array.isArray(content.customFeatures) ? content.customFeatures : [],
      customWorkflows: Array.isArray(content.customWorkflows) ? content.customWorkflows : [],
      ...(typeof content.updatedAt === "string" ? { updatedAt: content.updatedAt } : {}),
    };
  }

  function buildBaseFeatures() {
    const manual = Array.isArray(window.MANUAL_POI) ? window.MANUAL_POI : [];
    const imported = Array.isArray(window.IMPORTED_ANNOTATIONS) ? window.IMPORTED_ANNOTATIONS : [];
    const replacements = new Map([...manual, ...imported].filter((item) => item.replacesId).map((item) => [item.replacesId, item]));
    const base = (window.MAP_FEATURES || []).map((feature) => ({ ...feature, ...(replacements.get(feature.id) || {}), id: feature.id }));
    return [...base, ...manual.filter((item) => !item.replacesId), ...imported.filter((item) => !item.replacesId)]
      .filter((item) => item.id && item.name);
  }

  const baseFeatures = buildBaseFeatures();
  const baseWorkflows = Array.isArray(window.SERVICE_WORKFLOWS) ? window.SERVICE_WORKFLOWS : [];
  const baseFeatureById = Object.fromEntries(baseFeatures.map((item) => [item.id, item]));
  const baseWorkflowById = Object.fromEntries(baseWorkflows.map((item) => [item.id, item]));
  const themeOptions = (window.MAP_THEMES || []).filter((theme) => theme.id !== "all");

  function overridesForKind(kind = state.kind) {
    return kind === "workflow" ? state.content.workflowOverrides : state.content.featureOverrides;
  }

  function customCollection(kind = state.kind) {
    return kind === "workflow" ? state.content.customWorkflows : state.content.customFeatures;
  }

  function baseCollection(kind = state.kind) {
    return kind === "workflow" ? baseWorkflows : baseFeatures;
  }

  function isCustomId(id = state.selectedId, kind = state.kind) {
    return customCollection(kind).some((item) => item.id === id);
  }

  function itemById(id = state.selectedId, kind = state.kind) {
    const custom = customCollection(kind).find((item) => item.id === id);
    if (custom) return custom;
    const base = kind === "workflow" ? baseWorkflowById[id] : baseFeatureById[id];
    return base ? { ...base, ...(overridesForKind(kind)[id] || {}) } : null;
  }

  function activeCollection(kind = state.kind) {
    return [
      ...baseCollection(kind).map((item) => ({ ...item, ...(overridesForKind(kind)[item.id] || {}) })),
      ...customCollection(kind),
    ].sort((left, right) => String(left.title || left.name).localeCompare(String(right.title || right.name), "zh-CN"));
  }

  function setNotice(element, message, tone = "") {
    element.textContent = message;
    element.className = `form-notice${tone ? ` ${tone}` : ""}`;
  }

  function markDirty() {
    state.dirty = JSON.stringify(state.content) !== JSON.stringify(state.publishedContent);
    updateMeta();
  }

  function updateMeta() {
    elements.featureChangeCount.textContent = String(Object.keys(state.content.featureOverrides || {}).length);
    elements.workflowChangeCount.textContent = String(Object.keys(state.content.workflowOverrides || {}).length);
    elements.featureAddCount.textContent = String(state.content.customFeatures.length);
    elements.workflowAddCount.textContent = String(state.content.customWorkflows.length);
    const lastPublished = state.publishedContent.updatedAt;
    elements.lastPublishedAt.textContent = lastPublished
      ? new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(lastPublished))
      : "尚未发布";
    elements.publishState.textContent = state.dirty || state.formTouched ? "有未发布改动" : "内容已同步";
    elements.publishState.classList.toggle("dirty", state.dirty || state.formTouched);
    elements.publishButton.disabled = !state.storageConfigured || (!state.dirty && !state.formTouched);
  }

  function renderList() {
    const query = state.query.toLowerCase();
    const items = activeCollection().filter((item) => !query || JSON.stringify(item).toLowerCase().includes(query));
    if (!state.selectedId || !items.some((item) => item.id === state.selectedId)) state.selectedId = items[0]?.id || null;
    const overrides = overridesForKind();
    elements.contentList.innerHTML = items.map((item) => {
      const added = isCustomId(item.id);
      const changed = Boolean(overrides[item.id]);
      return `
        <button class="content-item ${state.selectedId === item.id ? "active" : ""} ${changed ? "changed" : ""} ${added ? "added" : ""}" type="button" data-content-id="${escapeHtml(item.id)}">
          <span class="content-item-icon">${escapeHtml(item.icon || (state.kind === "workflow" ? "办" : "点"))}</span>
          <span><strong>${escapeHtml(item.title || item.name)}</strong><small>${escapeHtml(item.category || item.location || "校园内容")}</small></span>
          <em aria-label="${added ? "新增内容" : changed ? "已有改动" : "未改动"}">${added ? "新" : ""}</em>
        </button>`;
    }).join("") || `<p class="form-notice">没有匹配的内容。</p>`;
    renderEditor();
  }

  function renderCategoryOptions(selectedCategory) {
    elements.fieldCategory.innerHTML = themeOptions.map((theme) => `
      <option value="${escapeHtml(theme.id)}" ${theme.id === selectedCategory ? "selected" : ""}>${escapeHtml(theme.label)}</option>
    `).join("");
  }

  function renderRelatedPlaceOptions(selectedIds) {
    const selected = new Set(Array.isArray(selectedIds) ? selectedIds : []);
    elements.fieldMapFeatureIds.innerHTML = activeCollection("feature").map((feature) => `
      <option value="${escapeHtml(feature.id)}" ${selected.has(feature.id) ? "selected" : ""}>${escapeHtml(feature.name)} · ${escapeHtml(feature.location || "四牌楼校区")}</option>
    `).join("");
  }

  function updateCoordinateVisibility() {
    if (state.kind === "workflow") {
      elements.coordinateFields.hidden = true;
      elements.fieldLatitude.required = false;
      elements.fieldLongitude.required = false;
      return;
    }
    const informationOnly = elements.fieldKnowledgeOnly.checked;
    elements.coordinateFields.hidden = informationOnly;
    elements.fieldLatitude.required = !informationOnly;
    elements.fieldLongitude.required = !informationOnly;
  }

  function renderPreview() {
    if (elements.contentForm.hidden) {
      elements.entryPreview.innerHTML = "";
      return;
    }
    const isWorkflow = state.kind === "workflow";
    const title = elements.fieldTitle.value.trim() || (isWorkflow ? "未命名办事流程" : "未命名地点");
    const summary = elements.fieldSummary.value.trim() || "填写摘要后，这里会显示用户在网站上看到的内容预览。";
    const icon = (isWorkflow ? elements.fieldWorkflowIcon.value : elements.fieldIcon.value).trim() || (isWorkflow ? "办" : "点");
    let meta;
    if (isWorkflow) {
      const stepCount = lineItems(elements.fieldSteps.value).length;
      meta = `${elements.fieldWorkflowCategory.value.trim() || "校园服务"} · ${stepCount || 0} 个办理步骤`;
    } else {
      const presentation = elements.fieldKnowledgeOnly.checked ? "信息条目" : "地图点位";
      meta = `${elements.fieldCategory.selectedOptions[0]?.textContent || "校园服务"} · ${presentation}`;
    }
    elements.entryPreview.innerHTML = `
      <span class="preview-label">网站呈现预览</span>
      <div class="preview-main">
        <span class="preview-icon">${escapeHtml(icon)}</span>
        <div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(meta)}<br>${escapeHtml(summary)}</p></div>
      </div>`;
  }

  function renderEditor() {
    const item = itemById();
    elements.contentForm.hidden = !item;
    if (!item) {
      elements.editorTitle.textContent = "没有可编辑内容";
      elements.entryPreview.innerHTML = "";
      return;
    }
    const isWorkflow = state.kind === "workflow";
    const added = isCustomId();
    const changed = Boolean(overridesForKind()[item.id]);
    elements.editorEyebrow.textContent = isWorkflow ? "WORKFLOW" : "PLACE";
    elements.editorTitle.textContent = item.title || item.name;
    elements.overrideBadge.textContent = added ? "新增内容" : changed ? "已加入发布草稿" : "使用指南原文";
    elements.overrideBadge.classList.toggle("changed", added || changed);
    elements.featureFields.hidden = isWorkflow;
    elements.workflowFields.hidden = !isWorkflow;
    elements.fieldTitle.value = item.title || item.name || "";
    elements.fieldSummary.maxLength = isWorkflow ? 300 : 800;
    elements.fieldSummary.value = item.summary || item.description || "";
    elements.fieldLocation.value = item.location || "";
    elements.fieldHours.value = item.hours || "";
    elements.fieldTags.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
    elements.fieldKnowledgeOnly.checked = Boolean(item.knowledgeOnly);
    renderCategoryOptions(item.category || "service");
    elements.fieldIcon.value = item.icon || "点";
    elements.fieldCoordinateSystem.value = item.coordinateSystem === "WGS84" ? "WGS84" : "GCJ-02";
    elements.fieldLatitude.value = Number.isFinite(Number(item.lat)) ? Number(item.lat).toFixed(6) : "";
    elements.fieldLongitude.value = Number.isFinite(Number(item.lng)) ? Number(item.lng).toFixed(6) : "";
    elements.fieldWorkflowCategory.value = item.category || "";
    elements.fieldWorkflowIcon.value = item.icon || "办";
    elements.fieldPreparation.value = Array.isArray(item.preparation) ? item.preparation.join("\n") : "";
    elements.fieldSteps.value = Array.isArray(item.steps) ? item.steps.join("\n") : "";
    elements.fieldNotice.value = item.notice || "";
    elements.fieldAgentPrompt.value = item.agentPrompt || "";
    renderRelatedPlaceOptions(item.mapFeatureIds);
    elements.restoreEntry.hidden = added;
    elements.deleteEntry.hidden = !added;
    updateCoordinateVisibility();
    renderPreview();
    setNotice(elements.entryNotice, "");
    state.formTouched = false;
    updateMeta();
  }

  function persistDraft() {
    localStorage.setItem(draftStorageKey, JSON.stringify(state.content));
  }

  function lineItems(value) {
    return String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }

  function tagItems(value) {
    return String(value || "").split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).slice(0, 20);
  }

  function selectedPlaceIds() {
    return [...elements.fieldMapFeatureIds.selectedOptions].map((option) => option.value);
  }

  function validCampusCoordinate(latitude, longitude) {
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      && latitude >= campusRegion.south && latitude <= campusRegion.north
      && longitude >= campusRegion.west && longitude <= campusRegion.east;
  }

  function entryFromForm() {
    const current = itemById();
    if (!current) return null;
    if (state.kind === "workflow") {
      return {
        id: current.id,
        title: elements.fieldTitle.value.trim(),
        summary: elements.fieldSummary.value.trim(),
        category: elements.fieldWorkflowCategory.value.trim() || "校园服务",
        icon: elements.fieldWorkflowIcon.value.trim() || "办",
        preparation: lineItems(elements.fieldPreparation.value),
        steps: lineItems(elements.fieldSteps.value),
        notice: elements.fieldNotice.value.trim(),
        mapFeatureIds: selectedPlaceIds(),
        agentPrompt: elements.fieldAgentPrompt.value.trim(),
        ...(isCustomId() ? { managed: true } : {}),
      };
    }
    const knowledgeOnly = elements.fieldKnowledgeOnly.checked;
    const latitude = Number(elements.fieldLatitude.value);
    const longitude = Number(elements.fieldLongitude.value);
    return {
      id: current.id,
      name: elements.fieldTitle.value.trim(),
      description: elements.fieldSummary.value.trim(),
      category: elements.fieldCategory.value,
      icon: elements.fieldIcon.value.trim() || "点",
      location: elements.fieldLocation.value.trim(),
      hours: elements.fieldHours.value.trim(),
      tags: tagItems(elements.fieldTags.value),
      knowledgeOnly,
      ...(!knowledgeOnly ? {
        lat: latitude,
        lng: longitude,
        coordinateSystem: elements.fieldCoordinateSystem.value === "WGS84" ? "WGS84" : "GCJ-02",
      } : {}),
      ...(isCustomId() ? { status: "unknown", verified: false, managed: true } : {}),
    };
  }

  function validateEntry(entry) {
    if (!entry) return "当前没有可保存的内容。";
    if (!(entry.title || entry.name)) return "请填写标题。";
    if (state.kind === "workflow") {
      if (!entry.steps.length) return "请至少填写一个办理步骤。";
      return "";
    }
    if (!entry.category) return "请选择内容分类。";
    if (!entry.knowledgeOnly && !validCampusCoordinate(entry.lat, entry.lng)) {
      return "请填写南京范围内有效的纬度和经度，或者选择“仅作为信息条目”。";
    }
    return "";
  }

  function commitCurrentEntry() {
    const entry = entryFromForm();
    const error = validateEntry(entry);
    if (error) {
      setNotice(elements.entryNotice, error, "error");
      return false;
    }
    if (isCustomId()) {
      const collection = customCollection();
      const index = collection.findIndex((item) => item.id === entry.id);
      if (index >= 0) collection[index] = entry;
    } else {
      const { id, ...override } = entry;
      overridesForKind()[id] = override;
    }
    state.formTouched = false;
    markDirty();
    persistDraft();
    renderList();
    setNotice(elements.publishNotice, "当前条目已保存到发布草稿。", "success");
    return true;
  }

  function saveCurrentEntry(event) {
    event.preventDefault();
    commitCurrentEntry();
  }

  function canLeaveEditor() {
    if (!state.formTouched) return true;
    if (!window.confirm("当前表单还有未保存的修改，确定离开吗？")) return false;
    state.formTouched = false;
    return true;
  }

  function createId(prefix) {
    const random = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now().toString(36)}-${random}`;
  }

  function addContent() {
    if (!canLeaveEditor()) return;
    state.query = "";
    elements.contentSearch.value = "";
    if (state.kind === "workflow") {
      const item = {
        id: createId("custom-workflow"),
        title: "新办事流程",
        summary: "",
        category: "校园服务",
        icon: "办",
        preparation: [],
        steps: [],
        notice: "",
        mapFeatureIds: [],
        agentPrompt: "",
        managed: true,
      };
      state.content.customWorkflows.push(item);
      state.selectedId = item.id;
    } else {
      const item = {
        id: createId("custom-place"),
        name: "新地点",
        description: "",
        category: "service",
        icon: "点",
        location: "",
        hours: "",
        tags: [],
        knowledgeOnly: false,
        status: "unknown",
        verified: false,
        managed: true,
      };
      state.content.customFeatures.push(item);
      state.selectedId = item.id;
    }
    markDirty();
    persistDraft();
    renderList();
    elements.fieldTitle.focus();
    elements.fieldTitle.select();
    setNotice(elements.entryNotice, state.kind === "workflow"
      ? "请至少填写一个办理步骤，并按需要关联地图地点。"
      : "请补全必要信息；地图点位需要有效经纬度。", "");
  }

  function restoreCurrentEntry() {
    if (isCustomId()) return;
    delete overridesForKind()[state.selectedId];
    state.formTouched = false;
    markDirty();
    persistDraft();
    renderList();
    setNotice(elements.publishNotice, "已恢复指南原文，发布后生效。", "success");
  }

  function deleteCurrentEntry() {
    if (!isCustomId()) return;
    const item = itemById();
    if (!window.confirm(`确定删除新增内容“${item?.title || item?.name || "未命名内容"}”吗？发布后网站将不再显示。`)) return;
    const collection = customCollection();
    const index = collection.findIndex((entry) => entry.id === state.selectedId);
    if (index >= 0) collection.splice(index, 1);
    state.selectedId = null;
    state.formTouched = false;
    markDirty();
    persistDraft();
    renderList();
    setNotice(elements.publishNotice, "新增内容已从草稿中删除。", "success");
  }

  function validateAllContent() {
    for (const feature of state.content.customFeatures) {
      if (!feature.name) return { kind: "feature", id: feature.id, message: "有新增地点尚未填写名称。" };
      if (!feature.knowledgeOnly && !validCampusCoordinate(Number(feature.lat), Number(feature.lng))) {
        return { kind: "feature", id: feature.id, message: `“${feature.name}”缺少有效地图坐标。` };
      }
    }
    for (const workflow of state.content.customWorkflows) {
      if (!workflow.title || !Array.isArray(workflow.steps) || !workflow.steps.length) {
        return { kind: "workflow", id: workflow.id, message: `“${workflow.title || "未命名流程"}”至少需要一个办理步骤。` };
      }
    }
    return null;
  }

  function focusValidationError(error) {
    if (!error) return;
    state.kind = error.kind;
    state.selectedId = error.id;
    document.querySelectorAll("[data-content-kind]").forEach((tab) => {
      const active = tab.dataset.contentKind === state.kind;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    updateAddButton();
    renderList();
    setNotice(elements.entryNotice, error.message, "error");
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setNotice(elements.coordinateNotice, "当前浏览器不支持定位，请手动填写坐标。", "error");
      return;
    }
    elements.useCurrentLocation.disabled = true;
    elements.useCurrentLocation.textContent = "正在定位…";
    navigator.geolocation.getCurrentPosition((position) => {
      elements.fieldLatitude.value = Number(position.coords.latitude).toFixed(6);
      elements.fieldLongitude.value = Number(position.coords.longitude).toFixed(6);
      elements.fieldCoordinateSystem.value = "WGS84";
      elements.fieldKnowledgeOnly.checked = false;
      state.formTouched = true;
      updateCoordinateVisibility();
      renderPreview();
      updateMeta();
      setNotice(elements.coordinateNotice, `定位完成，设备精度约 ${Math.round(position.coords.accuracy || 0)} 米；发布前请核对大头针位置。`, "success");
      elements.useCurrentLocation.disabled = false;
      elements.useCurrentLocation.textContent = "使用我的当前位置";
    }, () => {
      setNotice(elements.coordinateNotice, "未获得定位权限，请在浏览器地址栏允许位置访问，或手动填写坐标。", "error");
      elements.useCurrentLocation.disabled = false;
      elements.useCurrentLocation.textContent = "使用我的当前位置";
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }

  async function loadContent() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (response.status === 401) throw new Error("UNAUTHENTICATED");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "读取内容失败");
    state.storageConfigured = Boolean(result.storageConfigured);
    state.publishedContent = normalizeContent(result.content);
    let localDraft = null;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      localDraft = raw ? normalizeContent(JSON.parse(raw)) : null;
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
    state.content = localDraft || clone(state.publishedContent);
    state.dirty = JSON.stringify(state.content) !== JSON.stringify(state.publishedContent);
    if (!state.storageConfigured) setNotice(elements.publishNotice, "内容存储尚未连接；可以编辑草稿，但暂时不能发布。", "error");
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
    if (!canLeaveEditor()) return;
    await fetch("/api/admin/session", { method: "DELETE" });
    elements.editorView.hidden = true;
    elements.logoutButton.hidden = true;
    elements.loginView.hidden = false;
    elements.passwordInput.focus();
  }

  async function publish() {
    if (state.formTouched && !commitCurrentEntry()) return;
    const validationError = validateAllContent();
    if (validationError) {
      focusValidationError(validationError);
      setNotice(elements.publishNotice, validationError.message, "error");
      return;
    }
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
      state.content = normalizeContent(result.content);
      state.publishedContent = clone(state.content);
      state.dirty = false;
      state.formTouched = false;
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

  function updateAddButton() {
    elements.addContentLabel.textContent = state.kind === "workflow" ? "新增办事流程" : "新增地点或信息条目";
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", login);
    elements.logoutButton.addEventListener("click", logout);
    elements.addContentButton.addEventListener("click", addContent);
    elements.contentSearch.addEventListener("input", (event) => {
      if (state.formTouched && !canLeaveEditor()) {
        event.target.value = state.query;
        return;
      }
      state.query = event.target.value.trim();
      renderList();
    });
    elements.contentList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-content-id]");
      if (!button || button.dataset.contentId === state.selectedId || !canLeaveEditor()) return;
      state.selectedId = button.dataset.contentId;
      renderList();
    });
    document.querySelectorAll("[data-content-kind]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.contentKind === state.kind || !canLeaveEditor()) return;
      state.kind = button.dataset.contentKind === "workflow" ? "workflow" : "feature";
      state.selectedId = activeCollection()[0]?.id || null;
      document.querySelectorAll("[data-content-kind]").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      updateAddButton();
      renderList();
    }));
    elements.contentForm.addEventListener("submit", saveCurrentEntry);
    elements.contentForm.addEventListener("input", () => {
      state.formTouched = true;
      updateCoordinateVisibility();
      renderPreview();
      updateMeta();
    });
    elements.contentForm.addEventListener("change", () => {
      state.formTouched = true;
      updateCoordinateVisibility();
      renderPreview();
      updateMeta();
    });
    elements.useCurrentLocation.addEventListener("click", useCurrentLocation);
    elements.restoreEntry.addEventListener("click", restoreCurrentEntry);
    elements.deleteEntry.addEventListener("click", deleteCurrentEntry);
    elements.publishButton.addEventListener("click", publish);
    elements.discardDraft.addEventListener("click", () => {
      if (!window.confirm("确定放弃全部未发布改动吗？")) return;
      state.content = clone(state.publishedContent);
      state.dirty = false;
      state.formTouched = false;
      localStorage.removeItem(draftStorageKey);
      renderList();
      updateMeta();
      setNotice(elements.publishNotice, "未发布改动已放弃。", "success");
    });
    window.addEventListener("beforeunload", (event) => {
      if (!state.formTouched) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  async function initialize() {
    updateAddButton();
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
