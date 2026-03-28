# Claude Code 技能完全指南

> **Superpowers + Everything Claude Code (ECC) 全部技能介绍与使用教程**
>
> 生成日期：2026-03-29

---

## 目录

- [第一部分：Superpowers 插件](#第一部分superpowers-插件)
- [第二部分：Everything Claude Code (ECC) 插件](#第二部分everything-claude-code-ecc-插件)
- [附录：技能速查表](#附录技能速查表)

---

# 第一部分：Superpowers 插件

> **版本：** 5.0.6
> **作者：** Jesse Vincent
> **核心理念：** 强制工程纪律 — 先想清楚再动手（brainstorming → plan → TDD → verify → review）

## 工作流总览

```
用户需求 → brainstorming（头脑风暴）
         → writing-plans（写计划）
         → using-git-worktrees（隔离工作区）
         → subagent-driven-development / executing-plans（执行）
         → test-driven-development（TDD 开发）
         → systematic-debugging（排查 bug）
         → verification-before-completion（完成前验证）
         → requesting-code-review（请求审查）
         → receiving-code-review（接收审查反馈）
         → finishing-a-development-branch（收尾）
```

---

## 1. brainstorming — 头脑风暴

**触发时机：** 任何创造性工作之前 — 新功能、新组件、行为修改等。

**核心规则：** 在用户批准设计之前，**禁止写任何代码**。

### 流程

1. **探索项目上下文** — 查看文件、文档、最近提交
2. **提供可视化伴侣**（如果涉及 UI 问题）— 独立消息，不与其他问题混合
3. **逐一提问** — 一次一个问题，理解目的/约束/成功标准
4. **提出 2-3 种方案** — 含权衡和推荐
5. **展示设计** — 按复杂度分段，每段获得用户批准
6. **写设计文档** — 保存到 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
7. **Spec 自审** — 检查占位符、矛盾、模糊处
8. **用户审阅** — 等待用户确认
9. **过渡到实现** — 调用 writing-plans 技能

### 关键原则

- **一次一个问题** — 不要同时抛出多个问题
- **优先多选题** — 比开放式更容易回答
- **YAGNI** — 无情砍掉不必要的功能
- **始终提出 2-3 种方案**
- **增量验证** — 分段展示设计，逐步获批

### 使用示例

```
用户: "给我的电商平台加一个收藏功能"

Claude: [探索项目结构]
Claude: "这个收藏功能主要面向哪类用户？
  A) 普通消费者 — 收藏商品方便下次购买
  B) 批发商 — 收藏供应商和常购商品
  C) 两者都要"

用户: "A"

Claude: [继续逐一提问...]
Claude: [提出 2-3 种实现方案]
Claude: [展示设计，获得批准]
Claude: [写设计文档并提交]
Claude: [调用 writing-plans]
```

---

## 2. writing-plans — 写实现计划

**触发时机：** 有设计规格/需求文档后，在写代码之前。

**核心理念：** 假设实现者对代码库零了解。每个步骤都是 2-5 分钟的咬口大小任务。

### 计划文档结构

```markdown
# [功能名] 实现计划

> **For agentic workers:** 使用 superpowers:subagent-driven-development
> 或 superpowers:executing-plans 逐任务执行。

**目标:** [一句话描述]
**架构:** [2-3 句方案]
**技术栈:** [关键技术/库]

---

### Task N: [组件名]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: 写失败测试**
  [完整测试代码]

- [ ] **Step 2: 运行测试确认失败**
  Run: `pytest tests/path/test.py::test_name -v`
  Expected: FAIL

- [ ] **Step 3: 写最小实现**
  [完整实现代码]

- [ ] **Step 4: 运行测试确认通过**

- [ ] **Step 5: 提交**
```

### 禁止事项

- 不允许 "TBD"、"TODO"、"implement later"
- 不允许 "Add appropriate error handling"（必须写出具体代码）
- 不允许 "Similar to Task N"（每个任务独立完整）
- 每个步骤必须包含完整代码

### 自审清单

1. **Spec 覆盖** — 每个需求都有对应任务
2. **占位符扫描** — 搜索所有红旗词
3. **类型一致性** — 后续任务的类型/方法名与早期定义一致

---

## 3. executing-plans — 执行计划

**触发时机：** 有写好的实现计划，在独立会话中执行。

### 流程

1. **加载并审阅计划** — 读取计划文件，批判性审查，有疑问先提出
2. **逐任务执行** — 标记 in_progress → 按步骤执行 → 运行验证 → 标记 completed
3. **完成开发** — 所有任务完成后，调用 finishing-a-development-branch

### 何时停下来

- 遇到阻塞（缺依赖、测试失败、指令不清）
- 计划有关键缺口
- 不理解某个指令
- 验证反复失败

**宁可问，不要猜。**

---

## 4. test-driven-development — 测试驱动开发

**触发时机：** 实现任何功能或修复 bug 之前。

### 铁律

```
没有失败的测试 → 不能写生产代码
```

先写了代码？**删除它。从头开始。**

### Red-Green-Refactor 循环

| 阶段 | 做什么 | 验证 |
|------|--------|------|
| **RED** | 写一个最小失败测试 | 运行，确认失败（不是报错） |
| **GREEN** | 写最简单的代码通过测试 | 运行，确认通过 |
| **REFACTOR** | 消除重复，改善命名 | 保持测试绿色 |

### 好测试的标准

- **最小化** — 测试一个行为，名字里有 "and" 就该拆分
- **清晰** — 名字描述行为
- **真实** — 用真实代码，mock 仅在不可避免时使用

### 常见借口与现实

| 借口 | 现实 |
|------|------|
| "太简单不需要测试" | 简单代码也会出错，测试只要 30 秒 |
| "我先写代码后补测试" | 后补的测试立即通过，什么也证明不了 |
| "TDD 会拖慢速度" | TDD 比调试更快，这才是务实 |
| "我已经手动测过了" | 手动测试是临时的，无法复现 |
| "删掉 X 小时的代码太浪费" | 沉没成本谬误，保留不可信的代码才是浪费 |

### Bug 修复示例

```typescript
// RED — 写失败测试
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});

// 运行：FAIL ✓

// GREEN — 最小实现
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  // ...
}

// 运行：PASS ✓

// REFACTOR — 如需要，提取验证逻辑
```

---

## 5. systematic-debugging — 系统性调试

**触发时机：** 遇到任何 bug、测试失败、意外行为时，**在尝试修复之前**。

### 铁律

```
没有根因调查 → 不能提出修复方案
```

### 四个阶段

#### Phase 1: 根因调查

1. **仔细阅读错误信息** — 完整读取栈追踪，注意行号和错误码
2. **稳定复现** — 精确步骤，是否每次都发生
3. **检查最近改动** — git diff，最近提交，新依赖，配置变更
4. **多组件系统收集证据** — 在每个组件边界加诊断日志，运行一次收集证据
5. **追踪数据流** — 坏值从哪里来？一直向上追踪到源头

#### Phase 2: 模式分析

1. **找到正常工作的示例** — 同代码库中类似的能用的代码
2. **对比参考实现** — 完整阅读，不要跳过
3. **识别差异** — 列出所有不同点

#### Phase 3: 假设与测试

1. **形成单一假设** — "我认为 X 是根因，因为 Y"
2. **最小变更测试** — 一次只改一个变量
3. **验证后再继续** — 不要在不工作的修复上叠加更多修复

#### Phase 4: 实现

1. **创建失败测试用例**
2. **实现单一修复**
3. **验证修复**
4. **如果 3+ 次修复失败** → **停下来，质疑架构**

### 时间对比

- 系统性方法：15-30 分钟修复
- 随机修复：2-3 小时瞎折腾
- 首次修复成功率：95% vs 40%

---

## 6. verification-before-completion — 完成前验证

**触发时机：** 在声称工作完成/已修复/测试通过之前。

### 铁律

```
没有新鲜的验证证据 → 不能声称完成
```

### 门控函数

```
1. IDENTIFY: 什么命令能证明这个声称？
2. RUN: 执行完整命令（新鲜的，完整的）
3. READ: 读取完整输出，检查退出码
4. VERIFY: 输出是否确认了声称？
5. ONLY THEN: 做出声称
```

### 常见验证需求

| 声称 | 需要 | 不够 |
|------|------|------|
| 测试通过 | 测试命令输出：0 failures | 上次运行结果 |
| Linter 干净 | Linter 输出：0 errors | 部分检查 |
| Build 成功 | Build 命令：exit 0 | "看起来没问题" |
| Bug 已修复 | 测试原始症状：通过 | "代码改了，应该修好了" |

### 红旗

- 使用 "should"、"probably"、"seems to"
- 在验证前表达满意（"Great!"、"Done!"）
- 信任 agent 的成功报告而不独立验证

---

## 7. requesting-code-review — 请求代码审查

**触发时机：** 完成任务/主要功能后，merge 前。

### 步骤

```bash
# 1. 获取 git SHA
BASE_SHA=$(git rev-parse HEAD~1)   # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)

# 2. 分派 code-reviewer 子代理
# 填写模板：实现了什么、需求是什么、BASE_SHA、HEAD_SHA

# 3. 根据反馈行动
# Critical → 立即修复
# Important → 继续前修复
# Minor → 记录后续处理
```

### 与工作流集成

- **Subagent-Driven Development** → 每个任务后审查
- **Executing Plans** → 每 3 个任务批审
- **临时开发** → merge 前审查

---

## 8. receiving-code-review — 接收代码审查

**触发时机：** 收到代码审查反馈时。

### 响应模式

```
1. READ: 完整阅读反馈，不反应
2. UNDERSTAND: 用自己的话重述需求
3. VERIFY: 对照代码库实际情况检查
4. EVALUATE: 对当前代码库技术上是否合理？
5. RESPOND: 技术确认或有理有据的反驳
6. IMPLEMENT: 一次一个，每个都测试
```

### 禁止

- ❌ "You're absolutely right!"（表演性同意）
- ❌ "Great point!"（奉承）
- ❌ 未验证就实现

### 应该

- ✅ 重述技术需求
- ✅ 提出澄清问题
- ✅ 如果错误就用技术理由反驳
- ✅ 直接开始干活（行动 > 言语）

### 何时反驳

- 建议会破坏现有功能
- 审查者缺乏完整上下文
- 违反 YAGNI
- 对当前技术栈技术上不正确

---

## 9. dispatching-parallel-agents — 并行分派代理

**触发时机：** 有 2+ 个独立任务，无共享状态、无顺序依赖。

### 判断流程

```
多个失败？
  └─ 相互独立？
       ├─ 是 → 能并行？ → 并行分派
       └─ 否 → 单个代理调查
```

### 好的代理提示

```markdown
修复 src/agents/agent-tool-abort.test.ts 中的 3 个失败测试：

1. "should abort tool with partial output capture" - 期望 'interrupted at'
2. "should handle mixed completed and aborted tools" - 快工具被中止
3. "should properly track pendingToolCount" - 期望 3 个结果但得到 0

这些是计时/竞态条件问题。你的任务：
1. 阅读测试文件理解每个测试验证什么
2. 识别根因 - 计时问题还是实际 bug？
3. 修复

不要只增加超时时间 - 找到真正的问题。
返回：发现了什么以及修复了什么的摘要。
```

### 常见错误

- ❌ 太宽泛："Fix all the tests"
- ✅ 具体："Fix agent-tool-abort.test.ts"
- ❌ 无上下文
- ✅ 粘贴错误消息和测试名

---

## 10. subagent-driven-development — 子代理驱动开发

**触发时机：** 执行包含独立任务的实现计划，在当前会话中。

### 流程

```
读取计划 → 提取所有任务
  └─ 对每个任务：
       1. 分派实现子代理
       2. 如有问题 → 回答 → 重新分派
       3. 实现完成 → 分派 Spec 审查子代理
       4. Spec 通过 → 分派代码质量审查子代理
       5. 质量通过 → 标记完成 → 下一个任务
  └─ 所有任务完成 → 最终审查 → finishing-a-development-branch
```

### 模型选择

- **简单任务**（1-2 文件，清晰 spec）→ 用快速便宜模型
- **集成任务**（多文件协调）→ 用标准模型
- **架构/设计/审查**→ 用最强模型

### 实现者状态处理

| 状态 | 处理 |
|------|------|
| **DONE** | 进入 Spec 审查 |
| **DONE_WITH_CONCERNS** | 读取顾虑，评估后决定 |
| **NEEDS_CONTEXT** | 提供缺失上下文，重新分派 |
| **BLOCKED** | 评估阻塞原因，换策略/升级 |

---

## 11. using-git-worktrees — 使用 Git Worktree

**触发时机：** 需要隔离工作区的功能开发前，或执行计划前。

### 目录选择优先级

1. 检查 `.worktrees/` 或 `worktrees/` 是否存在
2. 检查 CLAUDE.md 中的偏好设置
3. 询问用户

### 创建步骤

```bash
# 1. 检查目录是否被 gitignore（关键！）
git check-ignore -q .worktrees

# 2. 如果没有被忽略 → 添加到 .gitignore 并提交

# 3. 创建 worktree
git worktree add .worktrees/feature-name -b feature/feature-name
cd .worktrees/feature-name

# 4. 安装依赖
npm install  # 或 cargo build / pip install 等

# 5. 运行测试确认基线干净
npm test
```

---

## 12. finishing-a-development-branch — 收尾开发分支

**触发时机：** 实现完成，所有测试通过，需要决定如何集成。

### 流程

1. **验证测试通过**（失败则停止）
2. **确定基础分支**
3. **呈现 4 个选项：**
   - Merge 回基础分支（本地）
   - Push 并创建 Pull Request
   - 保持分支现状
   - 丢弃这个工作
4. **执行选择**
5. **清理 worktree**

---

## 13. writing-skills — 编写技能

**触发时机：** 创建新技能、编辑现有技能。

### 核心理念

**写技能就是对流程文档做 TDD。**

### TDD 映射

| TDD 概念 | 技能创建 |
|----------|---------|
| 测试用例 | 压力场景 + 子代理 |
| 生产代码 | SKILL.md 文档 |
| RED（失败） | 代理在没有技能时违反规则 |
| GREEN（通过） | 代理有技能时遵守规则 |
| REFACTOR | 堵住漏洞，保持合规 |

### SKILL.md 结构

```markdown
---
name: skill-name
description: Use when [具体触发条件]
---

# 技能名称

## Overview
核心原则 1-2 句话

## When to Use
触发条件、症状

## Core Pattern
before/after 代码对比

## Quick Reference
快速扫描表格

## Common Mistakes
常见错误 + 修复
```

### 关键：description 只写触发条件，不写工作流摘要

```yaml
# ❌ 错误：描述了工作流
description: 任务间分派子代理做代码审查

# ✅ 正确：只写触发条件
description: Use when executing implementation plans with independent tasks
```

---

## 14. using-superpowers — 使用 Superpowers 引导

**触发时机：** 每次会话开始。

**作用：** 建立查找和使用技能的规则 — 在任何响应（包括澄清问题）之前先调用相关技能。

**核心规则：** 即使只有 1% 的可能性某个技能适用，也**必须调用**。

---

# 第二部分：Everything Claude Code (ECC) 插件

> **版本：** 1.9.0
> **技能总数：** 100+
> **覆盖：** 6 大框架（Claude, Cursor, Kiro, Codex, OpenCode, Plugin）

ECC 按领域分类，每个技能通过 `Skill` 工具调用，格式为 `everything-claude-code:<skill-name>`。

---

## 一、开发流程与规划

| 技能 | 说明 | 触发时机 |
|------|------|---------|
| `plan` | 重述需求、评估风险、创建分步实现计划 | 实现复杂功能前 |
| `blueprint` | 将一句话目标转为多会话、多代理工程项目的逐步构建计划 | 复杂多 PR 任务 |
| `tdd` | TDD 工作流：先搭接口、先写测试、再写最小实现 | 写新功能/修 bug/重构 |
| `tdd-workflow` | 强制 TDD 流程，要求 80%+ 覆盖率 | 同上 |
| `verification-loop` | 综合验证系统 | 发布/PR 前 |
| `search-first` | 先搜索现有工具/库/模式再写自定义代码 | 写代码前 |
| `agentic-engineering` | 以 eval 驱动执行、分解、成本感知路由运作 | 复杂代理任务 |

---

## 二、多代理协作

| 技能 | 说明 |
|------|------|
| `devfleet` | 通过 Claude DevFleet 编排并行代理 — 规划、分派隔离 worktree、监控进度 |
| `claude-devfleet` | 同上（别名） |
| `orchestrate` | 顺序和 tmux/worktree 多代理编排指导 |
| `team-builder` | 交互式代理选择器，组建并分派并行团队 |
| `dmux-workflows` | 使用 dmux（tmux 窗格管理器）编排 AI 代理 |
| `autonomous-loops` | 自主 Claude Code 循环模式 — 从简单管道到 RFC 驱动的 DAG |
| `continuous-agent-loop` | 带质量门控、evals 和恢复控制的持续自主循环 |
| `ralphinho-rfc-pipeline` | RFC 驱动多代理 DAG 执行模式 |
| `santa-method` | 多代理对抗性验证，双独立审查通过才发布 |

---

## 三、代码审查

| 技能 | 说明 |
|------|------|
| `python-review` | Python 代码审查（PEP 8、类型提示、安全、Pythonic 风格） |
| `typescript-review`* | TypeScript/JavaScript 审查（类型安全、async 正确性） |
| `java-review`* | Java/Spring Boot 审查（分层架构、JPA、安全） |
| `go-review` | Go 审查（惯用模式、并发安全、错误处理） |
| `rust-review` | Rust 审查（所有权、生命周期、错误处理、unsafe） |
| `cpp-review` | C++ 审查（内存安全、现代 C++、并发） |
| `kotlin-review` | Kotlin 审查（惯用模式、null 安全、协程安全） |
| `flutter-dart-code-review` | Flutter/Dart 审查（Widget、状态管理、性能） |

> *带星号表示该技能在 system reminder 列表中出现但可能需要对应代理支持

---

## 四、构建错误修复

| 技能 | 说明 |
|------|------|
| `cpp-build` | 修复 C++ 构建错误、CMake 问题、链接器问题 |
| `go-build` | 修复 Go 构建错误、go vet 警告 |
| `rust-build` | 修复 Rust 构建错误、借用检查器问题 |
| `kotlin-build` | 修复 Kotlin/Gradle 构建错误 |
| `gradle-build` | 修复 Gradle 构建错误（Android/KMP） |

---

## 五、测试

| 技能 | 说明 |
|------|------|
| `e2e` | Playwright E2E 测试 — 创建测试旅程、截图/视频/trace |
| `e2e-testing` | Playwright 模式、Page Object Model、CI/CD 集成 |
| `cpp-test` | C++ TDD（GoogleTest） |
| `go-test` | Go TDD（table-driven tests，80%+ 覆盖率） |
| `rust-test` | Rust TDD（cargo-llvm-cov） |
| `kotlin-test` | Kotlin TDD（Kotest + Kover） |
| `ai-regression-testing` | AI 辅助开发的回归测试策略 |

---

## 六、后端开发

### Spring Boot / Java

| 技能 | 说明 |
|------|------|
| `springboot-patterns` | Spring Boot 架构模式、REST API、分层服务、缓存 |
| `springboot-security` | Spring Security 最佳实践 |
| `springboot-tdd` | Spring Boot TDD（JUnit 5, Mockito, Testcontainers） |
| `springboot-verification` | Spring Boot 验证循环（构建、分析、测试、安全扫描） |
| `java-coding-standards` | Java 编码标准 |
| `jpa-patterns` | JPA/Hibernate 模式 |

### Django / Python

| 技能 | 说明 |
|------|------|
| `django-patterns` | Django 架构模式、DRF、ORM |
| `django-security` | Django 安全最佳实践 |
| `django-tdd` | Django 测试策略（pytest-django） |
| `django-verification` | Django 验证循环 |
| `python-patterns` | Pythonic 惯用法、PEP 8、类型提示 |
| `python-testing` | pytest TDD 策略 |

### Laravel / PHP

| 技能 | 说明 |
|------|------|
| `laravel-patterns` | Laravel 架构模式、Eloquent ORM |
| `laravel-security` | Laravel 安全最佳实践 |
| `laravel-tdd` | Laravel TDD（PHPUnit/Pest） |
| `laravel-verification` | Laravel 验证循环 |

### Go

| 技能 | 说明 |
|------|------|
| `golang-patterns` | 惯用 Go 模式和最佳实践 |
| `golang-testing` | Go 测试模式（table-driven, fuzzing） |

### Rust

| 技能 | 说明 |
|------|------|
| `rust-patterns` | 惯用 Rust 模式、所有权、trait、并发 |
| `rust-testing` | Rust 测试模式（property-based, async） |

### Kotlin

| 技能 | 说明 |
|------|------|
| `kotlin-patterns` | 惯用 Kotlin 模式、协程、null 安全 |
| `kotlin-testing` | Kotlin 测试（Kotest, MockK） |
| `kotlin-coroutines-flows` | Kotlin 协程和 Flow 模式 |
| `kotlin-ktor-patterns` | Ktor 服务器模式 |
| `kotlin-exposed-patterns` | JetBrains Exposed ORM 模式 |

### C++

| 技能 | 说明 |
|------|------|
| `cpp-coding-standards` | C++ Core Guidelines 编码标准 |
| `cpp-testing` | GoogleTest/CTest 配置和测试 |

### Perl

| 技能 | 说明 |
|------|------|
| `perl-patterns` | 现代 Perl 5.36+ 惯用法 |
| `perl-testing` | Perl 测试（Test2::V0） |
| `perl-security` | Perl 安全（taint mode, DBI） |

---

## 七、前端开发

| 技能 | 说明 |
|------|------|
| `frontend-patterns` | React/Next.js 前端模式、状态管理、性能优化 |
| `coding-standards` | TypeScript/JavaScript/React/Node.js 通用编码标准 |
| `nextjs-turbopack` | Next.js 16+ Turbopack 模式 |
| `nuxt4-patterns` | Nuxt 4 SSR 安全模式 |
| `bun-runtime` | Bun 运行时/包管理器/bundler |
| `frontend-slides` | 创建动画丰富的 HTML 演示文稿 |
| `swiftui-patterns` | SwiftUI 架构模式和状态管理 |
| `compose-multiplatform-patterns` | Compose Multiplatform/Jetpack Compose 模式 |
| `liquid-glass-design` | iOS 26 Liquid Glass 设计系统 |

---

## 八、数据库

| 技能 | 说明 |
|------|------|
| `postgres-patterns` | PostgreSQL 查询优化、模式设计、索引、安全 |
| `database-migrations` | 数据库迁移最佳实践（零停机） |
| `clickhouse-io` | ClickHouse 分析查询优化 |

---

## 九、DevOps 与部署

| 技能 | 说明 |
|------|------|
| `deployment-patterns` | 部署工作流、CI/CD、Docker、健康检查、回滚 |
| `docker-patterns` | Docker/Compose 模式、容器安全、网络 |

---

## 十、安全

| 技能 | 说明 |
|------|------|
| `security-review` | 认证/用户输入/密钥/API 端点安全清单 |
| `security-scan` | 扫描 `.claude/` 目录的安全漏洞和注入风险 |

---

## 十一、API 与集成

| 技能 | 说明 |
|------|------|
| `api-design` | REST API 设计模式（命名、状态码、分页、限流） |
| `claude-api` | Anthropic Claude API 模式（Messages API、streaming、tool use） |
| `mcp-server-patterns` | 构建 MCP 服务器（Node/TS SDK） |
| `x-api` | X/Twitter API 集成 |
| `fal-ai-media` | fal.ai MCP 统一媒体生成（图片/视频/音频） |

---

## 十二、AI/ML

| 技能 | 说明 |
|------|------|
| `pytorch-patterns` | PyTorch 深度学习模式和训练管道 |
| `cost-aware-llm-pipeline` | LLM API 成本优化 |
| `foundation-models-on-device` | Apple FoundationModels 框架（iOS 26+） |

---

## 十三、文档与研究

| 技能 | 说明 |
|------|------|
| `docs` / `documentation-lookup` | 通过 Context7 查询最新库/框架文档 |
| `deep-research` | 多源深度研究（firecrawl + exa） |
| `exa-search` | Exa 神经搜索（网页、代码、公司） |
| `market-research` | 市场研究、竞争分析 |
| `codebase-onboarding` | 分析陌生代码库并生成入门指南 |

---

## 十四、内容创作

| 技能 | 说明 |
|------|------|
| `article-writing` | 写文章/博客/教程/通讯 |
| `content-engine` | 跨平台内容系统（X/LinkedIn/TikTok/YouTube） |
| `crosspost` | 多平台内容分发 |
| `investor-materials` | 投资人材料（pitch deck/财务模型） |
| `investor-outreach` | 投资人沟通（冷邮件/跟进） |
| `video-editing` | AI 辅助视频编辑 |
| `videodb` | 视频/音频处理（索引、搜索、编辑） |

---

## 十五、移动端

| 技能 | 说明 |
|------|------|
| `android-clean-architecture` | Android/KMP Clean Architecture |
| `swift-concurrency-6-2` | Swift 6.2 并发模式 |
| `swift-actor-persistence` | Swift Actor 线程安全持久化 |
| `swift-protocol-di-testing` | Swift 协议依赖注入测试 |

---

## 十六、会话与学习管理

| 技能 | 说明 |
|------|------|
| `save-session` | 保存当前会话状态 |
| `resume-session` | 恢复上次会话 |
| `sessions` | 管理会话历史和别名 |
| `continuous-learning` | 自动提取可复用模式 |
| `continuous-learning-v2` | 基于 instinct 的学习系统 |
| `learn-eval` | 提取模式并自评质量 |
| `instinct-status` | 显示学到的 instincts |
| `instinct-export` / `instinct-import` | 导入/导出 instincts |
| `promote` | 将项目级 instinct 提升为全局 |
| `evolve` | 分析 instincts 并建议进化 |
| `prune` | 删除 30 天未提升的 instincts |
| `projects` | 列出已知项目及 instinct 统计 |

---

## 十七、工具与效率

| 技能 | 说明 |
|------|------|
| `aside` | 快速回答侧问题而不中断当前任务 |
| `context-budget` | 分析上下文窗口使用，找优化机会 |
| `strategic-compact` | 在逻辑间隔建议手动上下文压缩 |
| `claw` / `nanoclaw-repl` | NanoClaw REPL（模型路由、分支、压缩） |
| `simplify`* | 审查已改代码的复用性/质量/效率 |
| `configure-ecc` | ECC 交互式安装器 |
| `skill-create` | 从 git 历史提取模式生成 SKILL.md |
| `skill-health` | 技能组合健康仪表板 |
| `skill-stocktake` | 审计技能质量 |
| `skill-comply` | 可视化技能/规则是否被遵循 |
| `prompt-optimize` / `prompt-optimizer` | 分析 prompt 并输出优化版本（不执行） |
| `rules-distill` | 扫描技能提取跨领域原则 |
| `nutrient-document-processing` | 文档处理（PDF/DOCX/OCR/签名） |
| `visa-doc-translate` | 签证文件翻译 |
| `data-scraper-agent` | 构建自动数据采集代理 |

---

## 十八、架构与决策

| 技能 | 说明 |
|------|------|
| `architecture-decision-records` | 结构化 ADR 记录 |
| `backend-patterns` | Node.js/Express 后端模式 |
| `regex-vs-llm-structured-text` | 正则 vs LLM 解析决策框架 |
| `content-hash-cache-pattern` | SHA-256 内容哈希缓存模式 |
| `iterative-retrieval` | 渐进精化上下文检索 |
| `agent-harness-construction` | AI 代理 action space 设计 |
| `agent-eval` | 代理 head-to-head 比较 |
| `eval-harness` | 正式评估框架 |
| `click-path-audit` | 追踪每个 UI 按钮的完整状态变更序列 |
| `ai-first-engineering` | AI 优先工程运营模型 |
| `enterprise-agent-ops` | 长生命周期代理工作负载运维 |

---

## 十九、供应链与行业领域

| 技能 | 说明 |
|------|------|
| `carrier-relationship-management` | 承运商管理 |
| `customs-trade-compliance` | 海关贸易合规 |
| `energy-procurement` | 能源采购 |
| `inventory-demand-planning` | 库存需求规划 |
| `logistics-exception-management` | 物流异常管理 |
| `production-scheduling` | 生产排程 |
| `quality-nonconformance` | 质量不合格管理 |
| `returns-reverse-logistics` | 退货逆向物流 |

---

# 附录：技能速查表

## 使用方法

在 Claude Code 中直接调用：

```
# Superpowers 技能
使用 Skill 工具调用，名称为 superpowers:<skill-name>
例如: superpowers:brainstorming

# ECC 技能
使用 Skill 工具调用，名称为 everything-claude-code:<skill-name>
例如: everything-claude-code:plan
```

## 场景推荐

| 你想做什么 | 推荐技能 |
|-----------|---------|
| 开始一个新功能 | `superpowers:brainstorming` → `superpowers:writing-plans` |
| 执行已有计划 | `superpowers:subagent-driven-development` 或 `superpowers:executing-plans` |
| 写代码前 | `superpowers:test-driven-development` |
| 遇到 bug | `superpowers:systematic-debugging` |
| 完成前验证 | `superpowers:verification-before-completion` |
| 查库/框架文档 | `everything-claude-code:docs` |
| Spring Boot 开发 | `everything-claude-code:springboot-patterns` + `springboot-tdd` |
| 前端 React 开发 | `everything-claude-code:frontend-patterns` |
| 数据库优化 | `everything-claude-code:postgres-patterns` |
| 安全审查 | `everything-claude-code:security-review` |
| 写 REST API | `everything-claude-code:api-design` |
| 部署/CI/CD | `everything-claude-code:deployment-patterns` |
| 并行任务 | `superpowers:dispatching-parallel-agents` |
| 代码审查 | `superpowers:requesting-code-review` |
| 保存/恢复会话 | `everything-claude-code:save-session` / `resume-session` |
