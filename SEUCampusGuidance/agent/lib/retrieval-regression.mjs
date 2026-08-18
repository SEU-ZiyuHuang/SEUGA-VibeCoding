import { createRetriever } from "./retrieve.mjs";

export const RETRIEVAL_CASES = Object.freeze([
  { campus: "jiulonghu", query: "现在橘园有车去无线谷吗", expect: /shuttle-wireless-valley-line/ },
  { campus: "jiulonghu", query: "梅园的床帘要买多大", expect: /dormitor|source-differences/ },
  { campus: "jiulonghu", query: "兰台线节假日几点有车", expect: /shuttle-lantai-line/ },
  { campus: "jiulonghu", query: "图书馆的插座多不多", expect: /library/ },
  { campus: "jiulonghu", query: "理发", expect: /dormitor|commercial|services/ },
  { campus: "jiulonghu", query: "哪里能剪头发", expect: /dormitor|commercial|services/ },
  { campus: "jiulonghu", query: "网速怎么样", expect: /department-information-center|campus-map|library|dormitor/ },
  { campus: "sipailou", query: "在哪洗澡", expect: /dorm/ },
  { campus: "wuxi", query: "校园卡丢了", expect: /card/ },
  { campus: "sipailou", query: "沙塘园的快递寄到哪", expect: /delivery/ },
  { campus: "sipailou", query: "图书馆几点关门", expect: /place-library|department-library-department|library-and-classrooms/ },
  { campus: "sipailou", query: "文昌11舍是几人间", expect: /dorm/ },
  { campus: "sipailou", query: "大礼堂是谁设计的", expect: /place-auditorium/ },
  { campus: "sipailou", query: "四牌楼学生证盖章在哪", expect: /service-undergraduate-status-stamp/ },
  { campus: "sipailou", query: "校园卡丢了去哪里补办", expect: /service-campus-card-sipailou/ },
  { campus: "sipailou", query: "查档案要去哪里预约", expect: /service-archives-request/ },
  { campus: "jiulonghu", query: "研究生选课问题找谁咨询", expect: /department-graduate-school/ },
  { campus: "sipailou", query: "因公出国护照在哪里办", expect: /department-international-office/ },
  { campus: "sipailou", query: "大型仪器共享找哪个部门", expect: /department-lab-equipment-office/ },
  { campus: "jiulonghu", query: "基建项目工程管理电话", expect: /department-capital-construction/ },
  { campus: "sipailou", query: "社科项目申报找哪个部门", expect: /department-social-sciences-office/ },
  { campus: "jiulonghu", query: "本科招生咨询电话", expect: /department-undergraduate-admissions/ },
  { campus: "sipailou", query: "体育教务周五在哪里", expect: /department-sports-department/ },
  { campus: "sipailou", query: "校园网账号问题打哪个电话", expect: /department-information-center/ },
  { campus: "jiulonghu", query: "教务处有哪些科室，分别在哪里", expect: /department-academic-affairs/ },
  { campus: "sipailou", query: "教学研究科四牌楼办公室在哪", expect: /department-academic-affairs/ },
  { campus: "jiulonghu", query: "人事服务中心在哪办入职证明", expect: /department-human-resources/ },
  { campus: "sipailou", query: "保卫处消防监管办公室电话", expect: /department-security-office/ },
  { campus: "jiulonghu", query: "设备管理科办公地点", expect: /department-lab-equipment-office/ },
  { campus: "jiulonghu", query: "学科建设与资源配置电话", expect: /department-development-planning/ },
  { campus: "jiulonghu", query: "学生就业指导中心学生咨询电话", expect: /department-student-affairs/ },
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
