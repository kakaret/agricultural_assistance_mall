# 农业电商全栈项目 - 代码库深度分析

**生成时间：** 2026-04-04  
**项目位置：** `/Users/guangxiji/Documents/UGit/agricultural_assistance_mall/`  
**分析范围：** Spring Boot 后端 + Vue 2 前端 + 数据库

---

## 目录

1. [项目结构概览](#项目结构概览)
2. [后端（Spring Boot 3.4.1 / Java 17）](#后端spring-boot-341--java-17)
3. [前端（Vue 2 / newvue）](#前端vue-2--newvue)
4. [数据库设计](#数据库设计)
5. [命名约定与编码规范](#命名约定与编码规范)
6. [沟通规则与工作流](#沟通规则与工作流)
7. [关键配置与集成点](#关键配置与集成点)

---

## 项目结构概览

```
agricultural_assistance_mall/
├── springboot/                    # 后端（Spring Boot）
│   ├── pom.xml                   # Maven 依赖配置
│   ├── src/main/java/org/example/springboot/
│   │   ├── SpringbootApplication.java
│   │   ├── common/              # 通用类
│   │   │   └── Result.java       # 统一响应包装类
│   │   ├── config/              # 配置类（8 个）
│   │   ├── controller/          # 控制器（19 个）
│   │   ├── entity/              # JPA 实体（19 个）
│   │   ├── mapper/              # MyBatis Plus 接口（16 个）
│   │   ├── service/             # 业务服务（17 个）
│   │   ├── util/                # 工具类（8 个）
│   │   ├── enumClass/           # 枚举
│   │   └── controller/
│   │       ├── email/           # 邮件相关
│   │       └── Dict/            # 字典相关
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/java/           # 单元测试
│   └── target/                  # 构建输出
│
├── newvue/                       # 前端（Vue 2）
│   ├── package.json             # npm 依赖
│   ├── vue.config.js            # Vue CLI 构建配置
│   ├── jest.config.js           # Jest 单元测试配置
│   ├── cypress.json             # Cypress E2E 配置
│   ├── public/                  # 静态资源
│   ├── src/
│   │   ├── main.js              # 入口文件
│   │   ├── App.vue              # 根组件
│   │   ├── api/                 # API 层（14 个模块）
│   │   ├── router/              # Vue Router 路由配置
│   │   ├── store/               # Vuex 状态管理
│   │   │   ├── index.js
│   │   │   └── modules/         # 4 个模块：user, cart, product, loading
│   │   ├── components/          # 可复用组件
│   │   ├── views/               # 页面视图
│   │   ├── layouts/             # 布局组件
│   │   ├── directives/          # 自定义指令
│   │   ├── utils/               # 工具函数（9 个）
│   │   ├── plugins/             # Vue 插件
│   │   └── assets/              # 样式与图片
│   ├── tests/
│   │   ├── unit/                # Jest 单元测试
│   │   └── property/            # 基于属性的测试（fast-check）
│   ├── cypress/                 # Cypress E2E 测试
│   └── dist/                    # 生产构建输出
│
├── docs/                         # 文档
├── sql/                          # 数据库脚本
├── CLAUDE.md                     # Claude Code 指引（已有）
├── README.md                     # 项目简介
├── .claude/settings.json         # Claude Code 配置
└── .git/                         # Git 仓库
```

---

## 后端（Spring Boot 3.4.1 / Java 17）

### 依赖堆栈
- **Spring Boot 3.4.1**
- **Java 17**
- **MyBatis Plus 3.5.7** (ORM)
- **Caffeine 2.9.3** (缓存)
- **JWT 4.4.0** (认证)
- **MySQL Connector 8** (数据库)
- **Hutool 5.8.25** (工具库)
- **Lombok** (代码生成)

### 配置文件关键值
```properties
server.port=1234
spring.datasource.url=jdbc:mysql://192.168.31.99:3306/db_aps
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=500,expireAfterWrite=10m
spring.servlet.multipart.max-file-size=10MB
```

### 架构层级
```
Controller (/api/*) → Service → Mapper (MyBatis Plus) → MySQL
```

### 配置类（8 个）

| 文件 | 用途 |
|------|------|
| WebConfig | REST 路径前缀配置 + 拦截器注册 |
| JwtInterceptor | JWT token 验证 |
| SecurityConfig | Spring Security 配置 |
| MybatisPlusConfig | 分页插件配置 |
| CacheConfig | Caffeine 缓存策略 |
| JacksonConfig | JSON 序列化 |
| SchedulerConfig | 定时任务 |

### 控制器（19 个）
User, Product, Order, Cart, Category, Favorite, Review, Address, Article, Notice, Carousel, Stock, Statistics, AfterSales, Logistics, File, Email, Menu, Recommend

### 实体（19 个）
User, Product, Order, OrderItem, Cart, Category, Favorite, Review, Address, Article, Notice, CarouselItem, Logistics, AfterSales, StockIn, StockOut, Menu, Company

### Service 层
- 业务逻辑处理
- 使用 @Cacheable/@CacheEvict 管理缓存
- 调用 Mapper 进行数据库操作

### 统一响应格式
```json
{
  "code": "0",
  "msg": "成功",
  "data": {...}
}
```

### JWT 认证
- 2 小时有效期
- 使用用户密码作为签名密钥
- 密码改变后旧 token 自动失效

### 分页实现
- MyBatis Plus Page<T>
- 自动生成 count 查询
- 返回 records, total, pages 等

---

## 前端（Vue 2 / newvue）

### 技术栈
- Vue 2.6.14
- Vue Router 3.5.1
- Vuex 3.6.2
- Element UI 2.15.14
- Axios 1.7.9
- ECharts 5.6.0

### 开发服务器
```javascript
port: 8081
proxy: {'/api' -> 'http://192.168.31.99:1234'}
```

### API 层（14 个模块）
user, product, order, cart, category, favorite, address, article, notice, carousel, review, afterSales, statistics, stock

### 路由配置
- 29 条路由
- 路由守卫：认证 + 角色权限控制
- 支持 admin/merchant/customer 三种角色

### Vuex 状态管理（4 个模块）
- user：认证状态 + token
- cart：购物车数据
- product：商品列表缓存
- loading：全局加载状态

### HTTP 客户端（request.js）
- 自动注入 token 到 Authorization header
- 全局加载动画管理
- 401 自动登出并跳转登录
- API 性能监控

### 自定义指令
- v-lazy：图片懒加载

### 工具函数（9 个）
request, auth, validators, navigation, image, order, afterSales, date, performance

### 响应式设计
```
手机: 0-767px
平板: 768-1023px
桌面: 1024px+
```

### 测试配置
- Jest：单元测试 + 基于属性的测试（fast-check）
- Cypress：E2E 测试

---

## 数据库设计

### 连接信息
```
Host: 192.168.31.99:3306
DB: db_aps
User: root
Password: root
```

### 表结构（~12 张表）
user, product, category, order, order_item, cart, favorite, review, address, article, notice, carousel_item, logistics, stock_in, stock_out, after_sales, menu, company

### SQL 脚本
- db_aps.sql (887 行) - 主 schema
- agriculture_features.sql (38 行) - 功能表

---

## 命名约定

### Java
- 包名：小写点分隔 (org.example.springboot.controller)
- 类名：PascalCase (UserController)
- 方法名：camelCase (getUserById)
- 常数：UPPER_SNAKE_CASE (DEFAULT_PASSWORD)

### Vue/JavaScript
- 文件名：kebab-case 或 PascalCase
- 变量名：camelCase
- 常数：UPPER_SNAKE_CASE
- CSS 类：kebab-case

---

## 沟通规则

### 既有规则（CLAUDE.md）
1. 不假设清楚，动机不清时停下来问
2. 指出更短的路径
3. 追根因，不打补丁
4. 说重点
5. 用中文回复

### 推荐工作流
1. brainstorming：明确需求
2. writing-plans：创建实现计划
3. test-driven-development：TDD 开发
4. verification-before-completion：验证完成
5. requesting-code-review：请求审查

---

## 快速参考

### 常用命令
```bash
# 后端
cd springboot && mvn spring-boot:run  # 端口 1234

# 前端
cd newvue && npm run serve            # 端口 8081
npm run test:unit                     # 单元测试
npm run test:e2e                      # E2E 测试
```

### 公开接口（无需认证）
- /api/user/{login,add,forget,{id}}
- /api/product/**, /api/category/**, /api/article/**
- /api/email/**, /api/file/**

### 缓存策略
- Caffeine：500 条，10 分钟 TTL
- PageKeyGenerator：自定义分页键
- @Cacheable：读取时使用缓存
- @CacheEvict：修改时清除缓存

### 响应类型
- 成功：{code: "0", msg: "成功", data: {...}}
- 错误：{code: "-1", msg: "错误信息"}

