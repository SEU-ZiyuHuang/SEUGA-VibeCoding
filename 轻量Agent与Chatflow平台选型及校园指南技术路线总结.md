# 轻量 Agent / Chatflow 平台选型与校园指南 Agent 技术路线总结

> 讨论主题：Dify、FastGPT、Flowise 等开源 Agent / Chatflow 平台的定位、部署成本，以及在需要持续调试 Prompt 的前提下，如何设计更轻量的校园指南 Agent 技术架构。

---

## 1. 当前核心需求

目标是搭建一个类似 Dify 的 Agent / Chatflow 应用，主要需求包括：

- 支持多轮对话
- 支持 Prompt 配置与反复调试
- 支持知识库 / RAG
- 支持条件分支、路由和 Workflow
- 支持 Agent Tool Calling
- 后续可接 MCP 或其他校园工具
- 可以私有化部署
- 尽量轻量，不希望为了少量知识数据维护过多基础设施
- 最终面向校园指南 Agent 使用

当前校园指南数据规模较小，主要是多个校区的 Markdown 文档，例如：

- 九龙湖校区
- 四牌楼校区
- 丁家桥校区
- 江北校区
- 苏州校区
- 无锡校区

目前的数据量远没有达到必须使用大型 RAG 基础设施的程度。

---

# 2. 类 Dify 的开源 Agent / Chatflow 平台

讨论中主要关注了以下平台。

| 平台 | 定位 | 可视化 Workflow | RAG | Agent / Tool | 特点 |
|---|---|---:|---:|---:|---|
| Dify | 综合 AI 应用平台 | 强 | 强 | 强 | 功能最完整，偏产品化 |
| FastGPT | 知识库 + Agent Workflow | 强 | 很强 | 强 | 中文生态友好，RAG 能力突出 |
| MaxKB | 企业知识库 / AI 客服 | 有 | 很强 | 有 | 部署与使用相对简单 |
| Coze Studio | 开源 Agent 开发平台 | 很强 | 有 | 很强 | 能力完整，但整体较重 |
| Flowise | 开发者向 Agent Workflow | 很强 | 有 | 很强 | 比 Dify 轻量，灵活度高 |
| Langflow | Python Agent 编排 | 强 | 有 | 很强 | 偏 Python / LangChain 生态 |
| RAGFlow | RAG / 文档理解平台 | 有 | 极强 | 有 | 更适合大规模复杂文档 |
| AnythingLLM | 本地知识库 + Agent | 较弱 | 强 | 有 | 更偏 RAG Chat |
| Open WebUI | LLM Chat UI | 弱 | 有 | 有 | 聊天界面强，但不是 Workflow 核心 |
| n8n | 自动化 Workflow + AI | 极强 | 较弱 | 强 | 更偏业务自动化 |

如果目标是寻找最接近 Dify 的替代品：

1. FastGPT
2. Flowise
3. MaxKB
4. Coze Studio

是最值得优先考虑的几类方案。

---

# 3. 为什么 Dify 对外主要是 Workflow 和 Chatflow，而不是 Agent

一个关键认识是：

> **Workflow / Chatflow 是应用运行形态，而 Agent 更适合作为其中的一种执行能力。**

Dify 的架构可以理解为：

```text
Dify Application

├── Workflow
│   └── 面向单次任务 / 自动化流程
│
└── Chatflow
    └── 面向多轮对话

内部可以包含：

├── LLM
├── Knowledge
├── Code
├── HTTP
├── Condition
├── Tool
└── Agent
```

---

## 3.1 Workflow 的本质

Workflow 的路径由开发者预先规定。

例如：

```text
输入
 ↓
分类
 ↓
IF / ELSE
 ├─ 路径 A
 └─ 路径 B
```

本质是：

> 程序员决定下一步做什么。

---

## 3.2 Agent 的本质

Agent 则是：

```text
用户问题
 ↓
LLM
 ↓
决定需要哪个 Tool
 ↓
调用 Tool
 ↓
观察结果
 ↓
决定是否继续调用
 ↓
生成答案
```

本质是：

> LLM 动态决定下一步做什么。

Agent 可以被理解成：

- 动态 Router
- Tool Caller
- Reasoning Loop

---

## 3.3 Chatflow 的本质

Chatflow 本质上可以看成：

> 专门用于多轮聊天场景的 Workflow。

因此把 Agent 作为 Chatflow / Workflow 内部节点，比把整个应用都定义成一个 Agent 更可控。

---

# 4. 对校园指南 Agent 的推荐组织方式

不建议将整个校园助手完全交给一个 Agent 自主处理，例如：

```text
用户
 ↓
Agent
 ↓
给它所有工具和知识
 ↓
让模型自行决定
```

这种方式虽然简单，但：

- 不稳定
- 调试困难
- Token 消耗不容易控制
- 路由行为不可预测
- 随着工具增多容易失控

更合理的是：

```text
用户
 ↓
Chat / API
 ↓
校区识别
 ↓
意图判断
 ↓
┌───────────────┬───────────────┐
│               │
校园知识        实时能力
│               │
Markdown / RAG   Agent
│               │
│               ├─ 课表 MCP
│               ├─ 地图 MCP
│               ├─ 校园卡 MCP
│               └─ 其他 Tool
│
└───────→ 最终回答
```

即：

- Workflow 负责确定性部分
- Agent 负责真正需要自主 Tool Calling 的部分

---

# 5. FastGPT 的部署性能需求

如果 LLM、Embedding、Rerank 都使用外部 API，那么 FastGPT 本身并不需要 GPU。

FastGPT 服务器主要承担：

- Workflow 编排
- Prompt 拼接
- 会话存储
- RAG 检索
- 数据库查询
- API 调用
- Tool Calling

真正消耗大量算力的是外部模型服务。

---

## 5.1 配置建议

对于校园指南这种小规模项目：

| 配置 | 使用建议 |
|---|---|
| 1C2G | 不推荐 FastGPT |
| 2C4G | 可用于 POC / 测试 |
| 2C8G | 推荐配置 |
| 4C8G | 面向长期运行或多人使用 |
| GPU | 无必要 |

---

## 5.2 为什么 FastGPT 还是显得偏重

问题不在模型推理，而在基础设施。

FastGPT 通常不仅有一个应用容器，还会涉及：

```text
FastGPT
+
MongoDB
+
PostgreSQL / pgvector
+
AI Proxy
+
其他服务
```

因此虽然每个服务都不算特别重，但叠加之后：

> 2C4G 基本才算比较现实的入门配置。

对于只有几个 Markdown 的校园指南项目，这套基础设施存在一定的过度工程化。

---

# 6. 是否存在“FastGPT Lite”

目前并没有一个特别明确的官方 FastGPT Lite 方案。

如果想要：

> 类似 FastGPT / Dify，但是更轻

更现实的做法不是继续裁剪 FastGPT，而是换平台。

---

# 7. 更轻量的平台：Flowise

在讨论过的方案中：

> **Flowise 最接近“轻量版 Dify”。**

它的重要优势是：

- Node.js 生态
- 可以单进程运行
- 默认可使用 SQLite
- 支持本地文件存储
- 支持 AgentFlow
- 支持 Tool Calling
- 支持 RAG
- 支持条件节点
- 支持 Agent
- 可以接外部模型 API

最简单的架构甚至可以做到：

```text
Flowise
   │
SQLite
   │
本地文件
```

而不需要：

```text
MongoDB
PostgreSQL
Redis
多个独立服务
```

---

## 7.1 Flowise 资源建议

如果模型完全走 API：

| 配置 | 评价 |
|---|---|
| 1C1G | 可以尝试极小 Demo |
| 1C2G | 比较合理的最低档 |
| 2C2G | 校园指南 Demo 基本够用 |
| 2C4G | 相当宽裕 |

因此如果：

> 仍然希望拥有“拖节点、看执行链”的开发体验

Flowise 是非常合适的选择。

---

# 8. AnythingLLM 与 Open WebUI

## AnythingLLM

更偏向：

```text
文档
 ↓
知识库
 ↓
聊天
 ↓
Agent
```

适合：

- 文档问答
- RAG Chat
- 少量 Tool
- 本地知识库

如果核心需求是复杂 Flow / Router，则 Flowise 更合适。

---

## Open WebUI

Open WebUI 的强项是：

- 完整聊天界面
- 多模型管理
- RAG
- Tool

但它不是典型的可视化 Chatflow Builder。

因此对于校园指南 Agent：

> 更适合做聊天前端，不适合作为主要 Workflow 编排平台。

---

# 9. 最轻方案：直接自己写 Agent Runtime

考虑到校园指南目前的数据规模非常小，可以完全不用传统 RAG 系统。

例如：

```text
用户
 ↓
Next.js API
 ↓
判断 campus
 ↓
读取对应 Markdown
 ↓
将 Markdown 注入 Context
 ↓
调用 LLM
 ↓
返回答案
```

目录甚至可以直接：

```text
/data/campus/

├── jiulonghu.md
├── sipailou.md
├── dingjiaqiao.md
├── jiangbei.md
├── suzhou.md
└── wuxi.md
```

整个核心系统可以只有：

```text
Next.js
+
Markdown
+
LLM API
```

部署到：

```text
Vercel
```

第一阶段甚至不需要自己的 VPS。

---

# 10. 但纯代码方案存在一个重要问题：Prompt 调试

纯 Next.js 方案虽然非常轻，但是存在一个明显问题：

> 缺少类似 Dify 的 Prompt 调试页面。

实际 Agent 开发过程中需要不断：

```text
改 Prompt
 ↓
输入问题
 ↓
运行
 ↓
查看结果
 ↓
继续改 Prompt
 ↓
重新运行
```

因此 Prompt Playground 是开发体验中非常重要的一部分。

---

# 11. 解决方案：生产 Runtime 与 Prompt Playground 分离

不应该因为需要一个 Prompt 调试页面，就把整个 Agent Runtime 放到 Dify 中。

更合理的架构是：

```text
Agent Runtime
+
Prompt Engineering Platform
```

也就是：

> **运行层和调试层解耦。**

---

# 12. 推荐方案：Next.js + Langfuse

Langfuse 可以承担：

- Prompt Management
- Prompt Playground
- Prompt Version
- Prompt Label
- Trace
- Token 使用分析
- 延迟分析
- 输入输出记录
- Evaluation

架构：

```text
                  Langfuse
        ┌────────────────────────┐
        │ Prompt Playground      │
        │ Prompt Version         │
        │ Trace                  │
        │ Eval                   │
        └───────────┬────────────┘
                    │
              production prompt
                    │
                    ↓
用户
 ↓
Next.js
 ↓
Campus Agent Runtime
 ↓
├─ Campus Router
├─ Markdown
├─ LLM
├─ Tool Calling
└─ MCP
```

---

# 13. Prompt 调试流程

例如可以有：

```text
System Prompt v17

你是东南大学校园指南助手……

Model:
DeepSeek

Temperature:
0.2

Context:
九龙湖.md

Test Input:
九龙湖校区有哪些食堂？
```

然后：

```text
Run
 ↓
查看结果
 ↓
修改 Prompt
 ↓
重新 Run
 ↓
保存 v18
 ↓
标记 production
```

生产环境读取：

```text
production prompt
```

而不是把 Prompt 硬编码在 Next.js 中。

这样：

> 修改 Prompt 不需要重新部署整个应用。

---

# 14. 也可以自己做 `/playground`

如果不想依赖 Langfuse，也可以直接在 Next.js 项目中做：

```text
/
正式校园助手

/playground
Prompt 调试页面
```

页面可以包括：

```text
┌────────────────────────────────────┐
│ Prompt Playground                  │
├────────────────┬───────────────────┤
│ System Prompt  │ Test Chat         │
│                │                   │
│ ...            │ User Input        │
│                │                   │
├────────────────┼───────────────────┤
│ Model          │ Context           │
│ Temperature    │ Campus Markdown   │
│ Max Tokens     │ Token Count       │
├────────────────┴───────────────────┤
│ Run / Save / Set Production        │
└────────────────────────────────────┘
```

关键是：

> Playground 和正式环境必须调用同一个 Agent Runtime。

例如：

```ts
runCampusAgent({
  message,
  systemPrompt,
  model,
  temperature
})
```

正式环境：

```ts
runCampusAgent({
  message,
  systemPrompt: productionPrompt
})
```

Playground：

```ts
runCampusAgent({
  message,
  systemPrompt: playgroundPrompt
})
```

这样可以避免：

> 调试环境和生产环境出现两套不同执行逻辑。

---

# 15. 后续可以加入 Prompt Eval

随着 Agent 逐渐稳定，可以维护固定测试集。

例如：

```text
Q1 九龙湖食堂在哪？
Q2 丁家桥宿舍条件怎么样？
Q3 四牌楼怎么停车？
Q4 苏州校区怎么去？
```

同时比较：

```text
Prompt A
vs
Prompt B
```

得到：

```text
         Prompt A   Prompt B

Q1          ✅          ✅
Q2          ✅          ❌
Q3          ❌          ✅
Q4          ✅          ✅
```

进一步可以评价：

- 正确率
- 是否引用正确校区
- 是否出现幻觉
- Token
- 响应时间
- Tool Calling 是否正确

这时候就进入真正的 LLM Eval 阶段。

可以使用：

- Langfuse Eval
- Promptfoo
- 自己写自动化测试脚本

---

# 16. 当前几个方案的最终对比

## 方案 A：Dify

```text
优点：
+ 功能完整
+ Workflow 很成熟
+ Prompt 调试方便
+ RAG / Agent / Tool 全都有

缺点：
- 重
- 基础设施较多
- 对当前校园指南数据规模存在过度工程化
```

适合：

> 快速搭复杂 AI 产品，且希望大量能力开箱即用。

---

## 方案 B：FastGPT

```text
优点：
+ RAG 很强
+ 中文生态好
+ Workflow 能力完整
+ 非常适合知识库 Agent

缺点：
- MongoDB + PG 等基础设施
- 当前项目数据规模过小时显得偏重
```

适合：

> 知识库是 Agent 的核心。

---

## 方案 C：Flowise

```text
优点：
+ 非常轻
+ SQLite
+ 可视化 AgentFlow
+ Tool Calling
+ RAG
+ 部署简单

缺点：
- 产品化程度不如 Dify
- Prompt 管理 / Eval 体系没有 Langfuse 专门
```

适合：

> 想保留可视化 Workflow，但又不想部署 Dify / FastGPT。

---

## 方案 D：Next.js + Langfuse

```text
优点：
+ 最符合当前校园指南规模
+ Agent Runtime 非常轻
+ Prompt 可以独立管理
+ 有 Playground
+ 有 Trace
+ 有 Prompt Version
+ 后续可增加 Eval
+ 容易接 MCP
+ 架构完全可控

缺点：
- Agent Runtime 需要自己写
- 前期开发量高于纯 Dify
```

适合：

> 真正准备把校园指南 Agent 做成自己的长期产品。

---

# 17. 当前推荐路线

综合目前项目规模、未来扩展性和 Prompt 调试需求，推荐：

## 第一选择

```text
Next.js
+
LLM API
+
Markdown Campus Knowledge
+
Langfuse
+
后续 MCP
```

即：

```text
                    ┌──────────────┐
                    │   Langfuse   │
                    │ Prompt / Eval│
                    │ Trace        │
                    └──────┬───────┘
                           │
                           ↓
┌─────────────────────────────────────────┐
│                Next.js                  │
│                                         │
│ Frontend                                │
│    ↓                                    │
│ /api/chat                               │
│    ↓                                    │
│ Campus Router                           │
│    ↓                                    │
│ Campus Markdown                         │
│    ↓                                    │
│ LLM                                     │
│    ↓                                    │
│ Tool Calling / MCP                      │
│    ↓                                    │
│ Response                                │
└─────────────────────────────────────────┘
```

---

## 第二选择

如果现阶段仍然希望：

> 尽可能通过拖节点完成 Agent，而不是自己写 Agent Runtime

则选择：

```text
Flowise
+
SQLite
+
外部模型 API
```

这是目前最符合：

> **“轻量版 Dify”**

这一需求的方案。

---

# 18. 推荐的实施阶段

## Phase 1：快速验证

```text
Next.js
+
Markdown
+
LLM API
```

先实现：

- 对话 UI
- 校区识别
- 加载对应 Markdown
- 基础问答

---

## Phase 2：Prompt 工程

加入：

```text
Langfuse
```

实现：

- Prompt Playground
- Prompt Version
- Trace
- Token / 延迟观察
- Production Prompt

---

## Phase 3：Agent 能力

加入：

```text
Tool Calling
+
MCP
```

例如：

- 校园地图
- 课表
- 校园卡
- 校园活动
- 教务查询

---

## Phase 4：知识规模扩大

如果未来校园知识从：

```text
几个 Markdown
```

发展成：

```text
几十万 / 几百万字
+
大量 PDF
+
政策文件
+
规章制度
```

再引入：

```text
PostgreSQL
+
pgvector
```

或者独立 RAG 服务。

不要在第一阶段提前引入。

---

## Phase 5：Eval

建立固定测试集：

```text
100~500 个校园问题
```

持续评价：

- Prompt 版本
- 模型版本
- RAG 参数
- Tool Calling
- 幻觉率
- 准确率
- 成本
- 延迟

形成完整的 Agent 测试体系。

---

# 19. 最终结论

当前项目最重要的判断是：

> **需要 Prompt Playground，并不等于需要完整 Dify。**

Dify / FastGPT 把：

```text
Agent Runtime
Workflow
Knowledge
Prompt
Debug
Deployment
Observability
```

全部打包在一起。

而校园指南项目目前真正需要的核心能力只有：

```text
Agent Runtime
+
Prompt Debug
+
Knowledge
+
未来 Tool / MCP
```

因此可以拆成：

```text
Next.js
    ↓
Agent Runtime

Langfuse
    ↓
Prompt / Trace / Eval

Markdown
    ↓
Campus Knowledge

MCP
    ↓
Realtime Tools
```

这套方案：

- 比 Dify / FastGPT 更轻
- 比纯代码方案更容易调 Prompt
- 比单纯 Flowise 更容易长期演化成自己的产品
- 后续扩展 RAG、MCP、Eval 都比较自然

因此现阶段推荐优先级：

```text
长期产品：
Next.js + Langfuse

需要可视化 Flow：
Flowise

知识库优先：
FastGPT

希望全套开箱即用：
Dify
```

