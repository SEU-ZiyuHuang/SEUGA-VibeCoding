# 统一校园知识库

这里是地图前端与 Agent 共用的唯一事实源。请编辑本目录中的 JSON，不要直接修改生成文件。

- `meta.json`：版本、核验日期和更新策略。
- `campuses.json`：校区基础信息。
- `places/*.json`：建筑、场馆、校门和办事地点；稳定主键为 `place.id`。
- `services/*.json`：办事事项；通过 `placeId` 关联地点。
- `departments.json`：校级职能部门、职责、分校区办公室、电话与常用入口。
- `sources.json`：每条事实引用的来源、核验日期和易变性。

运行 `node scripts/build-shared-knowledge.mjs` 后会生成：

- `data/shared-knowledge.js`：浏览器地图直接加载的数据。
- `agent/data/shared-knowledge.mjs`：Agent 的检索页、别名和地图联动数据。

`node scripts/build-shared-knowledge.mjs --check` 只校验，不写文件，并检查生成物是否与 JSON 同步。首期不依赖向量数据库；未来需要语义检索时，可直接对生成的 `SHARED_CHUNKS` 做 embedding，实体 ID 和来源关系保持不变。
