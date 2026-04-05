# 农业助农商城 - 消息系统完整实现

**项目版本：** Phase 2 + Phase 3  
**更新日期：** 2026-04-05  
**状态：** ✅ 生产就绪

---

## 项目概述

本项目实现了农业助农商城的完整消息系统，分为两个阶段：

- **Phase 2**: 轮询版客服系统 - 基于HTTP的定时轮询消息系统
- **Phase 3**: WebSocket实时升级 - 添加WebSocket支持实时消息推送，自动降级为轮询

系统支持：
- ✅ 买家与商家的一对一聊天
- ✅ 自动回复规则匹配
- ✅ 实时在线状态显示
- ✅ 实时输入状态提示
- ✅ 完整的未读消息管理
- ✅ 自动断线重连
- ✅ 优雅降级（WebSocket失败→轮询）
- ✅ 缓存优化

---

## 快速开始

### 前置条件

```bash
# 检查环境
java -version        # JDK 11+
node -v              # Node.js 14+
mysql --version      # MySQL 5.7+
```

### 1. 数据库部署

```bash
# 创建数据库
mysql -u root -p < docs/sql/2026-04-05-chat-tables.sql
```

### 2. 后端启动

```bash
cd springboot

# 编译并打包
mvn clean package -DskipTests

# 运行
java -jar target/springboot-1.0.jar

# 或直接使用Maven运行
mvn spring-boot:run
```

后端启动成功后：
```
Tomcat started on port(s): 8080 (http)
```

### 3. 前端启动

```bash
cd newvue

# 安装依赖
npm install

# 启动开发服务器
npm run serve
```

前端启动成功后：
```
App running at: http://localhost:8081/
```

### 4. 验证

访问 `http://localhost:8081` 并测试消息功能：
- 以客户身份登录
- 以商家身份登录
- 发送消息
- 验证实时推送

---

## 项目结构

### 后端结构

```
springboot/
├── src/main/java/org/example/springboot/
│   ├── entity/
│   │   ├── ChatSession.java         - 聊天会话实体
│   │   ├── ChatMessage.java         - 聊天消息实体
│   │   └── AutoReplyRule.java       - 自动回复规则实体
│   ├── mapper/
│   │   ├── ChatSessionMapper.java   - 会话数据访问
│   │   ├── ChatMessageMapper.java   - 消息数据访问
│   │   └── AutoReplyRuleMapper.java - 规则数据访问
│   ├── service/
│   │   ├── ChatService.java         - 消息服务（核心业务逻辑）
│   │   ├── AutoReplyRuleService.java - 自动回复规则服务
│   │   └── OnlineStatusManager.java - 在线状态管理（WebSocket）
│   ├── controller/
│   │   └── ChatController.java      - API控制器
│   ├── handler/
│   │   └── ChatWebSocketHandler.java - WebSocket消息处理器
│   ├── config/
│   │   ├── WebSocketConfig.java     - WebSocket配置
│   │   └── WebSocketAuthInterceptor.java - WebSocket认证拦截器
│   └── common/
│       └── Result.java              - 统一返回格式
└── pom.xml                          - Maven配置（已添加WebSocket依赖）
```

### 前端结构

```
newvue/src/
├── api/
│   └── chat.js                      - HTTP API调用模块
├── utils/
│   └── websocket.js                 - WebSocket客户端（包括心跳、重连）
├── store/modules/
│   └── chat.js                      - Vuex聊天模块状态管理
├── components/
│   └── ChatWindow.vue               - 浏览器内聊天窗口组件
└── views/admin/
    └── ChatList.vue                 - 客服后台聊天列表和窗口
```

### 数据库表

```sql
chat_session         - 聊天会话表
  - id (主键)
  - customer_id (买家ID)
  - merchant_id (商家ID)
  - product_id (商品ID，可选)
  - status (状态)
  - last_message_time (最后消息时间)
  - created_at, updated_at

chat_message         - 聊天消息表
  - id (主键)
  - session_id (会话ID)
  - sender_id (发送者ID)
  - sender_role (发送者角色: CUSTOMER/MERCHANT/SYSTEM)
  - content (消息内容)
  - content_type (消息类型: TEXT/IMAGE)
  - is_read (是否已读)
  - created_at

auto_reply_rule      - 自动回复规则表
  - id (主键)
  - merchant_id (商家ID)
  - keyword (触发关键词)
  - reply_content (回复内容)
  - priority (优先级)
  - status (启用/禁用)
  - created_at, updated_at
```

---

## API 文档

### Phase 2 - HTTP REST API

#### 会话管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/chat/session` | 创建或获取会话 |
| GET | `/chat/sessions` | 获取用户的会话列表 |

**创建会话示例：**
```bash
POST /chat/session
?customerId=1&merchantId=2&productId=10

响应:
{
  "code": "0",
  "data": {
    "id": 1,
    "customerId": 1,
    "merchantId": 2,
    "status": 1,
    "customer": {...},
    "merchant": {...},
    "product": {...}
  }
}
```

#### 消息管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/chat/message` | 发送消息 |
| GET | `/chat/session/{id}/messages` | 获取消息历史 |
| GET | `/chat/unread` | 获取未读消息数 |
| PUT | `/chat/message/read/{sessionId}` | 标记已读 |

**发送消息示例：**
```bash
POST /chat/message
?sessionId=1&senderId=1&senderRole=CUSTOMER&content=你好&contentType=TEXT

响应:
{
  "code": "0",
  "data": {
    "id": 1,
    "sessionId": 1,
    "senderId": 1,
    "senderRole": "CUSTOMER",
    "content": "你好",
    "isRead": 0,
    "sender": {...}
  }
}
```

### Phase 3 - WebSocket 协议

连接URL：
```
ws://localhost:8080/ws/chat?token=<JWT_TOKEN>
```

消息格式：

**1. 心跳检测**
```json
// 客户端发送 (30秒一次)
{"type": "ping"}

// 服务器回复
{"type": "pong"}
```

**2. 聊天消息**
```json
// 客户端发送
{
  "type": "message",
  "sessionId": 1,
  "content": "你好",
  "contentType": "TEXT"
}

// 服务器推送
{
  "type": "message",
  "data": {
    "id": 1,
    "sessionId": 1,
    "senderId": 2,
    "senderRole": "MERCHANT",
    "content": "你好，有什么可以帮助的？",
    "contentType": "TEXT",
    "isRead": 0,
    "createdAt": "2026-04-05T10:00:00Z"
  }
}
```

**3. 正在输入提示**
```json
// 客户端发送
{"type": "typing", "sessionId": 1}

// 服务器推送
{
  "type": "typing",
  "sessionId": 1,
  "userId": 2
}
```

**4. 在线状态**
```json
// 服务器推送 (用户上线/下线)
{
  "type": "online",
  "userId": 1,
  "status": true  // true = 在线, false = 离线
}
```

---

## 核心特性详解

### 1. 自动降级机制

系统优先使用WebSocket，如果WebSocket失败，自动降级为HTTP轮询：

```javascript
// ChatWindow.vue 中的实现
async initChat() {
  if (this.sessionId) {
    await this.loadChatMessages()
    
    // 优先使用 WebSocket
    if (this.$store.state.user.token) {
      try {
        await this.connectWebSocket(this.$store.state.user.token)
      } catch (error) {
        // 连接失败，降级为轮询
        console.warn('[ChatWindow] WebSocket 连接失败，使用轮询模式')
        this.startPolling()
      }
    } else {
      this.startPolling()
    }
  }
}
```

### 2. 断线重连

WebSocket支持指数退避重连策略：

```
重连延迟序列: 1s → 2s → 4s → 8s → 16s → 30s
最大重连次数: 6次
失败后的行为: 停止重连并降级为轮询
```

### 3. 心跳检测

```
发送间隔: 30秒
超时时间: 45秒（45秒内未收到pong则认为断线）
自动重连: 是
```

### 4. 自动回复

商家可设置关键词自动回复规则。当买家消息包含关键词时，系统自动生成系统消息进行回复：

```javascript
// 在 ChatService 中的实现
if ("CUSTOMER".equals(senderRole)) {
    autoReplyIfMatched(session, message);
}

// autoReplyIfMatched 方法会:
// 1. 获取商家的所有启用规则
// 2. 按优先级遍历规则
// 3. 检查关键词匹配
// 4. 匹配则生成系统消息并推送
```

### 5. 未读消息管理

```javascript
// 计算未读数: 该会话中来自其他用户的未读消息
LambdaQueryWrapper<ChatMessage> queryWrapper = new LambdaQueryWrapper<>();
queryWrapper.eq(ChatMessage::getSessionId, sessionId);
queryWrapper.eq(ChatMessage::getIsRead, 0);
queryWrapper.ne(ChatMessage::getSenderId, userId);  // 不计算自己发送的消息

long unreadCount = chatMessageMapper.selectCount(queryWrapper);
```

### 6. 在线状态管理

```javascript
// OnlineStatusManager 使用 ConcurrentHashMap 管理在线用户
private final ConcurrentHashMap<Long, WebSocketSession> onlineUsers = new ConcurrentHashMap<>();

// WebSocket连接时添加
onlineUsers.put(userId, session);

// WebSocket断开时移除
onlineUsers.remove(userId);

// 推送状态变化到所有在线客户端
broadcastUserStatus(userId, true);
```

---

## 性能优化

### 1. 缓存策略

```java
// 消息列表缓存（key包含sessionId和分页参数）
@Cacheable(value = "chat", key = "'messages_' + #sessionId + '_' + #currentPage + '_' + #size")
public Result<?> getMessages(Long sessionId, Integer currentPage, Integer size)

// 会话列表缓存
@Cacheable(value = "chat", key = "'sessions_' + #userId + '_' + #userRole + '_' + #currentPage + '_' + #size")
public Result<?> getSessionsByPage(Long userId, String userRole, Integer currentPage, Integer size)

// 发送消息时清除相关缓存
@CacheEvict(value = "chat", key = "'session_' + #sessionId")
public Result<?> sendMessage(Long sessionId, ...)
```

### 2. 数据库索引

```sql
-- 会话查询优化
CREATE UNIQUE INDEX uk_customer_merchant ON chat_session(customer_id, merchant_id);
CREATE INDEX idx_customer ON chat_session(customer_id);
CREATE INDEX idx_merchant ON chat_session(merchant_id);

-- 消息查询优化
CREATE INDEX idx_session_time ON chat_message(session_id, created_at);
CREATE INDEX idx_sender ON chat_message(sender_id);

-- 规则查询优化
CREATE INDEX idx_merchant_status ON auto_reply_rule(merchant_id, status);
```

### 3. 连接池配置

```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

---

## 测试指南

详见 `docs/testing/CHAT_SYSTEM_TESTING_GUIDE.md`

主要测试场景：
- ✅ 会话创建和复用
- ✅ 消息发送和接收
- ✅ 自动回复触发
- ✅ WebSocket连接
- ✅ 心跳和重连
- ✅ 在线状态显示
- ✅ 未读消息管理

---

## 部署指南

详见 `docs/DEPLOYMENT_GUIDE.md`

快速部署流程：

```bash
# 1. 数据库部署
mysql -u root -p agricultural_mall < docs/sql/2026-04-05-chat-tables.sql

# 2. 后端打包
cd springboot && mvn clean package -DskipTests

# 3. 后端运行
java -jar target/springboot-1.0.jar

# 4. 前端构建
cd newvue && npm run build

# 5. 配置Nginx代理（生产环境）
# 参见 docs/DEPLOYMENT_GUIDE.md 第4部分
```

---

## 实现验证

详见 `docs/IMPLEMENTATION_VERIFICATION.md`

完成度总结：
- ✅ Phase 2: 所有功能 100% 完成
- ✅ Phase 3: 所有功能 100% 完成
- ✅ 数据库设计: 完全验证
- ✅ API端点: 全部实现
- ✅ 前端UI: 完整集成
- ✅ 文档: 完善准备

---

## 文档导航

| 文档 | 描述 |
|------|------|
| [实现验证报告](docs/IMPLEMENTATION_VERIFICATION.md) | 完整的实现验证和测试清单 |
| [部署指南](docs/DEPLOYMENT_GUIDE.md) | 生产部署步骤和配置 |
| [测试指南](docs/testing/CHAT_SYSTEM_TESTING_GUIDE.md) | 详细的测试场景和步骤 |
| [brainstorming](docs/brainstorming/) | 设计思考和需求分析 |
| [designs](docs/designs/) | 架构设计和技术方案 |
| [plans](docs/plans/) | 实现计划和步骤分解 |
| [sql](docs/sql/) | 数据库建表脚本 |

---

## 故障排查

### 问题：WebSocket连接失败

**症状：** 浏览器显示"轮询模式"

**解决方案：**
1. 检查后端是否运行：`curl http://localhost:8080/`
2. 检查WebSocket端口是否开放：`telnet localhost 8080`
3. 查看浏览器控制台错误日志
4. 检查代理配置（如果使用Nginx）

### 问题：消息发送后没有立即显示

**症状：** 消息需要刷新或轮询才能显示

**解决方案：**
1. 确认WebSocket已连接（查看UI状态指示）
2. 检查浏览器WebSocket连接状态
3. 查看后端WebSocket日志
4. 检查是否有JavaScript错误

### 问题：内存占用持续增长

**症状：** 应用运行一段时间后内存不释放

**解决方案：**
1. 检查WebSocket连接是否正确关闭
2. 检查定时器（心跳、轮询）是否正确清理
3. 查看垃圾回收日志：`jstat -gc -h10 <pid> 1000`
4. 使用VisualVM或JProfiler进行内存分析

---

## 扩展和优化方向

1. **集成消息队列** - 使用RabbitMQ处理高并发
2. **数据库分片** - 支持更大规模的消息存储
3. **消息加密** - 实现端到端加密
4. **多媒体支持** - 文件上传下载功能
5. **AI回复** - 集成AI进行智能回复
6. **消息撤回** - 支持消息编辑和撤回
7. **群组聊天** - 扩展到多人聊天
8. **消息搜索** - 全文搜索消息内容

---

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目采用 MIT 许可证。详见 `LICENSE` 文件。

---

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

**最后更新：** 2026-04-05  
**版本：** 1.0 (生产就绪)  
**维护人：** Agricultural Assistance Platform Team

