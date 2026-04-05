# 消息系统阶段三（WebSocket升级）实现完成

> 完成时间: 2026-04-05
> 前置完成: 阶段二（轮询版客服系统）

## ✅ 实现完成清单

### 后端实现 (Spring Boot WebSocket)

#### 1. WebSocket 基础配置
- **文件**: `springboot/src/main/java/org/example/springboot/config/WebSocketConfig.java`
- **功能**:
  - `@EnableWebSocket` 启用 WebSocket 支持
  - 注册 `/ws/chat` WebSocket 端点
  - 配置认证拦截器 (WebSocketAuthInterceptor)
  - CORS 支持
  - 注入 ChatWebSocketHandler 和 WebSocketAuthInterceptor 的 Bean

#### 2. WebSocket 认证拦截器
- **文件**: `springboot/src/main/java/org/example/springboot/config/WebSocketAuthInterceptor.java`
- **功能**:
  - 握手时从 URL 查询参数提取 JWT token: `ws://host/ws/chat?token=XXX`
  - 调用 `JwtTokenUtils.getUserIdFromToken(token)` 验证 token
  - 从 token 提取 userId 并存储到 session 属性
  - 验证失败返回 401 Unauthorized

#### 3. WebSocket 消息处理器
- **文件**: `springboot/src/main/java/org/example/springboot/handler/ChatWebSocketHandler.java`
- **功能**:
  - `afterConnectionEstablished()`: 连接建立时注册用户到 OnlineStatusManager
  - `handleTextMessage()`: 解析 JSON 消息，按 type 路由处理
  - `handleChatMessage()`: 调用 ChatService.sendMessage()
  - `handleTypingStatus()`: 处理正在输入提示（可扩展）
  - `handlePing()`: 心跳检测，响应 pong
  - `afterConnectionClosed()`: 连接关闭时移除用户
  - `handleTransportError()`: 传输错误处理

#### 4. 在线状态管理
- **文件**: `springboot/src/main/java/org/example/springboot/service/OnlineStatusManager.java`
- **功能**:
  - 使用 `ConcurrentHashMap<Long, WebSocketSession>` 存储在线用户
  - `isOnline(userId)`: 检查用户是否在线
  - `register(userId, session)`: 用户连接时注册
  - `remove(userId)`: 用户断开时移除
  - `sendToUser(userId, message)`: 发送文本消息给指定用户
  - `sendJsonToUser(userId, messageMap)`: 发送 JSON 消息
  - `broadcastToAll(message)`: 广播消息给所有在线用户
  - `getOnlineUserIds()`: 获取所有在线用户
  - `getOnlineCount()`: 获取在线用户总数
  - 完整的日志记录（info/error）

#### 5. 后端消息推送集成
- **文件**: `springboot/src/main/java/org/example/springboot/service/ChatService.java`
- **改动**:
  - 新增 `@Autowired(required = false) OnlineStatusManager onlineStatusManager`
  - 新增 `pushMessageToRecipient(session, message, senderRole)` 方法
  - 消息保存后自动检查接收方在线状态
  - 若在线则通过 WebSocket 推送，若离线则消息已在库中
  - 自动回复消息也通过 WebSocket 推送给在线的买家

#### 6. 依赖管理
- **文件**: `springboot/pom.xml`
- **改动**: 添加 `spring-boot-starter-websocket` 依赖

### 前端实现 (Vue.js WebSocket 客户端)

#### 1. WebSocket 客户端工具
- **文件**: `newvue/src/utils/websocket.js`
- **类**: `WebSocketClient`
- **功能**:

  **连接管理**:
  - `connect(token, messageCallback, connectionCallback, disconnectionCallback)`: 建立连接
  - `close()`: 关闭连接
  - `getStatus()`: 获取连接状态

  **心跳检测**:
  - 每 30 秒发送一次 ping 消息
  - 等待 45 秒的 pong 回复
  - 未收到 pong → 自动断线重连

  **断线重连**:
  - 指数退避策略: 1s → 2s → 4s → 8s → 16s → 30s
  - 最多 6 次重连
  - 到达上限后停止重连

  **消息发送**:
  - `send(message)`: 发送任意 JSON 消息
  - `sendChatMessage(sessionId, content, contentType)`: 发送聊天消息
  - `sendTypingStatus(sessionId)`: 发送正在输入提示
  - 发送前检查连接状态

  **生命周期**:
  - 连接打开时启动心跳
  - 连接关闭时清理所有定时器
  - 支持手动关闭和自动重连

#### 2. Vuex 状态管理升级
- **文件**: `newvue/src/store/modules/chat.js`
- **新增状态**:
  - `wsConnected`: WebSocket 连接状态
  - `onlineUsers`: Set<userId> 在线用户集合
  - `typingUsers`: Map<sessionId, [userId]> 正在输入用户

- **新增 Mutations**:
  - `SET_WS_CONNECTED(connected)`: 更新连接状态
  - `ADD_ONLINE_USER/REMOVE_ONLINE_USER`: 管理在线用户
  - `SET_ONLINE_USERS`: 批量设置在线用户
  - `ADD_TYPING_USER/REMOVE_TYPING_USER`: 管理输入状态

- **新增 Actions**:
  - `connectWebSocket(token)`: 连接 WebSocket
  - `disconnectWebSocket()`: 断开 WebSocket
  - `_onWebSocketMessage(message)`: 处理 WebSocket 消息回调
  - `sendWebSocketMessage({sessionId, content, contentType})`: 通过 WebSocket 发送消息
  - `sendTypingStatus(sessionId)`: 发送正在输入提示

- **新增 Getters**:
  - `wsConnected`: WebSocket 连接状态
  - `hasTypingUsers`: 当前会话是否有输入用户
  - `typingUserIds`: 当前会话输入用户ID列表

- **修改 Mutations**:
  - `ADD_MESSAGE`: 改为在列表末尾追加（WebSocket 推送消息）
  - 保留 `PREPEND_MESSAGE` 用于 HTTP 发送的消息

#### 3. 买家端聊天窗口升级
- **文件**: `newvue/src/components/ChatWindow.vue`
- **新增功能**:
  - 在线状态指示器（绿/红点 + 文字）
  - 正在输入提示（动画点点点）
  - WebSocket 优先连接，失败自动降级到轮询
  - 节流的输入状态发送（3秒防抖）

- **改动**:
  - 新增 `connectWebSocket` action 调用
  - 新增 `sendTypingStatus` action 调用
  - 新增 typing timer 定时器
  - 消息列表改用 `scrollToBottom` 方法
  - 修改 `sendMessage` 为 `ADD_MESSAGE` 而不是 `PREPEND_MESSAGE`

#### 4. 商家后台聊天列表升级
- **文件**: `newvue/src/views/admin/ChatList.vue`
- **新增功能**:
  - 在线状态指示器（头部）
  - 会话列表中显示客户在线状态（绿色 ● 在线）
  - 正在输入提示（动画）
  - WebSocket 优先连接，失败自动降级到轮询
  - 节流的输入状态发送

- **改动**:
  - mounted() 时尝试连接 WebSocket
  - 新增 `isCustomerOnline(customerId)` 方法
  - 新增 `handleTyping()` 方法
  - 新增 `scrollToBottom()` 方法
  - 新增 typing timer 定时器管理

### WebSocket 协议设计

#### 客户端发送消息

```json
// 聊天消息
{
  "type": "message",
  "sessionId": 1,
  "content": "你好，有货吗？",
  "contentType": "TEXT"
}

// 正在输入提示
{
  "type": "typing",
  "sessionId": 1
}

// 心跳 ping
{
  "type": "ping"
}
```

#### 服务端推送消息

```json
// 消息推送
{
  "type": "message",
  "data": {
    "id": 5,
    "sessionId": 1,
    "senderId": 2,
    "senderRole": "MERCHANT",
    "content": "有的，欢迎下单！",
    "contentType": "TEXT",
    "createdAt": "2026-04-05 10:30:00"
  }
}

// 输入状态推送
{
  "type": "typing",
  "sessionId": 1,
  "userId": 2
}

// 上线/下线推送
{
  "type": "online",
  "userId": 2,
  "status": true  // true=上线, false=下线
}

// 心跳 pong
{
  "type": "pong"
}
```

## 🔄 向后兼容性

- HTTP 轮询模式完全保留
- `OnlineStatusManager` 标记为 `@Autowired(required=false)`
- ChatService 自动检测 OnlineStatusManager 可用性
- 前端自动降级：WebSocket 连接失败 → 轮询模式
- 两种模式可并存运行（HTTP 轮询 + WebSocket）

## 📊 完整的消息流程

### 买家发送消息（两种模式）

```
买家输入 & 发送
    ↓
HTTP 轮询模式:
  POST /chat/message
    ↓
  ChatService.sendMessage()
    ↓
  检查接收方离线 → 消息保存到库
    ↓
  商家轮询 GET /chat/session/{id}/messages 拉取
  
WebSocket 模式:
  WebSocket 发送 {"type": "message", ...}
    ↓
  ChatWebSocketHandler.handleTextMessage()
    ↓
  ChatService.sendMessage() + 推送
    ↓
  检查接收方在线 → onlineStatusManager.sendJsonToUser()
    ↓
  商家 WebSocket 实时收到消息
```

### 自动回复流程

```
买家消息匹配规则
    ↓
ChatService.autoReplyIfMatched()
    ↓
插入系统消息 (senderRole=SYSTEM, senderId=0)
    ↓
检查买家在线状态
├─ 在线（WebSocket）→ WebSocket 推送自动回复
└─ 离线（轮询）   → 消息保存到库，买家下次轮询拉取
```

## 🧪 测试场景

1. **WebSocket 连接建立**
   - 验证握手时 JWT token 验证成功
   - 用户注册到 OnlineStatusManager
   - 连接后发送 heartbeat 每 30s 一次

2. **实时消息推送**
   - 发送方发送消息
   - 接收方在线 → 立即推送
   - 接收方离线 → 消息存库

3. **断线重连**
   - 主动关闭连接 → WebSocket close
   - 网络中断 → 客户端超时检测 (45s) → 自动重连
   - 指数退避正常工作

4. **心跳检测**
   - 每 30s 自动发送 ping
   - 服务端响应 pong
   - 45s 未收到 pong → 断线重连

5. **降级模式**
   - WebSocket 连接失败 → 自动切换轮询
   - 轮询模式继续工作

## 📈 性能优化

- 心跳间隔: 30 秒（减少网络开销）
- 输入状态节流: 3 秒（避免频繁发送）
- 重连延迟限制: 最多 30 秒
- ConcurrentHashMap 线程安全
- 消息队列化推送（不阻塞）

## 🚀 后续可扩展性

- 支持消息加密（修改 WebSocketConfig）
- 支持消息离线队列（修改 OnlineStatusManager）
- 支持群组广播（修改 ChatWebSocketHandler）
- 支持消息签名（修改 ChatService）
- 支持限流/防抖（修改 ChatWebSocketHandler）

---

**完成 git commit**: `b4bf667`
**涉及文件**: 10 个新增/修改
**代码行数**: 约 1200+ 行

