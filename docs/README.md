# docs/ 目录规范

```
docs/
├── README.md              ← 本文件，目录说明
├── brainstorming/         ← 需求探索、发散讨论、技术选型
│   └── YYYY-MM-DD-主题.md
├── designs/               ← 架构设计、数据模型、接口定义
│   └── YYYY-MM-DD-模块名.md
├── plans/                 ← 实现计划、步骤拆解、文件清单
│   └── YYYY-MM-DD-任务名.md
├── sql/                   ← 增量 SQL 脚本（建表、迁移）
│   └── YYYY-MM-DD-描述.sql
└── imgs/                  ← ER图、流程图等图片资源
```

## 命名规则

- 文件名格式: `YYYY-MM-DD-简短描述.md`（或 `.sql`）
- 用中文描述，连字符分隔
- 同一功能的 brainstorming → design → plan 用相同的描述后缀

## 文档流转

```
brainstorming (为什么做、做什么)
    ↓
designs (怎么做、数据模型、接口)
    ↓
plans (具体步骤、文件清单、执行顺序)
    ↓
sql/ (建表脚本，可直接执行)
```
