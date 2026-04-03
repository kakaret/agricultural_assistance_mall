# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 沟通规则

1. **不假设我清楚自己想要什么。** 动机或目标不清晰时，停下来问，不瞎讨论。
2. **目标清晰但路径不是最短的，直接告诉我并建议更好的办法。**
3. **遇到问题追根因，不打补丁。** 每个决策都要能回答"为什么"。
4. **输出说重点，砍掉一切不改变决策的信息。**
5. **用中文回复。**

## Build & Run Commands

### Backend (Spring Boot 3.4.1 / Java 17)
```bash
cd springboot
mvn clean install            # Build
mvn spring-boot:run          # Run on port 1234
mvn test                     # Run all tests
```

### Frontend (Vue 2 — in newvue/)
```bash
cd newvue
npm install                  # Install dependencies
npm run serve                # Dev server on port 8081
npm run build                # Production build → dist/
npm run lint                 # ESLint
npm run test:unit            # Jest unit tests
npm run test:property        # Jest property-based tests (fast-check)
npm run test:e2e             # Cypress E2E tests
```

Run a single Jest test file:
```bash
cd newvue && npx jest tests/unit/validators.spec.js
```

**Note:** `vue/` 是旧模板，所有前端开发在 `newvue/` 目录下进行。

## Architecture

### 农业电商全栈平台

**Backend:** `springboot/src/main/java/org/example/springboot/`
```
Controller (/api/*) → Service → Mapper (MyBatis Plus) → MySQL
```

- Spring Boot 3.4.1 + Java 17
- 所有 controller 通过 `WebConfig` 自动添加 `/api` 前缀
- 统一响应封装: `Result<T>` — `code` ("0"=成功, "-1"=错误), `msg`, `data`
- **JWT 认证**: `JwtInterceptor` 拦截所有 `/api/**` 请求
  - Token 有效期: 2 小时
  - 签名密钥: 用户密码 (密码变更后旧 token 自动失效)
  - 验证失败返回 401
- **公开接口**(无需认证):
  - `/api/user/login`, `/api/user/add`, `/api/user/forget`, `/api/user/{id}`
  - `/api/product/**`, `/api/category/**`, `/api/article/**`
  - `/api/email/**`, `/api/file/**`
- **密码**: BCrypt (strength 10), Spring Security `PasswordEncoder`
- **缓存**: Caffeine (500条, 10分钟TTL)
  - Service 层使用 `@Cacheable(value="products")` 读取时缓存
  - 使用 `@CacheEvict(value="products", allEntries=true)` 修改时清除
  - 自定义分页键: `PageKeyGenerator`
- **分页**: MyBatis Plus `Page<T>` 自动生成 count 查询
- **Entity**: 使用 Lombok + Jakarta Validation (`@NotBlank`, `@PositiveOrZero`)
- **19 个 Controller**: User, Product, Order, Cart, Category, Favorite, Review, Address, Article, Notice, Carousel, Stock, Statistics, AfterSales, Logistics, File, Email, Menu, Recommend
- **19 个 Entity**: 对应 controller 的业务模型

**Frontend:** `newvue/src/`
- Vue 2.6.14 + Vuex 3.6.2 + Vue Router 3.5.1 + Element UI 2.15.14 + Axios 1.7.9
- **API 层**: `src/api/` — 14 个模块文件，每个独立（user, product, order, cart等）
  - 封装函数签名: `export const functionName = (params) => request.get/post(...)`
- **HTTP 客户端**: `src/utils/request.js`
  - Axios 实例，baseURL `/api`，超时 15s
  - 请求拦截: 自动注入 JWT Authorization header (`Bearer {token}`)，管理全局加载动画
  - 响应拦截: 401 自动登出 + 跳转登录，其他错误显示 Message 通知
  - 开发环境: 记录 API 性能指标
- **Vuex 状态管理**: `src/store/modules/`
  - `user.js`: token, userInfo, isLoggedIn, role (getter 提供 isAdmin, isMerchant)，localStorage 持久化
  - `cart.js`: 购物车数据
  - `product.js`: 商品列表缓存
  - `loading.js`: 全局加载状态
- **路由**: `src/router/index.js`
  - 29 条路由，分为: 客户端路由 + 认证路由 + 嵌套 Admin 路由
  - **路由守卫** (`beforeEach`):
    - `requiresAuth: true` → 未登录重定向 /login
    - `requiresAdmin: true` → 仅 admin/merchant 可访问
    - Merchant 权限限制: 可访问 dashboard/products/categories/orders/stock/after-sales，不能访问 users/articles/carousels/notices/arbitration
    - Admin/merchant 用户访问客户端页面自动跳转 /admin/dashboard
  - 页面标题自动设置 (meta.title)
- **组件**: Element UI button, form, table, dialog, pagination 等，按 kebab-case 命名
- **自定义指令**: `src/directives/`
  - `v-lazy`: 图片懒加载 (Intersection Observer API)
- **工具函数**: `src/utils/`
  - request, auth, validators, navigation, image, order, afterSales, date, performance (9 个)
- **响应式设计**:
  - 手机: 0-767px
  - 平板: 768-1023px
  - 桌面: 1024px+

**Build 配置** (`newvue/vue.config.js`):
- 代码分割: Element UI、ECharts 独立 vendor chunk
- 图片优化: 4KB 以下转 base64
- 生产环境: 禁用 source map，CSS 分离
- /api 代理到 http://192.168.31.99:1234

**测试配置**:
- Jest: `jest.config.js` 配置 testMatch patterns (`tests/unit/**`, `tests/property/**`)
  - 使用 fast-check 进行属性基测试
  - moduleNameMapper 配置 @/ → src/
- Cypress: `cypress.json` 配置 baseUrl, viewport (1280x720), 超时 10s/30s

### Database
- MySQL 8 (db: `db_aps`, host: 192.168.31.99:3306, user: root/root)
- 约 18 张表: users, products, orders, order_items, cart, categories, favorites, reviews, addresses, articles, notices, carousel_items, logistics, after_sales, stock_in, stock_out, menu, company
- InnoDB 引擎，UTF8MB4 字符集
- Schema SQL 在 `sql/db_aps.sql` (887 行) 和 `sql/agriculture_features.sql` (38 行)

### 关键约定

**Java 命名规范**:
- 包名: 小写点分隔 (org.example.springboot.controller)
- 类名: PascalCase (UserController, UserService, UserMapper, User)
- 方法名: camelCase (getUserById, addUser)
- 常数: UPPER_SNAKE_CASE (DEFAULT_PASSWORD)

**Vue/JavaScript 命名规范**:
- 文件名: kebab-case (user-profile.vue) 或 PascalCase (UserProfile.vue)
- 变量名: camelCase (userName, isLoading)
- 常数: UPPER_SNAKE_CASE (API_TIMEOUT, MAX_ITEMS)
- CSS 类: kebab-case (.user-card, .btn-primary)
- Vuex action/mutation: UPPER_SNAKE_CASE (SET_USER_INFO, FETCH_PRODUCTS)

**UI 文本**: 全部中文 (document.title, form labels, error messages, notifications)

**代码分割**:
- Element UI 和 ECharts 独立 vendor chunk (性能优化)
- 路由懒加载: `() => import('@/views/...')`
- 自定义分页键: Service 层用 `PageKeyGenerator` 确保分页缓存准确

**图片处理**:
- 4KB 以下: url-loader 转 base64
- 4KB 以上: 文件引用
- 图片懒加载: 使用 v-lazy 指令

### 推荐工作流 (Superpowers)

当使用 Claude Code Superpowers 时，推荐顺序:
1. `/superpowers:brainstorming` — 明确需求、讨论方案
2. `/superpowers:writing-plans` — 创建实现计划
3. `/superpowers:test-driven-development` — TDD 开发
4. `/superpowers:verification-before-completion` — 验证完成
5. `/superpowers:requesting-code-review` — 请求审查

## 快速参考

### 新增 API 端点
1. Backend:
   - 在 `controller/` 新建或编辑控制器，使用 `@RestController @RequestMapping("/xxx")`
   - 调用 Service，返回 `Result.success(data)` 或 `Result.error(msg)`
   - Service 使用 `@Cacheable/@CacheEvict` 管理缓存
2. Frontend:
   - 在 `api/` 新建模块或编辑现有模块，导出 API 函数
   - 在 Vuex action 中调用，或在组件中直接调用
   - 在 request 拦截器中自动注入 token

### 新增路由
- 编辑 `newvue/src/router/index.js`
- 定义路由对象: `{ path: '/...', name: 'ComponentName', component: () => import('@/views/...'), meta: { title: '页面标题', requiresAuth: true/false, requiresAdmin: true/false } }`
- 若需认证，添加 `requiresAuth: true`
- 若仅限 admin/merchant，添加 `requiresAdmin: true`

### 新增 Vuex 模块
- 在 `src/store/modules/` 新建文件 (e.g. `newModule.js`)
- 定义 state, mutations, actions, getters
- 在 `src/store/index.js` 导入: `newModule: require('./modules/newModule').default`
- 在组件中使用: `this.$store.dispatch('newModule/actionName')`

### 缓存策略
- 只缓存 GET 接口 (读操作)
- Service 方法使用 `@Cacheable(value="products", key="'list'")` 或自定义键
- 修改操作使用 `@CacheEvict(value="products", allEntries=true)`
- 分页用 `PageKeyGenerator` 自动生成键
- TTL 10 分钟固定，可在 `application.properties` 调整

### 常见错误
- **401 Unauthorized**: token 已过期或无效，检查 JWT token 是否被修改或已过期
- **Duplicate Navigation Error**: 路由守卫中已处理，不需要手动处理
- **CORS**: 代理配置在 `vue.config.js`，确保 backend 在 192.168.31.99:1234
- **缓存问题**: 确保 Service 层的 `@CacheEvict` 正确清除，使用 `allEntries=true` 清除整个缓存组

### 响应类型示例
```json
{
  "code": "0",
  "msg": "成功",
  "data": {
    "id": 1,
    "name": "商品名"
  }
}
```

```json
{
  "code": "-1",
  "msg": "用户不存在",
  "data": null
}
```
