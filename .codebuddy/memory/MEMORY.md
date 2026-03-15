# 农产品销售系统 - 项目记忆文档

## 项目基本信息

### 项目名称
农产品销售系统前端 (newvue)

### 项目路径
前端: `/Users/guangxiji/Documents/UGit/agricultural_assistance_mall/newvue/`
后端: `/Users/guangxiji/Documents/UGit/agricultural_assistance_mall/springboot/`

### 技术栈
- **框架**: Vue 2.6.14 + Vue Router 3.5.1 + Vuex 3.6.2
- **UI 组件库**: Element UI 2.15.14
- **HTTP 客户端**: Axios 1.7.9
- **图表**: ECharts 5.6.0
- **开发端口**: 8081
- **后端端口**: 1234 (Spring Boot)

## 后端信息

### 后端代码位置
```
/Users/guangxiji/Documents/UGit/agricultural_assistance_mall/springboot/
```

### 后端配置
- **框架**: Spring Boot
- **端口**: 8080 (后端服务) / 1234 (可能为代理或开发端口)
- **API 路径**: `/api/*`
- **代理配置**: `vue.config.js` 中配置代理到 `http://localhost:1234`

## 前端项目结构

```
newvue/
├── public/
│   └── index.html              # SEO 优化的 HTML 模板
├── src/
│   ├── api/                    # API 服务模块
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── user.js
│   │   └── ...
│   ├── assets/
│   │   └── styles/
│   │       └── responsive.css  # 响应式设计样式
│   ├── components/
│   │   ├── common/             # 公共组件
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   ├── ProductCard.vue
│   │   │   ├── Pagination.vue
│   │   │   └── ...
│   │   ├── customer/           # 客户端组件
│   │   └── admin/              # 管理后台组件
│   ├── directives/
│   │   └── lazyLoad.js         # 图片懒加载指令
│   ├── layouts/
│   │   └── AdminLayout.vue     # 管理后台布局
│   ├── plugins/
│   │   └── loadingInterceptor.js # 加载状态拦截器
│   ├── router/
│   │   └── index.js            # 路由配置（代码分割）
│   ├── store/
│   │   ├── index.js
│   │   └── modules/
│   │       ├── user.js         # 用户状态
│   │       ├── cart.js         # 购物车状态
│   │       ├── product.js      # 产品状态
│   │       └── loading.js      # 全局加载状态
│   ├── utils/
│   │   ├── request.js          # Axios 请求封装
│   │   ├── auth.js             # 认证工具
│   │   └── validators.js       # 表单验证
│   ├── views/
│   │   ├── customer/           # 客户端页面
│   │   │   ├── Home.vue
│   │   │   ├── Products.vue
│   │   │   ├── ProductDetail.vue
│   │   │   ├── Cart.vue
│   │   │   ├── Order.vue
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── ...
│   │   ├── admin/              # 管理后台页面
│   │   │   ├── Dashboard.vue
│   │   │   ├── ProductManagement.vue
│   │   │   ├── OrderManagement.vue
│   │   │   ├── UserManagement.vue
│   │   │   └── ...
│   │   └── NotFound.vue
│   ├── App.vue
│   └── main.js
├── tests/
│   ├── unit/                   # 单元测试
│   │   └── validators.spec.js
│   └── property/               # 属性测试
│       ├── cart.properties.spec.js
│       ├── product.properties.spec.js
│       ├── user.properties.spec.js
│       ├── auth.properties.spec.js
│       ├── ui.properties.spec.js
│       └── favorite.properties.spec.js
├── cypress/
│   └── integration/            # E2E 集成测试
│       ├── auth.cy.js
│       ├── checkout.cy.js
│       └── product-management.cy.js
├── vue.config.js               # Vue CLI 配置
├── jest.config.js              # Jest 测试配置
├── cypress.json                # Cypress 配置
└── package.json
```

## 核心功能模块

### 1. 用户认证
- 登录/注册/登出
- 基于角色的访问控制 (RBAC)
- 角色: SUPER_ADMIN, ADMIN, MERCHANT, USER
- Token 存储与自动续期

### 2. 产品管理
- 产品浏览与搜索
- 分类导航
- 产品详情
- 收藏功能

### 3. 购物车
- 添加/删除商品
- 数量调整
- 价格计算（支持折扣）
- 乐观更新与回滚

### 4. 订单系统
- 下单流程
- 订单状态管理
- 物流跟踪
- 订单历史

### 5. 管理后台
- 数据统计仪表盘
- 产品管理 (CRUD)
- 分类管理
- 订单管理
- 用户管理
- 库存管理
- 轮播图管理
- 公告管理
- 文章管理

## 性能优化

### 1. 代码分割
- 路由级懒加载
- 第三方库分离 (vendor chunk)
- Element UI 和 ECharts 单独打包

### 2. 加载优化
- 全局加载状态管理
- 请求防抖处理
- 自动加载动画

### 3. 其他优化
- 图片懒加载
- 响应式设计
- 资源预加载

## 测试覆盖

### 单元测试
- 表单验证器测试

### 属性测试 (fast-check)
- Property 1: Category navigation displays correct products
- Property 2: Search results match query
- Property 3: Product display completeness
- Property 4: Product navigation consistency
- Property 5: Cart count accuracy
- Property 6: Cart total calculation
- Property 7: Cart item removal
- Property 8: Cart state preservation on error
- Property 9: Favorite toggle consistency
- Property 10: Favorites list accuracy
- Property 12: Registration form validation
- Property 13: Authentication token storage
- Property 15: Logout data cleanup
- Property 16: API request authentication
- Property 20: UI interaction feedback
- Property 21: Image lazy loading
- Property 22: Route guard protection

### 集成测试 (Cypress)
- 认证流程测试
- 产品管理测试
- 结账流程测试

## 开发命令

```bash
# 进入项目目录
cd newvue

# 安装依赖
npm install

# 启动开发服务器 (端口 8081)
npm run serve

# 生产构建
npm run build

# 运行单元测试
npm run test:unit

# 运行属性测试
npm run test:property

# 运行 E2E 测试
npm run test:e2e

# 代码检查
npm run lint
```

## 测试账号

- **管理员**: Sadmin / 123456
- **普通用户**: user / 123456

## 配置文件说明

### vue.config.js
```javascript
module.exports = {
    devServer: {
        port: 8081,                    // 前端开发端口
        proxy: {
            '/api': {
                target: 'http://localhost:1234',  // 后端服务端口
                changeOrigin: true
            }
        }
    }
}
```

### 关键文件变更历史

#### 性能优化相关
- `src/store/modules/loading.js` - 新建：全局加载状态管理
- `src/plugins/loadingInterceptor.js` - 新建：请求加载拦截器
- `src/utils/request.js` - 修改：添加自动加载动画
- `vue.config.js` - 修改：webpack 优化配置

#### SEO 优化相关
- `public/index.html` - 修改：添加 SEO meta 标签和加载动画

#### 测试相关
- `tests/property/*.properties.spec.js` - 新建：6 个属性测试文件
- `tests/unit/validators.spec.js` - 新建：单元测试
- `cypress/integration/*.cy.js` - 新建：3 个集成测试文件
- `src/utils/validators.js` - 修改：添加同步验证函数

## 注意事项

1. **后端端口**: 确保后端服务运行在 `localhost:1234`
2. **开发端口**: 前端开发服务器运行在 `localhost:8081`
3. **构建输出**: 生产构建输出在 `dist/` 目录
4. **测试要求**: 运行 Cypress 测试需要提前启动前后端服务

## 后续建议

1. 配置 CI/CD 流水线（GitHub Actions/GitLab CI）
2. 添加 Sentry 错误监控
3. 配置 CDN 加速静态资源
4. 添加性能监控（Lighthouse CI）
5. 完善 API 文档

---

**文档创建时间**: 2026-03-15
**最后更新**: 2026-03-15
