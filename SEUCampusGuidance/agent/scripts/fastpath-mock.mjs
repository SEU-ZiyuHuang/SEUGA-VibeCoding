// 快路径判定的回归基线。
//
// 快路径跳过决策轮 = 模型失去「换个词再检一次」的机会，所以判错的代价是答案质量下降，
// 而不是报错。这类退化没有测试就发现不了——这个文件就是那个测试。
//
// 下面 22 条是人工标注的：「应快」= 预检索已经命中正确章节、再查也是同一节；
// 「应慢」= 宽泛、口语、跨校区、紧急或指南没覆盖，必须留给多轮循环。
// 改 FAST_PATH_MIN_SCORE / FAST_PATH_MIN_MARGIN 之后必须重跑这个。

import { shouldFastPath } from "../lib/agent-loop.mjs";
import { searchGuide } from "../lib/retrieve.mjs";
import { isEmergency } from "../lib/prompt.mjs";

const CASES = [
  // —— 应当走快路径：问题具体，预检索 top1 明显且领先 ——
  { fast: true, campus: "jiulonghu", query: "现在橘园有车去无线谷吗" },
  { fast: true, campus: "jiulonghu", query: "兰台线节假日几点有车" },
  { fast: true, campus: "jiulonghu", query: "图书馆的插座多不多" },
  { fast: true, campus: "sipailou", query: "沙塘园的快递寄到哪" },
  { fast: true, campus: "sipailou", query: "图书馆几点关门" },
  { fast: true, campus: "wuxi", query: "无人小巴几点发车" },
  { fast: true, campus: "wuxi", query: "榴园食堂供餐时间" },
  { fast: true, campus: "jiangbei", query: "桃园宿舍床多大" },
  { fast: true, campus: "jiangbei", query: "怎么去禄口机场" },
  { fast: true, campus: "dingjiaqiao", query: "求恩4舍有独立卫浴吗" },

  // —— 必须走多轮 ——
  { fast: false, campus: "jiulonghu", query: "你好", why: "闲聊，零命中" },
  { fast: false, campus: "jiulonghu", query: "这个校区有什么", why: "宽泛，需要先看目录" },
  { fast: false, campus: "jiulonghu", query: "洗澡", why: "口语词，要改写成「浴室 热水」" },
  { fast: false, campus: "jiulonghu", query: "网速快吗", why: "口语词，要改写成「校园网 宽带」" },
  { fast: false, campus: "jiulonghu", query: "哪里能剪头发", why: "口语词，要改写成「理发」" },
  { fast: false, campus: "jiulonghu", query: "校园卡丢了怎么补办", why: "指南覆盖弱，得多试几次" },
  { fast: false, campus: "dingjiaqiao", query: "从丁家桥去九龙湖怎么走", why: "跨校区" },
  { fast: false, campus: "dingjiaqiao", query: "从丁家桥去九龙湖再去四牌楼", why: "跨校区" },
  { fast: false, campus: "jiulonghu", query: "我同学晕倒了怎么办", why: "紧急问题永远走完整流程" },
  { fast: false, campus: "jiulonghu", query: "梅园的床帘要买多大", why: "得分偏低，宁可保守" },
  { fast: false, campus: "sipailou", query: "文昌11舍是几人间", why: "区分度不足" },
  { fast: false, campus: "suzhou", query: "水电费怎么交", why: "得分偏低，宁可保守" },
];

let failed = 0;

for (const item of CASES) {
  const seed = searchGuide({ campus: item.campus, query: item.query, topK: 3 });
  const actual = shouldFastPath({ message: item.query, seed, emergency: isEmergency(item.query) });
  const ok = actual === item.fast;
  if (!ok) failed += 1;
  const label = `${item.fast ? "应快" : "应慢"} → ${actual ? "快路径" : "多轮"}`;
  const detail = `top1=${seed[0]?.score ?? 0} top2=${seed[1]?.score ?? 0}`;
  console.log(`${ok ? "✓" : "✗"} ${label}  ${detail.padEnd(24)} ${item.campus} 「${item.query}」${item.why ? `（${item.why}）` : ""}`);
}

// 环境变量必须能一键关停——线上出问题时这是唯一的止血手段
process.env.AGENT_FAST_PATH = "0";
const killSeed = searchGuide({ campus: "wuxi", query: "无人小巴几点发车", topK: 3 });
const killed = shouldFastPath({ message: "无人小巴几点发车", seed: killSeed, emergency: false });
if (killed) {
  failed += 1;
  console.log("✗ AGENT_FAST_PATH=0 应当整体关掉快路径");
} else {
  console.log("✓ AGENT_FAST_PATH=0 能整体关掉快路径");
}
delete process.env.AGENT_FAST_PATH;

console.log(failed ? `\n${failed} 项失败` : `\n全部通过（${CASES.length + 1} 项）`);
if (failed) process.exitCode = 1;
