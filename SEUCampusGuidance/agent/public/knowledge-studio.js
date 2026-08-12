// 调试台的线上知识维护。静态知识只读，所有编辑都落到独立修订层。
(function () {
  const $ = (id) => document.getElementById(id);
  const elements = {
    tabs: $("studioTabs"), promptView: $("editorView"), knowledgeView: $("knowledgeView"),
    promptState: $("stateChip"), promptSave: $("saveButton"), promptPublish: $("publishButton"),
    top: $("knowledgeTopActions"), state: $("knowledgeStateChip"), save: $("knowledgeSaveButton"), publish: $("knowledgePublishButton"),
    warning: $("knowledgeWarning"), campus: $("knowledgeCampus"), status: $("knowledgeStatus"), search: $("knowledgeSearch"), list: $("knowledgeList"), add: $("knowledgeAdd"),
    campusVersion: $("campusVersion"), campusNotice: $("campusNotice"), saveCampus: $("saveCampusChange"), restoreCampus: $("restoreCampus"),
    campusSourceLabel: $("campusSourceLabel"), campusSourceUrl: $("campusSourceUrl"), campusVerifiedAt: $("campusVerifiedAt"), campusVerifiedBy: $("campusVerifiedBy"), campusAuditNote: $("campusAuditNote"),
    empty: $("knowledgeEmpty"), editor: $("knowledgeEditor"), editorTitle: $("knowledgeEditorTitle"), editorStatus: $("knowledgeEditorStatus"),
    chunkId: $("chunkId"), chunkCampus: $("chunkCampus"), chunkTitle: $("chunkTitle"), chunkVersion: $("chunkVersion"), chunkSummary: $("chunkSummary"),
    chunkKeywords: $("chunkKeywords"), chunkAliases: $("chunkAliases"), chunkRelated: $("chunkRelated"), chunkPages: $("chunkPages"), chunkText: $("chunkText"),
    sourceLabel: $("auditSourceLabel"), sourceUrl: $("auditSourceUrl"), verifiedAt: $("auditVerifiedAt"), verifiedBy: $("auditVerifiedBy"), auditNote: $("auditNote"),
    generate: $("generateMetadata"), preview: $("previewMarkdown"), markdown: $("knowledgeMarkdownPreview"), saveChunk: $("saveChunkChange"), disable: $("disableChunk"), restore: $("restoreChunk"),
    releaseNote: $("knowledgeReleaseNote"), count: $("knowledgeChangeCount"), diff: $("knowledgeDiff"), problems: $("knowledgeProblems"), releases: $("knowledgeReleaseList"), releaseHint: $("knowledgeReleaseHint"),
  };

  const state = { loaded: false, loading: false, active: false, busy: false, storageConfigured: false, draft: null, published: null, baseCatalog: [], campuses: [], baseCampuses: [], releases: [], selectedId: null, currentRelease: null };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const lines = (value) => String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  const auditBlank = () => ({ sourceLabel: "", sourceUrl: "", verifiedAt: new Date().toISOString().slice(0, 10), verifiedBy: "", note: "" });

  async function request(path, options = {}) {
    const response = await fetch(path, { cache: "no-store", headers: options.body ? { "Content-Type": "application/json" } : undefined, ...options });
    let payload = {};
    try { payload = await response.json(); } catch { /* empty */ }
    if (!response.ok) {
      const error = new Error(payload.error || `请求失败（${response.status}）`);
      Object.assign(error, payload, { status: response.status });
      throw error;
    }
    return payload;
  }

  function emptyOverlay() {
    return { schemaVersion: 1, baseGeneratedAt: state.draft?.baseGeneratedAt || "", campusChanges: {}, chunkChanges: {}, releaseNote: "" };
  }

  function comparable(value) {
    if (!value) return "";
    const copy = clone(value);
    delete copy.updatedAt;
    return JSON.stringify(copy);
  }

  function isDirty() { return comparable(state.draft) !== comparable(state.published); }

  function catalog() {
    const byId = new Map(state.baseCatalog.filter((item) => item.base).map((item) => [item.id, { ...item, effective: item.base, status: "original", change: null }]));
    for (const [id, change] of Object.entries(state.draft?.chunkChanges || {})) {
      const item = byId.get(id) || { id, base: null };
      if (change.action === "disable") byId.set(id, { ...item, effective: null, change, status: "disabled" });
      else {
        const base = item.base || {};
        const campus = base.campus || change.campus;
        byId.set(id, { ...item, change, status: item.base ? "revised" : "added", effective: {
          ...base, id, campus, campusName: campusName(campus), sectionPath: change.title || base.sectionPath || "未命名知识",
          version: change.version || base.version || campusValue(campus, "version"), summary: change.summary || base.summary || "",
          keywords: change.keywords?.length ? change.keywords : (base.keywords || []), related: change.related?.length ? change.related : (base.related || []),
          pages: change.pages?.length ? change.pages : (base.pages || []), text: change.text || base.text || "",
        } });
      }
    }
    return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  function campusName(id) { return state.baseCampuses.find((campus) => campus.slug === id)?.name || id; }
  function campusValue(id, field) {
    const base = state.baseCampuses.find((campus) => campus.slug === id) || {};
    const change = state.draft?.campusChanges?.[id] || {};
    return change[field] || base[field] || "";
  }

  function statusLabel(status) { return ({ original: "原始", revised: "已修订", added: "新增", disabled: "已停用" })[status] || status; }

  function refreshTop() {
    const changed = isDirty();
    const count = Object.keys(state.draft?.campusChanges || {}).length + Object.keys(state.draft?.chunkChanges || {}).length;
    elements.state.textContent = changed ? "知识草稿与线上不一致" : "知识与线上一致";
    elements.state.className = `state-chip ${changed ? "dirty" : "synced"}`;
    elements.save.disabled = state.busy || !state.storageConfigured;
    elements.publish.disabled = state.busy || !state.storageConfigured;
    elements.count.textContent = `${count} 项修订`;
  }

  function renderCampuses() {
    for (const select of [elements.campus, elements.chunkCampus]) {
      const selected = select.value;
      select.textContent = "";
      state.baseCampuses.forEach((campus) => {
        const option = document.createElement("option"); option.value = campus.slug; option.textContent = campus.name; select.append(option);
      });
      if ([...select.options].some((option) => option.value === selected)) select.value = selected;
    }
    renderCampusEditor();
  }

  function renderCampusEditor() {
    const id = elements.campus.value || state.baseCampuses[0]?.slug;
    if (!id) return;
    elements.campusVersion.value = campusValue(id, "version");
    elements.campusNotice.value = campusValue(id, "notice");
    const audit = state.draft.campusChanges[id]?.audit || auditBlank();
    elements.campusSourceLabel.value = audit.sourceLabel || ""; elements.campusSourceUrl.value = audit.sourceUrl || "";
    elements.campusVerifiedAt.value = audit.verifiedAt || new Date().toISOString().slice(0, 10); elements.campusVerifiedBy.value = audit.verifiedBy || ""; elements.campusAuditNote.value = audit.note || "";
    elements.restoreCampus.disabled = !state.draft.campusChanges[id];
  }

  function renderList() {
    const campus = elements.campus.value;
    const status = elements.status.value;
    const query = elements.search.value.trim().toLowerCase();
    const items = catalog().filter((item) => {
      const source = item.effective || item.base || item.change || {};
      return (!campus || (source.campus || item.id.split("/")[0]) === campus)
        && (!status || item.status === status)
        && (!query || `${item.id} ${source.sectionPath || source.title || ""} ${source.summary || ""} ${source.text || ""}`.toLowerCase().includes(query));
    });
    elements.list.textContent = "";
    for (const item of items) {
      const button = document.createElement("button");
      button.type = "button"; button.className = `knowledge-item ${state.selectedId === item.id ? "active" : ""}`;
      const badge = document.createElement("span"); badge.className = `knowledge-badge ${item.status}`; badge.textContent = statusLabel(item.status);
      const strong = document.createElement("strong"); strong.textContent = item.effective?.sectionPath || item.base?.sectionPath || item.change?.title || item.id;
      const small = document.createElement("small"); small.textContent = item.id;
      button.append(badge, strong, small);
      button.addEventListener("click", () => selectItem(item.id));
      elements.list.append(button);
    }
    if (!items.length) elements.list.textContent = "没有符合筛选条件的页面。";
    renderDiff();
    refreshTop();
  }

  function renderDiff() {
    elements.diff.textContent = "";
    const changes = [];
    for (const campus of Object.keys(state.draft?.campusChanges || {})) changes.push(`校区修订 · ${campusName(campus)}`);
    for (const item of catalog().filter((entry) => entry.status !== "original")) {
      const title = item.effective?.sectionPath || item.base?.sectionPath || item.change?.title || item.id;
      changes.push(`${statusLabel(item.status)} · ${title}`);
    }
    if (!changes.length) {
      const empty = document.createElement("p"); empty.className = "field-help"; empty.textContent = "当前没有线上知识修订。"; elements.diff.append(empty); return;
    }
    for (const text of changes.slice(0, 30)) { const row = document.createElement("div"); row.className = "knowledge-diff-item"; row.textContent = text; elements.diff.append(row); }
    if (changes.length > 30) { const more = document.createElement("p"); more.className = "field-help"; more.textContent = `另有 ${changes.length - 30} 项未展开`; elements.diff.append(more); }
  }

  function formAudit(audit = {}) {
    elements.sourceLabel.value = audit.sourceLabel || ""; elements.sourceUrl.value = audit.sourceUrl || "";
    elements.verifiedAt.value = audit.verifiedAt || new Date().toISOString().slice(0, 10); elements.verifiedBy.value = audit.verifiedBy || ""; elements.auditNote.value = audit.note || "";
  }

  function fillForm(item) {
    const source = item.effective || item.base || item.change || {};
    const change = item.change || {};
    elements.empty.hidden = true; elements.editor.hidden = false;
    elements.chunkId.value = item.id; elements.chunkCampus.value = source.campus || item.id.split("/")[0];
    elements.chunkCampus.disabled = Boolean(item.base);
    elements.chunkTitle.value = source.sectionPath || change.title || ""; elements.chunkVersion.value = source.version || "";
    elements.chunkSummary.value = source.summary || ""; elements.chunkKeywords.value = (source.keywords || change.keywords || []).join("\n");
    elements.chunkAliases.value = (change.aliasPairs || []).map((pair) => `${pair.spoken} => ${pair.written}`).join("\n");
    elements.chunkRelated.value = (source.related || change.related || []).join("\n"); elements.chunkPages.value = (source.pages || change.pages || []).join("\n");
    elements.chunkText.value = source.text || change.text || ""; formAudit(change.audit || auditBlank());
    elements.editorTitle.textContent = source.sectionPath || "新增知识"; elements.editorStatus.textContent = statusLabel(item.status);
    elements.disable.textContent = item.status === "disabled" ? "保持停用" : "停用页面";
    elements.restore.hidden = !item.change;
    elements.restore.textContent = !item.base && item.status === "disabled" ? "重新启用" : "恢复基线";
    elements.markdown.hidden = true;
  }

  function selectItem(id) {
    state.selectedId = id;
    const item = catalog().find((entry) => entry.id === id);
    if (item) fillForm(item);
    renderList();
  }

  function readAudit() {
    return { sourceLabel: elements.sourceLabel.value.trim(), sourceUrl: elements.sourceUrl.value.trim(), verifiedAt: elements.verifiedAt.value, verifiedBy: elements.verifiedBy.value.trim(), note: elements.auditNote.value.trim() };
  }

  function readForm(action = "upsert") {
    return {
      action, campus: elements.chunkCampus.value, title: elements.chunkTitle.value.trim(), version: elements.chunkVersion.value.trim(), summary: elements.chunkSummary.value.trim(),
      keywords: lines(elements.chunkKeywords.value), aliasPairs: lines(elements.chunkAliases.value).map((line) => {
        const [spoken, ...rest] = line.split(/\s*=>\s*/); return { spoken: spoken?.trim() || "", written: rest.join("=>").trim() };
      }), related: lines(elements.chunkRelated.value), pages: lines(elements.chunkPages.value), text: elements.chunkText.value.trim(), audit: readAudit(),
    };
  }

  function saveForm() {
    const id = elements.chunkId.value;
    if (!id) return;
    state.draft.chunkChanges[id] = readForm("upsert");
    state.selectedId = id;
    elements.problems.textContent = "页面修订已加入本地草稿；请保存或试聊。";
    renderList(); selectItem(id);
  }

  function disableForm() {
    const id = elements.chunkId.value;
    if (!id) return;
    if (!window.confirm("停用后该页面不会参与线上检索。确定加入草稿吗？")) return;
    state.draft.chunkChanges[id] = readForm("disable");
    renderList(); selectItem(id);
  }

  function restoreForm() {
    const id = elements.chunkId.value;
    if (!id) return;
    const base = state.baseCatalog.find((item) => item.id === id)?.base;
    const current = state.draft.chunkChanges[id];
    if (!base && current?.action === "disable") {
      state.draft.chunkChanges[id] = { ...current, action: "upsert" };
      selectItem(id);
      return;
    }
    const published = state.published?.chunkChanges?.[id];
    if (!base && published) state.draft.chunkChanges[id] = clone(published);
    else delete state.draft.chunkChanges[id];
    state.selectedId = base || published ? id : null;
    if (state.selectedId) selectItem(id); else { elements.editor.hidden = true; elements.empty.hidden = false; renderList(); }
  }

  function addItem() {
    const campus = elements.campus.value || state.baseCampuses[0]?.slug;
    const id = `${campus}/managed-${crypto.randomUUID()}`;
    state.draft.chunkChanges[id] = { action: "upsert", campus, title: "", version: campusValue(campus, "version"), summary: "", keywords: [], aliasPairs: [], related: [], pages: [], text: "", audit: auditBlank() };
    state.selectedId = id; renderList(); selectItem(id); elements.chunkTitle.focus();
  }

  async function load() {
    if (state.loaded || state.loading) return;
    state.loading = true;
    try {
      const data = await request("/api/admin/knowledge");
      state.storageConfigured = Boolean(data.storageConfigured); state.draft = clone(data.draft || emptyOverlay()); state.published = clone(data.published || emptyOverlay()); state.baseCatalog = data.catalog || [];
      state.campuses = data.campuses || []; state.baseCampuses = data.baseCampuses || []; state.releases = data.releases || []; state.currentRelease = data.publishedRelease?.pathname || null;
      elements.warning.hidden = data.storageConfigured && !(data.warnings || []).length;
      if (!data.storageConfigured) elements.warning.textContent = "私有 Blob 尚未连接，只能查看和试聊，不能保存或发布。";
      else if (data.warnings?.length) elements.warning.textContent = data.warnings.join("；");
      state.loaded = true; renderCampuses(); renderList(); renderReleases(); elements.releaseNote.value = state.draft.releaseNote || "";
    } catch (error) { elements.warning.hidden = false; elements.warning.textContent = error.message; }
    finally { state.loading = false; }
  }

  async function saveDraft() {
    if (state.busy) return;
    state.draft.releaseNote = elements.releaseNote.value.trim(); state.busy = true; refreshTop();
    try { const data = await request("/api/admin/knowledge", { method: "PUT", body: JSON.stringify({ overlay: state.draft }) }); state.draft = clone(data.draft); elements.problems.textContent = "知识草稿已保存，线上尚未变化。"; }
    catch (error) { elements.problems.textContent = error.message; }
    finally { state.busy = false; refreshTop(); }
  }

  async function publish(confirmRegressions = false) {
    if (state.busy) return;
    state.draft.releaseNote = elements.releaseNote.value.trim();
    if (!window.confirm("发布后线上问答会在一分钟内使用这份知识修订。确定继续吗？")) return;
    state.busy = true; refreshTop();
    try {
      const data = await request("/api/admin/knowledge", { method: "POST", body: JSON.stringify({ action: "publish", overlay: state.draft, confirmRegressions }) });
      state.draft = clone(data.draft); state.published = clone(data.published); state.baseCatalog = data.catalog || state.baseCatalog; state.releases = data.releases || []; state.currentRelease = data.publishedRelease?.pathname || null;
      elements.problems.textContent = "知识已发布，最长一分钟全量生效。"; renderList(); renderReleases();
    } catch (error) {
      if (error.requiresConfirmation) {
        const detail = (error.regressions || []).map((item) => `${item.query}：${item.actual || "未命中"}`).join("\n");
        if (window.confirm(`有 ${error.regressions.length} 条检索基线发生变化：\n${detail}\n\n确认这是合理变化并继续发布吗？`)) {
          state.busy = false; refreshTop(); return publish(true);
        }
      }
      elements.problems.textContent = [...(error.problems || []), error.message].join("；");
    } finally { state.busy = false; refreshTop(); }
  }

  function renderReleases() {
    elements.releases.textContent = ""; elements.releaseHint.textContent = state.releases.length ? `最近 ${state.releases.length} 次` : "暂无";
    for (const release of state.releases) {
      const item = document.createElement("li"); const meta = document.createElement("div"); meta.className = "release-meta";
      const time = document.createElement("span"); time.className = "release-time"; time.textContent = new Date(release.uploadedAt).toLocaleString(); meta.append(time);
      const button = document.createElement("button"); button.type = "button"; button.textContent = release.pathname === state.currentRelease ? "当前" : "回退"; button.disabled = release.pathname === state.currentRelease;
      button.addEventListener("click", () => rollback(release)); item.append(meta, button); elements.releases.append(item);
    }
  }

  async function rollback(release) {
    if (!window.confirm("把这个知识历史版本重新发布到线上？")) return;
    state.busy = true; refreshTop();
    try { const data = await request("/api/admin/knowledge", { method: "POST", body: JSON.stringify({ action: "rollback", pathname: release.pathname, confirmRegressions: true }) }); state.draft = clone(data.draft); state.published = clone(data.published); state.baseCatalog = data.catalog || state.baseCatalog; state.releases = data.releases || []; state.currentRelease = data.publishedRelease?.pathname || null; elements.releaseNote.value = state.draft.releaseNote || ""; renderList(); renderReleases(); }
    catch (error) { elements.problems.textContent = error.message; }
    finally { state.busy = false; refreshTop(); }
  }

  async function generateMetadata() {
    elements.generate.disabled = true;
    try { const data = await request("/api/admin/knowledge-meta", { method: "POST", body: JSON.stringify({ title: elements.chunkTitle.value, text: elements.chunkText.value }) }); const c = data.candidates; elements.chunkSummary.value = c.summary || ""; elements.chunkKeywords.value = (c.keywords || []).join("\n"); elements.chunkAliases.value = (c.aliasPairs || []).map((pair) => `${pair.spoken} => ${pair.written}`).join("\n"); elements.problems.textContent = "AI 候选已回填，请人工核对后再加入草稿。"; }
    catch (error) { elements.problems.textContent = error.message; }
    finally { elements.generate.disabled = false; }
  }

  function activate(tab) {
    state.active = tab === "knowledge";
    elements.promptView.hidden = state.active; elements.knowledgeView.hidden = !state.active;
    elements.promptState.hidden = state.active; elements.promptSave.hidden = state.active; elements.promptPublish.hidden = state.active; elements.top.hidden = !state.active;
    elements.tabs.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.studioTab === tab));
    if (state.active) load();
  }

  elements.tabs.addEventListener("click", (event) => { const button = event.target.closest("[data-studio-tab]"); if (button) activate(button.dataset.studioTab); });
  elements.campus.addEventListener("change", () => { renderCampusEditor(); renderList(); }); elements.status.addEventListener("change", renderList); elements.search.addEventListener("input", renderList);
  elements.add.addEventListener("click", addItem); elements.saveChunk.addEventListener("click", saveForm); elements.disable.addEventListener("click", disableForm); elements.restore.addEventListener("click", restoreForm);
  elements.saveCampus.addEventListener("click", () => { const id = elements.campus.value; state.draft.campusChanges[id] = { version: elements.campusVersion.value.trim(), notice: elements.campusNotice.value.trim(), audit: { sourceLabel: elements.campusSourceLabel.value.trim(), sourceUrl: elements.campusSourceUrl.value.trim(), verifiedAt: elements.campusVerifiedAt.value, verifiedBy: elements.campusVerifiedBy.value.trim(), note: elements.campusAuditNote.value.trim() } }; elements.problems.textContent = "校区修订已加入草稿。"; renderList(); });
  elements.restoreCampus.addEventListener("click", () => { delete state.draft.campusChanges[elements.campus.value]; renderCampusEditor(); renderList(); });
  elements.generate.addEventListener("click", generateMetadata); elements.preview.addEventListener("click", () => { elements.markdown.hidden = !elements.markdown.hidden; if (!elements.markdown.hidden) elements.markdown.replaceChildren(window.SEUMarkdown.render(elements.chunkText.value)); });
  elements.save.addEventListener("click", saveDraft); elements.publish.addEventListener("click", () => publish(false)); elements.releaseNote.addEventListener("input", () => { if (state.draft) state.draft.releaseNote = elements.releaseNote.value; refreshTop(); });

  window.KnowledgeStudio = { authenticated: load, readOverlay: () => state.draft || emptyOverlay(), isDirty, load };
})();
