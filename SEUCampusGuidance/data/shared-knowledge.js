// 由 scripts/build-shared-knowledge.mjs 生成，请勿手改。
window.SHARED_KNOWLEDGE = {
  "meta": {
    "schemaVersion": 1,
    "contentVersion": "2026.08-campus-3",
    "title": "东南大学校园统一知识库",
    "description": "供校园地图前端与校园 Agent 共用的结构化事实源。覆盖四牌楼主要建筑、高频办事地点，以及学校核心职能部门与下设科室的聚合信息。",
    "verifiedAt": "2026-08-18",
    "maintainers": [
      "SEUGA 项目组"
    ],
    "licenseNote": "校方页面内容仅作事实摘录并保留原始链接；开放地图坐标来自 OpenStreetMap contributors，ODbL 1.0。",
    "freshnessPolicy": {
      "stable": "建筑历史等稳定事实每年复核一次",
      "volatile": "办公时间、电话、窗口地点等易变事实建议每 90 天复核一次",
      "displayRule": "易变事实必须展示核验日期，并提醒以主管部门最新通知为准"
    }
  },
  "build": {
    "schemaVersion": 1,
    "contentVersion": "2026.08-campus-3",
    "generatedAt": "2026-08-18T00:00:00+08:00",
    "verifiedAt": "2026-08-18",
    "campusCount": 3,
    "placeCount": 25,
    "serviceCount": 5,
    "departmentCount": 21,
    "departmentUnitCount": 107,
    "sourceCount": 65,
    "chunkCount": 70,
    "chunkChars": 71637,
    "aliasCount": 469
  },
  "campuses": [
    {
      "id": "sipailou",
      "name": "四牌楼校区",
      "aliases": [
        "四牌楼",
        "老校区",
        "本部"
      ],
      "city": "南京",
      "address": "江苏省南京市玄武区四牌楼2号",
      "summary": "东南大学百年办学历史的重要承载地，拥有大礼堂、孟芳图书馆、梅庵、体育馆等近现代校园建筑。",
      "sourceIds": [
        "sipailou-overview"
      ]
    },
    {
      "id": "jiulonghu",
      "name": "九龙湖校区",
      "aliases": [
        "九龙湖",
        "江宁校区"
      ],
      "city": "南京",
      "address": "江苏省南京市江宁区东南大学路2号",
      "summary": "东南大学主校区，多数校级行政部门在行政楼、纪忠楼、金智楼、大学生活动中心等建筑办公。",
      "sourceIds": [
        "seu-organization-current"
      ]
    },
    {
      "id": "dingjiaqiao",
      "name": "丁家桥校区",
      "aliases": [
        "丁家桥",
        "医学院校区"
      ],
      "city": "南京",
      "address": "江苏省南京市鼓楼区丁家桥87号",
      "summary": "东南大学医学相关教学与服务校区，设有丁家桥校区图书馆等公共服务设施。",
      "sourceIds": [
        "library-contact-current"
      ]
    }
  ],
  "places": [
    {
      "id": "auditorium",
      "campusId": "sipailou",
      "name": "东南大学大礼堂",
      "aliases": [
        "大礼堂",
        "中央大学大礼堂",
        "国立中央大学大礼堂"
      ],
      "category": "landmark",
      "icon": "礼",
      "kind": "历史建筑",
      "location": "四牌楼校区中轴线北端",
      "summary": "四牌楼校区标志性建筑，1931年落成，以西方古典主义立面和文艺复兴风格大穹顶著称。",
      "description": "建筑由英国公和洋行设计，1930年开工，1931年4月落成；后续工程由建筑师卢毓骏续成。1965年，杨廷宝主持在两翼扩建。1994年经校友余纪忠捐资修缮。",
      "history": [
        {
          "year": "1930",
          "text": "工程开工。"
        },
        {
          "year": "1931",
          "text": "4月落成，成为校园中轴线上的核心建筑。"
        },
        {
          "year": "1965",
          "text": "杨廷宝主持扩建两翼。"
        },
        {
          "year": "1994",
          "text": "余纪忠捐资修缮。"
        }
      ],
      "currentUse": "学校重要典礼、会议与文化活动场所；具体开放与活动安排以校内通知为准。",
      "heritage": "国立中央大学旧址组成部分，全国重点文物保护单位相关建筑。",
      "tags": [
        "地标",
        "历史建筑",
        "中央大学旧址",
        "建筑文化"
      ],
      "sourceIds": [
        "history-auditorium",
        "sipailou-overview"
      ],
      "primarySourceId": "history-auditorium",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0580097,
        "lng": 118.7890542,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236944775",
        "verified": false
      }
    },
    {
      "id": "mengfang-library",
      "campusId": "sipailou",
      "name": "孟芳图书馆",
      "aliases": [
        "老图书馆",
        "孟芳图书馆旧址",
        "中央大学孟芳图书馆"
      ],
      "category": "landmark",
      "icon": "史",
      "kind": "历史建筑",
      "location": "四牌楼校区南部",
      "summary": "1923年建成、1924年正式开放的校园历史图书馆，后经扩建形成今日规模。",
      "description": "建筑于1922年奠基、1923年竣工，1924年6月25日开馆，以齐孟芳之名命名。1933年由关颂声、朱彬、杨廷宝等主持扩建。",
      "history": [
        {
          "year": "1922",
          "text": "建筑奠基。"
        },
        {
          "year": "1923",
          "text": "主体建成。"
        },
        {
          "year": "1924",
          "text": "6月25日正式开馆。"
        },
        {
          "year": "1933",
          "text": "实施扩建。"
        }
      ],
      "currentUse": "校史馆资料记载其现作为学校行政办公用房；具体部门分布以现场标识为准。",
      "heritage": "国立中央大学旧址代表建筑之一。",
      "tags": [
        "老图书馆",
        "历史建筑",
        "行政办公",
        "中央大学旧址"
      ],
      "sourceIds": [
        "history-mengfang",
        "sipailou-overview"
      ],
      "primarySourceId": "history-mengfang",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0570575,
        "lng": 118.7884011,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945093",
        "verified": false
      }
    },
    {
      "id": "meian",
      "campusId": "sipailou",
      "name": "梅庵",
      "aliases": [
        "东南大学梅庵"
      ],
      "category": "landmark",
      "icon": "梅",
      "kind": "历史建筑",
      "location": "四牌楼校区西北部、六朝松附近",
      "summary": "为纪念两江师范学堂校长李瑞清而得名的历史建筑，现承载校史与红色文化展陈。",
      "description": "梅庵名称与李瑞清号“梅庵”相关，现存建筑于1933年前后重建，呈现中西合璧的校园建筑风格。",
      "history": [
        {
          "year": "早期",
          "text": "为纪念李瑞清而设梅庵。"
        },
        {
          "year": "1933",
          "text": "由朱葆初主持重建现存建筑。"
        }
      ],
      "currentUse": "设有团二大史料展等校史文化展陈；参观安排以校史馆或现场通知为准。",
      "heritage": "国立中央大学旧址组成部分。",
      "tags": [
        "李瑞清",
        "红色校史",
        "历史建筑",
        "六朝松"
      ],
      "sourceIds": [
        "history-meian",
        "sipailou-overview"
      ],
      "primarySourceId": "history-meian",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0596356,
        "lng": 118.7861645,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/1056854772",
        "verified": false
      }
    },
    {
      "id": "liuchaosong",
      "campusId": "sipailou",
      "name": "六朝松",
      "aliases": [
        "六朝古松"
      ],
      "category": "landmark",
      "icon": "松",
      "kind": "校园古树",
      "location": "四牌楼校区西北部、梅庵旁",
      "summary": "相传已有千余年树龄的校园古树，虽名为松，树种实为桧柏，是东大重要精神文化象征。",
      "description": "六朝松是四牌楼校园历史景观的重要组成。校史馆资料指出其树种实为桧柏，树龄已逾千年。",
      "history": [
        {
          "year": "六朝传说",
          "text": "校园所在地曾为六朝宫苑区域，古树由此得名。"
        },
        {
          "year": "当代",
          "text": "长期作为校园文化象征被保护和讲述。"
        }
      ],
      "currentUse": "校园历史景观与校史导览节点；请勿攀折或进入保护范围。",
      "heritage": "四牌楼校园重要古树与文化景观。",
      "tags": [
        "古树",
        "桧柏",
        "校园文化",
        "梅庵"
      ],
      "sourceIds": [
        "history-liuchaosong"
      ],
      "primarySourceId": "history-liuchaosong",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0594812,
        "lng": 118.7861905,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/node/9707574168",
        "verified": false
      }
    },
    {
      "id": "south-gate",
      "campusId": "sipailou",
      "name": "四牌楼校区南大门",
      "aliases": [
        "南门",
        "南校门",
        "中央大学南大门"
      ],
      "category": "landmark",
      "icon": "门",
      "kind": "历史建筑",
      "location": "四牌楼校区南侧主入口",
      "summary": "1933年建成的校园历史主门，由杨廷宝设计，是四牌楼中轴与城市街区衔接的重要节点。",
      "description": "南大门采用西方古典主义语汇，以方柱门楼形成庄重入口形象，是原中央大学校园总体格局的重要组成。",
      "history": [
        {
          "year": "1933",
          "text": "由杨廷宝设计并建成。"
        }
      ],
      "currentUse": "校园出入口；通行规则、访客预约与开放时段以保卫处及现场公告为准。",
      "heritage": "国立中央大学旧址组成部分。",
      "tags": [
        "校门",
        "杨廷宝",
        "历史建筑",
        "出入口"
      ],
      "sourceIds": [
        "history-south-gate",
        "sipailou-overview"
      ],
      "primarySourceId": "history-south-gate",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0554665,
        "lng": 118.7888365,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945298",
        "verified": false
      }
    },
    {
      "id": "history-museum",
      "campusId": "sipailou",
      "name": "东南大学校史馆",
      "aliases": [
        "校史馆",
        "工艺实习场",
        "精工实习场"
      ],
      "category": "landmark",
      "icon": "史",
      "kind": "校史展馆 / 历史建筑",
      "location": "四牌楼校区原工艺实习场",
      "summary": "校史馆设于1918年建成的工艺实习场，现通过多个展厅呈现学校百余年办学历程。",
      "description": "工艺实习场建于1918年，建筑面积约1000平方米。校史馆现设校史展厅、专题展厅等空间，是了解东南大学历史沿革的重要入口。",
      "history": [
        {
          "year": "1918",
          "text": "工艺实习场建成。"
        },
        {
          "year": "当代",
          "text": "修缮并作为东南大学校史馆使用。"
        }
      ],
      "currentUse": "校史陈列、专题展览与参观接待。常规开放为周二至周日08:30—11:30、14:00—17:00，周一闭馆；寒暑假及特殊日期以校史馆公告为准。",
      "heritage": "国立中央大学旧址组成部分，全国重点文物保护单位相关建筑。",
      "tags": [
        "博物馆",
        "校史",
        "展览",
        "参观"
      ],
      "sourceIds": [
        "history-museum-intro",
        "history-workshop",
        "campus-panorama-2026"
      ],
      "primarySourceId": "history-museum-intro",
      "serviceIds": [
        "history-museum-visit"
      ],
      "coordinate": {
        "lat": 32.0591478,
        "lng": 118.7873016,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237316237",
        "verified": false
      }
    },
    {
      "id": "gym",
      "campusId": "sipailou",
      "name": "四牌楼校区体育馆",
      "aliases": [
        "体育馆",
        "中央大学体育馆"
      ],
      "category": "sports",
      "icon": "体",
      "kind": "历史建筑 / 体育场馆",
      "location": "四牌楼校区西北部、体育场旁",
      "summary": "1923年建成的校园体育建筑，以爱奥尼柱式门廊等西方古典主义特征著称。",
      "description": "体育馆于1922年奠基、1923年完成，建筑面积约2317平方米。其门廊采用古典柱式，是四牌楼历史建筑群的重要组成。",
      "history": [
        {
          "year": "1922",
          "text": "建筑奠基。"
        },
        {
          "year": "1923",
          "text": "建筑落成。"
        }
      ],
      "currentUse": "体育教学与活动场所；具体项目、预约、收费与开放时间以体育部门平台为准。",
      "heritage": "国立中央大学旧址代表建筑之一。",
      "tags": [
        "体育",
        "爱奥尼柱式",
        "历史建筑",
        "预约"
      ],
      "sourceIds": [
        "history-gym",
        "sipailou-overview"
      ],
      "primarySourceId": "history-gym",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0588403,
        "lng": 118.786695,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237316228",
        "verified": false
      }
    },
    {
      "id": "jianxiong",
      "campusId": "sipailou",
      "name": "健雄院",
      "aliases": [
        "科学馆",
        "口字房",
        "江南院"
      ],
      "category": "study",
      "icon": "学",
      "kind": "历史建筑 / 教学空间",
      "location": "四牌楼校区东部",
      "summary": "原中央大学科学馆，1927年建成，1992年以杰出校友吴健雄之名更名为健雄院。",
      "description": "建筑原称口字房、科学馆、江南院，1924年开工、1927年完成，建筑面积约5234平方米。",
      "history": [
        {
          "year": "1924",
          "text": "科学馆工程开工。"
        },
        {
          "year": "1927",
          "text": "建筑竣工。"
        },
        {
          "year": "1992",
          "text": "更名为健雄院。"
        }
      ],
      "currentUse": "校史馆页面记载现为新生学院使用；院系房间与开放情况以现场信息为准。",
      "heritage": "国立中央大学旧址组成部分。",
      "tags": [
        "吴健雄",
        "科学馆",
        "历史建筑",
        "教学"
      ],
      "sourceIds": [
        "history-jianxiong",
        "sipailou-overview"
      ],
      "primarySourceId": "history-jianxiong",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0575652,
        "lng": 118.7901119,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945198",
        "verified": false
      }
    },
    {
      "id": "zhongda",
      "campusId": "sipailou",
      "name": "中大院",
      "aliases": [
        "生物馆",
        "中央大学生物馆"
      ],
      "category": "study",
      "icon": "建",
      "kind": "历史建筑 / 教学空间",
      "location": "四牌楼校区中部偏东",
      "summary": "原中央大学生物馆，1929年始建并于1933年扩建，现为东南大学建筑学院重要教学办公空间。",
      "description": "原生物馆于1929年由李宗侃设计建设，1933年由关颂声、朱彬、杨廷宝等参与改扩建。",
      "history": [
        {
          "year": "1929",
          "text": "原生物馆始建。"
        },
        {
          "year": "1933",
          "text": "实施改建与扩建。"
        }
      ],
      "currentUse": "建筑学院教学与办公空间；访客进入教学办公区域应遵守院系管理要求。",
      "heritage": "国立中央大学旧址组成部分。",
      "tags": [
        "建筑学院",
        "生物馆",
        "历史建筑",
        "教学"
      ],
      "sourceIds": [
        "history-zhongda",
        "sipailou-overview"
      ],
      "primarySourceId": "history-zhongda",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0570241,
        "lng": 118.7892935,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237202797",
        "verified": false
      }
    },
    {
      "id": "wu-memorial",
      "campusId": "sipailou",
      "name": "吴健雄纪念馆",
      "aliases": [
        "吴健雄馆",
        "吴健雄纪念馆"
      ],
      "category": "landmark",
      "icon": "吴",
      "kind": "纪念馆",
      "location": "大礼堂西南侧",
      "summary": "纪念杰出物理学家、东南大学校友吴健雄的专题纪念馆，2002年落成开放。",
      "description": "纪念馆由高民权设计，地上三层并设地下一层，于2002年落成开放，空间用于陈列吴健雄生平与科学贡献。",
      "history": [
        {
          "year": "2002",
          "text": "纪念馆建成并开放。"
        }
      ],
      "currentUse": "人物纪念与科学文化展示；参观安排以学校或场馆最新公告为准。",
      "heritage": "四牌楼校园当代纪念性建筑。",
      "tags": [
        "吴健雄",
        "物理学",
        "纪念馆",
        "校友"
      ],
      "sourceIds": [
        "history-wu-memorial"
      ],
      "primarySourceId": "history-wu-memorial",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0575528,
        "lng": 118.78823,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945199",
        "verified": false
      }
    },
    {
      "id": "wusi-building",
      "campusId": "sipailou",
      "name": "五四楼",
      "aliases": [
        "四牌楼五四楼",
        "五四楼北门"
      ],
      "category": "office",
      "icon": "办",
      "kind": "行政与服务建筑",
      "location": "四牌楼校区南部",
      "summary": "四牌楼校园卡服务台和自助补卡机所在建筑。",
      "description": "五四楼承载多项行政与生活服务。校园卡服务台位于一楼西侧，自助补卡机位于北门附近。",
      "history": [],
      "currentUse": "行政办公与校园卡服务。",
      "heritage": "",
      "tags": [
        "校园卡",
        "补卡",
        "行政服务"
      ],
      "sourceIds": [
        "campus-card-guide"
      ],
      "primarySourceId": "campus-card-guide",
      "serviceIds": [
        "campus-card-sipailou"
      ],
      "coordinate": {
        "lat": 32.0557574,
        "lng": 118.7882844,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945197",
        "verified": false
      }
    },
    {
      "id": "microwave-building",
      "campusId": "sipailou",
      "name": "微波楼",
      "aliases": [
        "四牌楼微波楼",
        "微波楼100",
        "微波楼104"
      ],
      "category": "office",
      "icon": "办",
      "kind": "教学与行政建筑",
      "location": "四牌楼校区东部",
      "summary": "教务处学籍管理科在四牌楼办理学生证、成绩单盖章等事项的窗口所在地。",
      "description": "微波楼设有教务、财务等相关办事点。不同事项对应房间和开放时段不同，前往前应先核对主管部门页面。",
      "history": [],
      "currentUse": "教学、办公与部分行政窗口。",
      "heritage": "",
      "tags": [
        "教务",
        "学籍",
        "盖章",
        "财务"
      ],
      "sourceIds": [
        "undergraduate-status-office"
      ],
      "primarySourceId": "undergraduate-status-office",
      "serviceIds": [
        "undergraduate-status-stamp"
      ],
      "coordinate": {
        "lat": 32.0575418,
        "lng": 118.7906947,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237445909",
        "verified": false
      }
    },
    {
      "id": "archives-building",
      "campusId": "sipailou",
      "name": "东南大学档案馆",
      "aliases": [
        "档案馆",
        "四牌楼档案馆"
      ],
      "category": "office",
      "icon": "档",
      "kind": "档案服务建筑",
      "location": "四牌楼校区档案馆楼",
      "summary": "学校档案保管、利用、编研与专门档案服务所在地，可通过网上办事大厅提前预约。",
      "description": "档案馆在四牌楼设办公室、收集指导部、保管利用部、信息技术与编研部及专门档案部等房间。",
      "history": [],
      "currentUse": "档案查询、利用与管理服务。",
      "heritage": "",
      "tags": [
        "查档",
        "档案",
        "预约",
        "证明"
      ],
      "sourceIds": [
        "archives-service",
        "archives-online-hall"
      ],
      "primarySourceId": "archives-online-hall",
      "serviceIds": [
        "archives-request"
      ],
      "coordinate": {
        "lat": 32.0562638,
        "lng": 118.7880968,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/node/9711688992",
        "verified": false
      }
    },
    {
      "id": "security",
      "campusId": "sipailou",
      "name": "四牌楼校区保卫处",
      "aliases": [
        "保卫处",
        "保卫楼",
        "户籍科",
        "沙塘园保卫楼"
      ],
      "category": "office",
      "icon": "安",
      "kind": "校园安全与户籍服务",
      "location": "沙塘园保卫楼",
      "summary": "承担四牌楼校区校园安全、报警联络和户籍相关服务。",
      "description": "四牌楼校区报警电话为025-83790110，户籍服务电话为025-83792086。户籍科房间参考为沙塘园保卫楼102，前往前建议电话确认。",
      "history": [],
      "currentUse": "校园安全、报警联络与户籍服务。",
      "heritage": "",
      "tags": [
        "校园安全",
        "报警",
        "户籍",
        "保卫处"
      ],
      "sourceIds": [
        "security-office-current",
        "security-room-reference"
      ],
      "primarySourceId": "security-office-current",
      "serviceIds": [
        "household-registration-sipailou"
      ],
      "coordinate": {
        "lat": 32.0551936,
        "lng": 118.7887996,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/404071180",
        "verified": false
      }
    },
    {
      "id": "zhongshan",
      "campusId": "sipailou",
      "name": "中山院",
      "aliases": [
        "中二院",
        "四牌楼中山院"
      ],
      "category": "study",
      "icon": "教",
      "kind": "历史沿革教学楼",
      "location": "四牌楼校区东南部、东南院西侧",
      "summary": "院址可追溯至1922年建成的中二院，现有建筑于1983年落成，是四牌楼主要教学楼之一。",
      "description": "中山院院址原为南京高等师范学校附属中学的中二院。中央大学时期，为纪念国立第四中山大学校名并表达对孙中山的敬意，建筑被命名为中山院。原楼于1982年拆除，次年完成重建，校史馆记载建筑面积7433平方米。",
      "history": [
        {
          "year": "1922",
          "text": "原中二院建成，最初作为附属中学教学楼。"
        },
        {
          "year": "中央大学时期",
          "text": "命名为中山院。"
        },
        {
          "year": "1982—1983",
          "text": "原楼拆除并在次年完成重建。"
        }
      ],
      "currentUse": "学校主要教学楼之一，承担课程、考试和校内活动；教室安排以课程表或当期通知为准。",
      "heritage": "现建筑延续了中山院的历史名称与校园教学功能，原址是四牌楼校园教育史的重要节点。",
      "tags": [
        "教学楼",
        "教室",
        "考试",
        "中二院"
      ],
      "sourceIds": [
        "history-zhongshan",
        "campus-panorama-2026"
      ],
      "primarySourceId": "history-zhongshan",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0556865,
        "lng": 118.7894311,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945297",
        "verified": false
      }
    },
    {
      "id": "dongnan",
      "campusId": "sipailou",
      "name": "东南院",
      "aliases": [
        "中一院",
        "四牌楼东南院"
      ],
      "category": "study",
      "icon": "教",
      "kind": "历史沿革教学楼",
      "location": "四牌楼校区东南角、中山院东侧",
      "summary": "院址原为1919年建成的中一院，曾为中央大学法学院所在地，现有建筑于1983年落成。",
      "description": "东南院因曾用校名和所在方位得名。院址原为中一院，1932至1937年间曾作为中央大学法学院教学空间。1952年后继续作教学用房，1982年拆除重建，次年落成。校史馆记载现建筑面积2799平方米，并通过平台与中山院相连。",
      "history": [
        {
          "year": "1919",
          "text": "原中一院建成。"
        },
        {
          "year": "1932—1937",
          "text": "中央大学法学院设于此。"
        },
        {
          "year": "1982—1983",
          "text": "原楼拆除并完成重建。"
        }
      ],
      "currentUse": "教学、办公及建筑学院相关活动空间；具体教室和活动安排以院系通知为准。",
      "heritage": "东南院之名承载了东南大学与中央大学时期的校园教育历史。",
      "tags": [
        "教学楼",
        "建筑学院",
        "法学院旧址",
        "中一院"
      ],
      "sourceIds": [
        "history-dongnan",
        "campus-panorama-2026"
      ],
      "primarySourceId": "history-dongnan",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.055662,
        "lng": 118.7901552,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236946061",
        "verified": false
      }
    },
    {
      "id": "qiangong",
      "campusId": "sipailou",
      "name": "前工院",
      "aliases": [
        "旧工院",
        "四牌楼前工院"
      ],
      "category": "study",
      "icon": "工",
      "kind": "历史沿革教学楼",
      "location": "四牌楼校区东部教学区",
      "summary": "初建于1929年，1957年定名前工院，现有建筑于1987年重建后成为主要教学楼。",
      "description": "前工院最初是中央大学时期的两层教学楼。抗战胜利后因工科快速发展划归工学院使用，南京工学院时期曾称旧工院，1957年命名为前工院。原建筑于1987年拆除重建，校史馆记载现建筑面积10700平方米。",
      "history": [
        {
          "year": "1929",
          "text": "初建为两层教学楼。"
        },
        {
          "year": "1957",
          "text": "正式命名为前工院。"
        },
        {
          "year": "1987",
          "text": "拆除原楼并完成重建。"
        }
      ],
      "currentUse": "学校主要教学楼之一；教室与开放安排以课程表和现场管理为准。",
      "heritage": "名称保留了中央大学工学院及南京工学院办学阶段的历史记忆。",
      "tags": [
        "教学楼",
        "工学院",
        "旧工院",
        "课堂"
      ],
      "sourceIds": [
        "history-qiangong"
      ],
      "primarySourceId": "history-qiangong",
      "serviceIds": []
    },
    {
      "id": "nangao",
      "campusId": "sipailou",
      "name": "南高院",
      "aliases": [
        "一字房",
        "南京高等师范学校校部"
      ],
      "category": "landmark",
      "icon": "南",
      "kind": "历史建筑 / 科研办公空间",
      "location": "四牌楼校区西南部",
      "summary": "始建于三江师范学堂时期、1904年落成，曾长期作为学校行政中枢，是校史延续最久的建筑节点之一。",
      "description": "南高院原名一字房，早期建筑东西两层、中部三层，居中钟楼四层。1933年修缮后以南京高等师范学校简称命名。南高、国立东南大学及中央大学初期，校长室长期设于此；1963年再次改建。",
      "history": [
        {
          "year": "1904",
          "text": "三江师范学堂时期的一字房落成。"
        },
        {
          "year": "1933",
          "text": "修缮并以南京高等师范学校历史命名为南高院。"
        },
        {
          "year": "1963",
          "text": "再次改建。"
        }
      ],
      "currentUse": "科研与办公用房，进入具体办公区域应遵守所在单位管理要求。",
      "heritage": "承载三江、两江、南高、东大、中大及南京工学院多个办学阶段的行政与教育记忆。",
      "tags": [
        "三江师范",
        "南京高师",
        "一字房",
        "科研办公"
      ],
      "sourceIds": [
        "history-nangao",
        "sipailou-overview"
      ],
      "primarySourceId": "history-nangao",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0575278,
        "lng": 118.7872441,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237174543",
        "verified": false
      }
    },
    {
      "id": "jinling",
      "campusId": "sipailou",
      "name": "金陵院",
      "aliases": [
        "中央大学牙症医院",
        "牙科医院旧址"
      ],
      "category": "landmark",
      "icon": "金",
      "kind": "历史建筑 / 教学科研空间",
      "location": "四牌楼校区东北部",
      "summary": "杨廷宝设计的原中央大学牙症医院教学实习大楼，1937年落成，现用于教学科研。",
      "description": "金陵院于1935年筹建、1937年落成，1960年加建西翼。建筑采用混凝土板梁结构和青砖清水墙，最初集教室、实验室与牙科诊疗室于一体。",
      "history": [
        {
          "year": "1935",
          "text": "原中央大学牙症医院教学实习大楼开始筹建。"
        },
        {
          "year": "1937",
          "text": "建筑落成。"
        },
        {
          "year": "1960",
          "text": "加建西翼。"
        }
      ],
      "currentUse": "教学科研用房；具体院系和房间以现场标识为准。",
      "heritage": "杨廷宝校园建筑作品，也是中央大学医学教育历史的空间见证。",
      "tags": [
        "杨廷宝",
        "牙科医院旧址",
        "历史建筑",
        "教学科研"
      ],
      "sourceIds": [
        "history-jinling",
        "sipailou-overview"
      ],
      "primarySourceId": "history-jinling",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0583338,
        "lng": 118.7904275,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237445911",
        "verified": false
      }
    },
    {
      "id": "yifu-architecture",
      "campusId": "sipailou",
      "name": "逸夫建筑馆",
      "aliases": [
        "建筑馆",
        "四牌楼逸夫建筑馆"
      ],
      "category": "study",
      "icon": "建",
      "kind": "教学、科研与行政建筑",
      "location": "四牌楼校区东部、群贤楼附近",
      "summary": "由邵逸夫捐资兴建、总建筑面积近1.7万平方米的建筑学院与研究生院相关办公教学建筑。",
      "description": "逸夫建筑馆由香港爱国人士邵逸夫捐资兴建，是四牌楼校区重要的教学办公建筑。除建筑学科教学与科研空间外，研究生院招生、培养、学位和综合办公室也分布在一至二层。",
      "history": [
        {
          "year": "建设时期",
          "text": "由邵逸夫捐资兴建。"
        }
      ],
      "currentUse": "建筑学院教学科研，以及研究生院多个科室办公；访问行政办公室前请核对楼层和房间。",
      "heritage": "体现社会捐赠支持高校教学科研设施建设的代表性校园建筑。",
      "tags": [
        "建筑学院",
        "研究生院",
        "招生",
        "培养",
        "学位"
      ],
      "sourceIds": [
        "yifu-architecture-building",
        "graduate-school-contact"
      ],
      "primarySourceId": "yifu-architecture-building",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0569774,
        "lng": 118.7903233,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236945039",
        "verified": false
      }
    },
    {
      "id": "library",
      "campusId": "sipailou",
      "name": "四牌楼校区图书馆",
      "aliases": [
        "四牌楼图书馆",
        "东大本部图书馆",
        "新图书馆"
      ],
      "category": "study",
      "icon": "书",
      "kind": "图书馆 / 学习空间",
      "location": "四牌楼校区中西部、孟芳图书馆西侧",
      "summary": "提供借还、馆藏阅览、期刊、自修、协作学习、查收查引等服务，主要空间通常开放至22:00。",
      "description": "四牌楼校区图书馆面向师生提供综合流通、阅览与学习支持。一楼设总服务台、自助借还、打印复印和协作学习空间；楼内分布自修室、中文书库、期刊阅览室、教育部外国教材中心及学科咨询中心等。",
      "history": [],
      "currentUse": "借还书、馆藏阅览、自修、打印复印、原文传递、查收查引与学科咨询。常规开放时间和寒暑假安排可能变化。",
      "heritage": "与孟芳图书馆共同构成四牌楼校区延续百年的图书馆空间体系。",
      "tags": [
        "自习",
        "借还书",
        "打印",
        "查收查引",
        "期刊"
      ],
      "sourceIds": [
        "library-open-current",
        "library-contact-current",
        "history-mengfang"
      ],
      "primarySourceId": "library-open-current",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0565081,
        "lng": 118.7882121,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/relation/6989378",
        "verified": false
      }
    },
    {
      "id": "stadium",
      "campusId": "sipailou",
      "name": "四牌楼校区体育场",
      "aliases": [
        "四牌楼体育场",
        "榴园体育场",
        "田径场"
      ],
      "category": "sports",
      "icon": "场",
      "kind": "室外体育场地",
      "location": "四牌楼校区西北部、体育馆东南侧",
      "summary": "四牌楼主要室外田径与校园体育活动场地，开放需服从体育教学、训练和活动安排。",
      "description": "体育场承担跑步、田径教学、训练和校内活动。体育系同时管理四牌楼体育馆、教务和群体活动；场地临时封闭、课程占用和开放规则以体育系或现场公告为准。",
      "history": [],
      "currentUse": "田径教学、日常锻炼、训练和大型校园活动。",
      "heritage": "与1923年落成的历史体育馆共同构成四牌楼传统体育空间。",
      "tags": [
        "跑步",
        "田径",
        "操场",
        "体育教学"
      ],
      "sourceIds": [
        "sports-contact-current",
        "history-gym"
      ],
      "primarySourceId": "sports-contact-current",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0584945,
        "lng": 118.7871944,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/236874028",
        "verified": false
      }
    },
    {
      "id": "campus-hospital",
      "campusId": "sipailou",
      "name": "东南大学医院四牌楼医疗点",
      "aliases": [
        "四牌楼校医院",
        "校医院",
        "成贤街82号医疗点"
      ],
      "category": "medical",
      "icon": "医",
      "kind": "校园医疗服务建筑",
      "location": "四牌楼校区东南侧、成贤街82号",
      "summary": "提供校内医疗、急诊、药房、检验、预防保健和学生医保等服务，急诊电话025-83795462。",
      "description": "四牌楼医疗点设有行政、学生医保与公费医疗、预防保健、检验、急诊和药房等服务。不同业务分布在不同楼层，门诊、报销和节假日服务时间可能调整。",
      "history": [],
      "currentUse": "校内基本医疗、急诊联络、药房、检验、预防保健与医保相关服务。紧急情况应优先拨打120。",
      "heritage": "校园公共服务设施。",
      "tags": [
        "看病",
        "急诊",
        "药房",
        "医保",
        "预防保健"
      ],
      "sourceIds": [
        "hospital-contact-current"
      ],
      "primarySourceId": "hospital-contact-current",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0539806,
        "lng": 118.7908406,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237318480",
        "verified": false
      }
    },
    {
      "id": "alumni-hall",
      "campusId": "sipailou",
      "name": "中大校友会堂",
      "aliases": [
        "校友会堂",
        "四牌楼校友会堂",
        "校友总会"
      ],
      "category": "office",
      "icon": "友",
      "kind": "校友服务与活动建筑",
      "location": "四牌楼校区西南部、动力楼西侧",
      "summary": "校友总会在四牌楼开展校友服务、返校接待与活动的重要场所。",
      "description": "中大校友会堂承载校友总会线下服务和校友活动。校友卡领取、返校活动等具体事项会随批次和日期调整，应先查看校友总会最新通知或邮件确认。",
      "history": [],
      "currentUse": "校友联络、返校接待、校友卡等阶段性服务及校友活动。",
      "heritage": "名称延续中央大学与东南大学校友共同体的历史联系。",
      "tags": [
        "校友",
        "校友卡",
        "返校",
        "活动"
      ],
      "sourceIds": [
        "alumni-card-hall"
      ],
      "primarySourceId": "alumni-card-hall",
      "serviceIds": [],
      "coordinate": {
        "lat": 32.0558511,
        "lng": 118.7876297,
        "system": "WGS84",
        "sourceId": "openstreetmap",
        "sourceUrl": "https://www.openstreetmap.org/way/237175533",
        "verified": false
      }
    },
    {
      "id": "asia-architecture-archive",
      "campusId": "sipailou",
      "name": "东南大学亚洲建筑档案中心",
      "aliases": [
        "亚洲建筑档案中心",
        "建筑档案中心"
      ],
      "category": "landmark",
      "icon": "藏",
      "kind": "专业档案与展览空间",
      "location": "四牌楼校区南高院南侧历史平房区域",
      "summary": "2020年成立并利用校园历史平房修缮建设的专业建筑档案机构，兼具收藏、研究、展览和学术交流功能。",
      "description": "中心启动空间由1939年前后形成的校园平房修缮而来，室内以建筑图纸、照片、书籍和模型等档案材料为核心。其建设既保留历史建筑痕迹，也为亚洲建筑史料的保存、研究和公共展示提供空间。",
      "history": [
        {
          "year": "1939前后",
          "text": "所在平房区域在校园历史变迁中形成。"
        },
        {
          "year": "2020",
          "text": "东南大学成立亚洲建筑档案中心并启动修缮利用。"
        }
      ],
      "currentUse": "建筑档案收藏、整理、研究、专题展览与学术活动；展览开放日期以建筑学院公告为准。",
      "heritage": "以适应性修缮方式激活校园历史建筑，同时保存亚洲建筑学术档案。",
      "tags": [
        "建筑档案",
        "展览",
        "建筑学院",
        "历史修缮"
      ],
      "sourceIds": [
        "asia-architecture-archive-history"
      ],
      "primarySourceId": "asia-architecture-archive-history",
      "serviceIds": []
    }
  ],
  "services": [
    {
      "id": "history-museum-visit",
      "campusId": "sipailou",
      "title": "参观东南大学校史馆",
      "aliases": [
        "校史馆开放时间",
        "校史馆预约",
        "参观校史馆"
      ],
      "category": "visit",
      "summary": "在四牌楼校区原工艺实习场参观校史展陈。",
      "placeId": "history-museum",
      "location": "东南大学校史馆（原工艺实习场）",
      "room": "",
      "hours": "周二至周日08:30—11:30、14:00—17:00；周一闭馆。法定节假日通常开放，春节闭馆；寒暑假另行通知。",
      "phones": [
        "025-83795636",
        "025-83795152"
      ],
      "onlineUrl": "",
      "audience": [
        "师生",
        "校友",
        "访客"
      ],
      "materials": [
        "团体或专题参观建议提前电话确认",
        "入校与参观要求以学校和校史馆最新通知为准"
      ],
      "steps": [
        "出发前核对校史馆最新开放通知",
        "按校园访客要求入校",
        "在开放时段前往校史馆参观"
      ],
      "notice": "开放安排属于易变信息，节假日、寒暑假或专题活动期间可能调整。",
      "sourceIds": [
        "history-museum-intro"
      ],
      "primarySourceId": "history-museum-intro",
      "verifiedAt": "2026-08-17",
      "volatile": true
    },
    {
      "id": "campus-card-sipailou",
      "campusId": "sipailou",
      "title": "四牌楼校园卡补换卡与服务",
      "aliases": [
        "校园卡补办",
        "一卡通补办",
        "校园卡丢了",
        "补卡"
      ],
      "category": "campus-card",
      "summary": "学生可在五四楼北门自助补卡；其他类型卡或复杂问题到五四楼一楼西服务台处理。",
      "placeId": "wusi-building",
      "location": "五四楼",
      "room": "自助补卡机：北门；服务台：一楼西",
      "hours": "服务台工作日上午08:00—12:00、下午14:00—18:00；自助设备可用状态以现场为准。",
      "phones": [
        "025-83795043"
      ],
      "onlineUrl": "https://allinonecard.seu.edu.cn/authorjzidsPortalHome.action",
      "audience": [
        "学生",
        "教职工",
        "校内人员"
      ],
      "materials": [
        "学生自助补卡需刷身份证",
        "其他类型卡到服务台时携带身份证件"
      ],
      "steps": [
        "先在校园卡渠道挂失",
        "学生可到五四楼北门自助补卡机刷身份证补卡",
        "非学生卡或异常情况到五四楼一楼西服务台处理"
      ],
      "notice": "补卡设备状态、工本费及假期服务时间以校园卡主管部门最新通知为准。",
      "sourceIds": [
        "campus-card-guide"
      ],
      "primarySourceId": "campus-card-guide",
      "verifiedAt": "2026-08-17",
      "volatile": true
    },
    {
      "id": "undergraduate-status-stamp",
      "campusId": "sipailou",
      "title": "本科生学生证、成绩单盖章与在读证明",
      "aliases": [
        "学生证盖章",
        "成绩单盖章",
        "在读证明",
        "学籍科"
      ],
      "category": "student-status",
      "summary": "四牌楼办理时段为周二、周五下午，地点在微波楼100；其他时间到九龙湖教五办理。",
      "placeId": "microwave-building",
      "location": "四牌楼校区微波楼",
      "room": "100室",
      "hours": "周二下午、周五下午在四牌楼办理；其他时间在九龙湖教五103/104办公。",
      "phones": [
        "025-83792666",
        "025-52090224",
        "025-52090227"
      ],
      "onlineUrl": "",
      "audience": [
        "全日制本科生"
      ],
      "materials": [
        "根据所办事项携带学生证、成绩单或证明材料",
        "特殊证明建议先电话咨询学籍管理科"
      ],
      "steps": [
        "确认事项属于本科生学籍管理科业务",
        "核对当周是否为工作日及是否有临时调整",
        "周二或周五下午到微波楼100办理，其他时间前往九龙湖"
      ],
      "notice": "寒暑假、节假日和集中办理期可能调整，出发前请查看教务处最新通知。",
      "sourceIds": [
        "undergraduate-status-office"
      ],
      "primarySourceId": "undergraduate-status-office",
      "verifiedAt": "2026-08-17",
      "volatile": true
    },
    {
      "id": "archives-request",
      "campusId": "sipailou",
      "title": "档案查询、利用与预约",
      "aliases": [
        "查档",
        "档案证明",
        "档案馆预约",
        "档案利用"
      ],
      "category": "archives",
      "summary": "建议先通过东南大学档案馆网上办事大厅预约，再到四牌楼档案馆相应部门办理。",
      "placeId": "archives-building",
      "location": "四牌楼校区档案馆",
      "room": "保管利用部421；收集指导部512；专门档案部422；具体按预约结果前往",
      "hours": "以网上预约结果和档案馆最新通知为准。",
      "phones": [
        "025-83792861",
        "025-83794725",
        "025-83792913"
      ],
      "onlineUrl": "https://dayy.seu.edu.cn/",
      "audience": [
        "师生",
        "校友",
        "相关单位"
      ],
      "materials": [
        "按所查档案类型准备身份证明和相关申请材料",
        "委托或单位查询可能需要授权材料"
      ],
      "steps": [
        "进入档案馆网上办事大厅选择业务",
        "提交预约或申请并等待确认",
        "按确认的地点、房间和时间携带材料办理"
      ],
      "notice": "档案馆房间和电话来自官网服务页；业务受理条件以网上办事大厅具体说明为准。",
      "sourceIds": [
        "archives-online-hall",
        "archives-service"
      ],
      "primarySourceId": "archives-online-hall",
      "verifiedAt": "2026-08-17",
      "volatile": true
    },
    {
      "id": "household-registration-sipailou",
      "campusId": "sipailou",
      "title": "四牌楼户籍相关事务",
      "aliases": [
        "户口",
        "户籍",
        "户口迁移",
        "常住人口登记表",
        "居住证"
      ],
      "category": "security",
      "summary": "四牌楼户籍服务由保卫处办理，联系电话025-83792086；房间参考为沙塘园保卫楼102。",
      "placeId": "security",
      "location": "沙塘园保卫楼",
      "room": "102室（出发前电话确认）",
      "hours": "工作时间与具体业务受理安排以保卫处最新通知或电话确认为准。",
      "phones": [
        "025-83792086"
      ],
      "onlineUrl": "https://bwc.seu.edu.cn/hjblzn/list.htm",
      "audience": [
        "学生",
        "教职工",
        "博士后"
      ],
      "materials": [
        "材料随户口迁移、登记表借用、居住证等业务而不同",
        "先在保卫处户籍办理指南中选择对应事项"
      ],
      "steps": [
        "查看保卫处户籍办理指南中的对应事项",
        "按最新通知准备材料",
        "电话确认后到沙塘园保卫楼办理"
      ],
      "notice": "房间号来自学校近期流程材料，主管页面未集中列出房间；因此标为“出发前确认”。",
      "sourceIds": [
        "security-office-current",
        "security-room-reference"
      ],
      "primarySourceId": "security-office-current",
      "verifiedAt": "2026-08-17",
      "volatile": true
    }
  ],
  "departments": [
    {
      "id": "president-office",
      "name": "校长办公室",
      "aliases": [
        "校办",
        "学校办公室",
        "印信室",
        "法制办公室"
      ],
      "category": "administration",
      "summary": "承担学校综合协调、公文文秘、信息督办、印信、法律事务和接待等工作。",
      "responsibilities": [
        "学校综合协调与重要会议服务",
        "公文、信息、督办和机要事务",
        "校级印章与事业单位法人证书相关服务",
        "合同法务与依法治校支持"
      ],
      "website": "https://xiaoban.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "综合办公室；印信室109",
          "phones": [
            "025-52090099",
            "025-52091201"
          ],
          "serviceNote": "校级用印常规安排为周一、周三、周四在九龙湖办理；节假日和临时调整以通知为准。"
        },
        {
          "campusId": "sipailou",
          "location": "孟芳图书馆（老图书馆）",
          "room": "印信室123",
          "phones": [
            "025-83790198"
          ],
          "placeId": "mengfang-library",
          "serviceNote": "校级用印常规安排为周二、周五在四牌楼办理，出发前请再次确认。"
        },
        {
          "campusId": "sipailou",
          "location": "逸夫建筑馆",
          "room": "9楼法制办公室",
          "phones": [
            "025-83795967"
          ],
          "placeId": "yifu-architecture",
          "serviceNote": "合同、法律事务应先按学校流程准备材料。"
        }
      ],
      "links": [
        {
          "label": "科室设置及联系方式",
          "url": "https://xiaoban.seu.edu.cn/753/list.htm"
        }
      ],
      "sourceIds": [
        "president-office-contact",
        "seu-organization-current"
      ],
      "primarySourceId": "president-office-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "general-office",
          "name": "综合办公室",
          "aliases": [
            "校办综合办"
          ],
          "responsibilities": [
            "综合协调、会议接待和日常行政事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "333",
              "phones": [
                "025-52090099"
              ]
            }
          ]
        },
        {
          "id": "seal-service",
          "name": "印信与用印服务",
          "aliases": [
            "校办盖章",
            "学校用印"
          ],
          "responsibilities": [
            "学校印章使用、登记和校区用印服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "109",
              "phones": [
                "025-52091201"
              ],
              "serviceNote": "通常周一、周三、周四办理。"
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "123",
              "phones": [
                "025-83790198"
              ],
              "placeId": "mengfang-library",
              "serviceNote": "通常周二、周五办理。"
            }
          ]
        },
        {
          "id": "document-circulation",
          "name": "公文流转",
          "aliases": [
            "校办公文"
          ],
          "responsibilities": [
            "学校公文收发、流转与归档协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "319",
              "phones": [
                "025-52090044"
              ]
            }
          ]
        },
        {
          "id": "information-petitions",
          "name": "信息公开、信访与对口支援",
          "aliases": [
            "校长信箱",
            "信息公开",
            "信访"
          ],
          "responsibilities": [
            "信息公开、来信来访、定点帮扶与对口支援联络"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "323",
              "phones": [
                "025-52090035",
                "025-52090052"
              ]
            }
          ]
        },
        {
          "id": "legal-affairs",
          "name": "法律事务",
          "aliases": [
            "法务",
            "法律咨询"
          ],
          "responsibilities": [
            "学校法律事务、合同与依法治校相关协调"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "逸夫建筑馆",
              "room": "九楼",
              "phones": [
                "025-83795967"
              ],
              "placeId": "yifu-architecture"
            }
          ]
        },
        {
          "id": "printing-room",
          "name": "文印室",
          "aliases": [
            "校办打印"
          ],
          "responsibilities": [
            "校级公文和行政材料文印服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "216",
              "phones": [
                "025-52090039"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "organization-department",
      "name": "党委组织部",
      "aliases": [
        "组织部",
        "党校",
        "党建办公室",
        "干部工作办公室"
      ],
      "category": "party",
      "summary": "负责学校基层党建、党员教育管理、党校培训和干部队伍建设等工作。",
      "responsibilities": [
        "基层党组织建设与党员教育管理",
        "党校培训和党建研究",
        "干部选拔、培养、考核与监督",
        "相关材料和党务咨询"
      ],
      "website": "https://zzb.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "207、208、316等",
          "phones": [
            "025-52090134",
            "025-52090133",
            "025-52090135"
          ],
          "serviceNote": "不同业务分属党建、党校和干部工作办公室，请先电话确认房间。"
        },
        {
          "campusId": "sipailou",
          "location": "孟芳图书馆（老图书馆）",
          "room": "239",
          "phones": [
            "025-83792065"
          ],
          "placeId": "mengfang-library",
          "serviceNote": "四牌楼办公室办理范围和坐班安排以组织部最新通知为准。"
        }
      ],
      "links": [
        {
          "label": "部门联系方式",
          "url": "https://zzb.seu.edu.cn/2807/list.htm"
        }
      ],
      "sourceIds": [
        "organization-office-contact",
        "seu-organization-current"
      ],
      "primarySourceId": "organization-office-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "cadre-office",
          "name": "干部工作办公室",
          "aliases": [
            "干部科"
          ],
          "responsibilities": [
            "干部队伍建设、选任管理、考核监督与相关服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "208",
              "phones": [
                "025-52090133",
                "025-52090135"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "239",
              "phones": [
                "025-83792065"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "party-school-office",
          "name": "党建、党校办公室",
          "aliases": [
            "党建办公室",
            "党校办公室"
          ],
          "responsibilities": [
            "基层党建、党员教育管理和党校培训相关工作"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "207",
              "phones": [
                "025-52090134"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "239",
              "phones": [
                "025-83792065"
              ],
              "placeId": "mengfang-library"
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "academic-affairs",
      "name": "教务处",
      "aliases": [
        "本科生院教务处",
        "本科教务",
        "学籍管理科",
        "教务科"
      ],
      "category": "teaching",
      "summary": "负责本科培养方案、教学运行、学籍、考试、成绩、实践教学和教学质量等事务。",
      "responsibilities": [
        "本科教学运行、排课与考试管理",
        "学籍、成绩、证书和在读证明",
        "实践教学、创新创业与教材建设",
        "教学质量与教师教学发展相关协调"
      ],
      "website": "https://jwc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区教学5号楼",
          "room": "201处办公室",
          "phones": [
            "025-52090216"
          ],
          "serviceNote": "综合办公及用印常规在九龙湖办理。"
        },
        {
          "campusId": "sipailou",
          "location": "微波楼",
          "room": "104（周五用印）；100学籍管理参考",
          "phones": [
            "025-83792666"
          ],
          "placeId": "microwave-building",
          "serviceNote": "学生证、成绩单盖章等事项的房间和日期可能调整，应先查看学籍管理科页面。"
        }
      ],
      "links": [
        {
          "label": "教务处首页",
          "url": "https://jwc.seu.edu.cn/"
        },
        {
          "label": "学籍管理科",
          "url": "https://jwc.seu.edu.cn/xjk_21855/list.htm"
        }
      ],
      "sourceIds": [
        "academic-office-contact",
        "undergraduate-status-office",
        "academic-teaching-office",
        "academic-research-office",
        "academic-practice-office",
        "academic-teaching-service",
        "academic-classroom-service",
        "academic-dingjiaqiao-office"
      ],
      "primarySourceId": "academic-office-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "department-office",
          "name": "处办公室",
          "aliases": [
            "教务处办公室",
            "教务处盖章"
          ],
          "responsibilities": [
            "综合协调、公文归档、教学经费、考核、印章和来访接待"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "201",
              "phones": [
                "025-52090216"
              ],
              "serviceNote": "用印通常周一至周四在九龙湖。"
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "104",
              "phones": [
                "025-83790711"
              ],
              "placeId": "microwave-building",
              "serviceNote": "处办公室用印通常周五在四牌楼。"
            }
          ]
        },
        {
          "id": "teaching-affairs",
          "name": "教务科",
          "aliases": [
            "排课科",
            "考试科",
            "办事厅"
          ],
          "responsibilities": [
            "排课选课、课程考试、四六级与计算机等级考试、成绩管理和教学事故处理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "101（办事厅、考试咨询）",
              "phones": [
                "025-52090218"
              ]
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "102（排课选课等教务业务）",
              "phones": [
                "025-52090226"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "100",
              "phones": [
                "025-83794380"
              ],
              "placeId": "microwave-building"
            }
          ],
          "sourceIds": [
            "academic-teaching-office"
          ]
        },
        {
          "id": "student-status",
          "name": "学籍管理科",
          "aliases": [
            "学籍科",
            "成绩单盖章",
            "在读证明",
            "毕业证明"
          ],
          "responsibilities": [
            "学籍异动、毕业与学位资格、电子注册、辅修、推免、转专业、学生证和成绩证明"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "103（学生证、成绩单盖章、在读证明）",
              "phones": [
                "025-52090224"
              ]
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "104（学籍、毕业资格、学籍异动）",
              "phones": [
                "025-52090227"
              ]
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教三",
              "room": "200（学业指导）",
              "phones": [
                "025-52090228"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "100",
              "phones": [
                "025-83792666"
              ],
              "placeId": "microwave-building",
              "serviceNote": "盖章通常周二、周五下午在四牌楼，其他时间在九龙湖。"
            }
          ],
          "sourceIds": [
            "undergraduate-status-office"
          ]
        },
        {
          "id": "teaching-research",
          "name": "教学研究科",
          "aliases": [
            "教研科"
          ],
          "responsibilities": [
            "培养方案、专业与课程建设、教材、教学改革、教学成果与质量评估"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "205",
              "phones": [
                "025-52090221",
                "025-52090220"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "104",
              "phones": [
                "025-83790711"
              ],
              "placeId": "microwave-building"
            }
          ],
          "sourceIds": [
            "academic-research-office"
          ]
        },
        {
          "id": "practical-teaching",
          "name": "实践教学科",
          "aliases": [
            "实践科",
            "竞赛办",
            "SRTP"
          ],
          "responsibilities": [
            "实习实践、毕业设计、学科竞赛、创新训练、课外研学和本科国际交流"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "207",
              "phones": [
                "025-52090230",
                "025-52090233",
                "025-52090229",
                "025-52090234"
              ]
            }
          ],
          "sourceIds": [
            "academic-practice-office"
          ]
        },
        {
          "id": "teaching-service-center",
          "name": "教学服务中心",
          "aliases": [
            "教材科",
            "教材服务"
          ],
          "responsibilities": [
            "教材采购、讲义委印、保管、发放与新生教材服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "106",
              "phones": [
                "025-52090357"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区礼西路书库",
              "room": "教学服务中心",
              "phones": [
                "025-83792258"
              ]
            }
          ],
          "sourceIds": [
            "academic-teaching-service"
          ]
        },
        {
          "id": "classroom-service-center",
          "name": "公共教室管理与服务中心",
          "aliases": [
            "教室管理中心",
            "教室借用"
          ],
          "responsibilities": [
            "公共教室资源规划、借用审核、巡查与设施服务协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教七",
              "room": "200-2",
              "phones": [
                "025-52097760"
              ]
            }
          ],
          "sourceIds": [
            "academic-classroom-service"
          ]
        },
        {
          "id": "printing-center",
          "name": "文印中心",
          "aliases": [
            "试卷印刷",
            "试卷委印"
          ],
          "responsibilities": [
            "本科课程试卷委印、领取与文印服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区教五",
              "room": "301",
              "phones": [
                "025-52090232"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "五四楼",
              "room": "115",
              "phones": [
                "025-83794959"
              ],
              "placeId": "wusi-building"
            }
          ],
          "sourceIds": [
            "academic-office-contact"
          ]
        },
        {
          "id": "dingjiaqiao-academic-office",
          "name": "丁家桥教务办",
          "aliases": [
            "丁家桥教务科"
          ],
          "responsibilities": [
            "丁家桥校区本科教学运行与教务服务"
          ],
          "offices": [
            {
              "campusId": "dingjiaqiao",
              "location": "丁家桥校区文枢楼",
              "room": "201",
              "phones": [
                "025-83272295"
              ]
            }
          ],
          "sourceIds": [
            "academic-dingjiaqiao-office"
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "graduate-school",
      "name": "研究生院",
      "aliases": [
        "研院",
        "研招办",
        "研究生培养办",
        "学位办",
        "研工部"
      ],
      "category": "teaching",
      "summary": "承担研究生招生、培养、学位、质量管理和研究生教育管理等工作。",
      "responsibilities": [
        "硕士与博士研究生招生",
        "培养方案、选课、学籍和教学运行",
        "学位申请、审核与质量保障",
        "研究生教育管理和就业相关协调"
      ],
      "website": "https://seugs.seu.edu.cn/",
      "offices": [
        {
          "campusId": "sipailou",
          "location": "逸夫建筑馆",
          "room": "招生203；培养107；行政204；研工206",
          "phones": [
            "025-83790123",
            "025-83792583",
            "025-83796153",
            "025-83790701"
          ],
          "placeId": "yifu-architecture",
          "serviceNote": "研究生招生、培养、学位与管理分属不同房间，请按事项选择电话。"
        },
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区纪忠楼",
          "room": "101B、102等",
          "phones": [
            "025-52090209",
            "025-52090206"
          ],
          "serviceNote": "培养与研工等业务在纪忠楼一层设有办公室。"
        }
      ],
      "links": [
        {
          "label": "研究生院联系方式",
          "url": "https://seugs.seu.edu.cn/27256/list.htm"
        },
        {
          "label": "研究生招生",
          "url": "https://yzb.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "graduate-school-contact"
      ],
      "primarySourceId": "graduate-school-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "admissions-office",
          "name": "招生办公室",
          "aliases": [
            "研招办",
            "硕士招生",
            "博士招生"
          ],
          "responsibilities": [
            "硕博研究生、港澳台及中外合作办学招生与考试考务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "逸夫建筑馆",
              "room": "203",
              "phones": [
                "025-83790123",
                "025-83792583"
              ],
              "placeId": "yifu-architecture"
            }
          ]
        },
        {
          "id": "graduate-affairs",
          "name": "党委研究生工作部（管理办公室）",
          "aliases": [
            "研工部",
            "研究生管理办",
            "研究生学籍"
          ],
          "responsibilities": [
            "研究生思政、奖助、学籍学历、日常管理、资助和创新实践"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区纪忠楼",
              "room": "101A、101B",
              "phones": [
                "025-52098701",
                "025-52090209",
                "025-52090208"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "逸夫建筑馆",
              "room": "206",
              "phones": [
                "025-83793783",
                "025-83794273",
                "025-83795363"
              ],
              "placeId": "yifu-architecture"
            }
          ]
        },
        {
          "id": "training-office",
          "name": "研究生培养办公室",
          "aliases": [
            "培养办",
            "研究生教务"
          ],
          "responsibilities": [
            "培养方案、排课考试、成绩、中期考核、教学改革、专业实践与国际交流"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区纪忠楼",
              "room": "102",
              "phones": [
                "025-52090205",
                "025-52090206",
                "025-52090207"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "逸夫建筑馆",
              "room": "107",
              "phones": [
                "025-83796153",
                "025-83792739",
                "025-83792529",
                "025-83795359"
              ],
              "placeId": "yifu-architecture"
            }
          ]
        },
        {
          "id": "degree-office",
          "name": "学位办公室",
          "aliases": [
            "学位办",
            "论文盲审",
            "学位证明"
          ],
          "responsibilities": [
            "学位申请与授予、论文评审抽检、导师队伍、证书信息和学位点建设"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区纪忠楼",
              "room": "Y103",
              "phones": [
                "025-52090204"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "逸夫建筑馆",
              "room": "207、208",
              "phones": [
                "025-83796075",
                "025-83796279",
                "025-83790712"
              ],
              "placeId": "yifu-architecture"
            }
          ]
        },
        {
          "id": "administrative-office",
          "name": "行政办公室",
          "aliases": [
            "研究生院办公室"
          ],
          "responsibilities": [
            "综合协调、印章财务、公文信息系统和对外接待"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "逸夫建筑馆",
              "room": "204",
              "phones": [
                "025-83790701",
                "025-83794826",
                "025-83795752"
              ],
              "placeId": "yifu-architecture"
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "student-affairs",
      "name": "党委学生工作部、学生处",
      "aliases": [
        "学生处",
        "学工部",
        "本科生管理办公室",
        "心理健康教育中心"
      ],
      "category": "student",
      "summary": "负责本科生思想教育、日常管理、资助、学生社区、心理健康和就业指导等服务。",
      "responsibilities": [
        "本科生思想教育和日常管理",
        "奖助学金、资助与勤工助学协调",
        "学生社区与公寓教育管理",
        "心理健康教育和咨询",
        "生涯教育与就业指导"
      ],
      "website": "https://xsc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区大学生活动中心",
          "room": "5楼及相关办公室",
          "phones": [
            "025-52090279",
            "025-52090282",
            "025-52090283",
            "025-52090277"
          ],
          "serviceNote": "综合、本科生管理、心理等业务电话不同，紧急心理危机应同时联系辅导员或校内应急渠道。"
        }
      ],
      "links": [
        {
          "label": "学生处首页",
          "url": "https://xsc.seu.edu.cn/"
        },
        {
          "label": "机构与联系方式",
          "url": "https://xsc.seu.edu.cn/65021/list.htm"
        }
      ],
      "sourceIds": [
        "student-affairs-current",
        "employment-contact-current"
      ],
      "primarySourceId": "student-affairs-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "department-office",
          "name": "学生处（学工部）办公室",
          "aliases": [
            "学生处办公室"
          ],
          "responsibilities": [
            "学生工作综合协调、公文会务和部门日常事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "五楼",
              "phones": [
                "025-52090279"
              ]
            }
          ]
        },
        {
          "id": "counselor-development",
          "name": "辅导员发展中心",
          "aliases": [
            "辅导员中心"
          ],
          "responsibilities": [
            "辅导员队伍建设、培训发展与工作支持"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "五楼",
              "phones": [
                "025-52090280"
              ]
            }
          ]
        },
        {
          "id": "ideological-office",
          "name": "本科生思想政治工作办公室",
          "aliases": [
            "本科生思政办"
          ],
          "responsibilities": [
            "本科生思想政治教育、主题教育和辅导员工作协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "五楼",
              "phones": [
                "025-52090269"
              ]
            }
          ]
        },
        {
          "id": "undergraduate-management",
          "name": "本科生管理工作办公室",
          "aliases": [
            "本科生管理办",
            "学生资助"
          ],
          "responsibilities": [
            "本科生日常管理、评奖评优、资助、学业与安全稳定工作"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "五楼",
              "phones": [
                "025-52090282",
                "025-52090283"
              ]
            }
          ]
        },
        {
          "id": "apartment-center",
          "name": "学生公寓管理中心",
          "aliases": [
            "宿舍管理中心",
            "公寓中心"
          ],
          "responsibilities": [
            "学生公寓教育管理、社区服务与住宿事务协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "五楼",
              "phones": [
                "025-52090268"
              ]
            }
          ]
        },
        {
          "id": "mental-health-center",
          "name": "心理健康教育中心",
          "aliases": [
            "心理中心",
            "心理咨询"
          ],
          "responsibilities": [
            "心理健康教育、咨询、危机预防与支持"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "五楼",
              "phones": [
                "025-52090277"
              ]
            }
          ]
        },
        {
          "id": "national-defense-center",
          "name": "国防教育中心",
          "aliases": [
            "征兵办公室",
            "军训办"
          ],
          "responsibilities": [
            "国防教育、军训和大学生征兵相关工作"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "以学生处最新通知为准",
              "phones": [
                "025-52090159"
              ]
            }
          ]
        },
        {
          "id": "employment-center",
          "name": "就业指导中心",
          "aliases": [
            "就业办",
            "生涯教育中心"
          ],
          "responsibilities": [
            "生涯教育、校园招聘、用人单位服务和学生就业手续咨询"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "就业指导相关办公室",
              "phones": [
                "025-52090274",
                "025-52090275"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区就业服务点",
              "room": "出发前电话确认",
              "phones": [
                "025-83795903",
                "025-83792592"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "human-resources",
      "name": "人事处",
      "aliases": [
        "人事处人才工作办公室",
        "人事科",
        "师资科",
        "博士后管理办公室"
      ],
      "category": "personnel",
      "summary": "负责学校人事政策、人才引进、岗位聘用、师资队伍、薪酬社保和博士后等工作。",
      "responsibilities": [
        "教职工人事与岗位聘用",
        "人才引进和师资队伍建设",
        "薪酬、社保与相关证明",
        "博士后进出站及日常管理"
      ],
      "website": "https://rsc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "408综合办公室及各业务科室",
          "phones": [
            "025-52090261"
          ],
          "serviceNote": "人事业务分科室办理，综合办公室可先行分流。"
        }
      ],
      "links": [
        {
          "label": "机构设置",
          "url": "https://rsc.seu.edu.cn/56160/list.htm"
        }
      ],
      "sourceIds": [
        "human-resources-contact"
      ],
      "primarySourceId": "human-resources-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "general-research-office",
          "name": "综合事务与研究办公室",
          "aliases": [
            "人事处综合办"
          ],
          "responsibilities": [
            "政策研究、综合协调、公文印章、考勤财务、数据和信访处分等事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "408",
              "phones": [
                "025-52090261"
              ],
              "serviceNote": "传真：025-52090250。"
            }
          ]
        },
        {
          "id": "resource-allocation",
          "name": "人力资源配置办公室",
          "aliases": [
            "招聘调配",
            "薪酬社保"
          ],
          "responsibilities": [
            "岗位编制、招聘调配、离职延聘、薪酬绩效、社会保险和医疗报销"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "432（配置）、430（薪酬）、434（社保）",
              "phones": [
                "025-52090256",
                "025-52090249",
                "025-52090262"
              ]
            }
          ]
        },
        {
          "id": "staff-development",
          "name": "教职工发展办公室",
          "aliases": [
            "职称办",
            "考核聘用"
          ],
          "responsibilities": [
            "职称评聘、岗位分级、合同聘期考核、教师资格、培训与外派交流"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "431、433",
              "phones": [
                "025-52090258",
                "025-52090259"
              ]
            }
          ]
        },
        {
          "id": "personnel-service-center",
          "name": "人事服务中心",
          "aliases": [
            "人事服务大厅",
            "入职离职",
            "人事证明"
          ],
          "responsibilities": [
            "入职调动离职、聘用合同、人事证明、请销假、因私出国、退休和日常咨询"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "435",
              "phones": [
                "025-52090260"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区群贤楼",
              "room": "一楼人事服务大厅",
              "phones": [
                "025-83795941"
              ]
            }
          ]
        },
        {
          "id": "personnel-records",
          "name": "人事档案服务",
          "aliases": [
            "教职工档案",
            "人事档案"
          ],
          "responsibilities": [
            "教职工人事档案收集、审核、保管、利用、转递与数字化"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "515",
              "phones": [
                "025-52090345"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "research-office",
      "name": "科研院",
      "aliases": [
        "科研处",
        "科技处",
        "科研项目办",
        "成果与知识产权办公室"
      ],
      "category": "research",
      "summary": "负责学校自然科学科研项目、基地平台、成果、知识产权和科研合作等管理服务。",
      "responsibilities": [
        "纵向与横向科研项目管理",
        "科研基地、平台和重大任务组织",
        "科技成果、奖励与知识产权管理",
        "科研合同、经费协同与用印服务"
      ],
      "website": "https://kjc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "201综合服务及相关办公室",
          "phones": [
            "025-52091173"
          ],
          "serviceNote": "科研院综合服务可先通过热线分流；不同项目类型对应不同办公室。"
        },
        {
          "campusId": "sipailou",
          "location": "孟芳图书馆（老图书馆）",
          "room": "102、103、104、108等",
          "phones": [
            "025-83791320",
            "025-83792076",
            "025-83792319"
          ],
          "placeId": "mengfang-library",
          "serviceNote": "用印常规为周二、周五在四牌楼104办理，其余日期在九龙湖，临时安排以通知为准。"
        }
      ],
      "links": [
        {
          "label": "科研院联系方式",
          "url": "https://kjc.seu.edu.cn/lxwm_14998/list.htm"
        }
      ],
      "sourceIds": [
        "research-office-contact"
      ],
      "primarySourceId": "research-office-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "general-management",
          "name": "综合管理科",
          "aliases": [
            "科研院综合科",
            "科研院用印"
          ],
          "responsibilities": [
            "综合协调、科研院用印、宣传、公文和科研服务热线"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "201",
              "phones": [
                "025-52091173",
                "025-52091180",
                "025-52090238"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "104",
              "phones": [
                "025-83792076",
                "025-83792319"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "project-management",
          "name": "项目管理中心",
          "aliases": [
            "项目管理科",
            "科研项目办",
            "科技合同章"
          ],
          "responsibilities": [
            "理工医科研项目、科技合同、经费入账与相关项目过程管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "113",
              "phones": [
                "025-52091170"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "108",
              "phones": [
                "025-83791320",
                "025-83792864"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "high-tech-social-development",
          "name": "高新技术与社会发展办公室",
          "aliases": [
            "高新办",
            "社会发展办"
          ],
          "responsibilities": [
            "高新技术和社会发展领域科研项目组织与管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "202",
              "phones": [
                "025-52091184",
                "025-52091161"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "103",
              "phones": [
                "025-83792628"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "basic-overseas",
          "name": "基础研究与海外合作办公室",
          "aliases": [
            "基础办",
            "海外合作办"
          ],
          "responsibilities": [
            "基础研究项目和相关海外科研合作事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "227",
              "phones": [
                "025-52091165",
                "025-52091182",
                "025-52091163"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "103",
              "phones": [
                "025-83790506"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "research-bases",
          "name": "科研基地与协同创新办公室",
          "aliases": [
            "基地办",
            "协同创新办"
          ],
          "responsibilities": [
            "科研基地、平台和协同创新载体建设管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "228",
              "phones": [
                "025-52091176"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "103",
              "phones": [
                "025-83792003"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "achievements-ip",
          "name": "科研成果与知识产权办公室",
          "aliases": [
            "成果办",
            "知识产权办",
            "专利办"
          ],
          "responsibilities": [
            "科技成果、奖励、知识产权和成果统计服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "226",
              "phones": [
                "025-52091172",
                "025-52091164",
                "025-52091179"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "108",
              "phones": [
                "025-83793955",
                "025-83795442"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "applied-technology",
          "name": "应用技术院（应技办）",
          "aliases": [
            "应用技术院",
            "应技办",
            "成果转化"
          ],
          "responsibilities": [
            "应用技术、产学研合作和科技成果转化相关管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "203",
              "phones": [
                "025-52091171",
                "025-52091183",
                "025-52091169"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "108",
              "phones": [
                "025-83792864"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "defense-confidentiality",
          "name": "国防科研与保密业务",
          "aliases": [
            "国防院",
            "质量办",
            "保密办"
          ],
          "responsibilities": [
            "国防科研项目、质量管理与科研保密相关事务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "128、130",
              "phones": [
                "025-83790552",
                "025-83792771",
                "025-83794838",
                "025-83790720"
              ],
              "placeId": "mengfang-library"
            },
            {
              "campusId": "dingjiaqiao",
              "location": "丁家桥校区行政楼",
              "room": "239",
              "phones": [
                "025-83272392"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "social-sciences-office",
      "name": "社会科学处",
      "aliases": [
        "社科处",
        "文科科研处",
        "社科项目办"
      ],
      "category": "research",
      "summary": "负责全校人文社会科学研究规划、项目、成果、平台和学术交流管理服务。",
      "responsibilities": [
        "人文社科项目申报与过程管理",
        "社科成果、奖励和统计",
        "文科平台、基地与规划建设",
        "人文社科学术交流和服务"
      ],
      "website": "https://skc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "sipailou",
          "location": "孟芳图书馆（老图书馆）",
          "room": "119",
          "phones": [
            "025-83793762"
          ],
          "placeId": "mengfang-library",
          "serviceNote": "四牌楼主要受理文科科研项目和成果管理咨询。"
        },
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "110、112、426",
          "phones": [
            "025-52090240",
            "025-52091078"
          ],
          "serviceNote": "不同房间承担项目、成果与规划基地等业务。"
        }
      ],
      "links": [
        {
          "label": "联系方式",
          "url": "https://skc.seu.edu.cn/2016/0418/c4968a156065/page.htm"
        }
      ],
      "sourceIds": [
        "social-sciences-contact"
      ],
      "primarySourceId": "social-sciences-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "projects-achievements",
          "name": "社科项目与成果管理办公室",
          "aliases": [
            "社科项目办",
            "社科成果办"
          ],
          "responsibilities": [
            "人文社科项目、成果、奖励与相关科研服务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "119",
              "phones": [
                "025-83793762"
              ],
              "placeId": "mengfang-library"
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "110、112、426",
              "phones": [
                "025-52091078",
                "025-52090240"
              ]
            }
          ]
        },
        {
          "id": "planning-bases",
          "name": "社科规划与基地建设办公室",
          "aliases": [
            "社科规划办",
            "文科基地办"
          ],
          "responsibilities": [
            "人文社科发展规划、科研基地与平台建设管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "112",
              "phones": [
                "025-52090240"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "119",
              "phones": [
                "025-83793762"
              ],
              "placeId": "mengfang-library"
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "finance-office",
      "name": "财务处",
      "aliases": [
        "财务处会计科",
        "财务服务窗口",
        "校园一卡通中心"
      ],
      "category": "finance",
      "summary": "负责学校预算、核算、报销、收费、资金和校园卡等财务服务。",
      "responsibilities": [
        "预算与经费管理",
        "会计核算、报销和票据业务",
        "学生收费及财务证明",
        "校园一卡通财务与充值服务"
      ],
      "website": "https://cwc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "sipailou",
          "location": "五四楼",
          "room": "一楼会计事务与校园卡；三楼办公室",
          "phones": [
            "025-83792462",
            "025-83795043",
            "025-83795348"
          ],
          "placeId": "wusi-building",
          "serviceNote": "报销、会计和校园卡分属不同窗口；财务处网站可能仅限校内访问。"
        },
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "一楼财务服务区",
          "phones": [
            "025-52095337",
            "025-52090295"
          ],
          "serviceNote": "校园卡和财务业务的窗口开放安排以当期通知为准。"
        }
      ],
      "links": [
        {
          "label": "财务处首页（可能需校内网）",
          "url": "https://cwc.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "finance-office-reference",
        "campus-card-guide"
      ],
      "primarySourceId": "finance-office-reference",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "department-office",
          "name": "办公室",
          "aliases": [
            "财务处办公室"
          ],
          "responsibilities": [
            "财务处综合行政、印章、公文与业务协调"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "五四楼",
              "room": "三楼",
              "phones": [
                "025-83795348"
              ],
              "placeId": "wusi-building"
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "一楼",
              "phones": [
                "025-52095337"
              ]
            }
          ]
        },
        {
          "id": "finance-section-one",
          "name": "财务一科",
          "aliases": [
            "财务科"
          ],
          "responsibilities": [
            "学校财务核算与相关财务业务办理"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "五四楼",
              "room": "三楼",
              "phones": [
                "025-83792312"
              ],
              "placeId": "wusi-building"
            }
          ]
        },
        {
          "id": "accounting-affairs",
          "name": "会计事务管理科",
          "aliases": [
            "会计科",
            "财务服务窗口"
          ],
          "responsibilities": [
            "会计事务、票据政策和服务窗口业务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "五四楼",
              "room": "一楼",
              "phones": [
                "025-83792462"
              ],
              "placeId": "wusi-building"
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "一楼财务服务窗口",
              "phones": [
                "025-52090295"
              ]
            }
          ]
        },
        {
          "id": "special-funds",
          "name": "专项科",
          "aliases": [
            "科研专项",
            "科研票据"
          ],
          "responsibilities": [
            "专项经费、科研项目票据开具审核等业务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "五四楼",
              "room": "具体窗口以财务处通知为准",
              "phones": [
                "025-83792741"
              ],
              "placeId": "wusi-building"
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "一楼财务服务区",
              "phones": [
                "025-52098529"
              ]
            }
          ]
        },
        {
          "id": "campus-card-office",
          "name": "校园卡管理办公室",
          "aliases": [
            "一卡通中心",
            "校园卡中心",
            "补卡"
          ],
          "responsibilities": [
            "校园卡挂失、补换卡、充值与相关账户服务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "五四楼",
              "room": "一楼西校园卡窗口",
              "phones": [
                "025-83792462"
              ],
              "placeId": "wusi-building"
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "一楼校园卡服务窗口",
              "phones": [
                "025-52090295"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "international-office",
      "name": "国际合作处（港澳台办公室）",
      "aliases": [
        "国际处",
        "外办",
        "港澳台办",
        "出国境管理办公室",
        "护照签证办公室"
      ],
      "category": "international",
      "summary": "负责国际合作、校际交流、学生海外交流、外国专家与因公出国境等事务。",
      "responsibilities": [
        "国际合作协议与校际交流",
        "学生海外交流项目",
        "外国专家与国际会议协调",
        "因公出国境、护照和签证服务",
        "港澳台交流事务"
      ],
      "website": "https://oic.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "210—213",
          "phones": [
            "025-52090191",
            "025-52090195",
            "025-52090196",
            "025-52090197"
          ],
          "serviceNote": "国际合作、学生交流和外事服务分科室办理。"
        },
        {
          "campusId": "sipailou",
          "location": "孟芳图书馆（老图书馆）",
          "room": "127",
          "phones": [
            "025-83793215",
            "025-83795067",
            "025-83793015"
          ],
          "placeId": "mengfang-library",
          "serviceNote": "出国境与护照签证业务应先核对线上流程和材料清单。"
        }
      ],
      "links": [
        {
          "label": "国际合作处联系方式",
          "url": "https://oic.seu.edu.cn/lxwm/list.htm"
        }
      ],
      "sourceIds": [
        "international-office-contact"
      ],
      "primarySourceId": "international-office-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "hong-kong-macao-taiwan",
          "name": "港澳台事务",
          "aliases": [
            "港澳台办"
          ],
          "responsibilities": [
            "港澳台合作交流与相关人员项目事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "213",
              "phones": [
                "025-52090193",
                "025-52090192"
              ]
            }
          ]
        },
        {
          "id": "cooperation-agreements",
          "name": "合作协议",
          "aliases": [
            "国际合作协议"
          ],
          "responsibilities": [
            "国际校际合作协议和合作伙伴关系管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "213",
              "phones": [
                "025-52090196"
              ]
            }
          ]
        },
        {
          "id": "foreign-experts",
          "name": "外国专家事务",
          "aliases": [
            "外专办",
            "外国专家"
          ],
          "responsibilities": [
            "外国专家聘请、来访与相关管理服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "213",
              "phones": [
                "025-52090199"
              ]
            }
          ]
        },
        {
          "id": "student-exchange",
          "name": "学生交流、交换与国际会议",
          "aliases": [
            "学生海外交流",
            "交换生"
          ],
          "responsibilities": [
            "学生海外交流交换项目和国际会议协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "213",
              "phones": [
                "025-52090195"
              ]
            }
          ]
        },
        {
          "id": "external-exchange",
          "name": "对外交流事务",
          "aliases": [
            "外事接待",
            "对外交流"
          ],
          "responsibilities": [
            "学校外事接待和对外交流综合事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "210",
              "phones": [
                "025-52090197",
                "025-83792412"
              ]
            }
          ]
        },
        {
          "id": "outbound-affairs",
          "name": "出国境事务",
          "aliases": [
            "因公出国",
            "因公出境"
          ],
          "responsibilities": [
            "因公出国境审批、材料与相关外事服务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "127",
              "phones": [
                "025-83793215",
                "025-83795067"
              ],
              "placeId": "mengfang-library"
            }
          ]
        },
        {
          "id": "passport-visa",
          "name": "护照签证事务",
          "aliases": [
            "因公护照",
            "签证服务"
          ],
          "responsibilities": [
            "因公护照、签证及相关证照材料服务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "孟芳图书馆（老图书馆）",
              "room": "127",
              "phones": [
                "025-83793015"
              ],
              "placeId": "mengfang-library"
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "security-office",
      "name": "保卫处",
      "aliases": [
        "保卫部",
        "校园警务",
        "户籍科",
        "校园报警"
      ],
      "category": "security",
      "summary": "负责校园安全、治安、消防、交通、户籍和应急联络等工作。",
      "responsibilities": [
        "校园治安、巡查与报警处置",
        "消防安全和校园交通管理",
        "师生集体户籍服务",
        "大型活动安全与应急协调"
      ],
      "website": "https://bwc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "sipailou",
          "location": "沙塘园保卫楼",
          "room": "户籍科102参考",
          "phones": [
            "025-83790110",
            "025-83792086"
          ],
          "placeId": "security",
          "serviceNote": "83790110为四牌楼校园报警电话；户籍业务前请电话确认房间。"
        },
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区教一综合服务大厅及保卫服务点",
          "room": "户籍服务10号窗口参考",
          "phones": [
            "025-52090110",
            "025-52091209"
          ],
          "serviceNote": "紧急情况优先拨打110或校区报警电话。"
        }
      ],
      "links": [
        {
          "label": "保卫处首页",
          "url": "https://bwc.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "security-office-current",
        "security-room-reference",
        "security-unit-directory"
      ],
      "primarySourceId": "security-office-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "general-service",
          "name": "综合服务办公室",
          "aliases": [
            "户籍科",
            "户政服务",
            "政保"
          ],
          "responsibilities": [
            "部门综合事务、户籍迁转、政保审查与校园安全宣传"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区保卫楼",
              "room": "204、207、215",
              "phones": [
                "025-52090109",
                "025-52090105",
                "025-52090122"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "沙塘园保卫处",
              "room": "102、302",
              "phones": [
                "025-83792086",
                "025-83792676"
              ],
              "placeId": "security"
            }
          ]
        },
        {
          "id": "fire-safety",
          "name": "消防监管办公室",
          "aliases": [
            "消防科",
            "动火审批"
          ],
          "responsibilities": [
            "消防制度、检查整改、设施建设、培训演练和动火施工审批"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区保卫楼",
              "room": "211",
              "phones": [
                "025-52090119"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "沙塘园保卫处",
              "room": "301",
              "phones": [
                "025-83792675"
              ],
              "placeId": "security"
            }
          ]
        },
        {
          "id": "order-management",
          "name": "秩序管理办公室",
          "aliases": [
            "交通科",
            "治安科",
            "监控调阅",
            "车辆通行"
          ],
          "responsibilities": [
            "校园交通治安、车辆与人员通行、监控调阅和安防系统建设"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区保卫楼",
              "room": "206、207、209",
              "phones": [
                "025-52090102",
                "025-52090122"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "沙塘园保卫处",
              "room": "103",
              "phones": [
                "025-83792671"
              ],
              "placeId": "security"
            }
          ]
        },
        {
          "id": "campus-guard",
          "name": "校卫总队",
          "aliases": [
            "校卫队",
            "校园报警",
            "门岗巡逻"
          ],
          "responsibilities": [
            "门岗巡逻、交通秩序、突发事件处置和大型活动安全保障"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区保卫楼",
              "room": "101、107、310、312",
              "phones": [
                "025-52090110",
                "025-52090107",
                "025-52090106"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "沙塘园保卫处",
              "room": "101、104、105",
              "phones": [
                "025-83790110",
                "025-83793213"
              ],
              "placeId": "security"
            },
            {
              "campusId": "dingjiaqiao",
              "location": "丁家桥校区文枢楼",
              "room": "103",
              "phones": [
                "025-83270110"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "general-services",
      "name": "总务处",
      "aliases": [
        "后勤",
        "后勤保障",
        "报修",
        "水电服务",
        "餐饮服务"
      ],
      "category": "campus-services",
      "summary": "统筹校园餐饮、物业、能源水电、修缮、交通和环境等后勤保障服务。",
      "responsibilities": [
        "食堂和餐饮服务监管",
        "水电能源与零星维修协调",
        "物业、环境和校园生活保障",
        "校车与交通保障相关服务"
      ],
      "website": "https://zwc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "总务处后勤服务体系",
          "room": "按具体业务分流",
          "phones": [
            "025-52090314"
          ],
          "serviceNote": "服务监督电话工作日8:30—12:00、13:30—17:00；报修和餐饮等应优先使用官网对应入口。"
        },
        {
          "campusId": "sipailou",
          "location": "四牌楼校区后勤服务点",
          "room": "按具体业务分流",
          "phones": [
            "025-52090314"
          ],
          "serviceNote": "该电话用于服务监督与分流，具体现场服务点以总务处页面和校内平台为准。"
        }
      ],
      "links": [
        {
          "label": "总务处服务入口",
          "url": "https://zwc.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "general-services-current"
      ],
      "primarySourceId": "general-services-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "general-supervision",
          "name": "综合协调与服务监督",
          "aliases": [
            "后勤监督",
            "总务投诉"
          ],
          "responsibilities": [
            "后勤综合协调、服务监督、意见受理与业务分流"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "总务处后勤服务体系",
              "room": "按具体业务分流",
              "phones": [
                "025-52090314"
              ],
              "serviceNote": "监督电话工作日8:30—12:00、13:30—17:00。"
            }
          ]
        },
        {
          "id": "campus-operations",
          "name": "校园运维管理",
          "aliases": [
            "校园运维",
            "零修报修"
          ],
          "responsibilities": [
            "校园设施运维、零星维修和公共设施修缮协调"
          ],
          "offices": [],
          "serviceNote": "优先从总务处官网“零修报修/公共设施修缮”入口办理；科室房间未集中公开。"
        },
        {
          "id": "catering",
          "name": "膳食与餐饮服务",
          "aliases": [
            "食堂管理",
            "餐饮投诉"
          ],
          "responsibilities": [
            "食堂运行、食品安全、餐饮服务监管和场地使用协调"
          ],
          "offices": [],
          "serviceNote": "从总务处“餐饮服务”入口查询；需要人工分流可拨打监督电话025-52090314。"
        },
        {
          "id": "energy-water-electricity",
          "name": "能源、水电与空调服务",
          "aliases": [
            "水电费",
            "能源管理",
            "空调安装"
          ],
          "responsibilities": [
            "能源运行、水电费用、空调安装和相关保障服务"
          ],
          "offices": [],
          "serviceNote": "水电缴费和空调安装优先通过总务处对应线上入口办理。"
        },
        {
          "id": "property-environment",
          "name": "物业、环境与绿化管理",
          "aliases": [
            "物业管理",
            "绿化管理",
            "树木修剪"
          ],
          "responsibilities": [
            "物业服务监督、校园环境、绿地和树木修剪占用管理"
          ],
          "offices": [],
          "serviceNote": "树木修剪、砍伐和绿地占用从总务处服务指南进入。"
        },
        {
          "id": "transport-meetings",
          "name": "车辆交通与会务服务",
          "aliases": [
            "校车",
            "接驳车",
            "车辆服务",
            "会务服务"
          ],
          "responsibilities": [
            "校园车辆与接驳保障、交通服务和会务支持"
          ],
          "offices": [],
          "serviceNote": "班车与接驳时刻易变，以总务处当期通告为准。"
        },
        {
          "id": "furniture-assets",
          "name": "家具与后勤固定资产服务",
          "aliases": [
            "家具采购",
            "家具报废"
          ],
          "responsibilities": [
            "家具类固定资产采购、管理和报废流程服务"
          ],
          "offices": [],
          "serviceNote": "优先使用家具管理系统及总务处固定资产服务入口。"
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "information-center",
      "name": "网络与信息中心",
      "aliases": [
        "网信中心",
        "网络中心",
        "信息中心",
        "校园网服务",
        "80808"
      ],
      "category": "information",
      "summary": "负责校园网络、统一身份认证、公共信息系统、数据中心和网络安全等服务。",
      "responsibilities": [
        "校园网接入与网络故障支持",
        "统一身份认证和公共账号服务",
        "校级信息系统、数据与基础平台运行",
        "网络与信息安全保障"
      ],
      "website": "https://nic.seu.edu.cn/",
      "offices": [
        {
          "campusId": "sipailou",
          "location": "进香河校区综合楼（四牌楼附近）",
          "room": "二楼",
          "phones": [
            "025-83790808"
          ],
          "email": "80808@seu.edu.cn",
          "serviceNote": "校园网、账号和公共信息系统问题可先拨打统一服务热线。"
        },
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区金智楼北楼",
          "room": "二楼",
          "phones": [
            "025-83790808"
          ],
          "email": "80808@seu.edu.cn",
          "serviceNote": "复杂业务可先通过服务热线或邮件确认负责科室。"
        }
      ],
      "links": [
        {
          "label": "网络与信息中心",
          "url": "https://nic.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "nic-current"
      ],
      "primarySourceId": "nic-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "user-service",
          "name": "用户服务与统一热线",
          "aliases": [
            "80808",
            "网络报修",
            "账号报修"
          ],
          "responsibilities": [
            "校园网、账号、统一身份认证和公共信息系统问题受理分流"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "进香河校区综合楼",
              "room": "二楼",
              "phones": [
                "025-83790808"
              ],
              "email": "80808@seu.edu.cn"
            },
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区金智楼北楼",
              "room": "二楼",
              "phones": [
                "025-83790808"
              ],
              "email": "80808@seu.edu.cn"
            }
          ]
        },
        {
          "id": "campus-network",
          "name": "校园网运行服务",
          "aliases": [
            "校园网",
            "无线网",
            "宿舍网"
          ],
          "responsibilities": [
            "校园网络接入、运行维护、故障处置和网络基础设施服务"
          ],
          "offices": [],
          "serviceNote": "统一拨打025-83790808或邮件80808@seu.edu.cn分流。"
        },
        {
          "id": "information-systems",
          "name": "信息系统与数字校园",
          "aliases": [
            "信息门户",
            "网上办事大厅",
            "统一身份认证"
          ],
          "responsibilities": [
            "校级信息系统、数字校园平台和统一身份认证运行支持"
          ],
          "offices": [],
          "serviceNote": "系统故障通过统一服务热线或网络报修入口提交。"
        },
        {
          "id": "data-computing",
          "name": "数据、算力与基础平台",
          "aliases": [
            "数据中心",
            "国产算力",
            "算力服务"
          ],
          "responsibilities": [
            "数据中心、公共数据平台和校级算力基础服务"
          ],
          "offices": [],
          "serviceNote": "具体申请条件和入口以中心官网“国产算力服务/校园信息化建设”为准。"
        },
        {
          "id": "cybersecurity",
          "name": "网络与信息安全",
          "aliases": [
            "网络安全",
            "信息安全"
          ],
          "responsibilities": [
            "网络安全监测、预警、应急处置和安全宣传"
          ],
          "offices": [],
          "serviceNote": "普通账号与网络故障仍先由统一服务热线分流；安全事件按中心官网要求上报。"
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "library-department",
      "name": "图书馆",
      "aliases": [
        "东大图书馆",
        "李文正图书馆",
        "四牌楼图书馆",
        "丁家桥图书馆"
      ],
      "category": "library-archives",
      "summary": "提供馆藏借阅、学习空间、数字资源、学科咨询、查收查引和文献传递等服务。",
      "responsibilities": [
        "纸质馆藏借阅与空间服务",
        "数据库和数字资源访问",
        "查收查引、科技查新与学科咨询",
        "文献传递、培训与阅读推广"
      ],
      "website": "https://lib.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区李文正图书馆",
          "room": "总服务台及办公室",
          "phones": [
            "025-52090331",
            "025-52090328"
          ],
          "email": "library@pub.seu.edu.cn",
          "serviceNote": "空间通常8:00—22:00开放，具体以节假日公告为准。"
        },
        {
          "campusId": "sipailou",
          "location": "四牌楼校区图书馆",
          "room": "一楼总服务台",
          "phones": [
            "025-83792630"
          ],
          "email": "library@pub.seu.edu.cn",
          "placeId": "library",
          "serviceNote": "借还、自修和多数阅览空间通常8:00—22:00开放。"
        },
        {
          "campusId": "dingjiaqiao",
          "location": "丁家桥校区图书馆",
          "room": "总服务台",
          "phones": [
            "025-83272462"
          ],
          "email": "library@pub.seu.edu.cn",
          "serviceNote": "医学馆藏与开放安排以图书馆当期公告为准。"
        }
      ],
      "links": [
        {
          "label": "开放时间",
          "url": "https://lib.seu.edu.cn/list.php?fid=220"
        },
        {
          "label": "联系我们",
          "url": "https://lib.seu.edu.cn/list.php?fid=630"
        }
      ],
      "sourceIds": [
        "library-open-current",
        "library-contact-current",
        "library-unit-directory"
      ],
      "primarySourceId": "library-contact-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "resource-development",
          "name": "资源发展部",
          "aliases": [
            "文献资源建设",
            "图书采购"
          ],
          "responsibilities": [
            "纸质与数字文献采购、编目、馆藏发展、资产和捐赠交换资料管理"
          ],
          "offices": [],
          "serviceNote": "业务联系方式由图书馆办公室或总服务台分流。"
        },
        {
          "id": "reader-services",
          "name": "读者服务部",
          "aliases": [
            "借还书",
            "证籍管理",
            "空间服务"
          ],
          "responsibilities": [
            "李文正馆借阅阅览、空间、证籍、自助设备、阅读推广和学习支持"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "李文正图书馆",
              "room": "总服务台",
              "phones": [
                "025-52090331"
              ],
              "email": "library@pub.seu.edu.cn"
            }
          ]
        },
        {
          "id": "urban-reader-services",
          "name": "城区读者服务部",
          "aliases": [
            "四牌楼图书馆服务",
            "丁家桥图书馆服务"
          ],
          "responsibilities": [
            "四牌楼、丁家桥和江北相关流通阅览、空间、证籍与学习支持"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "四牌楼校区图书馆",
              "room": "一楼总服务台",
              "phones": [
                "025-83792630"
              ],
              "placeId": "library"
            },
            {
              "campusId": "dingjiaqiao",
              "location": "丁家桥校区图书馆",
              "room": "总服务台",
              "phones": [
                "025-83272462"
              ]
            }
          ]
        },
        {
          "id": "subject-services",
          "name": "学科服务部",
          "aliases": [
            "学科馆员",
            "查收查引",
            "参考咨询"
          ],
          "responsibilities": [
            "学科联络、查收查引、科研支持、信息素养教育和参考咨询"
          ],
          "offices": [],
          "serviceNote": "优先从图书馆网站“科研支持/学科馆员”入口提交，现场可在总服务台咨询。"
        },
        {
          "id": "novelty-ip-services",
          "name": "查新与知识产权信息服务部",
          "aliases": [
            "科技查新",
            "知识产权中心",
            "专利分析"
          ],
          "responsibilities": [
            "科技查新、专利信息分析、知识产权信息和相关培训服务"
          ],
          "offices": [],
          "serviceNote": "通过图书馆网站“科技查新/知识产权服务”入口查看流程与当期联系人。"
        },
        {
          "id": "technology-data",
          "name": "技术支持与数据管理部",
          "aliases": [
            "图书馆技术部",
            "智慧图书馆"
          ],
          "responsibilities": [
            "智慧图书馆、信息系统、网络设备、业务数据和数字资源长期保存"
          ],
          "offices": [],
          "serviceNote": "读者端系统问题可先联系总服务台或智能咨询。"
        },
        {
          "id": "culture-special-collections",
          "name": "文化与特藏部",
          "aliases": [
            "特藏部",
            "阅读推广"
          ],
          "responsibilities": [
            "特藏资源、文化展陈、阅读推广、融媒体和图书馆文化品牌活动"
          ],
          "offices": [],
          "serviceNote": "特藏开放和活动安排以图书馆当期公告为准。"
        },
        {
          "id": "library-office",
          "name": "办公室",
          "aliases": [
            "图书馆办公室"
          ],
          "responsibilities": [
            "图书馆综合行政、党务人事、财务科研、馆舍物业和外联协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "李文正图书馆",
              "room": "办公室",
              "phones": [
                "025-52090328"
              ],
              "email": "library@pub.seu.edu.cn"
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "archives-department",
      "name": "档案馆",
      "aliases": [
        "学校档案馆",
        "查档",
        "成绩档案",
        "学籍档案"
      ],
      "category": "library-archives",
      "summary": "负责学校档案收集、保管、利用、编研和专门档案服务，支持线上预约。",
      "responsibilities": [
        "学校各类档案接收与保管",
        "校史、学籍及相关档案查询利用",
        "专门档案与证明服务",
        "档案数字化、编研与展陈"
      ],
      "website": "https://archives.seu.edu.cn/",
      "offices": [
        {
          "campusId": "sipailou",
          "location": "东南大学档案馆",
          "room": "保管利用部421、收集指导部512、专门档案部422等",
          "phones": [
            "025-83792861",
            "025-83794725",
            "025-83792913"
          ],
          "placeId": "archives-building",
          "serviceNote": "建议先通过网上办事大厅预约，并按事项确认房间和材料。"
        }
      ],
      "links": [
        {
          "label": "档案馆服务信息",
          "url": "https://archives.seu.edu.cn/789/list.htm"
        },
        {
          "label": "网上办事大厅说明",
          "url": "https://archives.seu.edu.cn/2020/1019/c30521a350299/page.htm"
        }
      ],
      "sourceIds": [
        "archives-service",
        "archives-online-hall"
      ],
      "primarySourceId": "archives-online-hall",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "custody-use",
          "name": "保管利用部",
          "aliases": [
            "查档服务",
            "档案利用"
          ],
          "responsibilities": [
            "馆藏档案保管、查询利用与相关证明服务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "东南大学档案馆",
              "room": "421",
              "phones": [
                "025-83792861"
              ],
              "placeId": "archives-building"
            }
          ]
        },
        {
          "id": "collection-guidance",
          "name": "收集指导部",
          "aliases": [
            "档案归档",
            "档案接收"
          ],
          "responsibilities": [
            "校内档案收集接收、归档业务指导与质量管理"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "东南大学档案馆",
              "room": "512",
              "phones": [
                "025-83794725"
              ],
              "placeId": "archives-building"
            }
          ]
        },
        {
          "id": "special-archives",
          "name": "专门档案部",
          "aliases": [
            "专门档案",
            "专业档案"
          ],
          "responsibilities": [
            "专门类别档案管理与相关查询服务"
          ],
          "offices": [
            {
              "campusId": "sipailou",
              "location": "东南大学档案馆",
              "room": "422",
              "phones": [
                "025-83792913"
              ],
              "placeId": "archives-building"
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "undergraduate-admissions",
      "name": "本科生招生办公室",
      "aliases": [
        "招生办",
        "本科招办",
        "东大招生咨询"
      ],
      "category": "admissions-employment",
      "summary": "负责本科招生政策、咨询、宣传和录取相关工作。",
      "responsibilities": [
        "本科招生政策和报考咨询",
        "招生宣传与咨询活动",
        "录取信息和特殊类型招生服务",
        "招生资料与信息发布"
      ],
      "website": "https://zsb.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区本科生招生办公室",
          "room": "以招生网最新说明为准",
          "phones": [
            "400-691-0286",
            "025-52090271"
          ],
          "email": "zhaoban@seu.edu.cn",
          "serviceNote": "热线用于本科招生咨询；具体咨询高峰期安排以招生网公告为准。"
        }
      ],
      "links": [
        {
          "label": "本科招生网",
          "url": "https://zsb.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "admissions-contact-current"
      ],
      "primarySourceId": "admissions-contact-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "consultation",
          "name": "招生咨询与综合服务",
          "aliases": [
            "招生热线",
            "报考咨询"
          ],
          "responsibilities": [
            "本科招生政策、报考、录取与日常综合咨询"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区本科生招生办公室",
              "room": "以招生网最新说明为准",
              "phones": [
                "400-691-0286",
                "025-52090271"
              ],
              "email": "zhaoban@seu.edu.cn"
            }
          ]
        },
        {
          "id": "special-admissions",
          "name": "专题与特殊类型招生",
          "aliases": [
            "强基计划",
            "综合评价",
            "高校专项",
            "保送生",
            "港澳台招生"
          ],
          "responsibilities": [
            "强基、综合评价、外语保送、少年生、艺术、港澳台侨、高校专项等专题招生"
          ],
          "offices": [],
          "serviceNote": "不同项目时间和联系人随年度简章变化，统一从招生网对应专题和热线查询。"
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "employment-services",
      "name": "学生就业指导中心",
      "aliases": [
        "就业办",
        "就业指导中心",
        "生涯教育中心",
        "就业手续"
      ],
      "category": "admissions-employment",
      "summary": "提供学生生涯教育、招聘信息、就业指导和就业手续相关服务。",
      "responsibilities": [
        "生涯规划和就业指导",
        "校园招聘与用人单位服务",
        "就业手续、去向和材料咨询",
        "就业市场与信息平台维护"
      ],
      "website": "https://xsc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区大学生活动中心",
          "room": "就业指导相关办公室",
          "phones": [
            "025-52090274",
            "025-52090275"
          ],
          "serviceNote": "具体手续可先通过电话或学校就业平台核对。"
        },
        {
          "campusId": "sipailou",
          "location": "四牌楼校区就业服务点",
          "room": "房间以学生处最新通知为准",
          "phones": [
            "025-83795903",
            "025-83792592"
          ],
          "serviceNote": "四牌楼办公地点可能随学期调整，出发前务必电话确认。"
        }
      ],
      "links": [
        {
          "label": "学生处机构与联系方式",
          "url": "https://xsc.seu.edu.cn/65021/list.htm"
        }
      ],
      "sourceIds": [
        "employment-contact-current"
      ],
      "primarySourceId": "employment-contact-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "employer-services",
          "name": "用人单位与校园招聘服务",
          "aliases": [
            "单位招聘",
            "校园宣讲会",
            "双选会"
          ],
          "responsibilities": [
            "用人单位接洽、校园招聘活动、岗位信息与招聘市场服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "就业指导相关办公室",
              "phones": [
                "025-52090274"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区就业服务点",
              "room": "出发前电话确认",
              "phones": [
                "025-83795903"
              ]
            }
          ]
        },
        {
          "id": "student-services",
          "name": "学生咨询与就业手续服务",
          "aliases": [
            "就业手续",
            "去向登记",
            "就业材料"
          ],
          "responsibilities": [
            "学生就业政策、去向登记、材料与相关手续咨询"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区大学生活动中心",
              "room": "就业指导相关办公室",
              "phones": [
                "025-52090275"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区就业服务点",
              "room": "出发前电话确认",
              "phones": [
                "025-83792592"
              ]
            }
          ]
        },
        {
          "id": "career-education",
          "name": "生涯教育与就业指导",
          "aliases": [
            "生涯规划",
            "就业指导"
          ],
          "responsibilities": [
            "生涯规划课程、求职能力提升、就业咨询和基层就业引导"
          ],
          "offices": [],
          "serviceNote": "课程和活动地点随学期变化，可由学生咨询电话025-52090275分流。"
        }
      ],
      "aggregateInto": "student-affairs"
    },
    {
      "id": "lab-equipment-office",
      "name": "实验室与设备管理处",
      "aliases": [
        "设备处",
        "实验室管理处",
        "实验室安全",
        "大型仪器共享"
      ],
      "category": "assets-construction",
      "summary": "负责实验室建设与安全、仪器设备管理、大型仪器开放共享等工作。",
      "responsibilities": [
        "实验室建设与安全管理",
        "仪器设备采购论证、验收和处置协调",
        "大型仪器开放共享与绩效管理",
        "实验技术队伍和相关平台服务"
      ],
      "website": "https://sbc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区后勤公寓楼",
          "room": "5—6楼相关办公室",
          "phones": [],
          "serviceNote": "具体事项按设备、实验室安全和共享平台分流；官网未在同一页面集中公布电话，建议先用线上入口。"
        },
        {
          "campusId": "sipailou",
          "location": "微波楼",
          "room": "504",
          "phones": [
            "025-83792432"
          ],
          "placeId": "microwave-building",
          "serviceNote": "大型仪器共享等业务可先电话确认或使用共享平台。"
        }
      ],
      "links": [
        {
          "label": "实验室与设备管理处",
          "url": "https://sbc.seu.edu.cn/"
        },
        {
          "label": "大型仪器共享平台",
          "url": "https://dypub.seu.edu.cn/main/equips"
        }
      ],
      "sourceIds": [
        "lab-equipment-current",
        "equipment-sharing-platform",
        "lab-equipment-organization",
        "lab-management-contact",
        "equipment-management-contact",
        "large-equipment-contact",
        "lab-safety-contact"
      ],
      "primarySourceId": "lab-equipment-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "department-office",
          "name": "处办公室",
          "aliases": [
            "实设处办公室",
            "设备处办公室"
          ],
          "responsibilities": [
            "部门综合协调、公文用印和日常行政事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区后勤公寓楼",
              "room": "5—6楼，具体房间以官网为准",
              "phones": []
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "504",
              "phones": [],
              "placeId": "microwave-building"
            }
          ]
        },
        {
          "id": "laboratory-management",
          "name": "实验室管理科",
          "aliases": [
            "实验室建设",
            "实验室数据"
          ],
          "responsibilities": [
            "实验室建设管理、实验技术队伍、教学资源、实验材料与数据上报"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区后勤公寓楼",
              "room": "604、605、606",
              "phones": [
                "025-52090355",
                "025-52090354",
                "025-52091617"
              ]
            }
          ],
          "sourceIds": [
            "lab-management-contact"
          ]
        },
        {
          "id": "equipment-management",
          "name": "设备管理科",
          "aliases": [
            "设备建账",
            "设备报废",
            "仪器设备采购"
          ],
          "responsibilities": [
            "仪器设备采购论证、建账、调拨、使用与报废等全生命周期管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区后勤公寓楼",
              "room": "505",
              "phones": [
                "025-52090231"
              ],
              "serviceNote": "通常周一至周五办理。"
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "504",
              "phones": [
                "025-83792431"
              ],
              "placeId": "microwave-building",
              "serviceNote": "公开页面标注通常周二、周五坐班。"
            }
          ],
          "sourceIds": [
            "equipment-management-contact"
          ]
        },
        {
          "id": "large-equipment-platform",
          "name": "大型装备平台科",
          "aliases": [
            "大型仪器共享",
            "大仪平台",
            "大型设备"
          ],
          "responsibilities": [
            "大型仪器论证验收、开放共享、维修测试基金、绩效考核和共享平台管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区后勤公寓楼",
              "room": "503、504",
              "phones": [
                "025-52091041"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "504",
              "phones": [
                "025-83792432",
                "025-83792705"
              ],
              "placeId": "microwave-building"
            }
          ],
          "sourceIds": [
            "large-equipment-contact",
            "equipment-sharing-platform"
          ]
        },
        {
          "id": "lab-safety-management",
          "name": "实验室安全管理科",
          "aliases": [
            "实验室安全",
            "危化品",
            "危废",
            "辐射安全"
          ],
          "responsibilities": [
            "安全准入、检查整改、危化品、辐射、特种设备、气瓶和危险废弃物管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区后勤公寓楼",
              "room": "509、510",
              "phones": [
                "025-52091627",
                "025-52090353"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "微波楼",
              "room": "504",
              "phones": [
                "025-83792702",
                "025-83792703"
              ],
              "placeId": "microwave-building"
            }
          ],
          "sourceIds": [
            "lab-safety-contact"
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "capital-construction",
      "name": "基本建设处",
      "aliases": [
        "基建处",
        "工程管理科",
        "计划与造价管理科",
        "校园建设"
      ],
      "category": "assets-construction",
      "summary": "负责学校基本建设规划、项目设计、投资造价、施工管理、验收移交和保修协调。",
      "responsibilities": [
        "校园基本建设规划与项目前期",
        "设计、投资估算和造价管理",
        "施工质量、进度和安全管理",
        "竣工验收、移交与保修协调"
      ],
      "website": "https://jbjsc.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区总务楼",
          "room": "办公室105；计划造价102/103；工程管理106/107",
          "phones": [
            "025-52091042",
            "025-52091363",
            "025-52090482"
          ],
          "serviceNote": "工程咨询应按项目阶段联系计划造价、工程管理或综合办公室。"
        }
      ],
      "links": [
        {
          "label": "基建处联系方式",
          "url": "https://jbjsc.seu.edu.cn/18326/list.htm"
        },
        {
          "label": "校园建设动态",
          "url": "https://jbjsc.seu.edu.cn/"
        }
      ],
      "sourceIds": [
        "capital-construction-contact"
      ],
      "primarySourceId": "capital-construction-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "planning-cost",
          "name": "计划与造价管理办公室",
          "aliases": [
            "计划造价办",
            "造价科"
          ],
          "responsibilities": [
            "建设项目前期计划、投资估算、概预算和造价控制"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区总务楼",
              "room": "102、103",
              "phones": [
                "025-52091363",
                "025-52091026"
              ]
            }
          ]
        },
        {
          "id": "engineering-management",
          "name": "工程管理办公室",
          "aliases": [
            "工程管理科",
            "施工管理"
          ],
          "responsibilities": [
            "建设项目施工质量、进度、安全、验收移交与保修协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区总务楼",
              "room": "106、107",
              "phones": [
                "025-52090482",
                "025-52091364"
              ]
            }
          ]
        },
        {
          "id": "technical-management",
          "name": "技术管理办公室",
          "aliases": [
            "总工办",
            "技术科"
          ],
          "responsibilities": [
            "建设项目设计、技术方案和重大技术问题协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区总务楼",
              "room": "108",
              "phones": [
                "025-52090486"
              ]
            }
          ]
        },
        {
          "id": "general-office",
          "name": "综合办公室",
          "aliases": [
            "基建处办公室"
          ],
          "responsibilities": [
            "基本建设处综合行政、文档、协调和来访分流"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区总务楼",
              "room": "105",
              "phones": [
                "025-52091042"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "development-planning",
      "name": "党委发展规划与学科建设部（发展规划与学科建设处）",
      "aliases": [
        "发展规划处",
        "学科建设处",
        "双一流办公室",
        "规划部"
      ],
      "category": "planning",
      "summary": "负责学校事业发展规划、综合改革、学科建设、资源配置和事业数据分析。",
      "responsibilities": [
        "中长期事业发展规划与评估",
        "一流大学和一流学科建设",
        "学科布局、申报和评估",
        "机构与资源配置规划",
        "事业数据统计分析"
      ],
      "website": "https://ghb.seu.edu.cn/main.htm",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区行政楼",
          "room": "具体房间以部门通知为准",
          "phones": [
            "025-52091387"
          ],
          "serviceNote": "面向院系和校内单位的规划、学科建设业务可先通过综合电话分流。"
        }
      ],
      "links": [
        {
          "label": "部门网站",
          "url": "https://ghb.seu.edu.cn/main.htm"
        }
      ],
      "sourceIds": [
        "development-planning-contact",
        "development-planning-units"
      ],
      "primarySourceId": "development-planning-contact",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "department-office",
          "name": "办公室",
          "aliases": [
            "规划处办公室"
          ],
          "responsibilities": [
            "综合行政、协调联络和部门日常事务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "511",
              "phones": [
                "025-52091386"
              ]
            }
          ]
        },
        {
          "id": "planning-governance",
          "name": "发展规划与治理体系",
          "aliases": [
            "规划科",
            "治理体系"
          ],
          "responsibilities": [
            "学校事业发展规划、综合改革与治理体系研究"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "509、511",
              "phones": [
                "025-52091386",
                "025-52091380"
              ]
            }
          ]
        },
        {
          "id": "discipline-resources",
          "name": "学科建设与资源配置",
          "aliases": [
            "学科建设科",
            "双一流办公室",
            "资源配置"
          ],
          "responsibilities": [
            "学科建设、双一流建设、项目库和资源配置统筹"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "508、509",
              "phones": [
                "025-52091379",
                "025-52091383",
                "025-52091384"
              ]
            }
          ]
        },
        {
          "id": "information-data",
          "name": "信息与数据",
          "aliases": [
            "事业数据",
            "规划数据"
          ],
          "responsibilities": [
            "学校事业数据、统计分析和规划决策信息支持"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区行政楼",
              "room": "511",
              "phones": [
                "025-52091386",
                "025-52091387",
                "025-83793530"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    },
    {
      "id": "sports-department",
      "name": "体育系",
      "aliases": [
        "体育部",
        "体育教务",
        "体育场馆管理",
        "群体办公室"
      ],
      "category": "sports",
      "summary": "承担公共体育教学、学生体质与群体活动、运动队和体育场馆管理等工作。",
      "responsibilities": [
        "本科公共体育课程教学",
        "体质测试、群体活动和校园体育",
        "运动队训练与竞赛组织",
        "体育场馆运行与相关咨询"
      ],
      "website": "https://tyx.seu.edu.cn/",
      "offices": [
        {
          "campusId": "jiulonghu",
          "location": "九龙湖校区体育馆主馆",
          "room": "101行政；102教务；其他办公室",
          "phones": [
            "025-52090819",
            "025-52090820",
            "025-52090821"
          ],
          "serviceNote": "教务办公室常规周一、周三在九龙湖，临时安排以体育系通知为准。"
        },
        {
          "campusId": "sipailou",
          "location": "四牌楼校区体育馆",
          "room": "101教务办公室",
          "phones": [
            "025-83792472",
            "025-83794442"
          ],
          "placeId": "gym",
          "serviceNote": "教务办公室常规周二、周四、周五在四牌楼，场馆开放另按公告执行。"
        }
      ],
      "links": [
        {
          "label": "办公地址及电话",
          "url": "https://tyx.seu.edu.cn/2160/list.htm"
        }
      ],
      "sourceIds": [
        "sports-contact-current"
      ],
      "primarySourceId": "sports-contact-current",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "units": [
        {
          "id": "administrative-office",
          "name": "行政办公室",
          "aliases": [
            "体育系办公室"
          ],
          "responsibilities": [
            "体育系综合行政、师生事务和对外联络"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区体育馆主馆",
              "room": "101",
              "phones": [
                "025-52090819"
              ]
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区体育馆",
              "room": "行政办公室",
              "phones": [
                "025-83792472"
              ],
              "placeId": "gym"
            }
          ]
        },
        {
          "id": "academic-office",
          "name": "教务办公室",
          "aliases": [
            "体育教务",
            "体育课选课"
          ],
          "responsibilities": [
            "公共体育课程、选课、成绩与教学运行服务"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区体育馆主馆",
              "room": "102",
              "phones": [
                "025-52090820"
              ],
              "serviceNote": "公开页面标注通常周一、周三在九龙湖。"
            },
            {
              "campusId": "sipailou",
              "location": "四牌楼校区体育馆",
              "room": "101",
              "phones": [
                "025-83794442"
              ],
              "placeId": "gym",
              "serviceNote": "公开页面标注通常周二、周四、周五在四牌楼。"
            }
          ]
        },
        {
          "id": "mass-sports",
          "name": "群体与课外体育",
          "aliases": [
            "群体办公室",
            "阳光体育",
            "体质测试"
          ],
          "responsibilities": [
            "学生体质测试、群体活动、体育社团和校园竞赛"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区体育馆主馆",
              "room": "108",
              "phones": [
                "025-52090821"
              ]
            }
          ]
        },
        {
          "id": "teaching-postgraduate",
          "name": "教学与研究生工作",
          "aliases": [
            "体育研究生",
            "体育教学管理"
          ],
          "responsibilities": [
            "体育教学建设、研究生培养与相关科研协调"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区体育馆主馆",
              "room": "108",
              "phones": [
                "025-52090822"
              ]
            }
          ]
        },
        {
          "id": "stadium-management",
          "name": "九龙湖体育场管理办公室",
          "aliases": [
            "桃园田径场管理",
            "场馆管理"
          ],
          "responsibilities": [
            "九龙湖体育场运行、使用协调与场地管理"
          ],
          "offices": [
            {
              "campusId": "jiulonghu",
              "location": "九龙湖校区桃园田径场",
              "room": "看台下管理办公室",
              "phones": [
                "025-52090824"
              ]
            }
          ]
        }
      ],
      "aggregateInto": null
    }
  ],
  "sources": [
    {
      "id": "history-museum-intro",
      "title": "东南大学校史馆简介",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/18649/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-17",
      "scope": "校史馆建筑、展陈、开放时间与联系电话"
    },
    {
      "id": "history-workshop",
      "title": "工艺实习场",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208752/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "工艺实习场沿革与建筑特征"
    },
    {
      "id": "history-auditorium",
      "title": "大礼堂",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208759/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "大礼堂建设、扩建与建筑特征"
    },
    {
      "id": "history-mengfang",
      "title": "孟芳图书馆",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208767/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "孟芳图书馆建设、命名、扩建与现状"
    },
    {
      "id": "history-meian",
      "title": "梅庵",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208741/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "梅庵名称由来、重建与展陈"
    },
    {
      "id": "history-liuchaosong",
      "title": "六朝松",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208749/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "六朝松树种、年代与校园文化意义"
    },
    {
      "id": "history-gym",
      "title": "体育馆",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208751/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "体育馆建设、规模与建筑特征"
    },
    {
      "id": "history-zhongda",
      "title": "中大院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208770/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "原生物馆建设、扩建与现用途"
    },
    {
      "id": "history-jianxiong",
      "title": "健雄院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208765/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-17",
      "scope": "原科学馆建设、命名与现用途"
    },
    {
      "id": "history-south-gate",
      "title": "南大门",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0321/c19863a210026/page.htm",
      "type": "official",
      "publishedAt": "2018-03-21",
      "verifiedAt": "2026-08-17",
      "scope": "南大门设计、建设与建筑特征"
    },
    {
      "id": "history-wu-memorial",
      "title": "吴健雄纪念馆",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0321/c19863a210027/page.htm",
      "type": "official",
      "publishedAt": "2018-03-21",
      "verifiedAt": "2026-08-17",
      "scope": "吴健雄纪念馆设计、落成与空间"
    },
    {
      "id": "sipailou-overview",
      "title": "四牌楼校区简介",
      "publisher": "东南大学四牌楼校区党工委、管委会",
      "url": "https://splgwh.seu.edu.cn/25035/main.psp",
      "type": "official",
      "verifiedAt": "2026-08-17",
      "scope": "校区沿革、历史建筑、保护名录与功能定位"
    },
    {
      "id": "campus-panorama-2026",
      "title": "东南大学校园全景图发布",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2026/0605/c18650a570327/page.htm",
      "type": "official",
      "publishedAt": "2026-06-05",
      "verifiedAt": "2026-08-17",
      "scope": "由档案馆、基本建设处等单位共同核验的校园空间资料"
    },
    {
      "id": "undergraduate-status-office",
      "title": "学籍管理科",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/xjk_21855/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-17",
      "volatile": true,
      "scope": "本科生学生证、成绩单盖章、在读证明及办公地点电话"
    },
    {
      "id": "campus-card-guide",
      "title": "校园卡服务指南",
      "publisher": "东南大学",
      "url": "https://lgbc.seu.edu.cn/xykfwzn/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-17",
      "volatile": true,
      "scope": "校园卡补换卡、自助设备、服务台时间地点与电话"
    },
    {
      "id": "archives-service",
      "title": "档案馆服务时间、地点和流程",
      "publisher": "东南大学档案馆",
      "url": "https://archives.seu.edu.cn/789/list.htm",
      "type": "official",
      "publishedAt": "2016-05-20",
      "verifiedAt": "2026-08-17",
      "volatile": true,
      "scope": "档案馆各部门房间与联系电话"
    },
    {
      "id": "archives-online-hall",
      "title": "东南大学档案馆网上办事大厅",
      "publisher": "东南大学档案馆",
      "url": "https://archives.seu.edu.cn/2020/1019/c30521a350299/page.htm",
      "type": "official",
      "publishedAt": "2020-10-19",
      "verifiedAt": "2026-08-17",
      "volatile": true,
      "scope": "网上预约入口与线下办理信息"
    },
    {
      "id": "security-office-current",
      "title": "东南大学保卫处",
      "publisher": "东南大学保卫处",
      "url": "https://bwc.seu.edu.cn/",
      "type": "official",
      "verifiedAt": "2026-08-17",
      "volatile": true,
      "scope": "各校区报警与户籍服务电话"
    },
    {
      "id": "security-room-reference",
      "title": "博士后离校手续办理流程（保卫处办理地点）",
      "publisher": "东南大学人事处",
      "url": "https://rsc.seu.edu.cn/_upload/article/10/54/f842b7fd4342834739e247acca2d/be474cec-200b-42f2-afed-797e9d98d67d.pdf",
      "type": "official",
      "verifiedAt": "2026-08-17",
      "volatile": true,
      "scope": "四牌楼保卫处户籍科房间参考"
    },
    {
      "id": "openstreetmap",
      "title": "OpenStreetMap",
      "publisher": "OpenStreetMap contributors",
      "url": "https://www.openstreetmap.org/copyright",
      "type": "open-data",
      "verifiedAt": "2026-08-17",
      "scope": "首期建筑经纬度，ODbL 1.0；非校方权威坐标"
    },
    {
      "id": "history-zhongshan",
      "title": "中山院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0321/c19863a210034/page.htm",
      "type": "official",
      "publishedAt": "2018-03-21",
      "verifiedAt": "2026-08-18",
      "scope": "中山院沿革、重建、规模与当前用途"
    },
    {
      "id": "history-dongnan",
      "title": "东南院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0321/c19863a210037/page.htm",
      "type": "official",
      "publishedAt": "2018-03-21",
      "verifiedAt": "2026-08-18",
      "scope": "东南院沿革、重建、规模及与中山院的空间关系"
    },
    {
      "id": "history-qiangong",
      "title": "前工院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0321/c19863a210033/page.htm",
      "type": "official",
      "publishedAt": "2018-03-21",
      "verifiedAt": "2026-08-18",
      "scope": "前工院初建、命名、重建与用途"
    },
    {
      "id": "history-nangao",
      "title": "南高院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208764/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-18",
      "scope": "南高院自三江师范学堂以来的沿革、改建与用途"
    },
    {
      "id": "history-jinling",
      "title": "金陵院",
      "publisher": "东南大学校史馆",
      "url": "https://history.seu.edu.cn/2018/0302/c19863a208756/page.htm",
      "type": "official",
      "publishedAt": "2018-03-02",
      "verifiedAt": "2026-08-18",
      "scope": "金陵院设计、建设、扩建与当前用途"
    },
    {
      "id": "yifu-architecture-building",
      "title": "逸夫建筑馆",
      "publisher": "东南大学教育基金会",
      "url": "https://seuef.seu.edu.cn/1011/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "scope": "逸夫建筑馆捐建背景与建筑面积"
    },
    {
      "id": "library-open-current",
      "title": "开放时间",
      "publisher": "东南大学图书馆",
      "url": "https://lib.seu.edu.cn/list.php?fid=220",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "四牌楼、九龙湖、丁家桥各馆阅览空间及开放时间"
    },
    {
      "id": "library-contact-current",
      "title": "联系我们",
      "publisher": "东南大学图书馆",
      "url": "https://lib.seu.edu.cn/list.php?fid=630",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "三校区图书馆服务电话与邮箱"
    },
    {
      "id": "sports-contact-current",
      "title": "办公地址及电话",
      "publisher": "东南大学体育系",
      "url": "https://tyx.seu.edu.cn/2160/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "四牌楼与九龙湖体育系办公室、教务及场馆联系电话"
    },
    {
      "id": "hospital-contact-current",
      "title": "东南大学医院办公电话",
      "publisher": "东南大学医院",
      "url": "https://hospital.seu.edu.cn/2016/0426/c3888a270432/page.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "四牌楼与九龙湖医疗点科室、急诊、药房和医保电话"
    },
    {
      "id": "alumni-card-hall",
      "title": "第七批校友卡领卡通知",
      "publisher": "东南大学校友总会",
      "url": "https://seuaa.seu.edu.cn/2023/0823/c1993a457039/page.htm",
      "type": "official",
      "publishedAt": "2023-08-23",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "四牌楼校友会堂作为校友总会线下服务地点的参考"
    },
    {
      "id": "asia-architecture-archive-history",
      "title": "亚洲建筑档案中心的“前世”今生",
      "publisher": "东南大学建筑学院",
      "url": "https://arch.seu.edu.cn/2022/0915/c9118a420023/page.htm",
      "type": "official",
      "publishedAt": "2022-09-15",
      "verifiedAt": "2026-08-18",
      "scope": "亚洲建筑档案中心旧址历史、修缮与空间功能"
    },
    {
      "id": "seu-organization-current",
      "title": "组织机构",
      "publisher": "东南大学",
      "url": "https://www.seu.edu.cn/17414/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "学校现行党政机构与直属单位名录"
    },
    {
      "id": "president-office-contact",
      "title": "科室设置及联系方式",
      "publisher": "东南大学校长办公室",
      "url": "https://xiaoban.seu.edu.cn/753/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "综合、文秘、印信、法务等科室的校区办公地点与电话"
    },
    {
      "id": "organization-office-contact",
      "title": "联系方式",
      "publisher": "东南大学党委组织部",
      "url": "https://zzb.seu.edu.cn/2807/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "党建、党校与干部工作办公室地点及电话"
    },
    {
      "id": "academic-office-contact",
      "title": "处办公室",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/cbgs/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "教务处综合办公室、用印与分校区办公安排"
    },
    {
      "id": "graduate-school-contact",
      "title": "联系我们",
      "publisher": "东南大学研究生院",
      "url": "https://seugs.seu.edu.cn/27256/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "研究生招生、培养、学位、管理办公室地点与电话"
    },
    {
      "id": "student-affairs-current",
      "title": "东南大学学生处",
      "publisher": "东南大学学生处",
      "url": "https://xsc.seu.edu.cn/",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "本科生教育管理、学生社区、心理和就业服务电话"
    },
    {
      "id": "human-resources-contact",
      "title": "机构设置",
      "publisher": "东南大学人事处",
      "url": "https://rsc.seu.edu.cn/56160/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "人事处科室职责、办公室地址与电话"
    },
    {
      "id": "research-office-contact",
      "title": "联系我们",
      "publisher": "东南大学科研院",
      "url": "https://kjc.seu.edu.cn/lxwm_14998/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "科研项目、成果、基地与综合办公室地点电话及用印安排"
    },
    {
      "id": "social-sciences-contact",
      "title": "联系方式",
      "publisher": "东南大学社会科学处",
      "url": "https://skc.seu.edu.cn/2016/0418/c4968a156065/page.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "人文社科项目与成果管理办公室的两校区地点电话"
    },
    {
      "id": "finance-office-reference",
      "title": "财务处科室联系电话与服务窗口参考",
      "publisher": "东南大学财务处",
      "url": "https://cwc.seu.edu.cn/_upload/article/files/42/99/92b23a004e3891d30f100de897ca/a42b1c80-3a37-4197-919b-2f5347ff9142.pdf",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "四牌楼五四楼与九龙湖行政楼财务科室位置电话参考；具体服务以财务处最新通知为准"
    },
    {
      "id": "international-office-contact",
      "title": "联系我们",
      "publisher": "东南大学国际合作处",
      "url": "https://oic.seu.edu.cn/lxwm/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "国际合作、学生交流、出国境与护照签证办公室地点电话"
    },
    {
      "id": "general-services-current",
      "title": "东南大学总务处",
      "publisher": "东南大学总务处",
      "url": "https://zwc.seu.edu.cn/",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "餐饮、修缮、水电、交通、物业等总务服务及监督电话"
    },
    {
      "id": "nic-current",
      "title": "机构设置",
      "publisher": "东南大学网络与信息中心",
      "url": "https://nic.seu.edu.cn/bmgk1/jgsz.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "校园网、信息系统、网络安全服务职责及两校区办公地点"
    },
    {
      "id": "admissions-contact-current",
      "title": "联系我们",
      "publisher": "东南大学本科生招生办公室",
      "url": "https://zsb.seu.edu.cn/lxwm_23609/listm.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "本科招生热线、办公室电话、邮箱和通信地址"
    },
    {
      "id": "employment-contact-current",
      "title": "学生处机构设置与联系方式",
      "publisher": "东南大学学生处",
      "url": "https://xsc.seu.edu.cn/65021/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "九龙湖与四牌楼就业指导办公室联系电话"
    },
    {
      "id": "lab-equipment-current",
      "title": "东南大学实验室与设备管理处",
      "publisher": "东南大学实验室与设备管理处",
      "url": "https://sbc.seu.edu.cn/",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "实验室安全、设备管理、大型仪器共享与办事入口"
    },
    {
      "id": "equipment-sharing-platform",
      "title": "大型仪器设备共享管理系统",
      "publisher": "东南大学",
      "url": "https://dypub.seu.edu.cn/main/equips",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "大型仪器共享入口及相关服务联系方式"
    },
    {
      "id": "capital-construction-contact",
      "title": "联系我们",
      "publisher": "东南大学基本建设处",
      "url": "https://jbjsc.seu.edu.cn/18326/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "计划造价、工程管理、总工办与综合办公室地点电话"
    },
    {
      "id": "development-planning-contact",
      "title": "联系我们",
      "publisher": "东南大学党委发展规划与学科建设部",
      "url": "https://ghb.seu.edu.cn/lxwm_21969/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "发展规划与学科建设处通信地址和联系电话"
    },
    {
      "id": "academic-teaching-office",
      "title": "教务科",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/jwk_21853/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "排课选课、考试和成绩管理职责及两校区办公地点电话"
    },
    {
      "id": "academic-research-office",
      "title": "教学研究科",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/jyk_21856/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "培养方案、专业课程教材和教学改革职责及办公地点电话"
    },
    {
      "id": "academic-practice-office",
      "title": "实践教学科",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/sjk_21857/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "实习、毕业设计、竞赛、创新训练和本科国际交流职责及办公地点电话"
    },
    {
      "id": "academic-teaching-service",
      "title": "教学服务中心",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/jxfwzx/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "教材采购、讲义委印与发放职责及两校区办公地点电话"
    },
    {
      "id": "academic-classroom-service",
      "title": "公共教室管理与服务中心",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/ggjsglyfwzx/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "公共教室规划、借用与设施协调职责及办公地点电话"
    },
    {
      "id": "academic-dingjiaqiao-office",
      "title": "丁家桥教务办",
      "publisher": "东南大学教务处",
      "url": "https://jwc.seu.edu.cn/djqjwb/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "丁家桥校区本科教务办公室地点电话"
    },
    {
      "id": "security-unit-directory",
      "title": "室队职能",
      "publisher": "东南大学党委保卫部、保卫处",
      "url": "https://bwc.seu.edu.cn/ywzncs/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "综合服务、消防监管、秩序管理和校卫总队的职责、房间与电话"
    },
    {
      "id": "library-unit-directory",
      "title": "部门介绍",
      "publisher": "东南大学图书馆",
      "url": "https://lib.seu.edu.cn/list.php?fid=222",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "资源发展、读者服务、学科服务、查新知识产权、技术数据、文化特藏及办公室职责"
    },
    {
      "id": "lab-equipment-organization",
      "title": "机构设置及工作职责",
      "publisher": "东南大学实验室与设备管理处",
      "url": "https://sbc.seu.edu.cn/5547/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "实验室管理、设备管理、大型装备平台与实验室安全管理科设置"
    },
    {
      "id": "lab-management-contact",
      "title": "实验室管理科",
      "publisher": "东南大学实验室与设备管理处",
      "url": "https://sbc.seu.edu.cn/5549/listm.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "实验室管理科职责、九龙湖办公房间和电话"
    },
    {
      "id": "equipment-management-contact",
      "title": "设备管理科",
      "publisher": "东南大学实验室与设备管理处",
      "url": "https://sbc.seu.edu.cn/sbglk/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "设备管理业务的两校区办公地点、电话和坐班时间"
    },
    {
      "id": "large-equipment-contact",
      "title": "大型装备平台科",
      "publisher": "东南大学实验室与设备管理处",
      "url": "https://sbc.seu.edu.cn/5551/listm.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "大型仪器论证、验收、共享和绩效管理职责及两校区联系方式"
    },
    {
      "id": "lab-safety-contact",
      "title": "实验室安全管理科",
      "publisher": "东南大学实验室与设备管理处",
      "url": "https://sbc.seu.edu.cn/5553/listm.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "实验室安全准入、危化品、辐射、特种设备和危废管理职责及联系方式"
    },
    {
      "id": "development-planning-units",
      "title": "机构设置",
      "publisher": "东南大学党委发展规划与学科建设部",
      "url": "https://ghb.seu.edu.cn/jgsz/list.htm",
      "type": "official",
      "verifiedAt": "2026-08-18",
      "volatile": true,
      "scope": "办公室、发展规划治理体系、学科建设资源配置和信息数据岗位的房间电话"
    }
  ],
  "mapFeatures": [
    {
      "id": "auditorium",
      "sharedPlaceId": "auditorium",
      "name": "东南大学大礼堂",
      "category": "landmark",
      "icon": "礼",
      "location": "四牌楼校区中轴线北端",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "地标",
        "历史建筑",
        "中央大学旧址",
        "建筑文化"
      ],
      "description": "四牌楼校区标志性建筑，1931年落成，以西方古典主义立面和文艺复兴风格大穹顶著称。",
      "officialKnowledge": true,
      "lat": 32.0580097,
      "lng": 118.7890542,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "mengfang-library",
      "sharedPlaceId": "mengfang-library",
      "name": "孟芳图书馆",
      "category": "landmark",
      "icon": "史",
      "location": "四牌楼校区南部",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "老图书馆",
        "历史建筑",
        "行政办公",
        "中央大学旧址"
      ],
      "description": "1923年建成、1924年正式开放的校园历史图书馆，后经扩建形成今日规模。",
      "officialKnowledge": true,
      "lat": 32.0570575,
      "lng": 118.7884011,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "meian",
      "sharedPlaceId": "meian",
      "name": "梅庵",
      "category": "landmark",
      "icon": "梅",
      "location": "四牌楼校区西北部、六朝松附近",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "李瑞清",
        "红色校史",
        "历史建筑",
        "六朝松"
      ],
      "description": "为纪念两江师范学堂校长李瑞清而得名的历史建筑，现承载校史与红色文化展陈。",
      "officialKnowledge": true,
      "lat": 32.0596356,
      "lng": 118.7861645,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "liuchaosong",
      "sharedPlaceId": "liuchaosong",
      "name": "六朝松",
      "category": "landmark",
      "icon": "松",
      "location": "四牌楼校区西北部、梅庵旁",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "古树",
        "桧柏",
        "校园文化",
        "梅庵",
        "校园古树"
      ],
      "description": "相传已有千余年树龄的校园古树，虽名为松，树种实为桧柏，是东大重要精神文化象征。",
      "officialKnowledge": true,
      "lat": 32.0594812,
      "lng": 118.7861905,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "south-gate",
      "sharedPlaceId": "south-gate",
      "name": "四牌楼校区南大门",
      "category": "landmark",
      "icon": "门",
      "location": "四牌楼校区南侧主入口",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "校门",
        "杨廷宝",
        "历史建筑",
        "出入口"
      ],
      "description": "1933年建成的校园历史主门，由杨廷宝设计，是四牌楼中轴与城市街区衔接的重要节点。",
      "officialKnowledge": true,
      "lat": 32.0554665,
      "lng": 118.7888365,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "history-museum",
      "sharedPlaceId": "history-museum",
      "name": "东南大学校史馆",
      "category": "landmark",
      "icon": "史",
      "location": "四牌楼校区原工艺实习场",
      "hours": "周二至周日08:30—11:30、14:00—17:00；周一闭馆。法定节假日通常开放，春节闭馆；寒暑假另行通知。",
      "status": "unknown",
      "verified": false,
      "tags": [
        "博物馆",
        "校史",
        "展览",
        "参观",
        "校史展馆 / 历史建筑"
      ],
      "description": "校史馆设于1918年建成的工艺实习场，现通过多个展厅呈现学校百余年办学历程。",
      "officialKnowledge": true,
      "lat": 32.0591478,
      "lng": 118.7873016,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "gym",
      "sharedPlaceId": "gym",
      "name": "四牌楼校区体育馆",
      "category": "sports",
      "icon": "体",
      "location": "四牌楼校区西北部、体育场旁",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "体育",
        "爱奥尼柱式",
        "历史建筑",
        "预约",
        "历史建筑 / 体育场馆"
      ],
      "description": "1923年建成的校园体育建筑，以爱奥尼柱式门廊等西方古典主义特征著称。",
      "officialKnowledge": true,
      "lat": 32.0588403,
      "lng": 118.786695,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "jianxiong",
      "sharedPlaceId": "jianxiong",
      "name": "健雄院",
      "category": "study",
      "icon": "学",
      "location": "四牌楼校区东部",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "吴健雄",
        "科学馆",
        "历史建筑",
        "教学",
        "历史建筑 / 教学空间"
      ],
      "description": "原中央大学科学馆，1927年建成，1992年以杰出校友吴健雄之名更名为健雄院。",
      "officialKnowledge": true,
      "lat": 32.0575652,
      "lng": 118.7901119,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "zhongda",
      "sharedPlaceId": "zhongda",
      "name": "中大院",
      "category": "study",
      "icon": "建",
      "location": "四牌楼校区中部偏东",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "建筑学院",
        "生物馆",
        "历史建筑",
        "教学",
        "历史建筑 / 教学空间"
      ],
      "description": "原中央大学生物馆，1929年始建并于1933年扩建，现为东南大学建筑学院重要教学办公空间。",
      "officialKnowledge": true,
      "lat": 32.0570241,
      "lng": 118.7892935,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "wu-memorial",
      "sharedPlaceId": "wu-memorial",
      "name": "吴健雄纪念馆",
      "category": "landmark",
      "icon": "吴",
      "location": "大礼堂西南侧",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "吴健雄",
        "物理学",
        "纪念馆",
        "校友"
      ],
      "description": "纪念杰出物理学家、东南大学校友吴健雄的专题纪念馆，2002年落成开放。",
      "officialKnowledge": true,
      "lat": 32.0575528,
      "lng": 118.78823,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "wusi-building",
      "sharedPlaceId": "wusi-building",
      "name": "五四楼",
      "category": "office",
      "icon": "办",
      "location": "四牌楼校区南部",
      "hours": "服务台工作日上午08:00—12:00、下午14:00—18:00；自助设备可用状态以现场为准。",
      "status": "unknown",
      "verified": false,
      "tags": [
        "校园卡",
        "补卡",
        "行政服务",
        "行政与服务建筑"
      ],
      "description": "四牌楼校园卡服务台和自助补卡机所在建筑。",
      "officialKnowledge": true,
      "lat": 32.0557574,
      "lng": 118.7882844,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "microwave-building",
      "sharedPlaceId": "microwave-building",
      "name": "微波楼",
      "category": "office",
      "icon": "办",
      "location": "四牌楼校区东部",
      "hours": "周二下午、周五下午在四牌楼办理；其他时间在九龙湖教五103/104办公。",
      "status": "unknown",
      "verified": false,
      "tags": [
        "教务",
        "学籍",
        "盖章",
        "财务",
        "教学与行政建筑"
      ],
      "description": "教务处学籍管理科在四牌楼办理学生证、成绩单盖章等事项的窗口所在地。",
      "officialKnowledge": true,
      "lat": 32.0575418,
      "lng": 118.7906947,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "archives-building",
      "sharedPlaceId": "archives-building",
      "name": "东南大学档案馆",
      "category": "office",
      "icon": "档",
      "location": "四牌楼校区档案馆楼",
      "hours": "以网上预约结果和档案馆最新通知为准。",
      "status": "unknown",
      "verified": false,
      "tags": [
        "查档",
        "档案",
        "预约",
        "证明",
        "档案服务建筑"
      ],
      "description": "学校档案保管、利用、编研与专门档案服务所在地，可通过网上办事大厅提前预约。",
      "officialKnowledge": true,
      "lat": 32.0562638,
      "lng": 118.7880968,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "security",
      "sharedPlaceId": "security",
      "name": "四牌楼校区保卫处",
      "category": "office",
      "icon": "安",
      "location": "沙塘园保卫楼",
      "hours": "工作时间与具体业务受理安排以保卫处最新通知或电话确认为准。",
      "status": "unknown",
      "verified": false,
      "tags": [
        "校园安全",
        "报警",
        "户籍",
        "保卫处",
        "校园安全与户籍服务"
      ],
      "description": "承担四牌楼校区校园安全、报警联络和户籍相关服务。",
      "officialKnowledge": true,
      "lat": 32.0551936,
      "lng": 118.7887996,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "zhongshan",
      "sharedPlaceId": "zhongshan",
      "name": "中山院",
      "category": "study",
      "icon": "教",
      "location": "四牌楼校区东南部、东南院西侧",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "教学楼",
        "教室",
        "考试",
        "中二院",
        "历史沿革教学楼"
      ],
      "description": "院址可追溯至1922年建成的中二院，现有建筑于1983年落成，是四牌楼主要教学楼之一。",
      "officialKnowledge": true,
      "lat": 32.0556865,
      "lng": 118.7894311,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "dongnan",
      "sharedPlaceId": "dongnan",
      "name": "东南院",
      "category": "study",
      "icon": "教",
      "location": "四牌楼校区东南角、中山院东侧",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "教学楼",
        "建筑学院",
        "法学院旧址",
        "中一院",
        "历史沿革教学楼"
      ],
      "description": "院址原为1919年建成的中一院，曾为中央大学法学院所在地，现有建筑于1983年落成。",
      "officialKnowledge": true,
      "lat": 32.055662,
      "lng": 118.7901552,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "qiangong",
      "sharedPlaceId": "qiangong",
      "name": "前工院",
      "category": "study",
      "icon": "工",
      "location": "四牌楼校区东部教学区",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "教学楼",
        "工学院",
        "旧工院",
        "课堂",
        "历史沿革教学楼"
      ],
      "description": "初建于1929年，1957年定名前工院，现有建筑于1987年重建后成为主要教学楼。",
      "officialKnowledge": true,
      "knowledgeOnly": true
    },
    {
      "id": "nangao",
      "sharedPlaceId": "nangao",
      "name": "南高院",
      "category": "landmark",
      "icon": "南",
      "location": "四牌楼校区西南部",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "三江师范",
        "南京高师",
        "一字房",
        "科研办公",
        "历史建筑 / 科研办公空间"
      ],
      "description": "始建于三江师范学堂时期、1904年落成，曾长期作为学校行政中枢，是校史延续最久的建筑节点之一。",
      "officialKnowledge": true,
      "lat": 32.0575278,
      "lng": 118.7872441,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "jinling",
      "sharedPlaceId": "jinling",
      "name": "金陵院",
      "category": "landmark",
      "icon": "金",
      "location": "四牌楼校区东北部",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "杨廷宝",
        "牙科医院旧址",
        "历史建筑",
        "教学科研",
        "历史建筑 / 教学科研空间"
      ],
      "description": "杨廷宝设计的原中央大学牙症医院教学实习大楼，1937年落成，现用于教学科研。",
      "officialKnowledge": true,
      "lat": 32.0583338,
      "lng": 118.7904275,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "yifu-architecture",
      "sharedPlaceId": "yifu-architecture",
      "name": "逸夫建筑馆",
      "category": "study",
      "icon": "建",
      "location": "四牌楼校区东部、群贤楼附近",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "建筑学院",
        "研究生院",
        "招生",
        "培养",
        "学位",
        "教学、科研与行政建筑"
      ],
      "description": "由邵逸夫捐资兴建、总建筑面积近1.7万平方米的建筑学院与研究生院相关办公教学建筑。",
      "officialKnowledge": true,
      "lat": 32.0569774,
      "lng": 118.7903233,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "library",
      "sharedPlaceId": "library",
      "name": "四牌楼校区图书馆",
      "category": "study",
      "icon": "书",
      "location": "四牌楼校区中西部、孟芳图书馆西侧",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "自习",
        "借还书",
        "打印",
        "查收查引",
        "期刊",
        "图书馆 / 学习空间"
      ],
      "description": "提供借还、馆藏阅览、期刊、自修、协作学习、查收查引等服务，主要空间通常开放至22:00。",
      "officialKnowledge": true,
      "lat": 32.0565081,
      "lng": 118.7882121,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "stadium",
      "sharedPlaceId": "stadium",
      "name": "四牌楼校区体育场",
      "category": "sports",
      "icon": "场",
      "location": "四牌楼校区西北部、体育馆东南侧",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "跑步",
        "田径",
        "操场",
        "体育教学",
        "室外体育场地"
      ],
      "description": "四牌楼主要室外田径与校园体育活动场地，开放需服从体育教学、训练和活动安排。",
      "officialKnowledge": true,
      "lat": 32.0584945,
      "lng": 118.7871944,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "campus-hospital",
      "sharedPlaceId": "campus-hospital",
      "name": "东南大学医院四牌楼医疗点",
      "category": "medical",
      "icon": "医",
      "location": "四牌楼校区东南侧、成贤街82号",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "看病",
        "急诊",
        "药房",
        "医保",
        "预防保健",
        "校园医疗服务建筑"
      ],
      "description": "提供校内医疗、急诊、药房、检验、预防保健和学生医保等服务，急诊电话025-83795462。",
      "officialKnowledge": true,
      "lat": 32.0539806,
      "lng": 118.7908406,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "alumni-hall",
      "sharedPlaceId": "alumni-hall",
      "name": "中大校友会堂",
      "category": "office",
      "icon": "友",
      "location": "四牌楼校区西南部、动力楼西侧",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "校友",
        "校友卡",
        "返校",
        "活动",
        "校友服务与活动建筑"
      ],
      "description": "校友总会在四牌楼开展校友服务、返校接待与活动的重要场所。",
      "officialKnowledge": true,
      "lat": 32.0558511,
      "lng": 118.7876297,
      "coordinateSystem": "WGS84"
    },
    {
      "id": "asia-architecture-archive",
      "sharedPlaceId": "asia-architecture-archive",
      "name": "东南大学亚洲建筑档案中心",
      "category": "landmark",
      "icon": "藏",
      "location": "四牌楼校区南高院南侧历史平房区域",
      "hours": "",
      "status": "unknown",
      "verified": false,
      "tags": [
        "建筑档案",
        "展览",
        "建筑学院",
        "历史修缮",
        "专业档案与展览空间"
      ],
      "description": "2020年成立并利用校园历史平房修缮建设的专业建筑档案机构，兼具收藏、研究、展览和学术交流功能。",
      "officialKnowledge": true,
      "knowledgeOnly": true
    }
  ]
};
