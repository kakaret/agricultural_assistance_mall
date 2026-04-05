# 消息系统（Phase 2 & Phase 3）测试指南

## 概述

本文档提供了完整的测试指南，涵盖了农业助农商城消息系统的所有功能点，包括：
- **Phase 2**: 轮询版客服系统（HTTP polling）
- **Phase 3**: WebSocket实时升级（WebSocket with automatic failover）

---

## 第一部分：环境准备

### 1.1 后端编译和启动

```bash
cd /Users/guangxiji/Documents/UGit/agricultural_assistance_mall/springboot

# 清理并重新编译
mvn clean compile

# 运行 Spring Boot 应用
mvn spring-boot:run
```

预期输出：
```
Tomcat started on port(s): 8080 (http) with context path ''
```

### 1.2 前端启动

```bash
cd /Users/guangxiji/Documents/UGit/agricultural_assistance_mall/newvue

# 安装依赖（如果未安装）
npm install

# 启动开发服务器
npm run serve
```

预期输出：
```
  App running at:
  - Local:   http://localhost:8081/
```

### 1.3 数据库准备

确保已执行以下SQL脚本：
```bash
# 执行建表脚本
cat /Users/guangxiji/Documents/UGit/agricultural_assistance_mall/docs/sql/2026-04-05-chat-tables.sql | mysql -u root -p
```

验证表是否创建成功：
```sql
SHOW TABLES LIKE 'chat%';
SHOW TABLES LIKE 'auto_reply%';
DESC chat_session;
DESC chat_message;
DESC auto_reply_rule;
```

---

## 第二部分：Phase 2 测试（轮询版）

### 2.1 基础会话测试

#### 测试场景 2.1.1：创建会话

**前置条件：** 确保用户表中存在ID为1和2的用户

**测试步骤：**
```
POST /chat/session
参数：
- customerId: 1
- merchantId: 2
- productId: 10
```

**预期结果：**
```json
{
  "code": "0",
  "data": {
    "id": 1,
    "customerId": 1,
    "merchantId": 2,
    "productId": 10,
    "status": 1,
    "createdAt": "2026-04-05T10:00:00Z",
    "customer": { ... },
    "merchant": { ... },
    "product": { ... }
  }
}
```

#### 测试场景 2.1.2：会话复用

**测试步骤：** 重复调用创建会话API，相同的customerId和merchantId

**预期结果：** 返回同一个会话ID，且productId被更新

---

## 第三部分：Phase 3 测试（WebSocket升级）

### 3.1 WebSocket连接测试

#### 测试场景 3.1.1：建立WebSocket连接

**测试工具：** Postman WebSocket或Chrome DevTools

**连接URL：**
```
ws://localhost:8080/ws/chat?token=<JWT_TOKEN>
```

**预期结果：**
- WebSocket连接建立成功
- 浏览器控制台输出：`[WebSocket] 连接已建立`

#### 测试场景 3.1.2：心跳检测

**测试步骤：**
1. 建立WebSocket连接后
2. 等待约30秒
3. 观察浏览器控制台

**预期结果：**
```
[WebSocket] 消息已发送: {"type":"ping"}
[WebSocket] 已收到 pong 回复
```

---

## 第四部分：集成测试

### 4.1 双端实时消息推送

**前置条件：** 
1. 打开两个浏览器标签页
2. 一个标签页以客户身份登录
3. 另一个标签页以商家身份登录

**测试步骤：**
1. 客户标签页：发送消息 "你好，商家"
2. 观察商家标签页

**预期结果：**
- 商家标签页立即收到消息
- 消息显示在聊天窗口中

---

## 附录：测试数据准备SQL

```sql
-- 插入测试用户
INSERT INTO user (id, name, role, status) VALUES (1, '测试买家', 'CUSTOMER', 1);
INSERT INTO user (id, name, role, status) VALUES (2, '测试商家', 'MERCHANT', 1);

-- 插入自动回复规则
INSERT INTO auto_reply_rule (merchant_id, keyword, reply_content, priority, status)
VALUES (2, '农业', '欢迎咨询农业相关问题', 10, 1);
```

---

**文档版本：** 1.0  
**最后更新：** 2026-04-05
