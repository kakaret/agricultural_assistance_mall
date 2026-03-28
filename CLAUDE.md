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
- Spring Boot MVC: Controller → Service → Mapper (MyBatis Plus) → MySQL
- 所有 controller 通过 `WebConfig` 自动添加 `/api` 前缀
- 统一响应封装: `Result<T>` — `code` ("0"=成功, "-1"=错误), `msg`, `data`
- JWT 认证: `JwtInterceptor` 拦截所有 `/api/**` 请求
- 公开接口(无需认证): `/api/user/login`, `/api/user/add`, `/api/email/**`, `/api/file/**`
- 密码: BCrypt (strength 10), Spring Security
- 缓存: Caffeine (500条, 10分钟TTL) — Service 层用 `@Cacheable`/`@CacheEvict`
- 分页: MyBatis Plus `Page<T>` 自动 count 查询
- Entity 使用 Lombok + Jakarta Validation (`@NotBlank`, `@PositiveOrZero`)

**Frontend:** `newvue/src/`
- Vue 2 + Vuex (modules: user, cart, product, loading) + Vue Router + Element UI
- API 层在 `src/api/` — 每个模块(user, product, order等)独立文件
- HTTP 客户端: `src/utils/request.js` — Axios 实例, 自动注入 JWT header, 401 自动跳转登录
- 路由懒加载: `() => import('@/views/...')`
- Admin 路由嵌套在 `/admin/*`，使用 `AdminLayout.vue`
- 路由守卫: 认证 + 角色(admin/customer)权限控制
- 响应式断点: mobile (<768px), tablet (768-1024px), desktop (>1024px)

### 关键约定
- 所有 UI 文本为中文
- Vuex store modules 在 `src/store/modules/` — actions 调用 API 层, mutations 更新状态
- 代码分割: Element UI 和 ECharts 独立 vendor chunk
- 图片懒加载: 自定义 `v-lazy` 指令 (`src/directives/lazyLoad.js`)

### Database
- MySQL (db: `db_aps`), 连接配置在 `springboot/src/main/resources/application.properties`
- 约12张表: users, products, orders, cart, favorites, categories, articles, notices, carousel, stock, reviews, logistics
- Schema SQL 在 `docs/` 目录
