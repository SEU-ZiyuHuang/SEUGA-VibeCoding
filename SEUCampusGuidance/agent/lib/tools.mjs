// 工具定义与执行。
//
// 知识库是页面化结构：2025 新生指南与官方统一知识库共用同一检索接口。
//
// 检索层已经内置了别名兜底（字面 0 命中时自动把口语词补成指南用词），所以工具描述里
// 不再说「没有同义扩展」——那是假话了。但改写引导仍然保留：别名表覆盖不了所有说法，
// 模型自己会换词依然是最后一道保险。
//
// list_sections 现在返回标题 + 摘要，等于把整个校区的 wiki 索引一次性给模型看，
// 它不用再拿光秃秃的标题猜哪一节可能有答案。

import { createRetriever } from "./retrieve.mjs";
import { CAMPUS_SLUGS, campusName, isCampusSlug } from "./campus.mjs";

const CAMPUS_DESCRIPTION = `校区 slug，可选值：${CAMPUS_SLUGS.join("、")}。`;

export const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_guide",
      description: [
        "在东南大学校园知识库中检索：既包括六校区《新生实用信息简明指南》，也包括经校内官网核验的建筑介绍和办事信息。",
        "这是你获取校园事实的唯一途径：宿舍、食堂、建筑校史、办事地点、图书馆、体育场馆、快递外卖、医疗、交通与周边商业，都必须先检索再回答。",
        "检索以字面子串匹配为主，另有一层口语词兜底（字面查不到时会自动把「剪头发」这类说法补成「理发」）。",
        "但兜底覆盖不全，返回为空或不相关时不要放弃，换成指南里更可能出现的书面词再检一次，例如：",
        "「洗澡」→「浴室 热水」；「网速」→「校园网 宽带」；「床帘多大」→「床铺 尺寸」；「怎么去机场」→「机场 禄口」。",
        "一次只能检索一个校区。跨校区问题请分别检索。",
      ].join("\n"),
      parameters: {
        type: "object",
        properties: {
          campus: { type: "string", enum: CAMPUS_SLUGS, description: `${CAMPUS_DESCRIPTION}用户锁定校区时必须用锁定值。` },
          query: {
            type: "string",
            description: "检索词，空格分隔 2—5 个关键词，用地点名／设施名／线路名这类名词，不要写整句问题。例：「梅园 床铺 尺寸」「兰台线 节假日 时刻」「近邻宝 快递」。",
          },
          top_k: { type: "integer", minimum: 1, maximum: 6, description: "返回章节数，默认 3；问题宽泛时可给 5—6。" },
        },
        required: ["campus", "query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_sections",
      description: "列出某校区 wiki 的全部页面：标题 + 一句话摘要（不含正文）。摘要里写了该页最关键的具体事实，据此就能判断该翻哪一页。用于两种场景：① 连续检索未命中，需要确认该校区覆盖了哪些主题；② 用户问题很宽泛（「这个校区有什么」）。拿到索引后用 read_section 按 id 取正文。",
      parameters: {
        type: "object",
        properties: { campus: { type: "string", enum: CAMPUS_SLUGS, description: CAMPUS_DESCRIPTION } },
        required: ["campus"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_section",
      description: "按页面 id 读取整页原文，返回值末尾会附上该页的「相关页面」。用于 list_sections 之后精确取用、search_guide 结果需要补全，或顺着相关页面补充上下文。",
      parameters: {
        type: "object",
        properties: {
          section_id: { type: "string", description: "形如 jiulonghu/shuttle-lantai-line 的页面 id，来自 search_guide、list_sections 或某页的「相关页面」。" },
        },
        required: ["section_id"],
      },
    },
  },
];

/**
 * 工具参数容错。模型可能给出非法 JSON、幻觉的校区、空 query——这些都不该让整轮失败。
 */
export function safeParseArgs(raw, { campus, message }) {
  let args = {};
  const text = typeof raw === "string" ? raw : JSON.stringify(raw ?? {});
  try {
    args = JSON.parse(text || "{}");
  } catch {
    const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
    try {
      args = JSON.parse(cleaned);
    } catch {
      args = {};
    }
  }
  if (typeof args !== "object" || args === null) args = {};
  if (!isCampusSlug(args.campus)) args.campus = campus;
  if (typeof args.query !== "string" || !args.query.trim()) args.query = message;
  args.top_k = Math.min(Math.max(Number(args.top_k) || 3, 1), 6);
  return args;
}

function sourceDescriptor(chunk) {
  if (chunk.managed && chunk.sourceLabel) {
    return `运营来源 ${chunk.sourceLabel}${chunk.verifiedAt ? ` · 核验 ${chunk.verifiedAt}` : ""}`;
  }
  if (chunk.official) {
    return `官方来源 ${chunk.sourceLabel || "东南大学官网"}${chunk.verifiedAt ? ` · 核验 ${chunk.verifiedAt}` : ""}`;
  }
  return `源图 ${chunk.pages.join("、") || "无标注"}`;
}

/** 把检索结果渲染成给模型看的纯文本。已给过的章节只回标题，省掉重复的输入 token。 */
export function renderSearchResult(hits, { campus, query, seen, retriever = createRetriever() }) {
  const total = retriever.countChunks(campus);
  if (!hits.length) {
    return [
      `未命中：检索词「${query}」在${campusName(campus)}知识库中没有匹配到任何章节。`,
      `该校区共 ${total} 个页面：`,
      ...retriever.listSections(campus).map((section) =>
        `  - ${section.sectionPath}（id=${section.id}）${section.summary ? `：${section.summary}` : ""}`),
      "请换用知识库更可能使用的正式名称再检一次，或改检其他校区。",
    ].join("\n");
  }
  const blocks = hits.map((hit, index) => {
    const head = `【${index + 1}】${hit.campusName} · ${hit.version} · ${hit.sectionPath} · ${sourceDescriptor(hit)} · id=${hit.id}`
      + (hit.summary ? `\n摘要：${hit.summary}` : "");
    if (seen.has(hit.id)) return `${head}\n（此节正文已在前一次检索中提供，不再重复）`;
    seen.set(hit.id, hit);
    return `${head}\n${hit.text}`;
  });
  return `${blocks.join("\n\n")}\n\n（命中 ${hits.length}/${total} 个章节；若未覆盖所需信息，请换关键词再检一次。）`;
}

/**
 * 执行一次工具调用。
 * 返回 { text, hits }：text 给模型，hits 用于服务端确定性生成 sources。
 */
export function executeTool(name, args, context) {
  const { seen, calls, budget, retriever = createRetriever() } = context;

  // 同参数重复调用是死循环的前兆，直接劝退。
  const signature = `${name}:${JSON.stringify(args)}`;
  if (calls.has(signature)) {
    return { text: "你刚刚用完全相同的参数检索过，结果见上文。请换关键词、换校区，或直接基于已有内容作答。", hits: [] };
  }
  calls.add(signature);

  if (budget.remaining <= 0) {
    return { text: "检索内容已达上限。请基于上文已有资料作答，缺失部分说明指南未覆盖。", hits: [] };
  }

  if (name === "search_guide") {
    const hits = retriever.searchGuide({ campus: args.campus, query: args.query, topK: args.top_k });
    const text = renderSearchResult(hits, { campus: args.campus, query: args.query, seen, retriever });
    budget.remaining -= text.length;
    return { text, hits };
  }

  if (name === "list_sections") {
    const sections = retriever.listSections(args.campus);
    const text = [
      `${campusName(args.campus)}知识库共 ${sections.length} 个页面：`,
      ...sections.map((section) =>
        `  - ${section.sectionPath}（id=${section.id}）${section.summary ? `\n      ${section.summary}` : ""}`),
      "按 id 用 read_section 取整页正文，或用 search_guide 检索关键词。",
    ].join("\n");
    budget.remaining -= text.length;
    return { text, hits: [] };
  }

  if (name === "read_section") {
    const chunk = retriever.getChunk(String(args.section_id || ""));
    if (!chunk) {
      return { text: `没有 id 为「${args.section_id}」的章节。请先用 list_sections 或 search_guide 获取合法 id。`, hits: [] };
    }
    seen.set(chunk.id, chunk);
    const related = retriever.relatedOf(chunk.id);
    const footer = related.length
      ? `\n\n相关页面（需要时用 read_section 打开）：\n${related.map((item) => `  - ${item.sectionPath}（id=${item.id}）`).join("\n")}`
      : "";
    const text = `${chunk.campusName} · ${chunk.version} · ${chunk.sectionPath} · ${sourceDescriptor(chunk)}\n${chunk.text}${footer}`;
    budget.remaining -= text.length;
    return { text, hits: [chunk] };
  }

  return { text: `未知工具「${name}」。可用工具：search_guide、list_sections、read_section。`, hits: [] };
}
