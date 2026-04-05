# 消息系统快速启动指南

**版本：** Phase 2 + Phase 3  
**最后更新：** 2026-04-05

---

## ⚡ 5分钟快速启动

### 1️⃣ 数据库初始化

```bash
# 执行建表脚本
mysql -u root -p agricultural_mall < docs/sql/2026-04-05-chat-tables.sql

# 验证
mysql -u root -p agricultural_mall
mysql> SHOW TABLES LIKE 'chat%';
mysql> SHOW TABLES LIKE 'auto_reply%';
```

### 2️⃣ 后端启动

```bash
cd springboot

# 方式A：使用Maven编译并运行
mvn clean package -DskipTests
java -jar target/springboot-1.0.jar

# 方式B：直接使用Maven运行
mvn spring-boot:run
```

**验证后端：**
```bash
curl http://localhost:8080/chat/sessions?userId=1&userRole=CUSTOMER
```

### 3️⃣ 前端启动

```bash
cd newvue

npm install
npm run serve
```

**访问前端：** http://localhost:8081

### 4️⃣ 功能验证

- [ ] 登录系统（客户/商家两个账号）
- [ ] 发起聊天
- [ ] 发送消息
- [ ] 检查WebSocket连接状态
- [ ] 测试在线状态指示
- [ ] 测试输入提示

---

## 📁 关键文件位置

### 后端关键文件

```
springboot/
├── src/main/java/org/example/springboot/
│   ├── service/ChatService.java              ← 核心业务逻辑
│   ├── service/OnlineStatusManager.java      ← WebSocket状态管理
│   ├── handler/ChatWebSocketHandler.java     ← WebSocket处理器
│   ├── config/WebSocketConfig.java           ← WebSocket配置
│   └── controller/ChatController.java        ← REST API端点
└── pom.xml                                   ← 依赖配置
```

### 前端关键文件

```
newvue/src/
├── utils/websocket.js                       ← WebSocket客户端（心跳、重连）
├── store/modules/chat.js                    ← Vuex状态管理
├── api/chat.js                              ← HTTP API调用
├── components/ChatWindow.vue                ← 聊天窗口
└── views/admin/ChatList.vue                 ← 客服聊天列表
```

### 数据库

```
docs/sql/2026-04-05-chat-tables.sql          ← 建表脚本
```

---

## 🔌 API 速查表

### 创建会话

```bash
POST /chat/session?customerId=1&merchantId=2&productId=10
```

### 发送消息

```bash
POST /chat/message
  ?sessionId=1
  &senderId=1
  &senderRole=CUSTOMER
  &content=hello
  &contentType=TEXT
```

### 获取消息

```bash
GET /chat/session/1/messages?currentPage=1&size=20
```

### 获取会话列表

```bash
GET /chat/sessions?userId=1&userRole=CUSTOMER&currentPage=1&size=10
```

### 获取未读数

```bash
GET /chat/unread?sessionId=1&userId=1
```

### 标记已读

```bash
PUT /chat/message/read/1?userId=1
```

---

## 🔌 WebSocket 连接

```javascript
// 连接地址
ws://localhost:8080/ws/chat?token=<JWT_TOKEN>

// 发送消息
{"type": "message", "sessionId": 1, "content": "hello", "contentType": "TEXT"}

// 接收消息
{"type": "message", "data": {...}}

// 发送正在输入
{"type": "typing", "sessionId": 1}

// 接收正在输入
{"type": "typing", "sessionId": 1, "userId": 2}
```

---

## 🔍 常见问题速解

### Q: WebSocket连接失败？
- A: 查看浏览器控制台，后端会自动降级为轮询模式

### Q: 消息没有实时推送？
- A: 确认WebSocket已连接（UI会显示"实时连接"或"轮询模式"）

### Q: 自动回复没有触发？
- A: 确认规则已启用，且关键词匹配正确

### Q: 内存占用过高？
- A: 检查浏览器开发者工具中是否有WebSocket连接未关闭

### Q: 消息丢失？
- A: 所有消息持久化到数据库，刷新页面后会重新加载

---

## 📊 验证清单

- [ ] 后端启动无错误
- [ ] 前端显示正常
- [ ] 数据库表已创建
- [ ] WebSocket连接成功
- [ ] 消息实时推送
- [ ] 在线状态显示
- [ ] 输入提示显示
- [ ] 未读消息计数

---

## 📚 详细文档

| 文档 | 内容 |
|------|------|
| [CHAT_SYSTEM_README.md](CHAT_SYSTEM_README.md) | 完整项目说明 |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | 生产部署指南 |
| [docs/IMPLEMENTATION_VERIFICATION.md](docs/IMPLEMENTATION_VERIFICATION.md) | 功能验证清单 |
| [docs/testing/CHAT_SYSTEM_TESTING_GUIDE.md](docs/testing/CHAT_SYSTEM_TESTING_GUIDE.md) | 详细测试指南 |

---

## 🚀 生产部署

参考 `docs/DEPLOYMENT_GUIDE.md`：
1. 配置Nginx反向代理
2. 启用HTTPS/WSS
3. 配置缓存和监控
4. 设置备份和恢复

---

## ⚙️ 环境变量

| 变量 | 默认值 | 说明 |
|------|-------|------|
| DB_URL | localhost:3306 | 数据库地址 |
| DB_USER | root | 数据库用户 |
| DB_PASS | - | 数据库密码 |
| JWT_SECRET | - | JWT秘钥 |
| WS_PORT | 8080 | WebSocket端口 |

---

## 💡 性能优化

- ✅ 消息列表缓存：避免重复查询
- ✅ WebSocket直连：实时消息推送
- ✅ 心跳检测：30秒间隔
- ✅ 指数退避：自动重连策略
- ✅ 数据库索引：优化查询性能

---

## 🐛 日志位置

```
后端日志: springboot/logs/application.log
前端日志: 浏览器控制台 (F12)
```

---

**需要帮助？** 查看详细文档或提交Issue

