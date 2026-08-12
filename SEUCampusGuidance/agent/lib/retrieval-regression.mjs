import { createRetriever } from "./retrieve.mjs";

export const RETRIEVAL_CASES = Object.freeze([
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
]);

export function runRetrievalRegression(knowledge) {
  const retriever = createRetriever(knowledge);
  return RETRIEVAL_CASES.map((item) => {
    const hits = retriever.searchGuide({ campus: item.campus, query: item.query, topK: 3 });
    const top = hits[0] || null;
    return {
      campus: item.campus,
      query: item.query,
      expected: String(item.expect),
      actual: top?.id || null,
      passed: Boolean(top && item.expect.test(top.id)),
    };
  });
}
