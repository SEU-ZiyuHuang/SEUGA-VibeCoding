import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const knowledgeRoot = path.join(projectRoot, "knowledge-base");
const checkOnly = process.argv.includes("--check");
const categoryIds = new Set(["landmark", "study", "dining", "dorm", "office", "sports", "service", "medical", "transport", "nearby"]);

async function readJson(relativePath) {
  const absolutePath = path.join(knowledgeRoot, relativePath);
  try {
    return JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`${relativePath} 读取失败：${error.message}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function assert(condition, message, problems) {
  if (!condition) problems.push(message);
}

function uniqueIds(records, label, problems) {
  const seen = new Set();
  for (const record of records) {
    assert(record && typeof record === "object", `${label}中存在非对象记录`, problems);
    const id = String(record?.id || "");
    assert(/^[a-z0-9-]+$/.test(id), `${label} ID「${id || "（空）"}」格式无效`, problems);
    assert(!seen.has(id), `${label} ID「${id}」重复`, problems);
    seen.add(id);
  }
  return seen;
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function mergeDepartmentUnits(departments, unitGroups) {
  const departmentIds = new Set(departments.map((department) => department.id));
  const unitGroupByDepartmentId = new Map();
  for (const group of unitGroups) {
    if (!departmentIds.has(group.departmentId)) throw new Error(`department-units.json 引用了不存在的部门 ${group.departmentId}`);
    if (unitGroupByDepartmentId.has(group.departmentId)) throw new Error(`department-units.json 的部门 ${group.departmentId} 重复`);
    unitGroupByDepartmentId.set(group.departmentId, group);
  }
  const missing = departments.filter((department) => !unitGroupByDepartmentId.has(department.id)).map((department) => department.id);
  if (missing.length) throw new Error(`department-units.json 缺少部门：${missing.join("、")}`);
  return departments.map((department) => {
    const group = unitGroupByDepartmentId.get(department.id);
    const units = asArray(group.units);
    return {
      ...department,
      units,
      aggregateInto: group.aggregateInto || null,
      sourceIds: [...new Set([
        ...asArray(department.sourceIds),
        ...asArray(group.sourceIds),
        ...units.flatMap((unit) => asArray(unit.sourceIds)),
      ])],
    };
  });
}

function validate({ meta, campuses, sources, places, services, departments }) {
  const problems = [];
  assert(meta?.schemaVersion === 1, "meta.schemaVersion 当前必须为 1", problems);
  assert(validDate(meta?.verifiedAt), "meta.verifiedAt 必须为 YYYY-MM-DD", problems);
  const campusIds = uniqueIds(campuses, "campuses", problems);
  const sourceIds = uniqueIds(sources, "sources", problems);
  const placeIds = uniqueIds(places, "places", problems);
  const serviceIds = uniqueIds(services, "services", problems);
  uniqueIds(departments, "departments", problems);

  for (const source of sources) {
    assert(source.title && source.publisher, `来源 ${source.id} 缺少标题或发布方`, problems);
    try {
      const url = new URL(source.url);
      assert(url.protocol === "https:", `来源 ${source.id} 必须使用 HTTPS`, problems);
    } catch {
      problems.push(`来源 ${source.id} 的 URL 无效`);
    }
    assert(validDate(source.verifiedAt), `来源 ${source.id} 缺少有效核验日期`, problems);
    assert(["official", "open-data"].includes(source.type), `来源 ${source.id} 的 type 无效`, problems);
  }

  const validateSourceRefs = (record, label) => {
    assert(asArray(record.sourceIds).length > 0, `${label} ${record.id} 没有来源`, problems);
    for (const id of asArray(record.sourceIds)) assert(sourceIds.has(id), `${label} ${record.id} 引用了不存在的来源 ${id}`, problems);
    assert(sourceIds.has(record.primarySourceId), `${label} ${record.id} 的 primarySourceId 无效`, problems);
    assert(asArray(record.sourceIds).includes(record.primarySourceId), `${label} ${record.id} 的主来源必须在 sourceIds 中`, problems);
  };

  for (const campus of campuses) {
    assert(campus.name && campus.summary, `校区 ${campus.id} 缺少名称或摘要`, problems);
    for (const id of asArray(campus.sourceIds)) assert(sourceIds.has(id), `校区 ${campus.id} 引用了不存在的来源 ${id}`, problems);
  }

  for (const place of places) {
    assert(campusIds.has(place.campusId), `地点 ${place.id} 的 campusId 无效`, problems);
    assert(place.name && place.summary && place.description, `地点 ${place.id} 缺少名称、摘要或介绍`, problems);
    assert(categoryIds.has(place.category), `地点 ${place.id} 的 category 无效`, problems);
    validateSourceRefs(place, "地点");
    for (const id of asArray(place.serviceIds)) assert(serviceIds.has(id), `地点 ${place.id} 引用了不存在的服务 ${id}`, problems);
    const coordinate = place.coordinate;
    if (coordinate) {
      assert(Number.isFinite(coordinate.lat) && coordinate.lat >= -90 && coordinate.lat <= 90, `地点 ${place.id} 纬度无效`, problems);
      assert(Number.isFinite(coordinate.lng) && coordinate.lng >= -180 && coordinate.lng <= 180, `地点 ${place.id} 经度无效`, problems);
      assert(["WGS84", "GCJ-02"].includes(coordinate.system), `地点 ${place.id} 坐标系无效`, problems);
      assert(sourceIds.has(coordinate.sourceId), `地点 ${place.id} 坐标来源无效`, problems);
      try { new URL(coordinate.sourceUrl); } catch { problems.push(`地点 ${place.id} 的坐标来源 URL 无效`); }
    }
  }

  for (const service of services) {
    assert(campusIds.has(service.campusId), `服务 ${service.id} 的 campusId 无效`, problems);
    assert(placeIds.has(service.placeId), `服务 ${service.id} 的 placeId 无效`, problems);
    assert(service.title && service.summary && service.location, `服务 ${service.id} 缺少标题、摘要或地点`, problems);
    validateSourceRefs(service, "服务");
    assert(validDate(service.verifiedAt), `服务 ${service.id} 缺少有效核验日期`, problems);
    const place = places.find((item) => item.id === service.placeId);
    assert(asArray(place?.serviceIds).includes(service.id), `服务 ${service.id} 未被地点 ${service.placeId} 反向关联`, problems);
    if (service.onlineUrl) {
      try { new URL(service.onlineUrl); } catch { problems.push(`服务 ${service.id} 的 onlineUrl 无效`); }
    }
  }

  for (const department of departments) {
    assert(department.name && department.summary && department.website, `部门 ${department.id} 缺少名称、摘要或网站`, problems);
    assert(asArray(department.responsibilities).length > 0, `部门 ${department.id} 缺少职责`, problems);
    assert(asArray(department.offices).length > 0, `部门 ${department.id} 缺少办公地点`, problems);
    validateSourceRefs(department, "部门");
    assert(validDate(department.verifiedAt), `部门 ${department.id} 缺少有效核验日期`, problems);
    if (department.aggregateInto) {
      assert(departments.some((item) => item.id === department.aggregateInto), `部门 ${department.id} 的 aggregateInto 无效`, problems);
      assert(department.aggregateInto !== department.id, `部门 ${department.id} 不能聚合到自身`, problems);
    }
    try { new URL(department.website); } catch { problems.push(`部门 ${department.id} 的 website 无效`); }
    const validateOffice = (office, label) => {
      assert(campusIds.has(office.campusId), `部门 ${department.id} 的办公室 campusId 无效`, problems);
      assert(office.location && office.room, `${label}缺少地点或房间`, problems);
      if (office.placeId) assert(placeIds.has(office.placeId), `部门 ${department.id} 的办公室引用了不存在的地点 ${office.placeId}`, problems);
    };
    for (const office of asArray(department.offices)) validateOffice(office, `部门 ${department.id} 的办公室`);
    for (const link of asArray(department.links)) {
      assert(link.label && link.url, `部门 ${department.id} 存在不完整的常用入口`, problems);
      try { new URL(link.url); } catch { problems.push(`部门 ${department.id} 的入口 URL 无效`); }
    }
    const unitIds = new Set();
    assert(asArray(department.units).length > 0, `部门 ${department.id} 缺少下设科室`, problems);
    for (const unit of asArray(department.units)) {
      assert(/^[a-z0-9-]+$/.test(String(unit.id || "")), `部门 ${department.id} 的科室 ID「${unit.id || "（空）"}」格式无效`, problems);
      assert(!unitIds.has(unit.id), `部门 ${department.id} 的科室 ID「${unit.id}」重复`, problems);
      unitIds.add(unit.id);
      assert(unit.name && asArray(unit.responsibilities).length > 0, `部门 ${department.id} 的科室 ${unit.id} 缺少名称或职责`, problems);
      assert(asArray(unit.offices).length > 0 || unit.serviceNote, `部门 ${department.id} 的科室 ${unit.id} 缺少办公地点或分流说明`, problems);
      for (const sourceId of asArray(unit.sourceIds)) assert(sourceIds.has(sourceId), `部门 ${department.id} 的科室 ${unit.id} 引用了不存在的来源 ${sourceId}`, problems);
      for (const office of asArray(unit.offices)) validateOffice(office, `部门 ${department.id} 的科室 ${unit.id} 办公室`);
      for (const link of asArray(unit.links)) {
        assert(link.label && link.url, `部门 ${department.id} 的科室 ${unit.id} 存在不完整入口`, problems);
        try { new URL(link.url); } catch { problems.push(`部门 ${department.id} 的科室 ${unit.id} 入口 URL 无效`); }
      }
    }
  }

  if (problems.length) throw new Error(`统一知识库校验失败：\n- ${[...new Set(problems)].join("\n- ")}`);
}

function sourceLines(sourceIds, sourceById) {
  return sourceIds.map((id) => {
    const source = sourceById.get(id);
    return `- ${source.publisher}《${source.title}》：${source.url}（核验 ${source.verifiedAt}）`;
  }).join("\n");
}

function buildPlaceChunk(place, campusById, sourceById) {
  const campus = campusById.get(place.campusId);
  const primary = sourceById.get(place.primarySourceId);
  const aliases = asArray(place.aliases);
  const history = asArray(place.history).length
    ? `\n\n历史节点：\n${place.history.map((item) => `- ${item.year}：${item.text}`).join("\n")}`
    : "";
  const text = [
    `# ${place.name}`,
    `地点：${campus.name}，${place.location}`,
    `类型：${place.kind}`,
    aliases.length ? `别名：${aliases.join("、")}` : "",
    `简介：${place.summary}`,
    `详细介绍：${place.description}`,
    history,
    `当前用途：${place.currentUse}`,
    place.heritage ? `保护与价值：${place.heritage}` : "",
    `标签：${asArray(place.tags).join("、")}`,
    "",
    "来源：",
    sourceLines(place.sourceIds, sourceById),
    place.coordinate ? `地图坐标：${place.coordinate.lat}, ${place.coordinate.lng}（${place.coordinate.system}；${place.coordinate.verified ? "已由校方核验" : "开放地图参考坐标，非校方权威点位"}；${place.coordinate.sourceUrl}）` : "",
  ].filter((item) => item !== "").join("\n");
  const keywords = [...new Set([place.name, ...aliases, place.location, place.kind, ...asArray(place.tags)].filter(Boolean))].slice(0, 20);
  return {
    id: `${place.campusId}/place-${place.id}`,
    campus: place.campusId,
    campusName: campus.name,
    version: `统一知识库 ${campusById.get(place.campusId).id} ${primary.verifiedAt}`,
    sectionPath: `校园建筑｜${place.name}`,
    chunkKey: `place_${place.id.replaceAll("-", "_")}`,
    summary: place.summary,
    keywords,
    related: asArray(place.serviceIds).map((id) => `${place.campusId}/service-${id}`),
    pages: [],
    text,
    official: true,
    sourceLabel: `${primary.publisher}《${primary.title}》`,
    sourceUrl: primary.url,
    verifiedAt: primary.verifiedAt,
    placeIds: [place.id],
  };
}

function buildServiceChunk(service, campusById, placeById, sourceById) {
  const campus = campusById.get(service.campusId);
  const place = placeById.get(service.placeId);
  const primary = sourceById.get(service.primarySourceId);
  const aliases = asArray(service.aliases);
  const text = [
    `# ${service.title}`,
    `校区：${campus.name}`,
    `办理地点：${service.location}${service.room ? `，${service.room}` : ""}`,
    `关联建筑：${place.name}`,
    aliases.length ? `常见问法：${aliases.join("、")}` : "",
    `事项说明：${service.summary}`,
    `办理时间：${service.hours}`,
    asArray(service.phones).length ? `联系电话：${service.phones.join("、")}` : "",
    service.onlineUrl ? `线上入口：${service.onlineUrl}` : "",
    asArray(service.audience).length ? `适用对象：${service.audience.join("、")}` : "",
    asArray(service.materials).length ? `准备材料与条件：\n${service.materials.map((item) => `- ${item}`).join("\n")}` : "",
    asArray(service.steps).length ? `办理步骤：\n${service.steps.map((item, index) => `${index + 1}. ${item}`).join("\n")}` : "",
    `提醒：${service.notice}`,
    `信息核验日期：${service.verifiedAt}。办公时间、电话与房间属于易变信息，出发前请打开主管部门页面复核。`,
    "",
    "来源：",
    sourceLines(service.sourceIds, sourceById),
  ].filter((item) => item !== "").join("\n");
  const keywords = [...new Set([service.title, ...aliases, place.name, service.location, service.room, ...asArray(service.phones)].filter(Boolean))].slice(0, 20);
  return {
    id: `${service.campusId}/service-${service.id}`,
    campus: service.campusId,
    campusName: campus.name,
    version: `统一知识库 办事信息 ${service.verifiedAt}`,
    sectionPath: `办事指南｜${service.title}`,
    chunkKey: `service_${service.id.replaceAll("-", "_")}`,
    summary: service.summary,
    keywords,
    related: [`${service.campusId}/place-${service.placeId}`],
    pages: [],
    text,
    official: true,
    sourceLabel: `${primary.publisher}《${primary.title}》`,
    sourceUrl: primary.url,
    verifiedAt: service.verifiedAt,
    placeIds: [service.placeId],
  };
}

function buildDepartmentChunks(department, campusById, sourceById) {
  const primary = sourceById.get(department.primarySourceId);
  const aliases = asArray(department.aliases);
  const unitOffices = asArray(department.units).flatMap((unit) => asArray(unit.offices));
  const officeCampuses = [...new Set([...asArray(department.offices), ...unitOffices].map((office) => office.campusId))];
  const officeLines = asArray(department.offices).map((office) => {
    const campus = campusById.get(office.campusId);
    const contact = [asArray(office.phones).join("、"), office.email].filter(Boolean).join("；");
    return `- ${campus.name}：${office.location}${office.room ? `，${office.room}` : ""}${contact ? `；${contact}` : ""}${office.serviceNote ? `；提醒：${office.serviceNote}` : ""}`;
  }).join("\n");
  const unitLines = asArray(department.units).map((unit) => {
    const unitOfficeLines = asArray(unit.offices).map((office) => {
      const campus = campusById.get(office.campusId);
      const contact = [asArray(office.phones).join("、"), office.email].filter(Boolean).join("；");
      return `  - ${campus.name}：${office.location}${office.room ? `，${office.room}` : ""}${contact ? `；${contact}` : ""}${office.serviceNote ? `；提醒：${office.serviceNote}` : ""}`;
    }).join("\n");
    return [
      `- ${unit.name}${asArray(unit.aliases).length ? `（常见称呼：${unit.aliases.join("、")}）` : ""}`,
      `  职责：${unit.responsibilities.join("；")}`,
      unitOfficeLines || `  办理提示：${unit.serviceNote}`,
      unitOfficeLines && unit.serviceNote ? `  办理提示：${unit.serviceNote}` : "",
    ].filter(Boolean).join("\n");
  }).join("\n");
  const linkLines = asArray(department.links).map((link) => `- ${link.label}：${link.url}`).join("\n");
  return officeCampuses.map((campusId) => {
    const campus = campusById.get(campusId);
    const campusOffices = [...asArray(department.offices), ...unitOffices].filter((office) => office.campusId === campusId);
    const placeIds = [...new Set(campusOffices.map((office) => office.placeId).filter(Boolean))];
    const text = [
      `# ${department.name}`,
      `当前检索校区：${campus.name}`,
      aliases.length ? `常用称呼：${aliases.join("、")}` : "",
      `部门简介：${department.summary}`,
      `主要职责：\n${department.responsibilities.map((item) => `- ${item}`).join("\n")}`,
      `办公地点与联系：\n${officeLines}`,
      `下设科室与办公地点（共 ${department.units.length} 个）：\n${unitLines}`,
      `部门网站：${department.website}`,
      linkLines ? `常用入口：\n${linkLines}` : "",
      `信息核验日期：${department.verifiedAt}。办公地点、电话和坐班安排属于易变信息，前往前请打开主管部门页面复核。`,
      "",
      "来源：",
      sourceLines(department.sourceIds, sourceById),
    ].filter((item) => item !== "").join("\n");
    const keywords = [...new Set([
      department.name,
      ...aliases,
      ...department.responsibilities,
      ...department.units.flatMap((unit) => [unit.name, ...asArray(unit.aliases), ...asArray(unit.responsibilities)]),
      ...campusOffices.flatMap((office) => [office.location, office.room, ...asArray(office.phones)]),
      ...unitOffices.flatMap((office) => [office.location, office.room, ...asArray(office.phones)]),
    ].filter(Boolean))].slice(0, 100);
    return {
      id: `${campusId}/department-${department.id}`,
      campus: campusId,
      campusName: campus.name,
      version: `统一知识库 职能部门 ${department.verifiedAt}`,
      sectionPath: `职能部门｜${department.name}`,
      chunkKey: `department_${department.id.replaceAll("-", "_")}`,
      summary: department.summary,
      keywords,
      related: placeIds.map((id) => `${campusId}/place-${id}`),
      pages: [],
      text,
      official: true,
      sourceLabel: `${primary.publisher}《${primary.title}》`,
      sourceUrl: primary.url,
      verifiedAt: department.verifiedAt,
      placeIds,
    };
  });
}

function buildAliases(places, services, departments) {
  const entries = [];
  const departmentById = new Map(departments.map((department) => [department.id, department]));
  for (const place of places) for (const alias of asArray(place.aliases)) if (alias !== place.name) entries.push([alias, [place.name]]);
  for (const service of services) for (const alias of asArray(service.aliases)) if (alias !== service.title) entries.push([alias, [service.title]]);
  for (const department of departments) {
    const canonicalDepartment = departmentById.get(department.aggregateInto) || department;
    if (department.aggregateInto) entries.push([department.name, [canonicalDepartment.name]]);
    for (const alias of asArray(department.aliases)) if (alias !== canonicalDepartment.name) entries.push([alias, [canonicalDepartment.name]]);
    for (const unit of asArray(department.units)) {
      entries.push([unit.name, [canonicalDepartment.name]]);
      for (const alias of asArray(unit.aliases)) entries.push([alias, [canonicalDepartment.name, unit.name]]);
    }
  }
  return Object.fromEntries(entries);
}

function buildMapFeatures(places, serviceById) {
  return places.map((place) => {
    const primaryService = asArray(place.serviceIds).map((id) => serviceById.get(id)).find(Boolean);
    const feature = {
      id: place.id,
      sharedPlaceId: place.id,
      name: place.name,
      category: place.category,
      icon: place.icon,
      location: place.location,
      hours: primaryService?.hours || "",
      status: "unknown",
      verified: false,
      tags: [...new Set([...asArray(place.tags), place.kind].filter(Boolean))],
      description: place.summary,
      officialKnowledge: true,
    };
    if (!place.coordinate) return { ...feature, knowledgeOnly: true };
    return {
      ...feature,
      lat: place.coordinate.lat,
      lng: place.coordinate.lng,
      coordinateSystem: place.coordinate.system,
    };
  });
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function main() {
  const [meta, campuses, sources, places, services, rawDepartments, departmentUnitGroups] = await Promise.all([
    readJson("meta.json"),
    readJson("campuses.json"),
    readJson("sources.json"),
    readJson(path.join("places", "sipailou.json")),
    readJson(path.join("services", "sipailou.json")),
    readJson("departments.json"),
    readJson("department-units.json"),
  ]);
  const departments = mergeDepartmentUnits(rawDepartments, departmentUnitGroups);
  validate({ meta, campuses, sources, places, services, departments });

  const campusById = new Map(campuses.map((item) => [item.id, item]));
  const sourceById = new Map(sources.map((item) => [item.id, item]));
  const placeById = new Map(places.map((item) => [item.id, item]));
  const serviceById = new Map(services.map((item) => [item.id, item]));
  const chunks = [
    ...places.map((place) => buildPlaceChunk(place, campusById, sourceById)),
    ...services.map((service) => buildServiceChunk(service, campusById, placeById, sourceById)),
    ...departments.filter((department) => !department.aggregateInto).flatMap((department) => buildDepartmentChunks(department, campusById, sourceById)),
  ];
  const aliases = buildAliases(places, services, departments);
  const mapFeatures = buildMapFeatures(places, serviceById);
  const build = {
    schemaVersion: meta.schemaVersion,
    contentVersion: meta.contentVersion,
    generatedAt: `${meta.verifiedAt}T00:00:00+08:00`,
    verifiedAt: meta.verifiedAt,
    campusCount: campuses.length,
    placeCount: places.length,
    serviceCount: services.length,
    departmentCount: departments.length,
    departmentUnitCount: departments.reduce((total, department) => total + department.units.length, 0),
    sourceCount: sources.length,
    chunkCount: chunks.length,
    chunkChars: chunks.reduce((total, chunk) => total + chunk.text.length, 0),
    aliasCount: Object.keys(aliases).length,
  };
  const shared = { meta, build, campuses, places, services, departments, sources, mapFeatures };
  const browserContent = `// 由 scripts/build-shared-knowledge.mjs 生成，请勿手改。\nwindow.SHARED_KNOWLEDGE = ${JSON.stringify(shared, null, 2)};\n`;
  const agentContent = [
    "// 由 ../scripts/build-shared-knowledge.mjs 生成，请勿手改。",
    `export const SHARED_KNOWLEDGE_BUILD = Object.freeze(${JSON.stringify(build, null, 2)});`,
    `export const SHARED_CAMPUSES = Object.freeze(${JSON.stringify(campuses, null, 2)});`,
    `export const SHARED_SOURCES = Object.freeze(${JSON.stringify(sources, null, 2)});`,
    `export const SHARED_PLACES = Object.freeze(${JSON.stringify(places, null, 2)});`,
    `export const SHARED_SERVICES = Object.freeze(${JSON.stringify(services, null, 2)});`,
    `export const SHARED_DEPARTMENTS = Object.freeze(${JSON.stringify(departments, null, 2)});`,
    `export const SHARED_CHUNKS = Object.freeze(${JSON.stringify(chunks, null, 2)});`,
    `export const SHARED_ALIASES = Object.freeze(${JSON.stringify(aliases, null, 2)});`,
    `export const SHARED_MAP_FEATURES = Object.freeze(${JSON.stringify(mapFeatures, null, 2)});`,
    "",
  ].join("\n");
  const outputs = [
    { file: path.join(projectRoot, "data", "shared-knowledge.js"), content: browserContent },
    { file: path.join(projectRoot, "agent", "data", "shared-knowledge.mjs"), content: agentContent },
  ];

  if (checkOnly) {
    const stale = [];
    for (const output of outputs) {
      let current = "";
      try { current = await readFile(output.file, "utf8"); } catch { current = ""; }
      if (current !== output.content) stale.push(path.relative(projectRoot, output.file));
    }
    if (stale.length) throw new Error(`生成文件缺失或已过期：${stale.join("、")}。请运行 node scripts/build-shared-knowledge.mjs`);
  } else {
    for (const output of outputs) {
      await mkdir(path.dirname(output.file), { recursive: true });
      await writeFile(output.file, output.content, "utf8");
    }
  }
  console.log(`统一知识库校验通过：${build.placeCount} 个地点、${build.serviceCount} 项服务、${build.departmentCount} 个部门、${build.departmentUnitCount} 个科室/业务单元、${build.sourceCount} 个来源、${build.chunkCount} 个检索页${checkOnly ? "（生成物已同步）" : "（已生成双端数据）"}`);
}

await main();
