(function () {
  "use strict";

  const state = {
    theme: "all",
    filter: "all",
    query: "",
    selectedId: null,
    mapMode: "fallback",
    fallbackZoom: 1,
    tmap: null,
    tmapMarkers: null,
    annotationMarkers: null,
    userMarker: null,
    userLocation: null,
    locationPromise: null,
    routeData: null,
    routeError: "",
    routeFeatureId: null,
    routeRequestId: null,
    routePolyline: null,
    routeLoading: false,
    nearbyOpen: false,
    nearbyCategory: "all",
    serviceWorkflowId: null,
    annotations: [],
    selectedAnnotationId: null,
    annotationMode: false,
    editingAnnotationId: null,
    pendingAnnotationCoordinate: null,
    editingCoordinateId: null,
    guideView: "structured",
    guideSheet: null,
    knowledgeCategory: "all",
    knowledgeAudience: "all",
    knowledgeQuery: "",
    knowledgeDocumentId: null,
  };

  const elements = {
    searchInput: document.querySelector("#searchInput"),
    themeList: document.querySelector("#themeList"),
    resultList: document.querySelector("#resultList"),
    resultCount: document.querySelector("#resultCount"),
    resultTitle: document.querySelector("#resultTitle"),
    markers: document.querySelector("#fallbackMarkers"),
    fallbackMap: document.querySelector("#fallbackMap"),
    tencentMap: document.querySelector("#tencentMap"),
    layerBar: document.querySelector("#layerBar"),
    nearbyButton: document.querySelector("#nearbyButton"),
    nearbyPanel: document.querySelector("#nearbyPanel"),
    nearbyClose: document.querySelector("#nearbyClose"),
    nearbyStatus: document.querySelector("#nearbyStatus"),
    nearbyFilters: document.querySelector("#nearbyFilters"),
    nearbyList: document.querySelector("#nearbyList"),
    annotationButton: document.querySelector("#annotationButton"),
    annotationPanel: document.querySelector("#annotationPanel"),
    annotationCount: document.querySelector("#annotationCount"),
    annotationList: document.querySelector("#annotationList"),
    annotationNotice: document.querySelector("#annotationNotice"),
    annotationExport: document.querySelector("#annotationExport"),
    annotationCopy: document.querySelector("#annotationCopy"),
    annotationClear: document.querySelector("#annotationClear"),
    annotationEditor: document.querySelector("#annotationEditor"),
    annotationEditorTitle: document.querySelector("#annotationEditorTitle"),
    annotationForm: document.querySelector("#annotationForm"),
    annotationName: document.querySelector("#annotationName"),
    annotationCategory: document.querySelector("#annotationCategory"),
    annotationDescription: document.querySelector("#annotationDescription"),
    annotationCoordinate: document.querySelector("#annotationCoordinate"),
    annotationCancel: document.querySelector("#annotationCancel"),
    annotationFormCancel: document.querySelector("#annotationFormCancel"),
    coordinateEditor: document.querySelector("#coordinateEditor"),
    coordinateEditorTitle: document.querySelector("#coordinateEditorTitle"),
    coordinateForm: document.querySelector("#coordinateForm"),
    coordinateFeatureName: document.querySelector("#coordinateFeatureName"),
    coordinateLatitude: document.querySelector("#coordinateLatitude"),
    coordinateLongitude: document.querySelector("#coordinateLongitude"),
    coordinateSystem: document.querySelector("#coordinateSystem"),
    coordinateCancel: document.querySelector("#coordinateCancel"),
    coordinateFormCancel: document.querySelector("#coordinateFormCancel"),
    detailPanel: document.querySelector("#detailPanel"),
    detailContent: document.querySelector("#detailContent"),
    agentDrawer: document.querySelector("#agentDrawer"),
    chatMessages: document.querySelector("#chatMessages"),
    promptSuggestions: document.querySelector("#promptSuggestions"),
    chatForm: document.querySelector("#chatForm"),
    chatInput: document.querySelector("#chatInput"),
    agentMode: document.querySelector("#agentMode"),
    guideModal: document.querySelector("#guideModal"),
    guideGallery: document.querySelector("#guideGallery"),
    guideStructured: document.querySelector("#guideStructured"),
    guideTopicList: document.querySelector("#guideTopicList"),
    guideRecordEyebrow: document.querySelector("#guideRecordEyebrow"),
    guideRecordTitle: document.querySelector("#guideRecordTitle"),
    guideRecordCount: document.querySelector("#guideRecordCount"),
    guideRecordList: document.querySelector("#guideRecordList"),
    knowledgeButton: document.querySelector("#knowledgeButton"),
    knowledgeModal: document.querySelector("#knowledgeModal"),
    knowledgeClose: document.querySelector("#knowledgeClose"),
    knowledgeVerifiedAt: document.querySelector("#knowledgeVerifiedAt"),
    knowledgeDocumentCount: document.querySelector("#knowledgeDocumentCount"),
    knowledgeDepartmentCount: document.querySelector("#knowledgeDepartmentCount"),
    knowledgeCurrentCount: document.querySelector("#knowledgeCurrentCount"),
    knowledgeSearch: document.querySelector("#knowledgeSearch"),
    knowledgeAudience: document.querySelector("#knowledgeAudience"),
    knowledgeCategories: document.querySelector("#knowledgeCategories"),
    knowledgeResultTitle: document.querySelector("#knowledgeResultTitle"),
    knowledgeResultCount: document.querySelector("#knowledgeResultCount"),
    knowledgeList: document.querySelector("#knowledgeList"),
    knowledgeDetail: document.querySelector("#knowledgeDetail"),
    serviceButton: document.querySelector("#serviceButton"),
    serviceModal: document.querySelector("#serviceModal"),
    serviceClose: document.querySelector("#serviceClose"),
    workflowList: document.querySelector("#workflowList"),
    workflowDetail: document.querySelector("#workflowDetail"),
    sidebar: document.querySelector(".sidebar"),
    dataStatus: document.querySelector("#dataStatus"),
  };

  const manualPoi = Array.isArray(window.MANUAL_POI) ? window.MANUAL_POI : [];
  const importedAnnotations = Array.isArray(window.IMPORTED_ANNOTATIONS) ? window.IMPORTED_ANNOTATIONS : [];
  const serviceWorkflows = Array.isArray(window.SERVICE_WORKFLOWS) ? window.SERVICE_WORKFLOWS : [];
  const knowledgeLibrary = window.KNOWLEDGE_LIBRARY && typeof window.KNOWLEDGE_LIBRARY === "object"
    ? window.KNOWLEDGE_LIBRARY
    : { categories: [], documents: [], verifiedAt: "" };
  const knowledgeDocuments = Array.isArray(knowledgeLibrary.documents) ? knowledgeLibrary.documents : [];
  const knowledgeCategories = Array.isArray(knowledgeLibrary.categories) ? knowledgeLibrary.categories : [];
  const sharedKnowledge = window.SHARED_KNOWLEDGE && typeof window.SHARED_KNOWLEDGE === "object"
    ? window.SHARED_KNOWLEDGE
    : { meta: {}, build: {}, places: [], services: [], departments: [], sources: [], mapFeatures: [] };
  const sharedPlaces = Array.isArray(sharedKnowledge.places) ? sharedKnowledge.places : [];
  const sharedServices = Array.isArray(sharedKnowledge.services) ? sharedKnowledge.services : [];
  const sharedDepartments = Array.isArray(sharedKnowledge.departments) ? sharedKnowledge.departments : [];
  const sharedSources = Array.isArray(sharedKnowledge.sources) ? sharedKnowledge.sources : [];
  const sharedMapFeatures = Array.isArray(sharedKnowledge.mapFeatures) ? sharedKnowledge.mapFeatures : [];
  const sharedPlaceById = Object.fromEntries(sharedPlaces.map((place) => [place.id, place]));
  const sharedServiceById = Object.fromEntries(sharedServices.map((service) => [service.id, service]));
  const sharedDepartmentById = Object.fromEntries(sharedDepartments.map((department) => [department.id, department]));
  const sharedSourceById = Object.fromEntries(sharedSources.map((source) => [source.id, source]));
  const sharedFeatureById = Object.fromEntries(sharedMapFeatures.map((feature) => [feature.id, feature]));
  const sharedServiceCategoryLabels = {
    visit: "参观服务",
    "campus-card": "校园卡",
    "student-status": "教务学籍",
    archives: "档案服务",
    security: "户籍与安全",
  };
  const sharedServiceIcons = { visit: "览", "campus-card": "卡", "student-status": "证", archives: "档", security: "户" };
  const generatedServiceWorkflows = sharedServices.map((service) => ({
    id: `official-${service.id}`,
    icon: sharedServiceIcons[service.category] || "办",
    category: `${sharedServiceCategoryLabels[service.category] || "校园服务"} · 官方核验`,
    title: service.title,
    summary: service.summary,
    preparation: [...(service.materials || [])],
    steps: [...(service.steps || [])],
    notice: `${service.notice}（信息核验：${service.verifiedAt}）`,
    mapFeatureIds: [service.placeId],
    agentPrompt: `请依据统一知识库说明“${service.title}”的地点、时间、材料和办理步骤，并提醒我核对最新官方通知。`,
    sharedServiceId: service.id,
  }));
  const departmentCategoryLabels = {
    party: "党群工作", administration: "综合行政", teaching: "教务培养", student: "学生服务",
    research: "科研服务", personnel: "人事人才", finance: "财务服务", international: "国际交流",
    security: "校园安全", "campus-services": "后勤保障", information: "网络信息",
    "library-archives": "图书档案", "admissions-employment": "招生就业",
    "assets-construction": "设备基建", planning: "发展规划", sports: "体育服务",
  };
  const departmentIcons = {
    party: "党", administration: "校", teaching: "教", student: "生", research: "研", personnel: "人",
    finance: "财", international: "外", security: "安", "campus-services": "勤", information: "网",
    "library-archives": "藏", "admissions-employment": "招", "assets-construction": "建", planning: "规", sports: "体",
  };
  const generatedDepartmentWorkflows = sharedDepartments.filter((department) => !department.aggregateInto).map((department) => ({
    id: `department-${department.id}`,
    icon: departmentIcons[department.category] || "部",
    category: `${departmentCategoryLabels[department.category] || "职能部门"} · 官方核验`,
    title: department.name,
    summary: department.summary,
    preparation: [...(department.responsibilities || [])],
    steps: [],
    notice: `办公地点、电话和坐班安排可能变化，前往前请打开部门官网复核。（信息核验：${department.verifiedAt}）`,
    mapFeatureIds: [...new Set(allDepartmentOffices(department).map((office) => office.placeId).filter(Boolean))],
    agentPrompt: `请依据统一知识库整合说明“${department.name}”及其下设科室：逐一列出职责、各校区办公室、房间和电话，不要拆成多个重复结果，并提醒我核对最新官方通知。`,
    entityType: "department",
    sharedDepartmentId: department.id,
  }));
  const replacedLegacyWorkflows = new Set(["campus-card-reissue", "academic-affairs"]);
  serviceWorkflows.splice(0, serviceWorkflows.length,
    ...generatedServiceWorkflows,
    ...generatedDepartmentWorkflows,
    ...serviceWorkflows.filter((workflow) => !replacedLegacyWorkflows.has(workflow.id)));
  const featureCoordinateStorageKey = "seu-campus-map-coordinate-overrides-v1";
  const toTencentCoordinate = (latitude, longitude, coordinateSystem = "WGS84") => (
    coordinateSystem === "GCJ-02"
      ? { latitude, longitude }
      : window.CampusCoordinates.wgs84ToGcj02(latitude, longitude)
  );

  function readFeatureCoordinateOverrides() {
    try {
      const raw = window.localStorage.getItem(featureCoordinateStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      console.warn("无法读取点位坐标修正数据。", error);
      return {};
    }
  }

  const featureCoordinateOverrides = readFeatureCoordinateOverrides();
  const manualReplacements = [
    ...manualPoi.filter((feature) => feature.replacesId),
    ...importedAnnotations.filter((feature) => feature.replacesId),
  ];
  const replacementsById = new Map(manualReplacements.map((feature) => [feature.replacesId, feature]));
  const baseFeatureIds = new Set(window.MAP_FEATURES.map((feature) => feature.id));
  const sharedDepartmentFeatures = sharedDepartments.filter((department) => !department.aggregateInto).map((department) => ({
    id: `department-${department.id}`,
    name: department.name,
    category: "office",
    icon: departmentIcons[department.category] || "部",
    location: departmentResultSummary(department),
    hours: "",
    status: "unknown",
    verified: false,
    tags: [
      departmentCategoryLabels[department.category] || "职能部门",
      ...(department.aliases || []),
      ...(department.units || []).flatMap((unit) => [unit.name, ...(unit.aliases || [])]),
    ],
    description: department.summary,
    knowledgeOnly: true,
    officialKnowledge: true,
    sharedDepartmentId: department.id,
  }));
  const enrichedFeatures = window.MAP_FEATURES.map((feature) => {
    const sharedFeature = sharedFeatureById[feature.id];
    if (!sharedFeature) return feature;
    return {
      ...feature,
      ...sharedFeature,
      id: feature.id,
      tags: [...new Set([...(feature.tags || []), ...(sharedFeature.tags || [])])],
    };
  });
  const mergedFeatures = enrichedFeatures.map((feature) => {
    const replacement = replacementsById.get(feature.id);
    if (!replacement) return feature;
    return {
      ...feature,
      ...replacement,
      id: feature.id,
      tags: [...new Set([...(feature.tags || []), ...(replacement.tags || [])])],
    };
  });
  window.MAP_FEATURES = [
    ...mergedFeatures,
    ...sharedMapFeatures.filter((feature) => !baseFeatureIds.has(feature.id)),
    ...sharedDepartmentFeatures,
    ...manualPoi.filter((feature) => !feature.replacesId),
    ...importedAnnotations.filter((feature) => !feature.replacesId),
  ].map((feature) => {
    const resolved = featureCoordinateOverrides[feature.id]
      ? { ...feature, ...featureCoordinateOverrides[feature.id], id: feature.id }
      : feature;
    if (!resolved.knowledgeOnly && Number.isFinite(Number(resolved.lat)) && Number.isFinite(Number(resolved.lng))) {
      Object.assign(resolved, fallbackPositionFromCoordinate(Number(resolved.lat), Number(resolved.lng), resolved.coordinateSystem));
    }
    return resolved;
  });

  const themeById = Object.fromEntries(window.MAP_THEMES.map((theme) => [theme.id, theme]));
  const featureById = Object.fromEntries(window.MAP_FEATURES.map((feature) => [feature.id, feature]));
  const workflowById = Object.fromEntries(serviceWorkflows.map((workflow) => [workflow.id, workflow]));
  const knowledgeById = Object.fromEntries(knowledgeDocuments.map((document) => [document.id, document]));
  const knowledgeCategoryById = Object.fromEntries(knowledgeCategories.map((category) => [category.id, category]));
  const sheetCategory = {
    "宿舍信息": "dorm", "食堂信息": "dining", "图书馆与学习设施": "study",
    "行政窗口": "office", "交通信息": "transport", "周边餐饮": "nearby",
    "周边商业服务": "service", "运动设施": "sports", "一卡通与生活服务": "service",
  };
  const guideSheetMeta = {
    "宿舍信息": { icon: "宿", summary: "楼栋房型、床铺、卫浴、门禁与生活设施" },
    "食堂信息": { icon: "食", summary: "三处食堂的2025版供餐时间与设施" },
    "图书馆与学习设施": { icon: "书", summary: "自习、借还书、研讨空间、空教室与打印" },
    "行政窗口": { icon: "办", summary: "教务、财务、学生事务与研究生办事地点" },
    "交通信息": { icon: "行", summary: "地铁、公交、步行与跨校区出行参考" },
    "周边餐饮": { icon: "吃", summary: "校园周边餐饮街区、连锁餐饮与商业体" },
    "周边商业服务": { icon: "店", summary: "超市、快递、打印、通信与电子维修" },
    "运动设施": { icon: "体", summary: "运动场馆、开放时间、预约与收费信息" },
    "一卡通与生活服务": { icon: "卡", summary: "一卡通、洗衣、外卖、医疗与AED" },
  };
  const annotationStorageKey = "seu-campus-map-annotations-v1";

  function applyPublishedContent(content) {
    (Array.isArray(content?.customFeatures) ? content.customFeatures : []).forEach((feature) => {
      if (!feature?.id || !feature?.name || featureById[feature.id]) return;
      const managedFeature = { ...feature };
      if (!managedFeature.knowledgeOnly && Number.isFinite(Number(managedFeature.lat)) && Number.isFinite(Number(managedFeature.lng))) {
        const fallback = fallbackPositionFromCoordinate(Number(managedFeature.lat), Number(managedFeature.lng), managedFeature.coordinateSystem);
        managedFeature.x = fallback.x;
        managedFeature.y = fallback.y;
      }
      window.MAP_FEATURES.push(managedFeature);
      featureById[managedFeature.id] = managedFeature;
    });
    (Array.isArray(content?.customWorkflows) ? content.customWorkflows : []).forEach((workflow) => {
      if (!workflow?.id || !workflow?.title || workflowById[workflow.id]) return;
      serviceWorkflows.push(workflow);
      workflowById[workflow.id] = workflow;
    });
    const featureFields = ["name", "description", "location", "hours", "category", "icon", "lat", "lng", "coordinateSystem", "tags", "knowledgeOnly"];
    const workflowFields = ["title", "summary", "notice", "preparation", "steps", "category", "icon", "mapFeatureIds", "agentPrompt"];
    Object.entries(content?.featureOverrides || {}).forEach(([id, override]) => {
      const feature = featureById[id];
      if (!feature || !override || typeof override !== "object") return;
      featureFields.forEach((field) => {
        if (typeof override[field] === "string") feature[field] = override[field];
        if ((field === "lat" || field === "lng") && Number.isFinite(Number(override[field]))) feature[field] = Number(override[field]);
        if (field === "knowledgeOnly" && typeof override[field] === "boolean") feature[field] = override[field];
        if (field === "tags" && Array.isArray(override[field])) feature[field] = override[field].filter((item) => typeof item === "string" && item.trim());
      });
      if (!feature.knowledgeOnly && Number.isFinite(Number(feature.lat)) && Number.isFinite(Number(feature.lng))) {
        Object.assign(feature, fallbackPositionFromCoordinate(Number(feature.lat), Number(feature.lng), feature.coordinateSystem));
      }
    });
    Object.entries(content?.workflowOverrides || {}).forEach(([id, override]) => {
      const workflow = workflowById[id];
      if (!workflow || !override || typeof override !== "object") return;
      workflowFields.forEach((field) => {
        if (typeof override[field] === "string") workflow[field] = override[field];
        if ((field === "preparation" || field === "steps" || field === "mapFeatureIds") && Array.isArray(override[field])) {
          workflow[field] = override[field].filter((item) => typeof item === "string" && item.trim());
        }
      });
    });
  }

  async function loadPublishedContent() {
    try {
      const response = await fetch("/api/content", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      applyPublishedContent(payload.content);
      renderAll();
      renderServiceWorkflows();
      if (state.selectedId) {
        const selected = resolveFeature(state.selectedId, !featureById[state.selectedId]);
        if (selected) renderDetail(selected);
      }
    } catch (error) {
      console.warn("已继续使用内置校园指南内容。", error);
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function normalize(value) {
    return String(value ?? "").toLowerCase().replace(/\s+/g, "");
  }

  const genericDepartmentQueries = new Set(["管理", "服务", "办公室", "中心", "科室", "电话", "地点", "校区", "行政"]);
  const genericDepartmentTerms = new Set(["办公室", "处办公室", "综合办公室", "行政办公室", "服务中心", "管理办公室"]);

  function allDepartmentOffices(department) {
    return [
      ...(department?.offices || []),
      ...(department?.units || []).flatMap((unit) => unit.offices || []),
    ];
  }

  function uniqueDepartmentOffices(department) {
    const seen = new Set();
    return allDepartmentOffices(department).filter((office) => {
      const key = [office.campusId, office.location, office.room, ...(office.phones || [])].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function departmentResultSummary(department) {
    const unitCount = (department?.units || []).length;
    const officeCount = uniqueDepartmentOffices(department).length;
    return `${unitCount} 个科室 · ${officeCount} 处办公点`;
  }

  function departmentSearchTerms(department) {
    const departmentTerms = [department?.name, ...(department?.aliases || [])];
    const unitTerms = (department?.units || []).flatMap((unit) => [unit.name, ...(unit.aliases || [])]);
    return [...new Set([...departmentTerms, ...unitTerms]
      .map(normalize)
      .filter((term) => term.length >= 2 && !genericDepartmentTerms.has(term)))];
  }

  function queryMatchesDepartment(department, query) {
    if (!query || genericDepartmentQueries.has(query)) return false;
    return departmentSearchTerms(department).some((term) => query.includes(term) || term.includes(query));
  }

  function departmentsMatchingQuery(query) {
    return sharedDepartments.filter((department) => !department.aggregateInto && queryMatchesDepartment(department, query));
  }

  function featureBelongsToDepartment(feature, department, query) {
    if (!feature || feature.sharedDepartmentId === department.id) return false;
    const terms = departmentSearchTerms(department);
    const featureName = normalize(feature.name);
    if (terms.includes(featureName)) return true;
    const relatedPlaceIds = new Set(allDepartmentOffices(department).map((office) => office.placeId).filter(Boolean));
    const featurePlaceId = feature.sharedPlaceId || feature.id;
    const featureText = normalize([feature.name, feature.location, feature.description, ...(feature.tags || [])].join(" "));
    if (relatedPlaceIds.has(featurePlaceId) && featureText.includes(query)) return true;
    if (feature.record) {
      const recordText = normalize(JSON.stringify(feature.record));
      return terms.some((term) => recordText.includes(term));
    }
    return false;
  }

  function categoryColor(category) {
    return (themeById[category] || themeById.all).color;
  }

  function markerStyleId(category, selected = false) {
    const theme = themeById[category] || themeById.all;
    const baseId = theme.id === "all" ? "default" : theme.id;
    return selected ? `${baseId}-selected` : baseId;
  }

  function loadAnnotations() {
    try {
      const raw = window.localStorage.getItem(annotationStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      state.annotations = Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.name) : [];
    } catch (error) {
      state.annotations = [];
      console.warn("无法读取本地标注数据。", error);
    }
  }

  function persistAnnotations() {
    try {
      window.localStorage.setItem(annotationStorageKey, JSON.stringify(state.annotations));
    } catch (error) {
      setAnnotationNotice("浏览器未允许本地保存；仍可导出当前标注。", true);
      console.warn("无法保存本地标注数据。", error);
    }
  }

  function persistFeatureCoordinateOverrides() {
    try {
      window.localStorage.setItem(featureCoordinateStorageKey, JSON.stringify(featureCoordinateOverrides));
    } catch (error) {
      setAnnotationNotice("浏览器未允许本地保存坐标修正；当前页面仍会继续显示。", true);
      console.warn("无法保存点位坐标修正数据。", error);
    }
  }

  function fallbackPositionFromCoordinate(latitude, longitude, coordinateSystem) {
    const point = coordinateSystem === "GCJ-02"
      ? { latitude, longitude }
      : toTencentCoordinate(latitude, longitude, coordinateSystem || "WGS84");
    const west = 118.7805;
    const east = 118.7995;
    const north = 32.0635;
    const south = 32.048;
    return {
      x: Math.max(0, Math.min(100, ((point.longitude - west) / (east - west)) * 100)),
      y: Math.max(0, Math.min(100, ((north - point.latitude) / (north - south)) * 100)),
    };
  }

  function distanceMeters(from, to) {
    if (!from || !to) return null;
    const radius = 6371000;
    const radians = (degrees) => degrees * Math.PI / 180;
    const lat1 = radians(Number(from.latitude));
    const lat2 = radians(Number(to.latitude));
    const deltaLat = lat2 - lat1;
    const deltaLng = radians(Number(to.longitude) - Number(from.longitude));
    const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  function featureDistance(feature) {
    if (!state.userLocation || !Number.isFinite(Number(feature?.lat)) || !Number.isFinite(Number(feature?.lng))) return null;
    return distanceMeters(state.userLocation, toTencentCoordinate(Number(feature.lat), Number(feature.lng), feature.coordinateSystem));
  }

  function formatDistance(distance) {
    if (!Number.isFinite(distance)) return "";
    if (distance < 1000) return `${Math.max(10, Math.round(distance / 10) * 10)} m`;
    return `${(distance / 1000).toFixed(distance < 10000 ? 1 : 0)} km`;
  }

  const nearbyCategories = [
    { id: "all", label: "全部" },
    { id: "dining", label: "餐饮" },
    { id: "service", label: "生活服务" },
    { id: "medical", label: "医疗急救" },
    { id: "study", label: "学习空间" },
    { id: "transport", label: "交通" },
  ];

  function setUserLocation(coordinate, centerMap = true) {
    state.userLocation = coordinate;
    if (centerMap && state.tmap) state.tmap.easeTo({ center: new TMap.LatLng(coordinate.latitude, coordinate.longitude), zoom: 18 });
    renderResults();
    renderNearby();
    if (state.selectedAnnotationId) {
      const annotation = state.annotations.find((item) => item.id === state.selectedAnnotationId);
      if (annotation) selectAnnotation(annotation);
    } else if (state.selectedId) {
      const selected = resolveFeature(state.selectedId, !featureById[state.selectedId]);
      if (selected) renderDetail(selected);
    }
    restoreDataStatus();
  }

  function requestUserLocation({ centerMap = true } = {}) {
    if (state.userLocation) return Promise.resolve(state.userLocation);
    if (state.locationPromise) return state.locationPromise;
    if (!navigator.geolocation) return Promise.reject(new Error("当前浏览器不支持定位。"));
    elements.dataStatus.textContent = "正在定位…";
    elements.dataStatus.classList.remove("success");
    elements.dataStatus.classList.add("warning");
    state.locationPromise = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        const coordinate = toTencentCoordinate(position.coords.latitude, position.coords.longitude);
        setUserLocation(coordinate, centerMap);
        resolve(coordinate);
      }, () => {
        state.userLocation = null;
        restoreDataStatus();
        reject(new Error("未获得定位权限。请在浏览器地址栏允许位置访问后重试。"));
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
    }).finally(() => { state.locationPromise = null; });
    return state.locationPromise;
  }

  function nearbyFeatures() {
    if (!state.userLocation) return [];
    const supported = new Set(["dining", "service", "medical", "study", "transport"]);
    return window.MAP_FEATURES
      .filter((feature) => supported.has(feature.category)
        && (state.nearbyCategory === "all" || feature.category === state.nearbyCategory)
        && Number.isFinite(Number(feature.lat))
        && Number.isFinite(Number(feature.lng)))
      .map((feature) => ({ feature, distance: featureDistance(feature) }))
      .filter((item) => Number.isFinite(item.distance))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 8);
  }

  function renderNearby() {
    if (!elements.nearbyPanel) return;
    elements.nearbyPanel.hidden = !state.nearbyOpen;
    elements.nearbyButton.classList.toggle("active", state.nearbyOpen);
    elements.nearbyFilters.innerHTML = nearbyCategories.map((category) => `
      <button class="nearby-filter ${state.nearbyCategory === category.id ? "active" : ""}" type="button" data-nearby-category="${category.id}">${category.label}</button>
    `).join("");
    if (!state.userLocation) {
      elements.nearbyStatus.textContent = "需要获取你的位置，才能计算附近服务的实际距离。";
      elements.nearbyList.innerHTML = `<button class="nearby-locate" type="button" data-nearby-action="locate">允许定位并查看</button>`;
      return;
    }
    const items = nearbyFeatures();
    elements.nearbyStatus.textContent = "已按直线距离由近到远排列；点击地点可查看详情。";
    elements.nearbyList.innerHTML = items.length ? items.map(({ feature, distance }, index) => `
      <article class="nearby-item">
        <button class="nearby-place" type="button" data-nearby-feature="${escapeHtml(feature.id)}">
          <span class="nearby-rank">${index + 1}</span>
          <span><strong>${escapeHtml(feature.name)}</strong><small>${escapeHtml(publicLocation(feature))}</small></span>
          <em>${formatDistance(distance)}</em>
        </button>
        <button class="nearby-route" type="button" data-nearby-route="${escapeHtml(feature.id)}" aria-label="规划到 ${escapeHtml(feature.name)} 的路线">路线</button>
      </article>
    `).join("") : `<div class="nearby-empty">这个分类暂时没有可计算距离的地点。</div>`;
  }

  async function openNearby() {
    state.nearbyOpen = true;
    renderNearby();
    if (state.userLocation) return;
    try {
      await requestUserLocation({ centerMap: false });
      showToast("已定位，附近服务已按距离排列。", "success");
    } catch (error) {
      elements.nearbyStatus.textContent = error.message;
      showToast(error.message, "warning");
    }
  }

  function closeNearby() {
    state.nearbyOpen = false;
    renderNearby();
  }

  function setAnnotationNotice(message, isWarning = false) {
    if (!elements.annotationNotice) return;
    elements.annotationNotice.textContent = message;
    elements.annotationNotice.style.color = isWarning ? "#a45b4f" : "";
  }

  function formatAnnotationCoordinate(annotation) {
    if (Number.isFinite(Number(annotation?.lat)) && Number.isFinite(Number(annotation?.lng))) {
      return `腾讯坐标 ${Number(annotation.lat).toFixed(6)}, ${Number(annotation.lng).toFixed(6)}`;
    }
    if (Number.isFinite(Number(annotation?.x)) && Number.isFinite(Number(annotation?.y))) {
      return `示意坐标 X ${Number(annotation.x).toFixed(2)}% · Y ${Number(annotation.y).toFixed(2)}%`;
    }
    return "坐标待补充";
  }

  function statusLabel(feature) {
    if (feature?.sharedDepartmentId) return "聚合部门";
    if (feature?.knowledgeOnly && feature?.officialKnowledge) return "官方资料";
    if (feature?.knowledgeOnly) return "指南内容";
    return "地图地点";
  }

  function publicLocation(feature) {
    let location = String(feature?.location || "")
      .replace(/^(?:腾讯地图)?人工标注坐标\s*·?\s*/, "")
      .replace(/，?具体(?:楼层|入口|位置)[^，。；]*待核验/g, "")
      .trim();
    if (!location || ["建筑/宿舍", "服务/办公室", "地图坐标"].includes(location)) {
      const area = String(feature?.name || "").split("·")[0].trim();
      if (feature?.category === "dorm" && area) return `${area}宿舍区`;
      if (feature?.category === "study" && String(feature?.name || "").includes("图书馆")) return "四牌楼校区图书馆";
      return "四牌楼校区";
    }
    return location;
  }

  function publicDescription(feature) {
    let description = String(feature?.description || "")
      .replace(/用户现场标注，?详情待补充。?/g, "")
      .replace(/精确点位需人工标注。?/g, "可根据地图定位前往。")
      .replace(/具体入口与时间待核验。?/g, "具体安排请以现场公告为准。")
      .replace(/待核验/g, "以现场公告为准")
      .trim();
    return description || `${feature?.name || "该地点"}的位置与服务信息。`;
  }

  function renderThemes() {
    elements.themeList.innerHTML = window.MAP_THEMES.map((theme) => `
      <button class="theme-button ${state.theme === theme.id ? "active" : ""}" data-theme="${theme.id}" style="--theme-color:${theme.color}">
        <span class="theme-icon">${theme.icon}</span>
        <span>${theme.label}</span>
      </button>
    `).join("");
  }

  function renderLayerBar() {
    const layers = window.MAP_THEMES.map((theme) => ({
      id: theme.id,
      label: theme.id === "all" ? "全部图层" : theme.label,
      color: theme.color,
    }));
    elements.layerBar.innerHTML = layers.map((layer) => `
      <button class="layer-button ${state.theme === layer.id ? "active" : ""}" data-theme="${layer.id}" style="--layer-color:${layer.color}"><span class="layer-swatch" aria-hidden="true"></span>${layer.label}</button>
    `).join("");
  }

  function renderAnnotationPanel() {
    if (!elements.annotationPanel) return;
    elements.annotationPanel.hidden = !state.annotationMode;
    elements.annotationButton.classList.toggle("active", state.annotationMode);
    elements.annotationButton.textContent = state.annotationMode ? "退出标注" : "标注地图";
    elements.annotationCount.textContent = `${state.annotations.length} 个`;
    elements.annotationList.innerHTML = state.annotations.length ? state.annotations.map((annotation) => `
      <article class="annotation-item" data-annotation-row="${escapeHtml(annotation.id)}">
        <div>
          <strong>${escapeHtml(annotation.name)}</strong>
          <small>${escapeHtml(formatAnnotationCoordinate(annotation))}</small>
        </div>
        <div class="annotation-item-actions">
          <button type="button" data-annotation-edit="${escapeHtml(annotation.id)}" aria-label="编辑 ${escapeHtml(annotation.name)}">✎</button>
          <button type="button" data-annotation-delete="${escapeHtml(annotation.id)}" aria-label="删除 ${escapeHtml(annotation.name)}">×</button>
        </div>
      </article>
    `).join("") : `<div class="annotation-empty">还没有标注。开启后点击腾讯底图上的任意位置，即可添加第一个点。</div>`;
  }

  function annotationCoordinate(annotation) {
    if (Number.isFinite(Number(annotation?.lat)) && Number.isFinite(Number(annotation?.lng))) {
      return { lat: Number(annotation.lat), lng: Number(annotation.lng), coordinateSystem: annotation.coordinateSystem || "GCJ-02" };
    }
    if (Number.isFinite(Number(annotation?.x)) && Number.isFinite(Number(annotation?.y))) {
      return { x: Number(annotation.x), y: Number(annotation.y), coordinateSystem: annotation.coordinateSystem || "fallback-percent" };
    }
    return null;
  }

  function annotationAsFeature(annotation) {
    const theme = themeById[annotation?.category] || themeById.all;
    return {
      id: annotation.id,
      name: annotation.name,
      category: theme.id,
      icon: theme.icon,
      lat: annotation.lat,
      lng: annotation.lng,
      coordinateSystem: annotation.coordinateSystem,
      location: "四牌楼校区",
      hours: "",
      status: "unknown",
      tags: [],
      description: annotation.description || `${annotation.name}已收录于四牌楼校园地图。`,
      knowledgeOnly: false,
      source: "user",
    };
  }

  function selectAnnotation(annotation) {
    if (!annotation) return;
    state.selectedAnnotationId = annotation.id;
    state.selectedId = null;
    renderMarkers();
    renderDetail(annotationAsFeature(annotation));
    focusAnnotation(annotation);
  }

  function openAnnotationEditor(coordinate, annotationId = null) {
    if (!state.annotationMode || !elements.annotationEditor) return;
    const existing = annotationId ? state.annotations.find((item) => item.id === annotationId) : null;
    state.editingAnnotationId = existing?.id || null;
    state.selectedAnnotationId = null;
    state.selectedId = null;
    elements.detailPanel?.classList.remove("open");
    state.pendingAnnotationCoordinate = coordinate || annotationCoordinate(existing);
    elements.annotationEditorTitle.textContent = existing ? "编辑地图点位" : "添加地图点位";
    elements.annotationName.value = existing?.name || "";
    elements.annotationCategory.value = existing?.category || "all";
    elements.annotationDescription.value = existing?.description || "";
    elements.annotationCoordinate.textContent = formatAnnotationCoordinate(state.pendingAnnotationCoordinate || {});
    elements.annotationEditor.hidden = false;
    renderMarkers();
    window.setTimeout(() => elements.annotationName.focus(), 0);
  }

  function closeAnnotationEditor() {
    state.editingAnnotationId = null;
    state.pendingAnnotationCoordinate = null;
    if (elements.annotationEditor) elements.annotationEditor.hidden = true;
    renderMarkers();
  }

  function formatFeatureCoordinate(feature) {
    if (!Number.isFinite(Number(feature?.lat)) || !Number.isFinite(Number(feature?.lng))) return "坐标待补充";
    const coordinateSystem = feature.coordinateSystem || "WGS84";
    return `${Number(feature.lat).toFixed(6)}, ${Number(feature.lng).toFixed(6)}（${coordinateSystem}）`;
  }

  function coordinateTarget(id) {
    const annotation = state.annotations.find((item) => item.id === id);
    if (annotation) return { kind: "annotation", value: annotation };
    const feature = featureById[id];
    return feature ? { kind: "feature", value: feature } : null;
  }

  function openCoordinateEditor(id) {
    const target = coordinateTarget(id);
    const feature = target?.value;
    if (!feature || !elements.coordinateEditor) return;
    if (!Number.isFinite(Number(feature.lat)) || !Number.isFinite(Number(feature.lng))) {
      setAnnotationNotice("这个点位还没有经纬度，暂时不能通过经纬度修正。", true);
      return;
    }
    state.editingCoordinateId = id;
    elements.coordinateEditorTitle.textContent = "修改点位坐标";
    elements.coordinateFeatureName.textContent = feature.name;
    elements.coordinateLatitude.value = Number(feature.lat).toFixed(8);
    elements.coordinateLongitude.value = Number(feature.lng).toFixed(8);
    elements.coordinateSystem.value = feature.coordinateSystem === "GCJ-02" ? "GCJ-02" : "WGS84";
    elements.coordinateEditor.hidden = false;
    elements.detailPanel?.classList.remove("open");
    window.setTimeout(() => elements.coordinateLatitude.focus(), 0);
  }

  function closeCoordinateEditor() {
    state.editingCoordinateId = null;
    if (elements.coordinateEditor) elements.coordinateEditor.hidden = true;
  }

  function saveCoordinate(event) {
    event.preventDefault();
    const target = coordinateTarget(state.editingCoordinateId);
    const latitude = Number(elements.coordinateLatitude.value);
    const longitude = Number(elements.coordinateLongitude.value);
    if (!target || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      elements.coordinateLatitude.reportValidity();
      return;
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      elements.coordinateLongitude.reportValidity();
      return;
    }
    const coordinateSystem = elements.coordinateSystem.value === "GCJ-02" ? "GCJ-02" : "WGS84";
    const fallback = fallbackPositionFromCoordinate(latitude, longitude, coordinateSystem);
    const coordinate = {
      lat: latitude,
      lng: longitude,
      coordinateSystem,
      x: fallback.x,
      y: fallback.y,
      updatedAt: new Date().toISOString(),
    };
    Object.assign(target.value, coordinate);
    closeCoordinateEditor();
    if (target.kind === "annotation") {
      state.selectedAnnotationId = target.value.id;
      persistAnnotations();
      renderAnnotationPanel();
      renderMarkers();
      renderDetail(annotationAsFeature(target.value));
      focusAnnotation(target.value);
    } else {
      state.selectedId = target.value.id;
      state.selectedAnnotationId = null;
      featureCoordinateOverrides[target.value.id] = { ...coordinate };
      persistFeatureCoordinateOverrides();
      renderMarkers();
      renderDetail(target.value);
      if (state.tmap) {
        const mapCoordinate = toTencentCoordinate(latitude, longitude, coordinateSystem);
        state.tmap.easeTo({ center: new TMap.LatLng(mapCoordinate.latitude, mapCoordinate.longitude), zoom: 18 });
      }
    }
    setAnnotationNotice("点位坐标已更新。", false);
  }

  function saveAnnotation(event) {
    event.preventDefault();
    if (!elements.annotationName.value.trim()) {
      elements.annotationName.reportValidity();
      return;
    }
    const existing = state.editingAnnotationId ? state.annotations.find((item) => item.id === state.editingAnnotationId) : null;
    const coordinate = state.pendingAnnotationCoordinate || {};
    const now = new Date().toISOString();
    const annotation = {
      ...(existing || {}),
      id: existing?.id || `annotation-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: elements.annotationName.value.trim(),
      category: elements.annotationCategory.value || "all",
      icon: (themeById[elements.annotationCategory.value] || themeById.all).icon,
      description: elements.annotationDescription.value.trim() || `${elements.annotationName.value.trim()}已收录于四牌楼校园地图。`,
      source: "user",
      updatedAt: now,
      createdAt: existing?.createdAt || now,
      ...(Number.isFinite(Number(coordinate.lat)) && Number.isFinite(Number(coordinate.lng)) ? {
        lat: Number(coordinate.lat),
        lng: Number(coordinate.lng),
        coordinateSystem: coordinate.coordinateSystem || "GCJ-02",
        x: undefined,
        y: undefined,
      } : {
        x: Number(coordinate.x),
        y: Number(coordinate.y),
        coordinateSystem: coordinate.coordinateSystem || "fallback-percent",
        lat: undefined,
        lng: undefined,
      }),
    };
    annotation.icon = (themeById[annotation.category] || themeById.all).icon;
    Object.keys(annotation).forEach((key) => annotation[key] === undefined && delete annotation[key]);
    state.annotations = existing
      ? state.annotations.map((item) => item.id === existing.id ? annotation : item)
      : [...state.annotations, annotation];
    persistAnnotations();
    closeAnnotationEditor();
    renderAnnotationPanel();
    renderMarkers();
    focusAnnotation(annotation);
    setAnnotationNotice(existing ? "点位已更新。" : "点位已保存，可继续点击地图添加。", false);
    updateAnnotationStatus();
  }

  function deleteAnnotation(id) {
    const annotation = state.annotations.find((item) => item.id === id);
    if (!annotation) return;
    state.annotations = state.annotations.filter((item) => item.id !== id);
    if (state.editingAnnotationId === id) closeAnnotationEditor();
    persistAnnotations();
    renderAnnotationPanel();
    renderMarkers();
    setAnnotationNotice(`已删除“${annotation.name}”。`);
    updateAnnotationStatus();
  }

  function annotationExportPayload() {
    return {
      schemaVersion: 1,
      campus: "东南大学四牌楼校区",
      mapProvider: state.mapMode === "tencent" ? "Tencent Maps GL JS" : "fallback schematic",
      coordinateSystem: state.mapMode === "tencent" ? "GCJ-02 (Tencent map click coordinates)" : "fallback-percent",
      exportedAt: new Date().toISOString(),
      existingMapFeatureCount: window.MAP_FEATURES.length,
      annotations: state.annotations.map((annotation) => ({ ...annotation })),
      coordinateOverrides: Object.entries(featureCoordinateOverrides).map(([featureId, coordinate]) => ({
        featureId,
        ...coordinate,
      })),
    };
  }

  function annotationJson() {
    return JSON.stringify(annotationExportPayload(), null, 2);
  }

  function downloadAnnotations() {
    const blob = new Blob([annotationJson()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    link.href = url;
    link.download = `sipailou-map-annotations-${stamp}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setAnnotationNotice(`已导出 ${state.annotations.length} 个标注，请把 JSON 文件发回给我。`);
  }

  async function copyAnnotations() {
    const json = annotationJson();
    try {
      await navigator.clipboard.writeText(json);
      setAnnotationNotice("JSON 已复制到剪贴板，可直接粘贴回对话。", false);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = json;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      setAnnotationNotice("JSON 已复制，可直接粘贴回对话。", false);
    }
  }

  function updateAnnotationStatus() {
    if (!state.annotationMode || !elements.dataStatus) return;
    elements.dataStatus.textContent = `标注模式 · ${state.annotations.length} 个待回传`;
    elements.dataStatus.classList.remove("success");
    elements.dataStatus.classList.add("warning");
  }

  function restoreDataStatus() {
    elements.dataStatus.textContent = state.userLocation
      ? "已定位 · 2025.08指南"
      : state.mapMode === "tencent"
        ? "腾讯底图 · 2025.08指南"
        : "指南版本 · 2025.08";
    elements.dataStatus.classList.add("success");
    elements.dataStatus.classList.remove("warning");
  }

  function toggleAnnotationMode() {
    state.annotationMode = !state.annotationMode;
    if (!state.annotationMode) closeAnnotationEditor();
    renderAnnotationPanel();
    renderMarkers();
    if (state.annotationMode) {
      updateAnnotationStatus();
      setAnnotationNotice("点击地图添加点位；点击列表中的 ✎ 可编辑。", false);
    } else {
      restoreDataStatus();
    }
  }

  function guideTimeSummary(values = {}) {
    const timeFields = Object.entries(values)
      .filter(([key, value]) => value !== null && value !== "" && value !== "-" && /(时间|时段|开放|营业|门禁|热水|首班|末班)/.test(key))
      .map(([key, value]) => `${key}：${value}`);
    return timeFields.length ? timeFields.join("；") : "见指南详情";
  }

  function recordAsKnowledge(record) {
    const raw = Object.entries(record.values || {})
      .filter(([, value]) => value !== null && value !== "" && value !== "-")
      .map(([key, value]) => `${key}：${value}`);
    return {
      id: record.id,
      name: record.title || record.sheet,
      category: sheetCategory[record.sheet] || "all",
      icon: "文",
      location: `指南数据 · ${record.sheet}`,
      hours: guideTimeSummary(record.values),
      status: "unknown",
      verified: false,
      tags: [record.sheet, "知识记录"],
      description: raw.join("；"),
      knowledgeOnly: true,
      record,
      sourcePage: record.sourcePage,
      sourceVersion: window.GUIDE_DATA?.meta?.version || "2025.08",
    };
  }

  function searchKnowledge() {
    if (!window.GUIDE_DATA?.records?.length) return [];
    const query = normalize(state.query);
    return window.GUIDE_DATA.records
      .filter((record) => !query || normalize(JSON.stringify(record)).includes(query))
      .slice(0, state.filter === "guide" ? 200 : 20)
      .map(recordAsKnowledge);
  }

  function filteredFeatures() {
    const query = normalize(state.query);
    const matchedDepartments = departmentsMatchingQuery(query);
    const spatial = window.MAP_FEATURES.filter((feature) => {
      const matchesTheme = state.theme === "all" || feature.category === state.theme;
      const matchesQuery = !query || normalize([feature.name, feature.location, feature.description, ...(feature.tags || [])].join(" ")).includes(query);
      const matchesFilter = state.filter === "guide"
        ? feature.knowledgeOnly
        : state.filter === "mapped"
          ? !feature.knowledgeOnly || (feature.sharedDepartmentId && matchedDepartments.some((department) => department.id === feature.sharedDepartmentId))
          : true;
      const departmentIsDiscoverable = !feature.sharedDepartmentId || Boolean(query) || state.filter === "guide" || state.theme === "office";
      return matchesFilter && matchesTheme && matchesQuery && departmentIsDiscoverable;
    });
    const knowledge = (state.filter !== "mapped" && (query || state.filter === "guide"))
      ? searchKnowledge().filter((feature) => state.theme === "all" || feature.category === state.theme)
      : [];
    const results = [...spatial, ...knowledge].filter((feature) => (
      !matchedDepartments.some((department) => featureBelongsToDepartment(feature, department, query))
    ));
    if (!state.userLocation) return results;
    return results.sort((left, right) => {
      const leftDistance = featureDistance(left);
      const rightDistance = featureDistance(right);
      if (leftDistance === null && rightDistance === null) return 0;
      if (leftDistance === null) return 1;
      if (rightDistance === null) return -1;
      return leftDistance - rightDistance;
    });
  }

  function renderResults() {
    const results = filteredFeatures();
    const activeTheme = themeById[state.theme] || themeById.all;
    elements.resultTitle.textContent = state.query
      ? `“${state.query}”的结果`
      : state.filter === "guide" ? "指南内容" : state.filter === "mapped" ? "地图地点" : activeTheme.label;
    elements.resultCount.textContent = results.length === 1 && results[0].sharedDepartmentId
      ? "1 个聚合结果"
      : `${results.length} 项`;
    elements.resultList.innerHTML = results.length ? results.map((feature) => `
      <button class="result-card ${state.selectedId === feature.id ? "active" : ""}" data-feature-id="${feature.id}" data-knowledge="${feature.knowledgeOnly ? "true" : "false"}">
        <span class="result-icon" style="--category-color:${categoryColor(feature.category)}">${escapeHtml(feature.icon)}</span>
        <span>
          <strong>${escapeHtml(feature.name)}</strong>
          <p>${featureDistance(feature) !== null ? `<b class="result-distance">${formatDistance(featureDistance(feature))}</b>` : ""}${escapeHtml(publicLocation(feature))}</p>
        </span>
        <span class="result-status ${feature.knowledgeOnly ? "guide" : "mapped"}">${statusLabel(feature)}</span>
      </button>
    `).join("") : `<div class="detail-description">没有找到匹配内容。可以换一个关键词，或让校园 Agent 帮你拆解需求。</div>`;
    renderMarkers();
  }

  function renderMarkers() {
    const visibleIds = new Set(filteredFeatures().filter((item) => !item.knowledgeOnly).map((item) => item.id));
    const featureMarkers = window.MAP_FEATURES.filter((feature) => visibleIds.has(feature.id)).map((feature) => `
      <button class="map-marker ${state.selectedId === feature.id ? "active" : ""}" data-feature-id="${feature.id}" aria-label="${escapeHtml(feature.name)}" style="left:${feature.x}%;top:${feature.y}%;--category-color:${categoryColor(feature.category)}">
        <span>${escapeHtml(feature.icon)}</span>
      </button>
    `).join("");
    const annotationMarkers = state.annotations.filter((annotation) => Number.isFinite(Number(annotation.x)) && Number.isFinite(Number(annotation.y))).map((annotation) => `
      <button class="map-marker annotation-marker ${state.editingAnnotationId === annotation.id ? "active" : ""}" data-annotation-id="${escapeHtml(annotation.id)}" aria-label="编辑标注 ${escapeHtml(annotation.name)}" style="left:${Number(annotation.x)}%;top:${Number(annotation.y)}%">
        <span>标</span>
      </button>
    `).join("");
    const userPosition = state.userLocation
      ? fallbackPositionFromCoordinate(state.userLocation.latitude, state.userLocation.longitude, "GCJ-02")
      : null;
    const userMarker = userPosition ? `<div class="user-location-marker" aria-label="我的位置" style="left:${userPosition.x}%;top:${userPosition.y}%"><span></span></div>` : "";
    elements.markers.innerHTML = featureMarkers + annotationMarkers + userMarker;
    state.annotations.forEach((annotation) => {
      const marker = elements.markers.querySelector(`[data-annotation-id="${CSS.escape(String(annotation.id))}"]`);
      marker?.style.setProperty("--category-color", categoryColor(annotation.category));
      marker?.classList.toggle("active", state.editingAnnotationId === annotation.id || state.selectedAnnotationId === annotation.id);
      const theme = themeById[annotation.category] || themeById.all;
      if (marker?.querySelector("span")) marker.querySelector("span").textContent = theme.icon;
    });
    updateTencentMarkers(visibleIds);
  }

  function resolveFeature(id, isKnowledge) {
    if (!isKnowledge && featureById[id]) return featureById[id];
    const record = window.GUIDE_DATA?.records?.find((item) => item.id === id);
    return record ? recordAsKnowledge(record) : featureById[id];
  }

  function selectFeature(id, isKnowledge = false) {
    const feature = resolveFeature(id, isKnowledge);
    if (!feature) return;
    if (state.routeFeatureId && state.routeFeatureId !== id) clearRoute();
    state.selectedAnnotationId = null;
    state.selectedId = id;
    renderResults();
    renderDetail(feature);
    if (state.tmap && !feature.knowledgeOnly) {
      const coordinate = toTencentCoordinate(feature.lat, feature.lng, feature.coordinateSystem);
      state.tmap.easeTo({ center: new TMap.LatLng(coordinate.latitude, coordinate.longitude), zoom: 18 });
    }
  }

  const featureGuideTerms = {
    library: ["图书馆"],
    stadium: ["田径场", "篮球场", "排球场"],
    gym: ["羽毛球", "乒乓球", "健身房", "网球"],
    "shatang-dorm": ["沙塘园"],
    "chengyuan-dorm": ["成园"],
    "west-dorm": ["校西"],
    "wenchang-dorm": ["文昌桥"],
    "campus-hospital": ["校医院"],
    "fuzimiao-metro": ["浮桥站"],
    "jimingsi-metro": ["鸡鸣寺站"],
    zhenxiang: ["蓁巷"],
    weixiang: ["卫巷", "新安里"],
    "wenchang-food": ["文昌过街天桥"],
    "library-print": ["打印"],
    "shatang-express": ["近邻宝"],
    "aed-library": ["AED"],
  };

  function canonicalGuideName(value) {
    return normalize(value)
      .replace(/[·—–\-（）()\/\\]/g, "")
      .replace(/东南大学|四牌楼校区|校园|宿舍区|餐饮街区|餐饮区|人工标注坐标|腾讯地图/g, "");
  }

  function linkedGuideRecords(feature) {
    if (!feature || !window.GUIDE_DATA?.records?.length) return [];
    const department = feature.sharedDepartmentId ? sharedDepartmentById[feature.sharedDepartmentId] : null;
    const terms = (department
      ? departmentSearchTerms(department)
      : [feature.name, ...(featureGuideTerms[feature.id] || [])].map(canonicalGuideName).filter((term) => term.length >= 2));
    return window.GUIDE_DATA.records.filter((record) => {
      const recordText = department ? normalize(JSON.stringify(record)) : canonicalGuideName(record.title);
      return terms.some((term) => recordText.includes(term) || (!department && term.includes(recordText)));
    });
  }

  function mapFeatureForRecord(record) {
    if (!record) return null;
    return window.MAP_FEATURES.find((feature) => linkedGuideRecords(feature).some((item) => item.id === record.id)) || null;
  }

  function renderGuideValue(value) {
    const text = String(value ?? "");
    const escaped = escapeHtml(text);
    if (/^https?:\/\/[^\s]+$/i.test(text)) {
      return `<a href="${escaped}" target="_blank" rel="noreferrer">${escaped}</a>`;
    }
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(text)) {
      return `<a href="https://${escaped}" target="_blank" rel="noreferrer">${escaped}</a>`;
    }
    if (/^(?:\+?86[- ]?)?0\d{2,3}[- ]?\d{7,8}$/.test(text)) {
      return `<a href="tel:${escaped.replace(/[- ]/g, "")}">${escaped}</a>`;
    }
    return escaped;
  }

  function renderRecordFields(record, limit = Infinity) {
    const entries = Object.entries(record?.values || {})
      .filter(([, value]) => value !== null && value !== "" && value !== "-")
      .slice(0, limit);
    return `<dl class="guide-field-list">${entries.map(([key, value]) => `
      <div><dt>${escapeHtml(key)}</dt><dd>${renderGuideValue(value)}</dd></div>
    `).join("")}</dl>`;
  }

  function renderRecordPreview(record) {
    const entries = Object.entries(record?.values || {})
      .filter(([, value]) => value !== null && value !== "" && value !== "-")
      .slice(0, 3);
    return `<span class="guide-record-preview">${entries.map(([key, value]) => `
      <span><b>${escapeHtml(key)}</b><i>${escapeHtml(value)}</i></span>
    `).join("")}</span>`;
  }

  function renderRelatedGuide(feature) {
    if (feature.record) {
      return `<section class="detail-guide-section">
        <div class="detail-section-heading"><span>详细信息</span><small>${escapeHtml(feature.record.sheet)}</small></div>
        ${renderRecordFields(feature.record)}
      </section>`;
    }
    const records = linkedGuideRecords(feature);
    if (!records.length) return "";
    if (feature.sharedDepartmentId) {
      return `<section class="detail-guide-section department-guide-section">
        <div class="detail-section-heading"><span>旧版指南补充</span><small>${records.length} 项已并入本页</small></div>
        <div class="department-guide-records">${records.map((record) => `
          <article class="department-guide-record"><h4>${escapeHtml(record.title)}</h4>${renderRecordFields(record)}</article>
        `).join("")}</div>
      </section>`;
    }
    return `<section class="detail-guide-section">
      <div class="detail-section-heading"><span>相关信息</span><small>${records.length} 项</small></div>
      <div class="detail-guide-records">${records.map((record, index) => `
        <details class="detail-guide-record" ${index === 0 ? "open" : ""}>
          <summary><span>${escapeHtml(record.title)}</span><span class="detail-guide-chevron" aria-hidden="true">⌄</span></summary>
          ${renderRecordFields(record)}
        </details>
      `).join("")}</div>
    </section>`;
  }

  function renderSharedSource(sourceId) {
    const source = sharedSourceById[sourceId];
    if (!source) return "";
    return `<a class="official-source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
      <span>${escapeHtml(source.publisher)}</span>
      <strong>${escapeHtml(source.title)}</strong>
      <small>${source.volatile ? "易变信息 · " : ""}核验 ${escapeHtml(source.verifiedAt)}</small>
    </a>`;
  }

  function renderSharedService(service) {
    const contact = (service.phones || []).map((phone) => `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a>`).join("　");
    return `<details class="official-service-card">
      <summary>
        <span><b>办</b><strong>${escapeHtml(service.title)}</strong></span>
        <span class="detail-guide-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="official-service-content">
        <p>${escapeHtml(service.summary)}</p>
        <dl>
          <div><dt>地点</dt><dd>${escapeHtml(service.location)}${service.room ? ` · ${escapeHtml(service.room)}` : ""}</dd></div>
          <div><dt>时间</dt><dd>${escapeHtml(service.hours)}</dd></div>
          ${contact ? `<div><dt>电话</dt><dd>${contact}</dd></div>` : ""}
        </dl>
        ${(service.steps || []).length ? `<ol>${service.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>` : ""}
        <p class="official-service-notice">${escapeHtml(service.notice)}</p>
        ${service.onlineUrl ? `<a class="official-online-link" href="${escapeHtml(service.onlineUrl)}" target="_blank" rel="noreferrer">打开线上入口 ↗</a>` : ""}
      </div>
    </details>`;
  }

  function renderSharedKnowledge(feature) {
    const place = sharedPlaceById[feature.sharedPlaceId || feature.id];
    if (!place) return "";
    const services = (place.serviceIds || []).map((id) => sharedServiceById[id]).filter(Boolean);
    const primarySource = sharedSourceById[place.primarySourceId];
    const timeline = (place.history || []).length ? `<div class="official-timeline">
      ${place.history.map((item) => `<div><time>${escapeHtml(item.year)}</time><p>${escapeHtml(item.text)}</p></div>`).join("")}
    </div>` : "";
    const coordinateNote = place.coordinate && !place.coordinate.verified
      ? `<p class="official-coordinate-note">地图点位采用 OpenStreetMap 参考坐标，尚非校方权威测绘坐标。<a href="${escapeHtml(place.coordinate.sourceUrl)}" target="_blank" rel="noreferrer">查看点位 ↗</a></p>`
      : "";
    return `<section class="official-knowledge-section">
      <div class="official-knowledge-heading">
        <div><span>统一知识库</span><strong>${escapeHtml(place.kind)}</strong></div>
        <small>官方资料核验 ${escapeHtml(primarySource?.verifiedAt || sharedKnowledge.meta?.verifiedAt || "")}</small>
      </div>
      <p class="official-long-description">${escapeHtml(place.description)}</p>
      ${timeline}
      <div class="official-current-use"><span>现在这里</span><p>${escapeHtml(place.currentUse)}</p></div>
      ${place.heritage ? `<div class="official-current-use"><span>保护与价值</span><p>${escapeHtml(place.heritage)}</p></div>` : ""}
      ${services.length ? `<div class="official-services"><h3>这里能办什么</h3>${services.map(renderSharedService).join("")}</div>` : ""}
      <div class="official-sources"><h3>资料来源</h3>${(place.sourceIds || []).map(renderSharedSource).join("")}</div>
      ${coordinateNote}
    </section>`;
  }

  function renderDepartmentPhoneLinks(phones = []) {
    return phones.map((phone) => `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a>`).join("<span aria-hidden=\"true\">·</span>");
  }

  function renderDepartmentOfficeCard(office, className = "department-office-card") {
    const campus = (sharedKnowledge.campuses || []).find((item) => item.id === office.campusId);
    const phones = renderDepartmentPhoneLinks(office.phones || []);
    const linkedPlace = office.placeId ? featureById[office.placeId] : null;
    return `<article class="${className}">
      <div class="department-office-heading"><span>${escapeHtml(campus?.name || office.campusId)}</span><strong>${escapeHtml(office.location)}</strong></div>
      <p class="department-office-room">${escapeHtml(office.room || "具体房间以官网为准")}</p>
      ${phones ? `<p class="department-contact">${phones}</p>` : ""}
      ${office.email ? `<a class="department-email" href="mailto:${escapeHtml(office.email)}">${escapeHtml(office.email)}</a>` : ""}
      ${office.serviceNote ? `<small>${escapeHtml(office.serviceNote)}</small>` : ""}
      ${linkedPlace ? `<button type="button" data-workflow-place="${escapeHtml(linkedPlace.id)}">地图查看 · ${escapeHtml(linkedPlace.name)}</button>` : ""}
    </article>`;
  }

  function renderDepartmentUnitCard(unit, index) {
    const offices = (unit.offices || []).map((office) => renderDepartmentOfficeCard(office, "department-unit-office")).join("");
    return `<article class="department-unit-card" data-department-unit="${escapeHtml(unit.id)}">
      <header>
        <div><span>科室 ${String(index + 1).padStart(2, "0")}</span><h4>${escapeHtml(unit.name)}</h4></div>
        <small>${unit.offices?.length ? `${unit.offices.length} 处办公点` : "线上或电话分流"}</small>
      </header>
      ${(unit.aliases || []).length ? `<p class="department-unit-aliases">常见称呼：${escapeHtml(unit.aliases.join("、"))}</p>` : ""}
      <ul class="department-unit-responsibilities">${(unit.responsibilities || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      ${offices ? `<div class="department-unit-office-list">${offices}</div>` : ""}
      ${unit.serviceNote ? `<p class="department-unit-note">${escapeHtml(unit.serviceNote)}</p>` : ""}
      ${(unit.links || []).length ? `<div class="department-unit-links">${unit.links.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join("")}</div>` : ""}
    </article>`;
  }

  function renderDepartmentUnits(department) {
    return `<div class="department-unit-grid">${(department.units || []).map(renderDepartmentUnitCard).join("")}</div>`;
  }

  function renderSharedDepartment(feature) {
    const department = sharedDepartmentById[feature.sharedDepartmentId];
    if (!department) return "";
    const offices = uniqueDepartmentOffices(department);
    const campuses = new Set(offices.map((office) => office.campusId));
    const officeCards = (department.offices || []).map((office) => renderDepartmentOfficeCard(office)).join("");
    return `<section class="official-knowledge-section department-knowledge-section">
      <div class="official-knowledge-heading">
        <div><span>统一知识库 · 聚合部门</span><strong>${escapeHtml(departmentCategoryLabels[department.category] || "校级部门")}</strong></div>
        <small>官方资料核验 ${escapeHtml(department.verifiedAt)}</small>
      </div>
      <div class="department-scope-stats" role="group" aria-label="部门信息覆盖范围">
        <div><strong>${department.units.length}</strong><span>下设科室</span></div>
        <div><strong>${offices.length}</strong><span>办公点</span></div>
        <div><strong>${campuses.size}</strong><span>覆盖校区</span></div>
      </div>
      <p class="official-long-description">${escapeHtml(department.summary)}</p>
      <div class="department-responsibilities">
        <h3>部门职责总览</h3>
        <ul>${(department.responsibilities || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      ${officeCards ? `<div class="department-offices"><h3>部门综合联系方式</h3>${officeCards}</div>` : ""}
      <section class="department-units">
        <div class="detail-section-heading"><span>下设科室与办公地点</span><small>${department.units.length} 个科室 · 全部展开</small></div>
        ${renderDepartmentUnits(department)}
      </section>
      <div class="department-links">
        <a href="${escapeHtml(department.website)}" target="_blank" rel="noreferrer">打开部门官网 ↗</a>
        ${(department.links || []).map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join("")}
      </div>
      <details class="department-source-details">
        <summary>官方资料来源 <span>${department.sourceIds.length} 项</span></summary>
        <div class="official-sources">${(department.sourceIds || []).map(renderSharedSource).join("")}</div>
      </details>
      <p class="official-coordinate-note">电话、房间和坐班日期属于易变信息，出发前请通过部门官网再次确认。</p>
    </section>`;
  }

  function showToast(message, tone = "info") {
    let toast = document.querySelector("#appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.className = "app-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.dataset.tone = tone;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function routeUriForFeature(feature) {
    if (!feature || !Number.isFinite(Number(feature.lat)) || !Number.isFinite(Number(feature.lng))) return "";
    const key = window.APP_CONFIG.tencentMapKey;
    if (!key) return "";
    const target = toTencentCoordinate(Number(feature.lat), Number(feature.lng), feature.coordinateSystem);
    const params = new URLSearchParams({
      type: "walk",
      from: "我的位置",
      fromcoord: state.userLocation ? `${state.userLocation.latitude},${state.userLocation.longitude}` : "CurrentLocation",
      to: feature.name,
      tocoord: `${target.latitude},${target.longitude}`,
      referer: key,
    });
    return `https://apis.map.qq.com/uri/v1/routeplan?${params.toString()}`;
  }

  function clearRoute() {
    state.routeData = null;
    state.routeError = "";
    state.routeFeatureId = null;
    state.routeRequestId = null;
    state.routeLoading = false;
    state.routePolyline?.setGeometries([]);
  }

  function drawRoute(route) {
    if (!state.tmap || !state.routePolyline || !Array.isArray(route?.polyline) || route.polyline.length < 2) return;
    const paths = route.polyline.map((point) => new TMap.LatLng(point.latitude, point.longitude));
    state.routePolyline.setGeometries([{ id: "active-walking-route", styleId: "walking-route", paths }]);
    const centerIndex = Math.floor(paths.length / 2);
    state.tmap.easeTo({
      center: paths[centerIndex],
      zoom: route.distance < 450 ? 19 : route.distance < 1200 ? 18 : 17,
    });
  }

  function renderRouteSummary(feature) {
    if (state.routeFeatureId !== feature?.id) return "";
    if (state.routeLoading) {
      return `<section class="route-summary route-loading" aria-live="polite"><span class="route-loader" aria-hidden="true"></span><div><strong>正在规划步行路线</strong><small>正在根据你的位置计算校园道路</small></div></section>`;
    }
    const route = state.routeData;
    const externalUri = routeUriForFeature(feature);
    if (!route && state.routeError) {
      return `<section class="route-summary route-error" role="status">
        <strong>站内路线暂时未生成</strong>
        <p>${escapeHtml(state.routeError)}</p>
        ${externalUri ? `<a class="route-external" href="${escapeHtml(externalUri)}" target="_blank" rel="noreferrer">改用腾讯地图导航 →</a>` : ""}
      </section>`;
    }
    if (!route) return "";
    return `<section class="route-summary">
      <div class="route-overview">
        <span><strong>${formatDistance(route.distance)}</strong><small>步行距离</small></span>
        <span><strong>${Math.max(1, Math.round(route.duration))} 分钟</strong><small>预计用时</small></span>
        <span><strong>${escapeHtml(route.direction || "校内")}</strong><small>整体方向</small></span>
      </div>
      <div class="detail-section-heading"><span>路线步骤</span><small>${route.steps.length} 步</small></div>
      <ol class="route-steps">${route.steps.map((step) => `
        <li><span class="route-step-dot" aria-hidden="true"></span><div><strong>${escapeHtml(step.instruction)}</strong><small>${formatDistance(step.distance)}</small></div></li>
      `).join("")}</ol>
      ${externalUri ? `<a class="route-external" href="${escapeHtml(externalUri)}" target="_blank" rel="noreferrer">在腾讯地图中继续导航 →</a>` : ""}
    </section>`;
  }

  async function openRouteForFeature(feature) {
    if (!feature || !Number.isFinite(Number(feature.lat)) || !Number.isFinite(Number(feature.lng))) {
      showToast("这个地点还没有可用于路线规划的坐标。", "warning");
      return;
    }
    const key = window.APP_CONFIG.tencentMapKey;
    if (!key) {
      showToast("配置腾讯地图 Key 后即可打开步行路线。", "warning");
      return;
    }
    state.routeFeatureId = feature.id;
    state.routeData = null;
    state.routeError = "";
    state.routeLoading = true;
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    state.routeRequestId = requestId;
    renderDetail(feature);
    try {
      const from = await requestUserLocation({ centerMap: false });
      if (state.routeRequestId !== requestId) return;
      const to = toTencentCoordinate(Number(feature.lat), Number(feature.lng), feature.coordinateSystem);
      const response = await fetch("/api/map/walking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.route) throw new Error(payload.error || "暂时无法规划步行路线。");
      if (state.routeRequestId !== requestId) return;
      state.routeData = payload.route;
      drawRoute(payload.route);
      showToast(`路线已生成：步行约 ${formatDistance(payload.route.distance)}。`, "success");
    } catch (error) {
      if (state.routeRequestId !== requestId) return;
      state.routeData = null;
      state.routeError = error.message || "暂时无法规划步行路线。";
      state.routePolyline?.setGeometries([]);
      showToast(error.message || "暂时无法规划步行路线。", "warning");
    } finally {
      if (state.routeRequestId === requestId) {
        state.routeLoading = false;
        if (state.selectedId === feature.id || state.selectedAnnotationId === feature.id) renderDetail(feature);
      }
    }
  }

  function focusAnnotation(annotation) {
    if (!state.tmap || !annotation) return;
    if (!Number.isFinite(Number(annotation.lat)) || !Number.isFinite(Number(annotation.lng))) return;
    const currentZoom = typeof state.tmap.getZoom === "function" ? Number(state.tmap.getZoom()) : 17;
    state.tmap.easeTo({
      center: new TMap.LatLng(Number(annotation.lat), Number(annotation.lng)),
      zoom: Math.max(18, Number.isFinite(currentZoom) ? currentZoom : 17),
    });
  }

  function renderDetail(feature) {
    const isDepartment = Boolean(feature.sharedDepartmentId);
    elements.detailContent.classList.toggle("department-detail", isDepartment);
    const tags = (isDepartment ? [] : (feature.tags || []))
      .filter((tag) => !["人工标注", "知识记录"].includes(tag))
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("");
    const hasEditableCoordinate = !feature.knowledgeOnly
      && Number.isFinite(Number(feature.lat))
      && Number.isFinite(Number(feature.lng));
    const linkedPlace = feature.knowledgeOnly ? mapFeatureForRecord(feature.record) : null;
    const hasGuideTime = !feature.record && feature.hours && !["待核验", "用户标注", "见指南详情"].includes(feature.hours);
    const displayLocation = publicLocation(feature);
    const displayDescription = publicDescription(feature);
    elements.detailContent.innerHTML = `
      <div class="detail-header">
      <span class="detail-category" style="--category-color:${categoryColor(feature.category)}">${escapeHtml((themeById[feature.category] || themeById.all).label)}</span>
      <h2>${escapeHtml(feature.name)}</h2>
      <div class="detail-location">⌖ ${escapeHtml(displayLocation || "四牌楼校区")}</div>
      </div>
      <div class="detail-body">
      ${feature.record || isDepartment ? "" : `<p class="detail-description">${escapeHtml(displayDescription)}</p>`}
      ${hasGuideTime ? `<div class="detail-grid"><span>开放时间</span><strong>${escapeHtml(feature.hours)}</strong></div>` : ""}
      ${featureDistance(feature) !== null ? `<div class="detail-grid"><span>距你</span><strong>${formatDistance(featureDistance(feature))} · 直线距离</strong></div>` : ""}
      ${tags ? `<div class="detail-grid"><span>设施与服务</span><div class="tag-list">${tags}</div></div>` : ""}
      ${renderSharedKnowledge(feature)}
      ${renderSharedDepartment(feature)}
      ${renderRelatedGuide(feature)}
      ${renderRouteSummary(feature)}
      <div class="detail-actions">
        ${linkedPlace ? `<button class="route-button" data-detail-action="show-map" data-place-id="${escapeHtml(linkedPlace.id)}">地图上查看</button>` : `<button class="route-button" data-detail-action="route" ${feature.knowledgeOnly || state.routeLoading ? "disabled" : ""}>${state.routeFeatureId === feature.id && state.routeData ? "重新规划" : state.routeLoading ? "规划中…" : "步行路线"}</button>`}
        <button class="ask-button" data-detail-action="ask">继续问 Agent</button>
        ${hasEditableCoordinate && state.annotationMode ? `<button class="coordinate-button" data-detail-action="edit-coordinate">校正地图位置</button>` : ""}
      </div>
      </div>
    `;
    elements.detailPanel.classList.add("open");
  }

  function closeDetail() {
    clearRoute();
    state.selectedId = null;
    state.selectedAnnotationId = null;
    elements.detailPanel.classList.remove("open");
    renderResults();
  }

  function renderGuideGallery() {
    elements.guideGallery.innerHTML = window.GUIDE_PAGES.map((page) => `
      <article class="guide-card">
        <img src="./原校区指南/${encodeURIComponent(page.image)}" alt="${escapeHtml(page.title)}" loading="lazy" />
        <div>
          <span class="eyebrow">PAGE ${escapeHtml(page.page)}</span>
          <h3>${escapeHtml(page.title)}</h3>
          <p>${escapeHtml(page.summary)}</p>
          <span class="guide-component">网页形式：${escapeHtml(page.component)}</span>
        </div>
      </article>
    `).join("");
  }

  function openGuide() {
    renderGuideBrowser();
    elements.guideModal.removeAttribute("inert");
    elements.guideModal.setAttribute("aria-hidden", "false");
    elements.guideModal.classList.add("open");
    window.setTimeout(() => document.querySelector("[data-guide-view].active")?.focus(), 0);
  }

  function closeGuide() {
    if (!elements.guideModal.classList.contains("open")) return;
    elements.guideModal.classList.remove("open");
    elements.guideModal.setAttribute("aria-hidden", "true");
    elements.guideModal.setAttribute("inert", "");
    document.querySelector("#guideButton")?.focus();
  }

  function renderGuideView() {
    const structured = state.guideView === "structured";
    elements.guideStructured.hidden = !structured;
    elements.guideGallery.hidden = structured;
    document.querySelectorAll("[data-guide-view]").forEach((button) => {
      const active = button.dataset.guideView === state.guideView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function renderGuideBrowser() {
    const sheets = window.GUIDE_DATA?.sheets || [];
    if (!state.guideSheet || !sheets.includes(state.guideSheet)) state.guideSheet = sheets[0] || null;
    elements.guideTopicList.innerHTML = sheets.map((sheet) => {
      const meta = guideSheetMeta[sheet] || { icon: "文", summary: "校园指南内容" };
      const count = window.GUIDE_DATA.records.filter((record) => record.sheet === sheet).length;
      return `<button class="guide-topic-button ${state.guideSheet === sheet ? "active" : ""}" type="button" data-guide-sheet="${escapeHtml(sheet)}">
        <span class="guide-topic-icon">${escapeHtml(meta.icon)}</span>
        <span><strong>${escapeHtml(sheet)}</strong><small>${escapeHtml(meta.summary)}</small></span>
        <em>${count}</em>
      </button>`;
    }).join("");
    const records = window.GUIDE_DATA.records.filter((record) => record.sheet === state.guideSheet);
    const meta = guideSheetMeta[state.guideSheet] || { summary: "GUIDE TOPIC" };
    elements.guideRecordEyebrow.textContent = meta.summary;
    elements.guideRecordTitle.textContent = state.guideSheet || "指南内容";
    elements.guideRecordCount.textContent = `${records.length} 条`;
    elements.guideRecordList.innerHTML = records.map((record) => {
      const place = mapFeatureForRecord(record);
      return `<button class="guide-record-card" type="button" data-guide-record-id="${escapeHtml(record.id)}">
        <span class="guide-record-topline"><strong>${escapeHtml(record.title)}</strong><em>${place ? "地图可查看" : "指南内容"}</em></span>
        ${renderRecordPreview(record)}
        <span class="guide-record-more">查看完整信息 →</span>
      </button>`;
    }).join("");
    renderGuideView();
  }

  function renderServiceWorkflows() {
    if (!elements.workflowList || !elements.workflowDetail || !serviceWorkflows.length) return;
    if (!state.serviceWorkflowId || !workflowById[state.serviceWorkflowId]) state.serviceWorkflowId = serviceWorkflows[0].id;
    elements.workflowList.innerHTML = serviceWorkflows.map((workflow) => `
      <button class="workflow-card ${state.serviceWorkflowId === workflow.id ? "active" : ""}" type="button" data-workflow-id="${escapeHtml(workflow.id)}">
        <span class="workflow-icon">${escapeHtml(workflow.icon)}</span>
        <span><small>${escapeHtml(workflow.category)}</small><strong>${escapeHtml(workflow.title)}</strong><em>${escapeHtml(workflow.summary)}</em></span>
        <b aria-hidden="true">→</b>
      </button>
    `).join("");
    const workflow = workflowById[state.serviceWorkflowId];
    const places = (workflow.mapFeatureIds || []).map((id) => featureById[id]).filter(Boolean);
    const department = workflow.entityType === "department" ? sharedDepartmentById[workflow.sharedDepartmentId] : null;
    elements.workflowDetail.classList.toggle("department-view", Boolean(department));
    if (department) {
      const offices = (department.offices || []).map((office) => renderDepartmentOfficeCard(office)).join("");
      const uniqueOffices = uniqueDepartmentOffices(department);
      elements.workflowDetail.innerHTML = `
        <span class="workflow-category">${escapeHtml(workflow.category)}</span>
        <h3>${escapeHtml(department.name)}</h3>
        <p class="workflow-summary">${escapeHtml(department.summary)}</p>
        <div class="department-scope-stats" aria-label="部门信息覆盖范围">
          <div><strong>${department.units.length}</strong><span>下设科室</span></div>
          <div><strong>${uniqueOffices.length}</strong><span>办公点</span></div>
          <div><strong>${new Set(uniqueOffices.map((office) => office.campusId)).size}</strong><span>覆盖校区</span></div>
        </div>
        <section class="workflow-preparation">
          <div class="detail-section-heading"><span>主要职责</span><small>${department.responsibilities.length} 项</small></div>
          <ul>${department.responsibilities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        ${offices ? `<section class="workflow-offices"><div class="detail-section-heading"><span>部门综合联系方式</span><small>${department.offices.length} 处</small></div><div class="workflow-office-grid">${offices}</div></section>` : ""}
        <section class="department-units workflow-department-units">
          <div class="detail-section-heading"><span>下设科室与办公地点</span><small>${department.units.length} 个科室 · 全部展开</small></div>
          ${renderDepartmentUnits(department)}
        </section>
        <section class="workflow-links">
          <div class="detail-section-heading"><span>官方入口</span><small>核验 ${escapeHtml(department.verifiedAt)}</small></div>
          <div><a href="${escapeHtml(department.website)}" target="_blank" rel="noreferrer">部门官网 ↗</a>${(department.links || []).map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join("")}</div>
        </section>
        <aside class="workflow-notice"><strong>信息提醒</strong><p>${escapeHtml(workflow.notice)}</p></aside>
        <div class="workflow-actions"><button class="primary-action" type="button" data-workflow-ask="${escapeHtml(workflow.id)}">继续问校园 Agent</button></div>
      `;
      return;
    }
    elements.workflowDetail.innerHTML = `
      <span class="workflow-category">${escapeHtml(workflow.category)}</span>
      <h3>${escapeHtml(workflow.title)}</h3>
      <p class="workflow-summary">${escapeHtml(workflow.summary)}</p>
      <section class="workflow-preparation">
        <div class="detail-section-heading"><span>办理前准备</span><small>${workflow.preparation.length} 项</small></div>
        <ul>${workflow.preparation.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
      <section class="workflow-steps">
        <div class="detail-section-heading"><span>办理步骤</span><small>${workflow.steps.length} 步</small></div>
        <ol>${workflow.steps.map((step, index) => `<li><span>${index + 1}</span><p>${escapeHtml(step)}</p></li>`).join("")}</ol>
      </section>
      ${workflow.notice ? `<aside class="workflow-notice"><strong>办理提醒</strong><p>${escapeHtml(workflow.notice)}</p></aside>` : ""}
      <div class="workflow-actions">
        ${places.map((place) => `<button class="secondary-action" type="button" data-workflow-place="${escapeHtml(place.id)}">地图查看 · ${escapeHtml(place.name)}</button>`).join("")}
        <button class="primary-action" type="button" data-workflow-ask="${escapeHtml(workflow.id)}">继续问校园 Agent</button>
      </div>
    `;
  }

  function openServices(workflowId = "") {
    if (workflowId && workflowById[workflowId]) state.serviceWorkflowId = workflowId;
    renderServiceWorkflows();
    elements.serviceModal.removeAttribute("inert");
    elements.serviceModal.setAttribute("aria-hidden", "false");
    elements.serviceModal.classList.add("open");
    window.setTimeout(() => elements.workflowList.querySelector(".workflow-card.active")?.focus(), 0);
  }

  function closeServices() {
    if (!elements.serviceModal.classList.contains("open")) return;
    elements.serviceModal.classList.remove("open");
    elements.serviceModal.setAttribute("aria-hidden", "true");
    elements.serviceModal.setAttribute("inert", "");
    elements.serviceButton.focus();
  }

  const knowledgeStatusMeta = {
    current: { label: "2026 当前", tone: "current" },
    stable: { label: "长期指南", tone: "stable" },
    reference: { label: "历史参考", tone: "reference" },
  };

  const knowledgeAudienceLabels = {
    newcomer: "新生",
    undergraduate: "本科生",
    graduate: "研究生",
    alumni: "毕业生 / 校友",
  };

  function filteredKnowledgeDocuments() {
    const query = normalize(state.knowledgeQuery);
    return knowledgeDocuments.filter((document) => {
      if (state.knowledgeCategory !== "all" && document.category !== state.knowledgeCategory) return false;
      if (state.knowledgeAudience !== "all" && !(document.audience || []).includes(state.knowledgeAudience)) return false;
      if (!query) return true;
      const searchable = normalize([
        document.title,
        document.department,
        document.summary,
        document.format,
        ...(document.highlights || []),
        ...(document.tags || []),
        ...(document.campuses || []),
    ].join(" "));
      return searchable.includes(query);
    }).sort((left, right) => {
      if (left.priority === "primary" && right.priority !== "primary") return -1;
      if (right.priority === "primary" && left.priority !== "primary") return 1;
      if (left.priority === "featured" && right.priority !== "featured") return -1;
      if (right.priority === "featured" && left.priority !== "featured") return 1;
      const statusRank = { current: 0, stable: 1, reference: 2 };
      const statusDifference = (statusRank[left.status] ?? 3) - (statusRank[right.status] ?? 3);
      if (statusDifference) return statusDifference;
      return String(right.publishedAt).localeCompare(String(left.publishedAt), "zh-CN");
    });
  }

  function knowledgeAgentPrompt(document) {
    const highlights = (document.highlights || []).join("；");
    return `请依据以下东南大学官方资料回答我的问题：\n《${document.title}》\n来源：${document.department}\n发布日期：${document.publishedAt}\n资料摘要：${document.summary}\n要点：${highlights}\n请明确区分资料原文信息和你的推断；如果内容可能已更新，请提醒我打开官方原文核对。`;
  }

  function renderKnowledgeDetail(document) {
    if (!elements.knowledgeDetail) return;
    if (!document) {
      elements.knowledgeDetail.innerHTML = `
        <div class="knowledge-empty-detail">
          <span>⌕</span>
          <h3>没有匹配的资料</h3>
          <p>试试缩短关键词，或切换到“全部资料”。</p>
          <button type="button" data-knowledge-reset>清除筛选</button>
        </div>
      `;
      return;
    }
    const category = knowledgeCategoryById[document.category] || { label: "校园资料", icon: "文" };
    const status = knowledgeStatusMeta[document.status] || knowledgeStatusMeta.stable;
    const audiences = (document.audience || []).map((item) => knowledgeAudienceLabels[item] || item);
    elements.knowledgeDetail.innerHTML = `
      <div class="knowledge-detail-scroll">
        <div class="knowledge-detail-topline">
          <span class="knowledge-detail-category"><b>${escapeHtml(category.icon)}</b>${escapeHtml(category.label)}</span>
          <span class="knowledge-status ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
        </div>
        <h3>${escapeHtml(document.title)}</h3>
        <p class="knowledge-detail-summary">${escapeHtml(document.summary)}</p>
        <dl class="knowledge-meta-grid">
          <div><dt>发布部门</dt><dd>${escapeHtml(document.department)}</dd></div>
          <div><dt>发布日期</dt><dd>${escapeHtml(document.publishedAt || "未标注")}</dd></div>
          <div><dt>适用人群</dt><dd>${escapeHtml(audiences.join(" · ") || "全体师生")}</dd></div>
          <div><dt>适用校区</dt><dd>${escapeHtml((document.campuses || ["全校"]).join(" · "))}</dd></div>
          <div><dt>资料形态</dt><dd>${escapeHtml(document.format || "网页")}</dd></div>
          <div><dt>来源状态</dt><dd>学校官网公开资料</dd></div>
        </dl>
        <section class="knowledge-highlights">
          <div class="detail-section-heading"><span>这份资料能解决什么</span><small>${document.highlights?.length || 0} 项</small></div>
          <ul>${(document.highlights || []).map((item) => `<li><span>✓</span>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <div class="knowledge-tags">${(document.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        ${document.status === "reference" ? `<aside class="knowledge-reference-note"><strong>时效提醒</strong><p>这是历史批次或操作参考。涉及具体日期、金额、材料或系统入口时，请以当年最新通知为准。</p></aside>` : ""}
        <div class="knowledge-actions">
          <a href="${escapeHtml(document.sourceUrl)}" target="_blank" rel="noopener noreferrer">查看学校官网原文 ↗</a>
          <button type="button" data-knowledge-ask="${escapeHtml(document.id)}">带着这份资料问 Agent</button>
        </div>
        <p class="knowledge-source-note">知识中心展示的是便于检索的摘要，不替代学校正式文件；Agent 回答也应附带这条来源。</p>
      </div>
    `;
  }

  function renderKnowledgeLibrary() {
    if (!elements.knowledgeList || !knowledgeDocuments.length) return;
    const filtered = filteredKnowledgeDocuments();
    if (!state.knowledgeDocumentId || !filtered.some((document) => document.id === state.knowledgeDocumentId)) {
      state.knowledgeDocumentId = filtered[0]?.id || null;
    }

    const selectedCategory = knowledgeCategoryById[state.knowledgeCategory] || knowledgeCategoryById.all || { label: "全部资料" };
    elements.knowledgeCategories.innerHTML = knowledgeCategories.map((category) => {
      const count = category.id === "all"
        ? knowledgeDocuments.length
        : knowledgeDocuments.filter((document) => document.category === category.id).length;
      return `<button class="knowledge-category ${state.knowledgeCategory === category.id ? "active" : ""}" type="button" data-knowledge-category="${escapeHtml(category.id)}">
        <span>${escapeHtml(category.icon)}</span><strong>${escapeHtml(category.label)}</strong><small>${count}</small>
      </button>`;
    }).join("");
    elements.knowledgeResultTitle.textContent = state.knowledgeQuery
      ? `“${state.knowledgeQuery}”的资料`
      : selectedCategory.label;
    elements.knowledgeResultCount.textContent = `${filtered.length} 份`;
    elements.knowledgeList.innerHTML = filtered.length ? filtered.map((document) => {
      const category = knowledgeCategoryById[document.category] || { icon: "文" };
      const status = knowledgeStatusMeta[document.status] || knowledgeStatusMeta.stable;
      return `<button class="knowledge-card ${state.knowledgeDocumentId === document.id ? "active" : ""}" type="button" data-knowledge-document="${escapeHtml(document.id)}">
        <span class="knowledge-card-icon">${escapeHtml(category.icon)}</span>
        <span class="knowledge-card-body">
          <span class="knowledge-card-meta"><em class="${escapeHtml(status.tone)}">${escapeHtml(status.label)}</em><i>${escapeHtml(document.publishedAt)}</i><i>${escapeHtml(document.format)}</i></span>
          <strong>${escapeHtml(document.title)}</strong>
          <small>${escapeHtml(document.department)}</small>
          <span>${escapeHtml(document.summary)}</span>
        </span>
        <b aria-hidden="true">→</b>
      </button>`;
    }).join("") : `<div class="knowledge-no-results"><span>未找到相关资料</span><button type="button" data-knowledge-reset>清除筛选</button></div>`;
    renderKnowledgeDetail(knowledgeById[state.knowledgeDocumentId]);
  }

  function renderKnowledgeOverview() {
    if (!elements.knowledgeDocumentCount) return;
    const departments = new Set(knowledgeDocuments.map((document) => document.department.split("/")[0].trim()));
    elements.knowledgeDocumentCount.textContent = String(knowledgeDocuments.length);
    elements.knowledgeDepartmentCount.textContent = String(departments.size);
    elements.knowledgeCurrentCount.textContent = String(knowledgeDocuments.filter((document) => document.status === "current").length);
    elements.knowledgeVerifiedAt.textContent = `官网资料 · 核验于 ${knowledgeLibrary.verifiedAt || "2026-08-12"}`;
    renderKnowledgeLibrary();
  }

  function resetKnowledgeFilters() {
    state.knowledgeCategory = "all";
    state.knowledgeAudience = "all";
    state.knowledgeQuery = "";
    state.knowledgeDocumentId = knowledgeDocuments[0]?.id || null;
    elements.knowledgeSearch.value = "";
    elements.knowledgeAudience.value = "all";
    renderKnowledgeLibrary();
  }

  function openKnowledge() {
    renderKnowledgeOverview();
    elements.knowledgeModal.removeAttribute("inert");
    elements.knowledgeModal.setAttribute("aria-hidden", "false");
    elements.knowledgeModal.classList.add("open");
    if (window.location.hash !== "#knowledge") window.history.replaceState(null, "", "#knowledge");
    window.setTimeout(() => elements.knowledgeSearch.focus(), 0);
  }

  function closeKnowledge() {
    if (!elements.knowledgeModal.classList.contains("open")) return;
    elements.knowledgeModal.classList.remove("open");
    elements.knowledgeModal.setAttribute("aria-hidden", "true");
    elements.knowledgeModal.setAttribute("inert", "");
    if (window.location.hash === "#knowledge") window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    elements.knowledgeButton.focus();
  }

  function applyKnowledgePath(path) {
    const paths = {
      newcomer: { category: "newcomer", audience: "newcomer", query: "" },
      daily: { category: "digital", audience: "newcomer", query: "" },
      graduate: { category: "graduate", audience: "graduate", query: "" },
      security: { category: "security", audience: "all", query: "" },
    };
    const selection = paths[path];
    if (!selection) return;
    state.knowledgeCategory = selection.category;
    state.knowledgeAudience = selection.audience;
    state.knowledgeQuery = selection.query;
    elements.knowledgeAudience.value = selection.audience;
    elements.knowledgeSearch.value = selection.query;
    renderKnowledgeLibrary();
    elements.knowledgeList.scrollTop = 0;
  }

  function addMessage(role, content, loading = false) {
    const item = document.createElement("div");
    item.className = `message ${role}${loading ? " loading" : ""}`;
    item.textContent = content;
    elements.chatMessages.appendChild(item);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    return item;
  }

  function openAgent(seedQuestion = "") {
    elements.agentDrawer.classList.add("open");
    if (seedQuestion) {
      elements.chatInput.value = seedQuestion;
      elements.chatInput.focus();
    }
  }

  function localAgent(question) {
    const normalized = normalize(question);
    let ids = [];
    let message = "我会优先查询2025.08版四牌楼校园指南，并把相关地点同步显示在地图上。";
    if (/打印|复印/.test(normalized)) {
      ids = ["library-print", "zhongshan"];
      message = "2025.08版指南记录了图书馆大厅和中山院的自助打印设施。我已在地图上标出两个候选点。";
    } else if (/吃|餐|午饭|晚饭|夜宵|好吃/.test(normalized)) {
      ids = ["shatang-canteen", "xiangyuan", "zhenxiang", "weixiang", "wenchang-food"];
      message = "如果在校内，可以先看沙塘园或香园食堂；想找夜宵可查看蓁巷。以下推荐依据2025.08版指南。";
    } else if (/自习|学习|图书馆|空教室/.test(normalized)) {
      ids = ["library", "zhongshan", "dongnan"];
      message = "图书馆适合预约座位和研讨空间；中山院、东南院可以通过数智东南查询空教室。我已高亮相关地点。";
    } else if (/医院|看病|急诊|aed|急救/.test(normalized)) {
      ids = ["campus-hospital", "aed-library"];
      message = "校医院可处理基本门诊；指南建议紧急情况优先考虑鼓楼医院。图书馆等多处设有 AED，可按现场标识查找。";
    } else if (/宿舍|床|洗澡|门禁/.test(normalized)) {
      ids = ["shatang-dorm", "chengyuan-dorm", "west-dorm", "wenchang-dorm"];
      message = "四个主要宿舍区域已高亮。不同楼栋的床型、卫浴和门禁不同，请选择具体宿舍区查看。";
    } else if (/地铁|公交|南京南|南京站|机场|怎么走/.test(normalized)) {
      ids = ["fuzimiao-metro", "jimingsi-metro"];
      message = "四牌楼附近可使用浮桥站和鸡鸣寺站。页面展示的是2025.08版指南记录的耗时和首末班信息。";
    }
    return { message, placeIds: ids };
  }

  async function askAgent(question) {
    addMessage("user", question);
    const loading = addMessage("assistant", "正在查询校园数据…", true);
    let response;
    try {
      if (window.APP_CONFIG.agentEnabled) {
        const result = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, context: { selectedPlaceId: state.selectedId } }),
        });
        if (!result.ok) throw new Error(`Agent request failed: ${result.status}`);
        response = await result.json();
        elements.agentMode.textContent = "在线校园 Agent";
      } else {
        await new Promise((resolve) => setTimeout(resolve, 420));
        response = localAgent(question);
        elements.agentMode.textContent = "本地指南模式";
      }
    } catch (error) {
      response = localAgent(question);
      response.message += "\n\n在线服务暂不可用，已切换为本地指南查询。";
      elements.agentMode.textContent = "本地指南模式";
    }
    loading.remove();
    addMessage("assistant", response.message || "暂时没有找到答案。");
    if (response.placeIds?.length) {
      state.theme = "all";
      state.filter = "all";
      state.query = "";
      elements.searchInput.value = "";
      renderAll();
      selectFeature(response.placeIds[0]);
      response.placeIds.forEach((id) => document.querySelector(`.map-marker[data-feature-id="${id}"]`)?.classList.add("active"));
    }
  }

  function updateTencentMarkers(visibleIds) {
    if (!state.tmapMarkers || !window.TMap) return;
    const geometries = window.MAP_FEATURES.filter((feature) => visibleIds.has(feature.id)).map((feature) => {
      const coordinate = toTencentCoordinate(feature.lat, feature.lng, feature.coordinateSystem);
      const selected = state.selectedId === feature.id;
      return {
        id: feature.id,
        styleId: markerStyleId(feature.category, selected),
        position: new TMap.LatLng(coordinate.latitude, coordinate.longitude),
        properties: { title: feature.name },
      };
    });
    state.tmapMarkers.setGeometries(geometries);
    if (state.annotationMarkers) {
      const annotationGeometries = state.annotations
        .filter((annotation) => Number.isFinite(Number(annotation.lat)) && Number.isFinite(Number(annotation.lng)))
        .map((annotation) => ({
          id: annotation.id,
          styleId: markerStyleId(annotation.category, state.editingAnnotationId === annotation.id || state.selectedAnnotationId === annotation.id),
          position: new TMap.LatLng(Number(annotation.lat), Number(annotation.lng)),
          properties: { title: annotation.name },
        }));
      state.annotationMarkers.setGeometries(annotationGeometries);
    }
    if (state.userMarker) {
      state.userMarker.setGeometries(state.userLocation ? [{
        id: "current-user-location",
        styleId: "user-location",
        position: new TMap.LatLng(state.userLocation.latitude, state.userLocation.longitude),
      }] : []);
    }
  }

  function extractTencentLatLng(event) {
    const candidate = event?.latLng || event?.lngLat || event?.coordinate || event?.location;
    if (!candidate) return null;
    const read = (value, methodName, keys) => {
      if (typeof value?.[methodName] === "function") return Number(value[methodName]());
      for (const key of keys) {
        if (value?.[key] !== undefined) return Number(value[key]);
      }
      return NaN;
    };
    const lat = read(candidate, "getLat", ["lat", "latitude"]);
    const lng = read(candidate, "getLng", ["lng", "longitude"]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, coordinateSystem: "GCJ-02" } : null;
  }

  function makeTencentMapAccessible() {
    if (!elements.tencentMap) return;
    const annotate = () => {
      elements.tencentMap.querySelectorAll("img:not([alt])").forEach((image) => image.setAttribute("alt", ""));
      elements.tencentMap.querySelectorAll("a").forEach((link) => {
        if (!link.getAttribute("aria-label") && !link.textContent.trim()) link.setAttribute("aria-label", "打开腾讯地图");
      });
    };
    annotate();
    const observer = new MutationObserver(annotate);
    observer.observe(elements.tencentMap, { childList: true, subtree: true });
  }

  function initializeTencentMap() {
    if (!window.TMap || !window.APP_CONFIG.tencentMapKey) return;
    elements.fallbackMap.hidden = true;
    elements.tencentMap.hidden = false;
    state.mapMode = "tencent";
    const campusCenter = toTencentCoordinate(32.0577, 118.7868);
    state.tmap = new TMap.Map(elements.tencentMap, {
      center: new TMap.LatLng(campusCenter.latitude, campusCenter.longitude),
      zoom: 17,
      pitch: 0,
      rotation: 0,
    });
    makeTencentMapAccessible();
    const markerSvg = (color) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46"><path fill="${color}" stroke="white" stroke-width="3" d="M18 1.5c-9 0-16.5 7.2-16.5 16.2C1.5 30 18 44.5 18 44.5S34.5 30 34.5 17.7C34.5 8.7 27 1.5 18 1.5Z"/><circle cx="18" cy="17.5" r="6" fill="white"/></svg>`)}`;
    const selectedMarkerSvg = (color) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 64"><circle cx="26" cy="27" r="24" fill="${color}" opacity=".18"/><circle cx="26" cy="27" r="19" fill="white" opacity=".88"/><path fill="${color}" stroke="white" stroke-width="3.5" d="M26 2.5C13.7 2.5 3.5 12.1 3.5 24.2 3.5 38.2 26 61 26 61s22.5-22.8 22.5-36.8C48.5 12.1 38.3 2.5 26 2.5Z"/><circle cx="26" cy="24" r="7.5" fill="white"/></svg>`)}`;
    const markerStyles = {};
    window.MAP_THEMES.forEach((theme) => {
      const baseId = theme.id === "all" ? "default" : theme.id;
      markerStyles[baseId] = new TMap.MarkerStyle({ width: 36, height: 46, anchor: { x: 18, y: 46 }, src: markerSvg(theme.color) });
      markerStyles[`${baseId}-selected`] = new TMap.MarkerStyle({ width: 52, height: 64, anchor: { x: 26, y: 64 }, src: selectedMarkerSvg(theme.color) });
    });
    state.tmapMarkers = new TMap.MultiMarker({
      map: state.tmap,
      styles: markerStyles,
      geometries: [],
    });
    state.annotationMarkers = new TMap.MultiMarker({
      map: state.tmap,
      styles: markerStyles,
      geometries: [],
    });
    const userMarkerSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="#3079d6" opacity=".2"/><circle cx="18" cy="18" r="8" fill="#3079d6" stroke="white" stroke-width="4"/></svg>`)}`;
    state.userMarker = new TMap.MultiMarker({
      map: state.tmap,
      styles: {
        "user-location": new TMap.MarkerStyle({ width: 36, height: 36, anchor: { x: 18, y: 18 }, src: userMarkerSvg }),
      },
      geometries: [],
    });
    state.routePolyline = new TMap.MultiPolyline({
      map: state.tmap,
      zIndex: 150,
      styles: {
        "walking-route": new TMap.PolylineStyle({
          color: "#245342",
          width: 8,
          borderWidth: 3,
          borderColor: "rgba(255,253,246,.96)",
          lineCap: "round",
          showArrow: true,
          arrowOptions: { width: 7, height: 5, space: 58 },
        }),
      },
      geometries: [],
    });
    state.tmapMarkers.on("click", (event) => {
      const id = event?.geometry?.id;
      if (id) selectFeature(id);
    });
    state.annotationMarkers.on("click", (event) => {
      const id = event?.geometry?.id;
      const annotation = state.annotations.find((item) => item.id === id);
      if (!annotation) return;
      if (state.annotationMode) openAnnotationEditor(annotationCoordinate(annotation), id);
      else selectAnnotation(annotation);
    });
    state.tmap.on("click", (event) => {
      if (!state.annotationMode) return;
      const coordinate = extractTencentLatLng(event);
      if (coordinate) openAnnotationEditor(coordinate);
      else setAnnotationNotice("没有读取到腾讯地图坐标，请稍后再试。", true);
    });
    restoreDataStatus();
    renderMarkers();
    if (state.routeData) drawRoute(state.routeData);
  }

  function loadTencentMap() {
    const key = window.APP_CONFIG.tencentMapKey;
    if (!key) return;
    window.__initCampusTMap = initializeTencentMap;
    const script = document.createElement("script");
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${encodeURIComponent(key)}&callback=__initCampusTMap`;
    script.async = true;
    script.onerror = () => console.warn("腾讯地图加载失败，继续使用示意地图。");
    document.head.appendChild(script);
  }

  function renderAll() {
    renderThemes();
    renderLayerBar();
    renderNearby();
    renderAnnotationPanel();
    renderResults();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const knowledgeCategoryButton = event.target.closest("[data-knowledge-category]");
      if (knowledgeCategoryButton) {
        state.knowledgeCategory = knowledgeCategoryButton.dataset.knowledgeCategory;
        state.knowledgeDocumentId = null;
        renderKnowledgeLibrary();
        return;
      }
      const knowledgeDocumentButton = event.target.closest("[data-knowledge-document]");
      if (knowledgeDocumentButton) {
        state.knowledgeDocumentId = knowledgeDocumentButton.dataset.knowledgeDocument;
        renderKnowledgeLibrary();
        return;
      }
      const knowledgeAskButton = event.target.closest("[data-knowledge-ask]");
      if (knowledgeAskButton) {
        const document = knowledgeById[knowledgeAskButton.dataset.knowledgeAsk];
        if (document) {
          closeKnowledge();
          openAgent(knowledgeAgentPrompt(document));
        }
        return;
      }
      const knowledgePathButton = event.target.closest("[data-knowledge-path]");
      if (knowledgePathButton) {
        applyKnowledgePath(knowledgePathButton.dataset.knowledgePath);
        return;
      }
      if (event.target.closest("[data-knowledge-reset]")) {
        resetKnowledgeFilters();
        return;
      }
      const workflowButton = event.target.closest("[data-workflow-id]");
      if (workflowButton) {
        state.serviceWorkflowId = workflowButton.dataset.workflowId;
        renderServiceWorkflows();
        return;
      }
      const workflowPlaceButton = event.target.closest("[data-workflow-place]");
      if (workflowPlaceButton) {
        closeServices();
        selectFeature(workflowPlaceButton.dataset.workflowPlace);
        return;
      }
      const workflowAskButton = event.target.closest("[data-workflow-ask]");
      if (workflowAskButton) {
        const workflow = workflowById[workflowAskButton.dataset.workflowAsk];
        if (workflow) {
          closeServices();
          openAgent(workflow.agentPrompt || `请介绍${workflow.title}的办理流程。`);
        }
        return;
      }
      const nearbyCategoryButton = event.target.closest("[data-nearby-category]");
      if (nearbyCategoryButton) {
        state.nearbyCategory = nearbyCategoryButton.dataset.nearbyCategory;
        renderNearby();
        return;
      }
      const nearbyFeatureButton = event.target.closest("[data-nearby-feature]");
      if (nearbyFeatureButton) {
        closeNearby();
        selectFeature(nearbyFeatureButton.dataset.nearbyFeature);
        return;
      }
      const nearbyRouteButton = event.target.closest("[data-nearby-route]");
      if (nearbyRouteButton) {
        const feature = featureById[nearbyRouteButton.dataset.nearbyRoute];
        if (feature) {
          closeNearby();
          selectFeature(feature.id);
          openRouteForFeature(feature);
        }
        return;
      }
      if (event.target.closest('[data-nearby-action="locate"]')) {
        openNearby();
        return;
      }
      const guideViewButton = event.target.closest("[data-guide-view]");
      if (guideViewButton) {
        state.guideView = guideViewButton.dataset.guideView === "original" ? "original" : "structured";
        renderGuideView();
        return;
      }
      const guideTopicButton = event.target.closest("[data-guide-sheet]");
      if (guideTopicButton) {
        state.guideSheet = guideTopicButton.dataset.guideSheet;
        renderGuideBrowser();
        return;
      }
      const guideRecordButton = event.target.closest("[data-guide-record-id]");
      if (guideRecordButton) {
        closeGuide();
        selectFeature(guideRecordButton.dataset.guideRecordId, true);
        return;
      }
      const annotationEditButton = event.target.closest("[data-annotation-edit]");
      if (annotationEditButton) {
        event.stopPropagation();
        openAnnotationEditor(annotationCoordinate(state.annotations.find((annotation) => annotation.id === annotationEditButton.dataset.annotationEdit)), annotationEditButton.dataset.annotationEdit);
        return;
      }
      const annotationDeleteButton = event.target.closest("[data-annotation-delete]");
      if (annotationDeleteButton) {
        event.stopPropagation();
        deleteAnnotation(annotationDeleteButton.dataset.annotationDelete);
        return;
      }
      const annotationMarker = event.target.closest("[data-annotation-id]");
      if (annotationMarker) {
        event.stopPropagation();
        const annotation = state.annotations.find((item) => item.id === annotationMarker.dataset.annotationId);
        if (state.annotationMode) openAnnotationEditor(annotationCoordinate(annotation), annotationMarker.dataset.annotationId);
        else selectAnnotation(annotation);
        return;
      }
      const themeButton = event.target.closest("[data-theme]");
      if (themeButton) {
        state.theme = themeButton.dataset.theme;
        state.query = "";
        elements.searchInput.value = "";
        renderAll();
      }
      const featureButton = event.target.closest("[data-feature-id]");
      if (featureButton) selectFeature(featureButton.dataset.featureId, featureButton.dataset.knowledge === "true");
      const promptButton = event.target.closest("[data-prompt]");
      if (promptButton) { openAgent(); askAgent(promptButton.dataset.prompt); }
    });

    elements.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value.trim();
      renderResults();
    });
    elements.knowledgeSearch.addEventListener("input", (event) => {
      state.knowledgeQuery = event.target.value.trim();
      state.knowledgeDocumentId = null;
      renderKnowledgeLibrary();
    });
    elements.knowledgeAudience.addEventListener("change", (event) => {
      state.knowledgeAudience = event.target.value;
      state.knowledgeDocumentId = null;
      renderKnowledgeLibrary();
    });
    elements.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && elements.resultList.querySelector("[data-feature-id]")) elements.resultList.querySelector("[data-feature-id]").click();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && document.activeElement !== elements.searchInput) { event.preventDefault(); elements.searchInput.focus(); }
      if (event.key === "Escape") { closeDetail(); closeNearby(); closeAnnotationEditor(); closeCoordinateEditor(); elements.agentDrawer.classList.remove("open"); closeGuide(); closeServices(); closeKnowledge(); }
    });
    document.querySelectorAll(".filter-chip").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.filter = button.dataset.filter;
      renderResults();
    }));
    document.querySelector("#detailClose").addEventListener("click", closeDetail);
    document.querySelector("#agentButton").addEventListener("click", () => openAgent());
    document.querySelector("#agentClose").addEventListener("click", () => elements.agentDrawer.classList.remove("open"));
    elements.knowledgeButton.addEventListener("click", openKnowledge);
    elements.knowledgeClose.addEventListener("click", closeKnowledge);
    elements.serviceButton.addEventListener("click", () => openServices());
    elements.serviceClose.addEventListener("click", closeServices);
    document.querySelector("#guideButton").addEventListener("click", openGuide);
    document.querySelector("#guideClose").addEventListener("click", closeGuide);
    elements.annotationButton.addEventListener("click", toggleAnnotationMode);
    elements.annotationForm.addEventListener("submit", saveAnnotation);
    elements.coordinateForm.addEventListener("submit", saveCoordinate);
    elements.annotationEditor.addEventListener("pointerdown", (event) => event.stopPropagation());
    elements.annotationEditor.addEventListener("click", (event) => event.stopPropagation());
    elements.annotationCancel.addEventListener("click", closeAnnotationEditor);
    elements.annotationFormCancel.addEventListener("click", closeAnnotationEditor);
    elements.coordinateCancel.addEventListener("click", closeCoordinateEditor);
    elements.coordinateFormCancel.addEventListener("click", closeCoordinateEditor);
    elements.annotationExport.addEventListener("click", downloadAnnotations);
    elements.annotationCopy.addEventListener("click", copyAnnotations);
    elements.annotationClear.addEventListener("click", () => {
      if (!state.annotations.length) {
        setAnnotationNotice("当前没有可清空的标注。", true);
        return;
      }
      if (!window.confirm(`确定清空 ${state.annotations.length} 个标注吗？`)) return;
      state.annotations = [];
      persistAnnotations();
      closeAnnotationEditor();
      renderAnnotationPanel();
      renderMarkers();
      setAnnotationNotice("标注已清空。", false);
      updateAnnotationStatus();
    });
    elements.guideModal.addEventListener("click", (event) => { if (event.target === elements.guideModal) closeGuide(); });
    elements.serviceModal.addEventListener("click", (event) => { if (event.target === elements.serviceModal) closeServices(); });
    elements.knowledgeModal.addEventListener("click", (event) => { if (event.target === elements.knowledgeModal) closeKnowledge(); });
    elements.nearbyButton.addEventListener("click", () => { if (state.nearbyOpen) closeNearby(); else openNearby(); });
    elements.nearbyClose.addEventListener("click", closeNearby);
    document.querySelector("#mobileCollapse").addEventListener("click", () => elements.sidebar.classList.toggle("collapsed"));
    elements.detailPanel.addEventListener("click", (event) => {
      if (!state.selectedAnnotationId) return;
      const action = event.target.closest("[data-detail-action]")?.dataset.detailAction;
      if (!action) return;
      const annotation = state.annotations.find((item) => item.id === state.selectedAnnotationId);
      if (!annotation) return;
      event.stopImmediatePropagation();
      if (action === "edit-coordinate") {
        openCoordinateEditor(annotation.id);
        return;
      }
      if (action === "ask") openAgent(`请介绍新增地点：${annotation.name}`);
      if (action === "route") openRouteForFeature(annotationAsFeature(annotation));
    });
    elements.detailPanel.addEventListener("click", (event) => {
      const action = event.target.closest("[data-detail-action]")?.dataset.detailAction;
      if (action === "show-map") {
        const placeId = event.target.closest("[data-place-id]")?.dataset.placeId;
        if (placeId) selectFeature(placeId);
        return;
      }
      if (action === "edit-coordinate") openCoordinateEditor(state.selectedId);
      if (action === "ask") openAgent(`请介绍一下${resolveFeature(state.selectedId, !featureById[state.selectedId])?.name || "这个地点"}`);
      if (action === "route") openRouteForFeature(featureById[state.selectedId]);
    });
    elements.chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const question = elements.chatInput.value.trim();
      if (!question) return;
      elements.chatInput.value = "";
      askAgent(question);
    });
    document.querySelector("#zoomInButton").addEventListener("click", () => {
      if (state.tmap) state.tmap.zoomTo(state.tmap.getZoom() + 1);
      else { state.fallbackZoom = Math.min(1.35, state.fallbackZoom + .08); elements.fallbackMap.style.transform = `scale(${state.fallbackZoom})`; }
    });
    document.querySelector("#zoomOutButton").addEventListener("click", () => {
      if (state.tmap) state.tmap.zoomTo(state.tmap.getZoom() - 1);
      else { state.fallbackZoom = Math.max(.9, state.fallbackZoom - .08); elements.fallbackMap.style.transform = `scale(${state.fallbackZoom})`; }
    });
    document.querySelector("#locateButton").addEventListener("click", async () => {
      try {
        await requestUserLocation();
        showToast("已定位，地点列表已按直线距离排序。", "success");
      } catch (error) {
        showToast(error.message || "未获得定位权限，仍可继续浏览校园指南。", "warning");
      }
    });
    elements.fallbackMap.addEventListener("click", (event) => {
      if (!state.annotationMode || event.target.closest(".map-marker")) return;
      const rect = elements.fallbackMap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      openAnnotationEditor({
        x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
        y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
        coordinateSystem: "fallback-percent",
      });
    });
  }

  function initialize() {
    loadAnnotations();
    renderGuideGallery();
    renderGuideBrowser();
    renderServiceWorkflows();
    renderKnowledgeOverview();
    renderAll();
    bindEvents();
    elements.agentMode.textContent = window.APP_CONFIG.agentEnabled ? "校园知识模式" : "本地指南模式";
    elements.promptSuggestions.innerHTML = ["晚上哪里能打印？", "中午吃什么？", "哪里可以自习？", "校医院怎么走？"].map((prompt) => `<button class="prompt-suggestion" data-prompt="${prompt}">${prompt}</button>`).join("");
    addMessage("assistant", "你好，我是四牌楼校园 Agent，可以帮你查找学习、餐饮、宿舍、办事和交通信息。");
    loadTencentMap();
    loadPublishedContent();
    if (window.location.hash === "#knowledge") openKnowledge();
  }

  initialize();
})();
