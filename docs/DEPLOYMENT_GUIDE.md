# 消息系统部署指南

**项目：** 农业助农商城消息系统  
**版本：** Phase 2 + Phase 3  
**更新时间：** 2026-04-05

---

## 一、部署前准备

### 1.1 系统要求

- **Java**: JDK 11 或更高版本
- **Node.js**: 14.0 或更高版本
- **MySQL**: 5.7 或更高版本
- **操作系统**: Linux/Windows/macOS

### 1.2 端口要求

| 服务 | 端口 | 协议 | 说明 |
|------|------|------|------|
| 后端应用 | 8080 | HTTP/HTTPS | Spring Boot应用 |
| WebSocket | 8080 | WS/WSS | WebSocket端点 |
| 前端应用 | 8081 | HTTP | Vue开发服务器（开发时） |
| MySQL | 3306 | TCP | 数据库连接 |

### 1.3 依赖检查

```bash
# 检查Java版本
java -version  # 需要 11 或更高

# 检查Maven版本
mvn -version   # 需要 3.6 或更高

# 检查Node版本
node -v        # 需要 14 或更高
npm -v         # 需要 6 或更高

# 检查MySQL版本
mysql --version # 需要 5.7 或更高
```

---

## 二、数据库部署

### 2.1 创建数据库

```sql
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS agricultural_mall 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_0900_ai_ci;

-- 使用数据库
USE agricultural_mall;
```

### 2.2 执行建表脚本

```bash
# 方式1：直接执行
mysql -u root -p agricultural_mall < /path/to/2026-04-05-chat-tables.sql

# 方式2：登录后执行
mysql -u root -p
mysql> USE agricultural_mall;
mysql> SOURCE /path/to/2026-04-05-chat-tables.sql;
```

### 2.3 验证表结构

```sql
-- 显示所有表
SHOW TABLES;

-- 验证各表结构
DESC chat_session;
DESC chat_message;
DESC auto_reply_rule;

-- 验证索引
SHOW INDEX FROM chat_session;
SHOW INDEX FROM chat_message;
SHOW INDEX FROM auto_reply_rule;
```

### 2.4 初始化测试数据（可选）

```sql
-- 插入测试用户
INSERT INTO user (id, name, role, status) 
VALUES 
  (1, '测试买家', 'CUSTOMER', 1),
  (2, '测试商家', 'MERCHANT', 1);

-- 插入测试商品
INSERT INTO product (id, merchant_id, name) 
VALUES (10, 2, '测试商品');

-- 插入自动回复规则
INSERT INTO auto_reply_rule (merchant_id, keyword, reply_content, priority, status)
VALUES (2, '农业', '欢迎咨询农业相关问题', 10, 1);
```

---

## 三、后端部署

### 3.1 配置文件准备

编辑 `springboot/src/main/resources/application.properties`：

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/agricultural_mall?useSSL=false&serverTimezone=UTC&characterEncoding=utf8mb4
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA配置
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# 日志级别
logging.level.root=INFO
logging.level.org.example.springboot=DEBUG

# WebSocket配置
server.port=8080

# 缓存配置
spring.cache.type=simple
```

### 3.2 编译打包

```bash
cd springboot

# 清理旧构建
mvn clean

# 编译并打包成JAR
mvn package -DskipTests

# 或者如果想运行测试
mvn package

# 验证打包成功
ls -lh target/springboot-*.jar
```

### 3.3 运行应用

**方式1：直接运行JAR**
```bash
java -jar target/springboot-1.0.jar
```

**方式2：使用Maven运行**
```bash
mvn spring-boot:run
```

**方式3：使用Systemd服务（Linux生产环境）**

编辑 `/etc/systemd/system/agri-chat-service.service`：

```ini
[Unit]
Description=Agricultural Chat Service
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/agri-chat
ExecStart=/usr/bin/java -jar springboot-1.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable agri-chat-service
sudo systemctl start agri-chat-service
sudo systemctl status agri-chat-service
```

### 3.4 验证后端启动

```bash
# 查看启动日志
tail -f logs/spring.log

# 测试应用是否运行
curl http://localhost:8080/

# 测试API端点
curl http://localhost:8080/chat/sessions?userId=1&userRole=CUSTOMER

# 测试WebSocket（需要token）
# 使用WebSocket客户端或Postman
```

---

## 四、前端部署

### 4.1 构建前端应用

```bash
cd newvue

# 安装依赖
npm install

# 构建生产版本
npm run build

# 验证构建成功
ls -lh dist/
```

### 4.2 配置API基础URL

编辑 `newvue/.env.production`（或 `newvue/src/utils/request.js`）：

```
VUE_APP_API_BASE_URL=http://your-domain.com/api
VUE_APP_WS_URL=ws://your-domain.com
```

### 4.3 部署到Web服务器

**方式1：使用Nginx**

编辑 `/etc/nginx/sites-available/agri-chat`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端应用
    location / {
        root /var/www/agri-chat/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
    
    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket代理
    location /ws/ {
        proxy_pass http://localhost:8080/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/agri-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**方式2：使用Apache**

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    # 前端应用
    DocumentRoot /var/www/agri-chat/dist
    <Directory /var/www/agri-chat/dist>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [QSA,L]
    </Directory>
    
    # 后端API代理
    ProxyPass /api http://localhost:8080/
    ProxyPassReverse /api http://localhost:8080/
    
    # WebSocket代理
    ProxyPass /ws ws://localhost:8080/ws
    ProxyPassReverse /ws ws://localhost:8080/ws
</VirtualHost>
```

### 4.4 HTTPS/WSS配置

对于生产环境，必须使用HTTPS和WSS：

**Nginx HTTPS配置：**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 其他配置同上...
    
    # WebSocket使用wss://
    location /ws/ {
        proxy_pass http://localhost:8080/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # ... 其他header配置
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 五、性能优化

### 5.1 缓存配置

在 `application.properties` 中配置缓存：

```properties
# 使用Redis缓存（推荐）
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.database=0
spring.redis.password=

# 缓存过期时间
spring.cache.redis.time-to-live=3600000
```

### 5.2 数据库连接池

```properties
# HikariCP配置
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

### 5.3 WebSocket优化

在 `WebSocketConfig.java` 中优化：

```java
registry.addHandler(chatWebSocketHandler(), "/ws/chat")
    .addInterceptors(interceptors)
    .setAllowedOrigins("*")
    .setHandshakeHandler(new DefaultHandshakeHandler() {
        @Override
        protected Principal determineUser(ServerHttpRequest request,
                WebSocketHandler wsHandler,
                Map<String, Object> attributes) {
            // 优化身份验证逻辑
            return super.determineUser(request, wsHandler, attributes);
        }
    });
```

### 5.4 监控和日志

```properties
# 启用监控
management.endpoints.web.exposure.include=health,metrics,prometheus

# 日志输出配置
logging.file.name=/var/log/agri-chat/application.log
logging.file.max-size=10MB
logging.file.max-history=30
```

---

## 六、监控告警

### 6.1 关键指标

```
- WebSocket连接数
- 消息处理延迟
- 数据库查询时间
- CPU和内存使用率
- 错误率和异常日志
```

### 6.2 日志聚合（使用ELK）

```yaml
# logstash配置示例
input {
  file {
    path => "/var/log/agri-chat/application.log"
    start_position => "beginning"
  }
}

filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level}" }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "agri-chat-%{+YYYY.MM.dd}"
  }
}
```

---

## 七、备份和恢复

### 7.1 数据库备份

```bash
# 定期备份数据库
mysqldump -u root -p agricultural_mall > backup_$(date +%Y%m%d).sql

# 添加cron定时任务
0 2 * * * mysqldump -u root -ppassword agricultural_mall > /backup/agricultural_mall_$(date +\%Y\%m\%d).sql
```

### 7.2 恢复数据库

```bash
mysql -u root -p agricultural_mall < backup_20260405.sql
```

---

## 八、故障排查

### 问题1：WebSocket连接失败

**症状：** 浏览器显示"轮询模式"

**排查步骤：**
1. 检查后端WebSocket端口是否开放
2. 检查防火墙规则
3. 查看后端日志
4. 测试WebSocket连接：`wscat -c ws://localhost:8080/ws/chat?token=xxx`

### 问题2：消息延迟

**症状：** 消息推送很慢

**排查步骤：**
1. 检查网络延迟
2. 检查服务器CPU和内存
3. 查看数据库查询日志
4. 检查缓存是否命中

### 问题3：内存泄漏

**症状：** 内存占用持续增长

**排查步骤：**
1. 检查WebSocket连接是否正确关闭
2. 检查定时器是否正确清理
3. 使用JProfiler或YourKit分析
4. 查看垃圾回收日志

---

## 九、升级和维护

### 9.1 版本升级流程

1. 备份当前数据库
2. 停止应用
3. 部署新版本
4. 运行数据库迁移脚本
5. 启动应用
6. 验证功能

### 9.2 滚动更新（无停机部署）

使用负载均衡器实现：

```bash
# 1. 部署新版本到新实例
# 2. 逐步将流量切换到新实例
# 3. 旧实例优雅关闭
```

---

## 十、生产检查清单

在部署到生产环境前，确保完成以下检查：

- [ ] 数据库已备份
- [ ] 所有表已创建且索引正确
- [ ] 后端代码已编译无误
- [ ] 前端代码已优化构建
- [ ] WebSocket端口已开放
- [ ] HTTPS/WSS已正确配置
- [ ] 日志级别已调整为INFO
- [ ] 性能监控已启用
- [ ] 错误告警已配置
- [ ] 备份恢复计划已测试
- [ ] 用户文档已发布
- [ ] 支持团队已培训

---

**最后更新：** 2026-04-05  
**版本：** 1.0  
**维护人：** Agricultural Assistance Platform Team

