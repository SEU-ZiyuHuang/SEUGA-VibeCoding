// 检索层自检 CLI。这个项目没有测试框架，--suite 就是检索质量的回归基线。
//
//   node scripts/query.mjs jiulonghu "现在橘园有车去无线谷吗"
//   node scripts/query.mjs --suite
//   node scripts/query.mjs --sections jiulonghu

import { searchGuide, listSections, countChunks } from "../lib/retrieve.mjs";
import { CAMPUS_SLUGS, campusName, detectCampus, DEFAULT_CAMPUS } from "../lib/campus.mjs";

// expect 为正则时断言 top1 的 **chunk id** 必须匹配；为 null 时断言应当 0 命中。
//
// 断言 id 而不是标题：id 是 wiki 的语义 slug（suzhou/dorm-and-utilities），改标题不会漂；
// 标题是模型生成的元数据，人工复核时随时可能被润色，拿它当基线会天天误报。
// 从前「剪头发」这类口语查询是故意断言 0 命中的——单轮检索答不了，只能靠模型换词重检。
// wiki 化之后检索层有了别名兜底（字面 0 命中才启用），这类查询现在应当直接命中，
// 所以断言从「0 命中」翻成了「命中正确页面」。这是 lib/retrieve.mjs 里那条兜底路径的回归基线。
const SUITE = [
  { campus: "jiulonghu", query: "现在橘园有车去无线谷吗", expect: /shuttle-wireless-valley-line/ },
  { campus: "jiulonghu", query: "梅园的床帘要买多大", expect: /dormitor|source-differences/ },
  { campus: "jiulonghu", query: "兰台线节假日几点有车", expect: /shuttle-lantai-line/ },
  { campus: "jiulonghu", query: "图书馆的插座多不多", expect: /library/ },
  { campus: "jiulonghu", query: "理发", expect: /dormitor|commercial|services/ },
  { campus: "jiulonghu", query: "哪里能剪头发", expect: /dormitor|commercial|services/ },
  { campus: "jiulonghu", query: "网速怎么样", expect: /campus-map|library|dormitor/ },
  { campus: "sipailou", query: "在哪洗澡", expect: /dorm/ },
  { campus: "wuxi", query: "校园卡丢了", expect: /card/ },
  { campus: "sipailou", query: "沙塘园的快递寄到哪", expect: /delivery/ },
  { campus: "sipailou", query: "图书馆几点关门", expect: /library/ },
  { campus: "sipailou", query: "文昌11舍是几人间", expect: /dorm/ },
  { campus: "dingjiaqiao", query: "从丁家桥去九龙湖怎么走", expect: /intercampus|metro/ },
  { campus: "dingjiaqiao", query: "求恩4舍有独立卫浴吗", expect: /dormitor/ },
  { campus: "wuxi", query: "无人小巴几点发车", expect: /autonomous|shuttle/ },
  { campus: "wuxi", query: "榴园食堂供餐时间", expect: /canteen/ },
  { campus: "suzhou", query: "水电费怎么交", expect: /dorm-and-utilities/ },
  { campus: "jiangbei", query: "桃园宿舍床多大", expect: /dormitory/ },
  { campus: "jiangbei", query: "怎么去禄口机场", expect: /stations-airport/ },
];

const args = process.argv.slice(2);

function printHits(hits) {
  if (!hits.length) {
    console.log("  （0 命中）");
    return;
  }
  for (const [index, hit] of hits.entries()) {
    console.log(`  ${index + 1}. [${String(hit.score).padStart(7)}] ${hit.sectionPath}`);
    console.log(`     id=${hit.id} pages=${hit.pages.join("、") || "无"} ${hit.text.length}字`);
  }
}

if (args[0] === "--suite") {
  let passed = 0;
  const failures = [];
  for (const item of SUITE) {
    const hits = searchGuide({ campus: item.campus, query: item.query, topK: 3 });
    const top = hits[0];
    const ok = item.expect === null ? hits.length === 0 : Boolean(top && item.expect.test(top.id));
    if (ok) passed += 1;
    else failures.push({ item, top });
    const mark = ok ? "✓" : "✗";
    const summary = item.expect === null
      ? (hits.length === 0 ? "0 命中（符合预期）" : `预期 0 命中，实得 ${hits.length}：${top.id}`)
      : (top ? `${top.sectionPath}  [${top.score}]  ${top.id}` : "0 命中");
    console.log(`${mark} ${item.campus.padEnd(12)} ${item.query.padEnd(24)} → ${summary}`);
  }
  console.log(`\n${passed}/${SUITE.length} 通过`);
  if (failures.length) {
    console.log("\n失败项的完整候选：");
    for (const { item } of failures) {
      console.log(`\n【${item.campus}】${item.query}  期望 ${item.expect || "0 命中"}`);
      printHits(searchGuide({ campus: item.campus, query: item.query, topK: 5 }));
    }
  }
  process.exit(failures.length ? 1 : 0);
}

if (args[0] === "--sections") {
  const campus = args[1] || DEFAULT_CAMPUS;
  console.log(`${campusName(campus)} 共 ${countChunks(campus)} 个章节：`);
  for (const section of listSections(campus)) {
    console.log(`  ${section.id.padEnd(20)} ${section.sectionPath}  [${section.pages.join("、") || "无页码"}]`);
  }
  process.exit(0);
}

const [maybeCampus, ...rest] = args;
if (!maybeCampus) {
  console.log("用法：node scripts/query.mjs <校区slug> \"问题\"   |   --suite   |   --sections <校区slug>");
  console.log(`校区：${CAMPUS_SLUGS.join(" / ")}`);
  process.exit(1);
}

const explicit = CAMPUS_SLUGS.includes(maybeCampus);
const query = (explicit ? rest : args).join(" ");
const campus = explicit ? maybeCampus : (detectCampus(query) || DEFAULT_CAMPUS);

console.log(`校区：${campusName(campus)}（${campus}${explicit ? "" : "，自动识别"}）  问题：${query}`);
printHits(searchGuide({ campus, query, topK: 5 }));
