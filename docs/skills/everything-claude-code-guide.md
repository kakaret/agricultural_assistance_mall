# Everything Claude Code (ECC) 技能完整指南

> 版本: ECC v1.9.0 | 总技能数: 156 | 本文档覆盖: 8 大类 32+ 核心技能
> 更新日期: 2026-04-06

---

## 目录

- [一、技能全景图](#一技能全景图)
- [二、实战示例：客服对话功能开发全链路](#二实战示例客服对话功能开发全链路)
- [三、Spring Boot / Java 技能](#三spring-boot--java-技能)
- [四、API & 后端技能](#四api--后端技能)
- [五、前端技能](#五前端技能)
- [六、代码质量与审查技能](#六代码质量与审查技能)
- [七、架构与规划技能](#七架构与规划技能)
- [八、DevOps & 部署技能](#八devops--部署技能)
- [九、Agent & 自动化技能](#九agent--自动化技能)
- [十、工具与实用程序技能](#十工具与实用程序技能)
- [十一、ECC vs Superpowers 对比](#十一ecc-vs-superpowers-对比)
- [十二、技能联动矩阵与场景速查](#十二技能联动矩阵与场景速查)

---

## 一、技能全景图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                Everything Claude Code 技能生态 (156 skills)              │
├─────────────────────┬───────────────────────┬───────────────────────────┤
│  Spring Boot/Java   │  API & 后端            │  前端                      │
│                     │                       │                           │
│  springboot-patterns│  api-design           │  frontend-patterns        │
│  springboot-tdd     │  backend-patterns     │  e2e-testing              │
│  springboot-security│  database-migrations  │                           │
│  springboot-verif.  │  postgres-patterns    │                           │
│  java-coding-stds   │                       │                           │
│  jpa-patterns       │                       │                           │
├─────────────────────┼───────────────────────┼───────────────────────────┤
│  代码质量 & 审查     │  架构 & 规划           │  DevOps & 部署             │
│                     │                       │                           │
│  code-review        │  blueprint            │  git-workflow             │
│  security-review    │  hexagonal-arch       │  deployment-patterns      │
│  tdd-workflow       │  architecture-ADR     │  docker-patterns          │
│  verification-loop  │  plan / prp-plan      │                           │
│  santa-method       │  prp-implement        │                           │
├─────────────────────┼───────────────────────┼───────────────────────────┤
│  Agent & 自动化      │  工具 & 实用程序       │  更多领域技能               │
│                     │                       │                           │
│  claude-devfleet    │  codebase-onboarding  │  golang / rust / kotlin   │
│  autonomous-harness │  search-first         │  python / perl / swift    │
│  autonomous-loops   │  deep-research        │  flutter / dart           │
│  continuous-learning│  prompt-optimizer     │  django / laravel / nestjs│
│  agentic-engineering│  context-budget       │  healthcare / logistics   │
│                     │  save/resume-session  │  ...                      │
└─────────────────────┴───────────────────────┴───────────────────────────┘
```

---

## 二、实战示例：客服对话功能开发全链路

> 场景：为农业电商平台添加「客服在线对话」功能

### 阶段 0：项目认知 → `codebase-onboarding`

```
你: /codebase-onboarding

Claude 会做:
  1. 侦察: 检测 Spring Boot 3.4.1 + Vue 2 + MySQL 8
  2. 架构映射: Controller → Service → Mapper → MySQL
  3. 约定检测: PascalCase 类名、camelCase 方法、Result<T> 统一响应
  4. 关键文件识别: WebConfig、JwtInterceptor、request.js
  5. 输出 CLAUDE.md 或验证现有 CLAUDE.md 完整性
```

### 阶段 1：研究现有方案 → `search-first`

```
你: 我要做客服对话功能，先看看有没有现成方案

Claude 会做:
  1. 需求分析: 实时通信 + 消息持久化 + 商家端回复
  2. 搜索: WebSocket 库、Spring WebSocket 模块、消息中间件
  3. 评估矩阵:
     - Spring WebSocket (内置) → 精确匹配 → 采用
     - STOMP 协议 → 部分匹配 → 组合
     - 第三方 SaaS → 过重 → 跳过
  4. 决策: 采用 Spring WebSocket + STOMP，自建消息表
```

### 阶段 2：架构设计 → `blueprint` + `architecture-decision-records`

```
你: 帮我规划客服对话的实现架构

Claude 会做 (blueprint):
  Phase 1 Research: 分析现有 19 个 Controller 的模式
  Phase 2 Design: 拆分为独立步骤
    Step 1: 数据库表设计 (chat_messages, chat_sessions)
    Step 2: Backend WebSocket 配置
    Step 3: Message Entity + Mapper + Service
    Step 4: ChatController REST API (历史消息)
    Step 5: WebSocket Handler (实时消息)
    Step 6: 前端 ChatWindow.vue 组件
    Step 7: Vuex chat 模块
    Step 8: 路由集成
  Phase 3 Draft: 完整计划文档
  Phase 4 Review: 对抗审查
  Phase 5 Register: 保存到 plans/

Claude 会做 (ADR):
  ADR-001: 选用 Spring WebSocket + STOMP
    Context: 需要实时通信，项目已用 Spring Boot
    Decision: 采用内置 WebSocket 模块
    Alternatives: 轮询(延迟高)、第三方SaaS(过重)、RSocket(学习成本)
    Consequences: 无额外依赖，但需处理 JWT 认证与 WS 握手
```

### 阶段 3：API 接口设计 → `api-design`

```
你: 帮我设计客服聊天的 API

Claude 按 api-design 规范输出:
  GET    /api/chat/sessions                    → 获取会话列表
  GET    /api/chat/sessions/{id}/messages      → 获取历史消息（游标分页）
  POST   /api/chat/sessions                    → 创建会话
  DELETE /api/chat/sessions/{id}               → 关闭会话
  WS     /ws/chat                              → WebSocket 实时通道

  响应格式 (遵循项目 Result<T> 约定):
  {
    "code": "0",
    "msg": "成功",
    "data": {
      "records": [...],
      "cursor": "msg_2026040600123"
    }
  }

  错误码: 400(参数错误), 401(未认证), 403(非会话参与者), 404(会话不存在)
```

### 阶段 4：安全审查 → `springboot-security` + `security-review`

```
你: 检查一下客服功能的安全设计

Claude 会做 (springboot-security):
  ✅ JWT 认证: WebSocket 握手时验证 token
  ✅ 授权: 用户只能访问自己参与的会话
  ⚠️ 问题: JwtInterceptor 可能拦截 /ws/** 路径
     修复: WebSocketConfig 中排除 /ws/** 或握手阶段验证
  ✅ 输入验证: 消息内容 @NotBlank @Size(max=2000)
  ✅ XSS 防护: 消息内容 HTML 转义
  ⚠️ 问题: 图片上传需限制
     修复: 5MB 上限 + MIME 白名单 (image/jpeg, image/png)
  ✅ 速率限制: 每用户每分钟最多 30 条消息
```

### 阶段 5：TDD 开发 → `springboot-tdd` + `tdd-workflow`

```
你: 开始 TDD 开发 ChatController

Claude 按 springboot-tdd 流程:

  === RED (写测试，必须失败) ===
  @WebMvcTest(ChatController.class)
  class ChatControllerTest {
      @Test
      void getMessages_returnsPagedMessages() {
          // Arrange: mock ChatService
          // Act: mockMvc.perform(get("/chat/sessions/1/messages"))
          // Assert: status 200, 返回消息列表
      }
  }
  → 运行: mvn test → 编译失败 (ChatController 不存在) ✅

  === GREEN (最小实现) ===
  @RestController @RequestMapping("/chat")
  public class ChatController {
      @GetMapping("/sessions/{id}/messages")
      public Result<Page<ChatMessage>> getMessages(...) { ... }
  }
  → 运行: mvn test → 1/1 passed ✅

  === REFACTOR (清理) ===
  提取分页参数到 PageRequest，添加 @Validated
  → 运行: mvn test → 仍然 1/1 passed ✅

  覆盖率: JaCoCo 验证 ChatController 80%+ ✅
```

### 阶段 6：验证 → `springboot-verification` + `verification-loop`

```
你: 功能写完了，帮我验证

Claude 按 springboot-verification 6 步走:

  1. 构建验证:  mvn clean verify -DskipTests     → BUILD SUCCESS ✅
  2. 静态分析:  spotbugs/pmd/checkstyle           → 0 issues ✅
  3. 测试+覆盖: mvn test + JaCoCo                 → 42/42 passed, 85% coverage ✅
  4. 安全扫描:  依赖 CVE + 密钥检测               → 0 vulnerabilities ✅
  5. 差异审查:  git diff main...feature/chat      → 仅预期变更 ✅
  6. 前端验证:  npm run test:unit && npm run lint  → 28/28 passed ✅

  ┌──────────┬────────┐
  │ 检查项    │ 状态   │
  ├──────────┼────────┤
  │ 构建      │ ✅ PASS│
  │ 静态分析  │ ✅ PASS│
  │ 测试      │ ✅ PASS│
  │ 覆盖率    │ ✅ 85% │
  │ 安全      │ ✅ PASS│
  │ 差异审查  │ ✅ PASS│
  └──────────┴────────┘
```

### 阶段 7：对抗审查 → `santa-method`

```
你: 用 santa method 做最终审查

Claude 按 santa-method 流程:
  Phase 1 生成: 客服对话功能完整实现
  Phase 2 双审:
    Reviewer A (安全视角): WebSocket JWT 验证 ✅ / 消息 XSS 防护 ✅ / 速率限制 ✅
    Reviewer B (架构视角): 分层清晰 ✅ / 缓存策略 ✅ / 接口一致 ✅
  Phase 3 判决: A=PASS, B=PASS → 可以发布 🎉

  (如果任一 FAIL → 修复 → 重新审查 → 直到两者都 PASS)
```

### 阶段 8：部署准备 → `deployment-patterns` + `docker-patterns`

```
你: 准备部署

Claude 检查:
  deployment-patterns:
    - 健康检查端点: /actuator/health (readiness + liveness)
    - 回滚策略: 保留前一版本 JAR
    - WebSocket 连接: 部署时需优雅断开重连

  docker-patterns (如适用):
    - WebSocket 需要 Nginx upstream 配置 upgrade 头
    - docker-compose.yml 添加 chat 服务依赖
```

### 阶段 9：Git 提交与 PR → `git-workflow` + `prp-pr`

```
你: 创建 PR

Claude 按 git-workflow:
  Conventional Commits:
    feat(chat): add customer service chat with WebSocket
    feat(chat): add chat message REST API with pagination
    feat(chat): add ChatWindow.vue component
    test(chat): add ChatController and ChatService tests

  PR 创建 (prp-pr):
    Title: feat: Add customer service chat functionality
    Body: ## Summary / ## Changes / ## Test Plan / ## Security Review
```

### 全链路流程图

```
codebase-onboarding (认知项目)
       ↓
search-first (研究现有方案)
       ↓
blueprint (规划实现步骤) + architecture-decision-records (记录决策)
       ↓
api-design (设计 API 接口)
       ↓
springboot-security + security-review (安全设计审查)
       ↓
springboot-tdd + tdd-workflow (TDD 开发)
       ↓ (遇 Bug → systematic-debugging)
springboot-verification + verification-loop (6 步验证)
       ↓
santa-method (对抗式双审)
       ↓
deployment-patterns + docker-patterns (部署准备)
       ↓
git-workflow + prp-pr (提交与 PR)
```

---

## 三、Spring Boot / Java 技能

### 3.1 springboot-patterns（Spring Boot 架构模式）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:springboot-patterns` |
| **触发** | 使用 Spring MVC/WebFlux 构建 API、配置 JPA/缓存/异步 |

**核心功能：**

1. **分层架构**：Controller → Service → Repository，严格职责隔离
2. **REST API 规范**：命名、路由、异常处理器
3. **数据访问模式**：JPA/Hibernate、事务管理、N+1 防护
4. **缓存策略**：@Cacheable / @CacheEvict、TTL 配置
5. **异步处理**：@Async、@EventListener、@Scheduled

**关键配置：**
- Entity 使用 Records（不可变）+ Jakarta Validation
- @Transactional 放在 Service 层，readOnly 优化查询
- 全局异常处理器 @RestControllerAdvice

**反模式：**
- ❌ Controller 直接操作 Entity（绕过 Service）
- ❌ 混层职责（Controller 写业务逻辑）
- ❌ 未定义服务边界
- ❌ 硬编码配置（应用 application.properties）

**与本项目对应：**
- 你的 `WebConfig` 自动添加 `/api` 前缀 → 符合 REST 规范
- 你的 `Result<T>` 统一响应 → 符合异常处理模式
- 你的 Caffeine 缓存 → 对应 @Cacheable 模式

---

### 3.2 springboot-tdd（Spring Boot TDD）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:springboot-tdd` |
| **触发** | 新功能开发、Bug 修复、重构 |

**核心功能：**

1. **JUnit 5 + Mockito** 单元测试
2. **MockMvc** Web 层测试（不启动完整容器）
3. **Testcontainers** 集成测试（真实 MySQL/Redis）
4. **JaCoCo** 覆盖率验证（目标 80%+）
5. **Arrange-Act-Assert** 测试模式

**执行步骤：**

```
RED:    写测试 → 运行 → 必须失败（验证失败原因正确）
GREEN:  写最小实现 → 运行 → 测试通过
REFACTOR: 清理代码 → 运行 → 仍然通过
→ JaCoCo 验证覆盖率 80%+
```

**测试层次：**

| 层 | 工具 | 测什么 |
|----|------|--------|
| Controller | @WebMvcTest + MockMvc | HTTP 请求/响应、参数验证 |
| Service | @ExtendWith(MockitoExtension) | 业务逻辑、异常分支 |
| Repository | @DataJpaTest | SQL 查询、数据完整性 |
| 集成 | @SpringBootTest + Testcontainers | 端到端流程 |

**反模式：**
- ❌ 部分 Mock（Mockito.spy 慎用）
- ❌ 测试写完直接通过（没验证失败状态）
- ❌ 一个测试测多个行为

---

### 3.3 springboot-security（Spring Boot 安全）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:springboot-security` |
| **触发** | 添加认证授权、处理用户输入、创建 API 端点、处理密钥 |

**核心检查清单：**

| 检查项 | 做法 | 你的项目现状 |
|--------|------|-------------|
| 认证 | JWT / OAuth2 | ✅ JWT 2h 有效期 |
| 密码 | BCrypt (10+) | ✅ BCrypt strength 10 |
| 输入验证 | @Valid + Bean Validation | ✅ @NotBlank @PositiveOrZero |
| CORS | 显式白名单 | ⚠️ 检查 WebConfig |
| 密钥管理 | 环境变量，不硬编码 | ⚠️ 密码签名 JWT 需注意 |
| 速率限制 | 接口层限流 | ❌ 未实现 |

**关键模式：**
```java
// JWT 过滤器 (OncePerRequestFilter)
// 方法级授权 @PreAuthorize("@authz.canEdit(#id)")
// 全局安全配置 SecurityFilterChain
```

**反模式：**
- ❌ 硬编码 API 密钥
- ❌ 所有接口默认允许（应默认拒绝）
- ❌ 无输入验证直接入库
- ❌ Session Cookie 未设 HttpOnly + Secure

---

### 3.4 springboot-verification（Spring Boot 验证循环）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:springboot-verification` |
| **触发** | 提交 PR 前、主要变更后、预发布 |

**6 步验证流程：**

```
Step 1: mvn clean verify -DskipTests          → 构建通过？
Step 2: spotbugs / pmd / checkstyle            → 静态分析通过？
Step 3: mvn test + JaCoCo 报告                 → 测试通过？覆盖率 80%+？
Step 4: 依赖 CVE 扫描 + 密钥检测               → 安全通过？
Step 5: git diff 检查                          → 仅预期变更？
Step 6: 汇总报告                               → 全部 ✅？
```

**输出格式：**

```
┌──────────┬────────┐
│ 检查项    │ 状态   │
├──────────┼────────┤
│ 构建      │ ✅/❌  │
│ 静态分析  │ ✅/❌  │
│ 测试      │ ✅/❌  │
│ 覆盖率    │ XX%   │
│ 安全      │ ✅/❌  │
│ 差异      │ ✅/❌  │
└──────────┴────────┘
```

---

### 3.5 java-coding-standards（Java 编码标准）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:java-coding-standards` |
| **触发** | 代码审查、命名规范检查 |

**核心原则：**

| 原则 | 说明 |
|------|------|
| 清晰 > 聪慧 | 代码首先给人读 |
| 默认不可变 | final 字段、Records、Collections.unmodifiable |
| 快速失败 | 方法入口验证参数 |
| 一致命名 | 类 PascalCase、方法 camelCase、常量 UPPER_SNAKE |

**与本项目约定一致：**
- 包名: `org.example.springboot.controller` ✅
- 类名: `UserController` ✅
- 方法名: `getUserById` ✅
- 常量: `DEFAULT_PASSWORD` ✅

---

### 3.6 jpa-patterns（JPA/ORM 模式）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:jpa-patterns` |
| **触发** | Entity 设计、关系映射、查询优化 |

**核心模式：**

| 模式 | 说明 | 适用 |
|------|------|------|
| Lazy + JOIN FETCH | 默认懒加载，需要时 FETCH | 所有关联 |
| 投影接口 | 只查需要的字段 | 列表查询 |
| @Transactional(readOnly=true) | 只读优化 | GET 接口 |
| 审计监听器 | 自动 createTime/updateTime | 所有 Entity |
| HikariCP | 连接池配置 | 生产环境 |

**注意：** 你的项目用 MyBatis Plus 而非 JPA，但以下概念通用：
- N+1 防护（批量查询替代循环）
- 事务管理（Service 层标注）
- 分页模式（Page 对象）

---

## 四、API & 后端技能

### 4.1 api-design（REST API 设计）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:api-design` |
| **触发** | 设计新端点、审查 API 合约、实现分页/过滤 |

**URL 命名规范：**

```
✅ 正确                          ❌ 错误
GET  /api/products               GET  /api/getProducts
GET  /api/products/123           GET  /api/product/123 (单数)
POST /api/products               POST /api/create-product (含动词)
GET  /api/users/123/orders       GET  /api/get_user_orders (下划线)
POST /api/orders/123/cancel      POST /api/cancelOrder (驼峰)
```

**HTTP 方法语义：**

| 方法 | 用途 | 幂等 | 响应码 |
|------|------|------|--------|
| GET | 获取资源 | ✅ | 200 |
| POST | 创建资源 | ❌ | 201 |
| PUT | 全量更新 | ✅ | 200 |
| PATCH | 部分更新 | ❌ | 200 |
| DELETE | 删除资源 | ✅ | 204 |

**分页参数（游标 vs 偏移）：**

| 方式 | 参数 | 性能 | 适用 |
|------|------|------|------|
| 偏移分页 | `?page=1&size=20` | O(n) 越后越慢 | 数据量小 |
| 游标分页 | `?cursor=xxx&size=20` | O(1) 恒定 | 数据量大 |

---

### 4.2 database-migrations（数据库迁移）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:database-migrations` |
| **触发** | Schema 变更、数据迁移、新表创建 |

**5 条铁律：**

1. **每个变更都是迁移**（禁止手动改生产 DB）
2. **迁移只向前**（回滚通过新迁移实现）
3. **Schema 和数据分离**（DDL 和 DML 不混）
4. **测试大数据量**（10M 行 vs 100 行差异巨大）
5. **迁移不可变**（部署后禁止编辑）

**安全操作清单（MySQL 适用）：**

| 操作 | 安全做法 | 危险做法 |
|------|---------|---------|
| 新增列 | 可空列，无默认值 | NOT NULL 无默认值 |
| 新增索引 | 小表直接加，大表分批 | 锁表加索引 |
| 重命名列 | expand-contract 模式 | ALTER RENAME（破坏兼容） |
| 删除列 | 先停止使用 → 再删除 | 直接 DROP |
| 大表迁移 | 分批 UPDATE WHERE id BETWEEN | 一次 UPDATE 全表 |

---

## 五、前端技能

### 5.1 frontend-patterns（前端模式）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:frontend-patterns` |
| **触发** | 组件开发、状态管理、性能优化 |

**核心模式（通用，Vue 2 可借鉴）：**

| 模式 | 概念 | Vue 2 对应 |
|------|------|-----------|
| 组件组合 | 小组件组合大组件 | 插槽 (slot) |
| 状态管理 | 集中式 store | Vuex modules |
| 数据获取 | 缓存 + 加载状态 | Axios 拦截器 |
| 代码分割 | 按路由懒加载 | `() => import(...)` |
| 性能优化 | 虚拟滚动、防抖 | v-lazy 指令 |

### 5.2 e2e-testing（端到端测试）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:e2e-testing` |
| **触发** | 构建 E2E 测试套件、CI 集成 |

**Page Object Model：**

```javascript
// 封装页面操作
class ProductPage {
  selectors = { title: '.product-title', addToCart: '.btn-cart' }
  async addToCart() { await this.click(this.selectors.addToCart) }
  async getTitle() { return this.getText(this.selectors.title) }
}

// 测试用例
test('用户可以添加商品到购物车', async () => {
  const page = new ProductPage()
  await page.addToCart()
  expect(await cartPage.itemCount()).toBe(1)
})
```

**与本项目对应：** Cypress 配置在 `cypress.json`，baseUrl + viewport 已配置。

---

## 六、代码质量与审查技能

### 6.1 code-review（代码审查）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:code-review` |
| **触发** | 本地未提交变更审查，或 GitHub PR 审查（传入 PR 编号/URL） |

**两种模式：**

| 模式 | 用法 | 数据来源 |
|------|------|---------|
| 本地审查 | `/code-review` | `git diff` 未提交变更 |
| PR 审查 | `/code-review 123` 或 `/code-review <PR-URL>` | GitHub PR diff |

---

### 6.2 security-review（安全审查）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:security-review` |
| **触发** | 添加认证、处理用户输入、创建端点、处理密钥 |

**检查维度：**

| 维度 | 检查内容 |
|------|---------|
| 密钥管理 | .env 在 .gitignore？密钥用环境变量？ |
| 输入验证 | 所有用户输入 Schema 验证？ |
| 文件上传 | 大小限制？MIME 白名单？扩展名检查？ |
| SQL 注入 | 参数化查询？（MyBatis #{} 不是 ${}） |
| XSS | HTML 输出转义？ |
| 认证 | Token 验证？过期处理？ |

---

### 6.3 tdd-workflow（TDD 工作流）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:tdd-workflow` |
| **触发** | 新功能、Bug 修复、重构 |

**与 Superpowers 的 TDD 区别：**

| 对比项 | ECC tdd-workflow | Superpowers test-driven-development |
|--------|-----------------|-------------------------------------|
| 覆盖率目标 | 80%+ 硬性要求 | 无具体数字 |
| 测试类型 | 单元 + 集成 + E2E 分层 | 主要关注单元 |
| Git 检查点 | RED/GREEN/REFACTOR 分别 commit | 绿色步骤后 commit |
| 语言覆盖 | 通用 (JS/TS/Python/Go/Rust 示例) | 通用 |

---

### 6.4 verification-loop（验证循环）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:verification-loop` |
| **触发** | 功能完成、重大变更、PR 前 |

**6 阶段验证（通用版）：**

```
1. 构建:    npm build / mvn verify
2. 类型检查: tsc / pyright / javac
3. Lint:    eslint / ruff / checkstyle
4. 测试:    npm test / mvn test + 覆盖率
5. 安全:    密钥检测 + console.log 扫描
6. 差异:    git diff 检查意图外变更
```

---

### 6.5 santa-method（对抗式双审查）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:santa-method` |
| **触发** | 生产部署、合规约束、准确性关键场景 |

**流程：**

```
Phase 1: 生成器 (Agent A) 生成交付物
Phase 2: 双独立审查
         Reviewer B (视角1) ──→ PASS/FAIL
         Reviewer C (视角2) ──→ PASS/FAIL
Phase 3: 判决
         B=PASS && C=PASS → 发布 🎉
         任一 FAIL → 进入修复循环
Phase 4: 修复循环
         收集所有标记 → 修复 → 重新审查 → 直到收敛
```

**关键：** 两个 Reviewer 无共享上下文，独立评审同一 Rubric。

---

## 七、架构与规划技能

### 7.1 blueprint（构造计划生成器）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:blueprint` |
| **触发** | 大型功能（跨多 PR）、跨会话重构、多 Agent 协调 |

**5 阶段管道：**

```
Research → Design → Draft → Review → Register
  研究       设计     草案    对抗审查    注册保存
```

**输出：** `plans/` 目录下 Markdown 计划，每步包含：
- 自包含上下文（新 Agent 可冷启动）
- 依赖图 + 并行检测
- 验证命令 + 预期输出
- 回滚策略

**关键规则：** 每步 = 1 个 PR；无 "TBD"；依赖关系显式标注。

---

### 7.2 hexagonal-architecture（六边形架构）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:hexagonal-architecture` |
| **触发** | 新功能需高可维护性、解耦应用逻辑、多接口支持 |

**核心分层：**

```
┌──────────────────────────────────────┐
│            Adapters (适配器)          │
│  HTTP Controller / CLI / MQ Consumer │
├──────────────────────────────────────┤
│         Application (应用层)          │
│        Use Cases / Ports (端口)       │
├──────────────────────────────────────┤
│           Domain (领域层)             │
│      业务规则 / 实体 / 值对象          │
└──────────────────────────────────────┘

依赖方向: Adapters → Application → Domain (Domain 最独立)
```

---

### 7.3 architecture-decision-records（架构决策记录）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:architecture-decision-records` |
| **触发** | 技术选型权衡、"记录这个决定" |

**ADR 模板：**

```markdown
# ADR-001: 选用 JWT 而非 Session 认证

## Status: accepted

## Context
商城需要前后端分离认证，移动端和 Web 端共用。

## Decision
选用 JWT，签名密钥为用户密码。

## Alternatives Considered
- Session: 需要服务器端状态，水平扩展复杂
- OAuth2: 过重，当前规模不需要
- API Key: 不适合用户认证

## Consequences
- ✅ 无状态，易水平扩展
- ✅ 密码变更自动失效旧 token
- ⚠️ token 无法主动失效（2h 过期兜底）
```

**存储：** `docs/adr/` 目录，带编号。

---

## 八、DevOps & 部署技能

### 8.1 git-workflow（Git 工作流）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:git-workflow` |
| **触发** | 分支策略、提交规范、合并冲突 |

**推荐策略（GitHub Flow）：**

```
main ──────────────────────────────────────
  ↑          ↑
  │          │ (PR merge)
  │    feature/chat ──── commit ── commit
  │
  └─── feature/payment ──── commit
```

**Conventional Commits：**

```
feat(chat): add WebSocket real-time messaging
fix(auth): exclude /ws/** from JWT interceptor
test(chat): add ChatController unit tests
docs(chat): add ADR for WebSocket choice
refactor(chat): extract message validation logic
```

---

### 8.2 deployment-patterns（部署模式）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:deployment-patterns` |
| **触发** | CI/CD 设置、部署策略规划、健康检查 |

**部署策略对比：**

| 策略 | 特点 | 回滚速度 | 适用 |
|------|------|---------|------|
| Rolling | 逐步替换，无停机 | 慢（需重新部署） | 一般应用 |
| Blue-Green | 原子切换，即时回滚 | 秒级 | 关键服务 |
| Canary | 小流量先行验证 | 快（切回旧版） | 高风险变更 |

**健康检查（Spring Boot Actuator）：**

```
/actuator/health/readiness  → 就绪探针（能接收流量吗？）
/actuator/health/liveness   → 存活探针（需要重启吗？）
```

---

### 8.3 docker-patterns（Docker 模式）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:docker-patterns` |
| **触发** | 容器化、Docker Compose 编排、多容器架构 |

**典型 Compose 栈（对应本项目）：**

```yaml
services:
  backend:
    build: ./springboot
    ports: ["1234:1234"]
    depends_on:
      mysql: { condition: service_healthy }
  frontend:
    build: ./newvue
    ports: ["8081:8081"]
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: db_aps
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
```

---

## 九、Agent & 自动化技能

### 9.1 claude-devfleet（多 Agent 编排）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:devfleet` |
| **触发** | 多个并行编码任务、需要工作树隔离 |

**工作流：**

```
plan_project("客服对话功能")
  → AI 分解为 mission DAG:
     Mission 1: DB Schema (无依赖)
     Mission 2: Backend API (依赖 1)
     Mission 3: Frontend Component (依赖 1)
     Mission 4: Integration Test (依赖 2, 3)

dispatch_mission(1)  → Worker A (隔离 worktree)
dispatch_mission(2)  → Worker B (等 1 完成)
dispatch_mission(3)  → Worker C (等 1 完成)
dispatch_mission(4)  → Worker D (等 2, 3 完成)

get_report()  → 合并所有变更 + 测试报告
```

**最大并发：** 3 个 Agent（可配置）。

---

### 9.2 autonomous-agent-harness（持久自主 Agent）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:autonomous-agent-harness` |
| **触发** | 定时任务、连续运行、跨会话持久化 |

**核心组件：**

| 组件 | 功能 | 示例 |
|------|------|------|
| Cron | 定时任务 | 每天 9 点跑测试 |
| Dispatch | 远程 Agent | 分派到独立进程 |
| Memory | 持久记忆 | 跨会话保存上下文 |
| Computer Use | 屏幕自动化 | 操作浏览器/IDE |

**内存层次：**

| 层 | 存储 | 生命周期 |
|----|------|---------|
| 短期 | TodoWrite | 单会话 |
| 中期 | ~/.claude/projects/*/memory/ | 跨会话 |
| 长期 | MCP 知识图 | 永久 |

---

### 9.3 continuous-learning-v2（持续学习 v2）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:learn-eval` |
| **触发** | 会话结束时自动提取可复用模式 |

**Instinct 架构：**

```
观察 (Hook: PreToolUse/PostToolUse)
  ↓
提取 Instinct: { trigger, action, confidence: 0.3-0.9 }
  ↓
项目作用域存储 (React patterns 留在 React 项目)
  ↓
跨 2+ 项目重复 → Promotion 到全局
  ↓
Instinct 聚类 → 演化为 Skill / Command / Agent
```

---

## 十、工具与实用程序技能

### 10.1 codebase-onboarding（代码库入门）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:codebase-onboarding` |
| **触发** | 第一次打开项目、加入新团队 |

**5 阶段：**

```
1. 侦察:     包管理器 / 框架指纹 / 入口点 / 目录结构
2. 架构映射:  Tech Stack / 架构模式 / 关键目录 / 数据流
3. 约定检测:  命名规范 / 代码模式 / 错误处理风格
4. 关键文件:  核心业务文件 / 配置
5. CLAUDE.md: 生成项目级指令文件
```

---

### 10.2 search-first（研究优先）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:search-first` |
| **触发** | 添加新功能/依赖/工具前 |

**决策矩阵：**

| 搜索结果 | 决策 |
|---------|------|
| 精确匹配 + 维护良好 | **采用** |
| 部分匹配 + 好基础 | **扩展** |
| 多弱匹配 | **组合** |
| 无合适 | **构建**（但 informed） |

---

### 10.3 prompt-optimizer（Prompt 优化器）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:prompt-optimize` |
| **触发** | 用户说"优化 prompt"、"改进 prompt" |

**6 阶段：** 项目检测 → Intent 分类 → 范围评估 → 技能匹配 → 参数建议 → 输出优化 prompt

---

### 10.4 context-budget（上下文预算）

| 项目 | 内容 |
|------|------|
| **调用** | `everything-claude-code:context-budget` |
| **触发** | 会话变慢、多 skill/MCP 加载后 |

**检查内容：** 盘点 agents/skills/rules/MCP 的 token 消耗 → 分类必要性 → 发现冗余 → 优化建议

---

### 10.5 save-session / resume-session（会话保存/恢复）

| 技能 | 用法 |
|------|------|
| `/save-session` | 保存当前会话状态到 `~/.claude/session-data/` |
| `/resume-session` | 加载最近会话文件，恢复上下文继续工作 |

---

## 十一、ECC vs Superpowers 对比

| 维度 | ECC | Superpowers |
|------|-----|-------------|
| **技能数量** | 156 | 14 |
| **定位** | 全栈技能库（覆盖各语言/框架/领域） | 核心开发流程 |
| **Spring Boot** | 专属技能 (patterns/tdd/security/verification) | 通用 |
| **TDD** | 80%+ 覆盖率硬性要求 + 语言专属 | 流程规范，无具体指标 |
| **架构** | blueprint + hexagonal + ADR | brainstorming + writing-plans |
| **Agent 编排** | devfleet + autonomous-harness | subagent-driven + parallel-agents |
| **代码审查** | code-review (本地+PR) + santa-method (对抗双审) | requesting/receiving-code-review |
| **学习能力** | continuous-learning + instinct 系统 | 无 |
| **互补性** | ✅ 两者可同时使用，不冲突 | ✅ 两者可同时使用 |

**推荐组合使用：**
- **流程控制**用 Superpowers（brainstorming → plan → execute → finish）
- **技术实现**用 ECC（springboot-tdd、api-design、security-review）
- **质量保障**用 ECC（santa-method、verification-loop）
- **持续学习**用 ECC（continuous-learning-v2）
- **记忆管理**用 NeuralMemory（memory-intake/audit/evolution）

---

## 十二、技能联动矩阵与场景速查

### 场景 → 技能链

| 场景 | ECC 技能链 |
|------|-----------|
| **新 Spring Boot 功能** | `codebase-onboarding` → `search-first` → `blueprint` → `api-design` → `springboot-tdd` → `springboot-verification` → `santa-method` |
| **修 Bug** | `springboot-tdd`(RED: 复现 bug) → GREEN → `springboot-verification` |
| **安全审计** | `springboot-security` → `security-review` → `code-review` |
| **大型重构** | `blueprint` → `hexagonal-architecture` → `architecture-decision-records` → `springboot-tdd` → `santa-method` |
| **PR 前检查** | `springboot-verification` → `code-review` → `verification-loop` |
| **多任务并行** | `claude-devfleet` → `verification-loop` |
| **部署上线** | `deployment-patterns` → `docker-patterns` → `git-workflow` |
| **首次进入项目** | `codebase-onboarding` → `context-budget` |
| **优化 prompt** | `prompt-optimizer` → 匹配对应技能 |
| **会话接续** | `save-session` → (新会话) → `resume-session` |

### 技能互补关系

```
Superpowers (流程)          ECC (技术)              NeuralMemory (记忆)
brainstorming         +    search-first            memory-intake
writing-plans         +    blueprint               ↓
executing-plans       +    springboot-tdd          memory-audit
verification          +    springboot-verification  ↓
requesting-review     +    santa-method            memory-evolution
finishing-branch      +    git-workflow + prp-pr
```
