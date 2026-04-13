# Superpowers + NeuralMemory 技能完整指南

> 版本: Superpowers v5.0.7 | NeuralMemory v4.33.0
> 更新日期: 2026-04-06

---

## 目录

- [一、技能全景图](#一技能全景图)
- [二、实战示例：客服对话功能开发全链路](#二实战示例客服对话功能开发全链路)
- [三、核心开发流程技能详解](#三核心开发流程技能详解)
- [四、辅助技能详解](#四辅助技能详解)
- [五、NeuralMemory 记忆管理技能详解](#五neuralmemory-记忆管理技能详解)
- [六、技能联动矩阵](#六技能联动矩阵)
- [七、硬性规则速查](#七硬性规则速查)

---

## 一、技能全景图

```
┌─────────────────────────────────────────────────────────────────┐
│                     Superpowers 技能生态                         │
├──────────────────────┬──────────────────────────────────────────┤
│   核心开发流程 (6)    │   辅助技能 (8)                           │
│                      │                                          │
│  brainstorming       │  receiving-code-review                   │
│       ↓              │  systematic-debugging                    │
│  writing-plans       │  dispatching-parallel-agents             │
│       ↓              │  subagent-driven-development             │
│  executing-plans     │  using-git-worktrees                     │
│       ↓              │  writing-skills                          │
│  test-driven-dev     │  using-superpowers                       │
│       ↓              │  finishing-a-development-branch          │
│  verification        │                                          │
│       ↓              │                                          │
│  requesting-review   │                                          │
├──────────────────────┴──────────────────────────────────────────┤
│                   NeuralMemory 记忆管理 (3)                      │
│                                                                  │
│  memory-intake → memory-audit → memory-evolution                 │
│  (录入)           (体检)          (优化)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、实战示例：客服对话功能开发全链路

> 场景：为农业电商平台添加「客服在线对话」功能

### 阶段 0：知识准备（NeuralMemory）

```
你: /memory-intake 客服功能需求：用户可以在商品详情页发起咨询，
    商家实时回复，支持文字和图片消息，历史记录可查

效果: 将需求结构化存入记忆，后续开发时自动召回
```

### 阶段 1：头脑风暴 → `superpowers:brainstorming`

```
你: 我要给商城加一个客服对话功能，用户在商品页能咨询商家

Claude 会做:
  1. 读取项目结构（CLAUDE.md、router、api 目录）
  2. 逐个提问澄清需求:
     - "实时通信用 WebSocket 还是轮询？"
     - "消息存 MySQL 还是独立消息表？"
     - "需要离线消息通知吗？"
  3. 提出 2-3 种技术方案（对比优劣）
  4. 生成设计文档 → docs/superpowers/specs/2026-04-06-customer-service-chat-design.md
  5. 等你确认批准

产出: 设计规范文档（技术选型、数据库表设计、API 接口定义、前端组件拆分）
```

### 阶段 2：编写计划 → `superpowers:writing-plans`

```
你: 设计我同意了，帮我写实现计划

Claude 会做:
  1. 基于设计文档拆分原子任务（每个 2-5 分钟）
  2. 按 TDD 顺序排列:
     Task 1: 创建 chat_messages 表（含 SQL）
     Task 2: 写 Message Entity + Mapper
     Task 3: 写 MessageController 测试 → 看失败
     Task 4: 实现 MessageController → 测试通过
     Task 5: 写前端 ChatWindow.vue 组件测试
     Task 6: 实现 ChatWindow.vue
     Task 7: 写 WebSocket 配置
     Task 8: 集成测试
     ...
  3. 每步包含完整代码、精确文件路径、运行命令、预期输出
  4. 保存 → docs/superpowers/plans/2026-04-06-customer-service-chat.md

产出: 分步实现计划（可由另一个会话或子代理直接执行）
```

### 阶段 3：执行计划（二选一）

**方案 A：子代理驱动** → `superpowers:subagent-driven-development`

```
你: 用子代理模式执行计划

Claude 会做:
  1. 创建 Git Worktree 隔离工作区
  2. 对每个任务:
     a. 派遣 implementer 子代理（带完整上下文）
     b. 子代理: 写测试 → 失败 → 实现 → 通过 → 提交
     c. 派遣 spec-reviewer 子代理（规格合规检查）
     d. 派遣 code-quality-reviewer 子代理（代码质量检查）
     e. 有问题? → implementer 修复 → 重审
  3. 全部任务完成 → 最终代码审查
```

**方案 B：内联执行** → `superpowers:executing-plans`

```
你: 在当前会话执行计划

Claude 会做:
  1. 创建 Git Worktree
  2. 加载计划，逐任务执行
  3. 每 3 个任务后请求代码审查
  4. 全部完成后调用 finishing-a-development-branch
```

### 阶段 4：调试（如遇 Bug）→ `superpowers:systematic-debugging`

```
场景: WebSocket 连接建立后消息收不到

Claude 会做:
  Phase 1: 根因调查（读错误日志、检查 WebSocket 握手、检查消息序列化）
  Phase 2: 模式分析（对比工作的 HTTP 接口 vs 不工作的 WS）
  Phase 3: 假设测试（"可能是 JWT 拦截器拦截了 WS 升级请求"）
  Phase 4: TDD 修复（写测试 → 失败 → 修复 JwtInterceptor 排除 WS 路径 → 通过）
```

### 阶段 5：验证 → `superpowers:verification-before-completion`

```
Claude 会做:
  1. 运行全部后端测试: mvn test → 34/34 passed
  2. 运行前端测试: npm run test:unit → 28/28 passed
  3. 运行 E2E 测试: npm run test:e2e → 对话流程通过
  4. 用证据声明: "所有测试通过，功能验证完成"
```

### 阶段 6：代码审查 → `superpowers:requesting-code-review`

```
Claude 会做:
  1. 派遣 code-reviewer 子代理
  2. 审查范围: git diff main...feature/customer-chat
  3. 反馈分级: Critical / Important / Minor
  4. Critical/Important → 立即修复 → 重审
  5. Minor → 记录，可后续处理
```

### 阶段 7：完成 → `superpowers:finishing-a-development-branch`

```
Claude 会做:
  1. 验证测试全部通过
  2. 提供 4 个选项:
     a) 合并到 main（本地）
     b) 推送并创建 PR
     c) 保留分支
     d) 丢弃
  3. 执行你的选择 + 清理 worktree
```

### 阶段 8：记忆沉淀（NeuralMemory）

```
你: /memory-intake 客服功能已完成:
    - WebSocket 实现实时通信
    - chat_messages 表存消息
    - JwtInterceptor 需排除 /ws/** 路径
    - ChatWindow.vue 是主组件

效果: 下次开发类似功能时，这些经验自动召回
```

### 全链路流程图

```
/memory-intake (录入需求)
       ↓
superpowers:brainstorming (需求 → 设计文档)
       ↓
superpowers:writing-plans (设计 → 实现计划)
       ↓
superpowers:using-git-worktrees (创建隔离工作区)
       ↓
superpowers:subagent-driven-development  ← superpowers:test-driven-development
  或 superpowers:executing-plans          ← (每个任务内部 TDD)
       ↓
superpowers:systematic-debugging (遇 Bug 时触发)
       ↓
superpowers:verification-before-completion (完成前验证)
       ↓
superpowers:requesting-code-review → superpowers:receiving-code-review
       ↓
superpowers:finishing-a-development-branch (合并/PR/保留)
       ↓
/memory-intake (沉淀经验)
       ↓
/memory-audit (定期体检) → /memory-evolution (优化记忆)
```

---

## 三、核心开发流程技能详解

### 3.1 头脑风暴 (brainstorming)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:brainstorming` |
| **触发** | 开始任何功能/组件/行为修改前 |
| **铁律** | 设计批准前不写一行代码 |

**核心功能：**

1. 通过自然对话将模糊想法转化为完整设计规范
2. **一次一个问题**，优先多选题，避免认知过载
3. 提出 2-3 种方案，说明各方案优劣
4. 生成设计文档并提交 git
5. 大项目自动拆分为子项目

**执行步骤：**

```
探索项目上下文 → 逐个澄清问题 → 提出方案 → 分阶段呈现设计
→ 写设计文档 → 自审 → 用户审查 → 批准后进入 writing-plans
```

**输出路径：** `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`

**反模式：**
- ❌ "这太简单了，不需要设计" — 再简单也要设计（可以是几句话）
- ❌ 一次问多个问题
- ❌ 设计中出现 "TBD"、"TODO"
- ❌ 多个子系统混在一个规格里

**最佳实践：**
- 问题越具体越好
- 设计围绕单一目的的小单元组织
- 遵循项目既有模式（从 CLAUDE.md 和现有代码推断）

---

### 3.2 编写计划 (writing-plans)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:writing-plans` |
| **触发** | brainstorming 完成并获批后 |
| **铁律** | 假设读者对代码库零了解 |

**核心功能：**

1. 生成可直接执行的分步实现计划
2. 每个任务是原子操作（2-5 分钟）
3. 包含**完整代码**、精确文件路径、运行命令、预期输出
4. 按 TDD + DRY + YAGNI 原则设计
5. 规格覆盖自审（检查遗漏）

**输出路径：** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

**执行选项：**

| 模式 | 适用 | 特点 |
|------|------|------|
| Subagent-Driven（推荐） | 大功能、多任务 | 每任务新子代理 + 两阶段审查 |
| Inline Execution | 小功能、少任务 | 当前会话逐步执行 |

**反模式：**
- ❌ "实现类似 Task N" — 必须重复写完整代码
- ❌ "添加适当的错误处理" — 必须写具体代码
- ❌ 没有精确文件路径
- ❌ 函数/方法在任何任务中都没有定义

**最佳实践：**
- 每步完整代码（不省略）
- 精确命令 + 预期输出
- 频繁提交（每个绿色步骤后）
- 多系统拆分多个计划

---

### 3.3 执行计划 (executing-plans)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:executing-plans` |
| **触发** | 有已写好的实现计划 |
| **前置** | 必须先用 `using-git-worktrees` 创建隔离工作区 |

**核心功能：**

1. 加载计划并批判性审查（发现问题先沟通）
2. 逐任务执行：标记 in_progress → 执行 → 验证 → 标记完成
3. 完成后自动调用 `finishing-a-development-branch`

**反模式：**
- ❌ 在 main/master 分支工作
- ❌ 跳过验证步骤
- ❌ 不理解指令就继续（先问）

---

### 3.4 测试驱动开发 (test-driven-development)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:test-driven-development` |
| **触发** | 实现任何功能、修 bug、重构时 |
| **铁律** | 没有失败测试，就不写生产代码 |

**核心功能：RED → GREEN → REFACTOR 循环**

```
1. RED:    写一个最小失败测试（验证失败原因正确）
2. GREEN:  写最小代码通过测试（不加额外功能）
3. REFACTOR: 清理代码（不改行为，保持绿色）
4. 重复
```

**关键参数：**
- 一个测试 = 一个行为
- 测试名称描述行为（不是 "test1"）
- 用真实代码，非必要不 mock

**反模式（违反即删除代码重来）：**
- ❌ 代码在测试之前写
- ❌ 测试写完直接通过（没验证失败）
- ❌ "已手动测试过" — 手动 ≠ 系统性
- ❌ "TDD 太教条" — TDD 就是务实
- ❌ "太简单不用测" — 简单代码也会坏
- ❌ 一次 3+ 次修复尝试 → 停下，这是架构问题

---

### 3.5 完成前验证 (verification-before-completion)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:verification-before-completion` |
| **触发** | 任何"完成/修复/通过"声明之前 |
| **铁律** | 无新鲜验证证据，不得声称完成 |

**5 步门函数：**

```
1. IDENTIFY:  什么命令能证明这个声明？
2. RUN:       执行完整验证命令（新鲜的）
3. READ:      完整读输出，检查退出码
4. VERIFY:    输出证实声明吗？
5. ONLY THEN: 做出声明
```

**反模式（违反 = 说谎）：**
- ❌ "应该能工作了" — 跑验证
- ❌ "很有信心" — 信心 ≠ 证据
- ❌ "代理说成功" — 独立验证
- ❌ 使用"应该"/"可能"/"似乎"

---

### 3.6 请求代码审查 (requesting-code-review)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:requesting-code-review` |
| **触发** | 任务完成、功能实现后、合并前 |
| **需要** | 子代理支持 |

**核心功能：**

1. 派遣 code-reviewer 子代理
2. 构建审查上下文：BASE_SHA、HEAD_SHA、实现描述、计划/需求
3. 反馈分级：Critical → Important → Minor
4. Critical/Important 必须修复后重审

**审查频率：**

| 模式 | 频率 |
|------|------|
| Subagent-Driven | 每个任务完成后 |
| Executing-Plans | 每 3 个任务后 |

---

## 四、辅助技能详解

### 4.1 接收代码审查 (receiving-code-review)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:receiving-code-review` |
| **触发** | 收到审查反馈时 |
| **核心** | 技术评估，不盲目同意 |

**响应流程：** 阅读 → 理解 → 验证代码库 → 技术评估 → 响应 → 实现

**反模式：**
- ❌ "你说得完全对！" — 表演式认同
- ❌ 不清楚就开始实现
- ❌ 批量实现不测试

---

### 4.2 系统性调试 (systematic-debugging)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:systematic-debugging` |
| **触发** | 任何 bug、测试失败、异常行为 |
| **铁律** | 无根因调查，不提修复方案 |

**四阶段流程（不可跳过）：**

| 阶段 | 做什么 | 关键 |
|------|--------|------|
| Phase 1 | 根因调查 | 读错误信息、重现、检查最近改动 |
| Phase 2 | 模式分析 | 找工作示例对比、识别差异 |
| Phase 3 | 假设测试 | 单一假设 + 最小测试 |
| Phase 4 | 实现修复 | TDD 修复根因 |

**关键规则：**
- 修复失败 <3 次 → 返回 Phase 1
- 修复失败 ≥3 次 → **停下，质疑架构**
- 多层系统 → 每层边界打诊断日志

---

### 4.3 派遣并行代理 (dispatching-parallel-agents)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:dispatching-parallel-agents` |
| **触发** | 2+ 个独立任务，无共享状态 |
| **核心** | 一个代理一个问题域 |

**独立性判断：** "修复一个会修复其他吗？" NO = 可以并行

**代理任务模板：**
```
- 特定作用域（哪个文件/模块）
- 清晰目标（修什么/做什么）
- 约束条件（"不改产品代码" / "仅修测试"）
- 预期输出（返回什么格式的结果）
```

**不适用场景：**
- 失败相关（修一个可能修其他）
- 需要全系统理解
- 探索性调试

---

### 4.4 子代理驱动开发 (subagent-driven-development)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:subagent-driven-development` |
| **触发** | 有实现计划，任务大多独立，同会话执行 |
| **核心** | 每任务新子代理 + 两阶段审查 |

**每任务执行流程：**

```
提取任务上下文
    ↓
派遣 implementer → 实现 + 测试 + 提交
    ↓
派遣 spec-reviewer → 规格合规检查
    ↓ (不合规? implementer 修 → 重审)
派遣 code-quality-reviewer → 代码质量检查
    ↓ (有问题? implementer 修 → 重审)
标记完成 → 下一个任务
```

**模型选择策略：**

| 任务类型 | 推荐模型 |
|---------|---------|
| 机械实现（1-2 文件） | 快速便宜模型 |
| 集成/判断（多文件） | 标准模型 |
| 架构/设计/审查 | 最强模型 |

**反模式：**
- ❌ 并行多个 implementer（会冲突）
- ❌ 跳过审查
- ❌ 代码质量审查在规格审查之前（顺序错）
- ❌ 一个审查还有 open 问题就进下一个任务

---

### 4.5 使用 Git Worktrees (using-git-worktrees)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:using-git-worktrees` |
| **触发** | 开始功能开发前（executing-plans 的前置要求） |
| **核心** | 创建隔离工作区 |

**目录选择优先级：**
1. 检查现有 `.worktrees/` 或 `worktrees/`
2. 检查 CLAUDE.md 偏好
3. 询问用户

**自动执行：** 创建 worktree → 检测项目类型 → npm install/mvn install → 运行基线测试

---

### 4.6 完成开发分支 (finishing-a-development-branch)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:finishing-a-development-branch` |
| **触发** | 实现完成，所有测试通过 |
| **前置** | 必须先通过 verification |

**4 个选项：**

| 选项 | 操作 | Worktree |
|------|------|---------|
| 1. 合并到 main | merge + 合并后测试 + 删分支 | 清理 |
| 2. 推送创建 PR | push + gh pr create | 清理 |
| 3. 保留分支 | 不动 | 保留 |
| 4. 丢弃 | 需要输入 'discard' 确认 | 清理 |

---

### 4.7 编写技能 (writing-skills)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:writing-skills` |
| **触发** | 创建/编辑自定义 skill |
| **核心** | TDD 应用到流程文档 |

**SKILL.md 结构：**
```yaml
---
name: skill-name        # 字母/数字/连字符
description: |           # 仅写触发条件，不总结流程（max 1024 chars）
  Use when...
---
# Overview: 核心原则
# When to Use: 流程图
# Core Pattern: 好/坏对比
# Quick Reference: 速查表
# Common Mistakes: 错误 + 修正
```

---

### 4.8 使用超级力量 (using-superpowers)

| 项目 | 内容 |
|------|------|
| **调用** | `superpowers:using-superpowers` |
| **触发** | 每次对话开始 |
| **铁律** | 即使 1% 概率适用，也必须调用技能 |

**指令优先级：** 用户指令 > 技能指令 > 默认系统提示

---

## 五、NeuralMemory 记忆管理技能详解

### 5.1 记忆录入 (memory-intake)

| 项目 | 内容 |
|------|------|
| **调用** | `/memory-intake <内容>` |
| **触发** | 有零散知识需要结构化存储 |
| **核心** | 分类 → 澄清 → 充实 → 去重 → 批存 |

**记忆类型与优先级：**

| 类型 | 信号词 | 默认优先级 | 默认过期 |
|------|--------|-----------|---------|
| fact | "是"、数字、日期 | 5 | 无 |
| decision | "决定"、"选用"、"采用" | 7 | 无 |
| todo | "需要"、"应该"、"TODO" | 6 | 30 天 |
| error | "bug"、"崩溃"、"修复" | 7 | 90 天 |
| insight | "发现"、"原来"、"关键" | 6 | 无 |
| preference | "偏好"、"总是用"、"约定" | 5 | 无 |
| instruction | "规则"、"永远"、"不要" | 8 | 无 |
| workflow | "流程"、"步骤"、"先…再…" | 6 | 无 |
| context | 背景、环境、项目状态 | 4 | 30 天 |

**优先级范围：**
- 0-3: 背景知识
- 4-6: 标准操作知识
- 7-8: 重要决策、活跃 TODO
- 9-10: 安全敏感、核心架构

**规则：**
- 存储前必须预览确认（不自动存）
- 一个概念一条记忆
- 决策必须包含理由
- 检查已有标签（不发明新的）

---

### 5.2 记忆审计 (memory-audit)

| 项目 | 内容 |
|------|------|
| **调用** | `/memory-audit` |
| **触发** | 定期体检，积累一段时间后 |
| **核心** | 6 维度打分，输出审计报告 |

**6 个审计维度：**

| 维度 | 权重 | A 级标准 | 检查内容 |
|------|------|---------|---------|
| 纯度 | 25% | 0 冲突, 0 重复 | 矛盾、近似重复、过时事实 |
| 新鲜度 | 20% | <10% 过时, 0 过期 TODO | 过时比例、僵尸记忆 |
| 覆盖度 | 20% | 重要话题 >2 条记忆 | 主题平衡、决策完整性 |
| 清晰度 | 15% | 无模糊、无过载 | 模糊记忆、缺失上下文 |
| 相关性 | 10% | 匹配当前项目 | 孤立引用、技术漂移 |
| 结构 | 10% | 连接良好 | 孤立神经元、突触多样性 |

**反模式：**
- ❌ 无证据的发现（每条必须引用具体记忆）
- ❌ 自动修改（只建议，用户决定）

---

### 5.3 记忆进化 (memory-evolution)

| 项目 | 内容 |
|------|------|
| **调用** | `/memory-evolution` |
| **触发** | 审计发现问题后，或定期优化 |
| **核心** | 基于实际使用模式优化 |

**5 种进化操作：**

| 操作 | 触发条件 | 做什么 |
|------|---------|--------|
| 合并 (Consolidation) | 3+ 条记忆覆盖同一窄话题 | 合并为 2-3 条更丰富的 |
| 补充 (Enrichment) | 重要话题覆盖不足 | 提问填补缺口 |
| 清理 (Pruning) | >90 天从未召回 | 展示后删除 |
| 标签归一 (Tag Normalization) | 同概念多个标签变体 | 统一为规范标签 |
| 优先级重衡 (Priority Rebalancing) | 热记忆低优先级 / 死记忆高优先级 | 调整优先级 |

**记忆分类：**

| 类别 | 标准 | 处理 |
|------|------|------|
| Hot | 7 天内 5+ 次召回 | 保护，可能提升优先级 |
| Warm | 30 天内 1-4 次召回 | 健康，不动 |
| Cold | 30-90 天未召回 | 审查相关性 |
| Dead | >90 天未召回 | 候选清理 |
| Zombie | 有召回但置信度 <0.3 | 候选重写/充实 |

**规则：**
- 每次 3-5 个操作（不批量 20 个）
- 目标 +5-10 分/周期，不追求完美
- 保留 > 清理（有疑问就保留）
- 错误记忆保留更久（防止重复犯错）

---

## 六、技能联动矩阵

### 触发链

| 技能 | 前置 | 后续 | 内部依赖 |
|------|------|------|---------|
| brainstorming | — | writing-plans | — |
| writing-plans | brainstorming | executing-plans 或 subagent-driven | — |
| executing-plans | writing-plans | finishing-branch | using-git-worktrees |
| subagent-driven | writing-plans | finishing-branch | using-git-worktrees |
| test-driven-dev | — | verification | — (每个实现任务内部) |
| verification | — | — | — (每次声明完成前) |
| requesting-review | verification | receiving-review | — |
| systematic-debugging | — | test-driven-dev | — |
| finishing-branch | verification | — | — |

### 场景速查

| 场景 | 技能链 |
|------|--------|
| **新功能** | brainstorming → writing-plans → worktree → subagent/executing → verification → review → finish |
| **修 Bug** | systematic-debugging → TDD → verification → finish |
| **重构** | brainstorming → writing-plans → TDD → verification → review → finish |
| **多独立任务** | dispatching-parallel-agents → verification |
| **知识管理** | memory-intake → memory-audit → memory-evolution |

---

## 七、硬性规则速查

| 规则 | 技能 | 违反后果 |
|------|------|---------|
| 设计批准前不写代码 | brainstorming | 方向错误，返工 |
| 没有失败测试不写生产代码 | TDD | 删代码重来 |
| 无证据不声称完成 | verification | 等同说谎 |
| 找到根因才能修复 | systematic-debugging | 症状修复 = 失败 |
| 3+ 次修复失败停下 | systematic-debugging | 架构问题被掩盖 |
| 不在 main 分支工作 | executing-plans | 污染主分支 |
| 审查有 open 问题不继续 | subagent-driven | 问题累积 |
| 规格审查在质量审查前 | subagent-driven | 顺序错误 |
| 记忆存储前必须预览 | memory-intake | 垃圾数据 |
| 用户指令 > 技能指令 | using-superpowers | — |
