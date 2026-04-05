# 🚚 农业电商平台 - 物流系统简明指南

## 快速概览

### 文件位置
```
后端:
  springboot/src/main/java/org/example/springboot/
  ├── entity/Logistics.java
  ├── controller/LogisticsController.java
  ├── service/LogisticsService.java
  └── mapper/LogisticsMapper.java

前端:
  newvue/src/
  ├── views/customer/Order.vue (用户查看物流)
  ├── views/admin/OrderManagement.vue (管理员发货)
  ├── components/customer/OrderDetail.vue
  └── api/order.js

数据库:
  sql/db_aps.sql (logistics表)
```

---

## 用户点击"查看物流"后的完整流程

### 1️⃣ 前端 - Order.vue 中的 viewLogistics() 方法
```javascript
// 用户点击"查看物流"按钮
async viewLogistics(order) {
  this.logisticsVisible = true      // 显示对话框
  this.logisticsLoading = true      // 显示加载状态
  
  // 调用API获取物流信息
  const res = await getOrderLogistics(order.id)
  
  if (res.code === '0' && res.data) {
    this.logisticsData = res.data   // 保存物流数据
  }
  
  this.logisticsLoading = false     // 关闭加载状态
}
```

### 2️⃣ 网络请求
```
GET /order/{orderId}/logistics
```

### 3️⃣ 后端处理流程
```
OrderController.getOrderLogistics(id)
  ↓
OrderService.getOrderLogistics(orderId)
  ├─ 查询订单是否存在
  ├─ 根据 orderId 查询 logistics 表
  ├─ 填充关联的订单对象
  └─ 返回物流信息
```

### 4️⃣ 数据库查询
```sql
SELECT * FROM logistics WHERE order_id = ? LIMIT 1
```

### 5️⃣ 返回给前端
```json
{
  "code": "0",
  "data": {
    "id": 1,
    "orderId": 114,
    "companyName": "中通快递",
    "trackingNumber": "11111",
    "status": 1,                    // 1 = 运输中
    "receiverName": "jx",
    "receiverPhone": "15252393509",
    "receiverAddress": "15816165",
    "expectedArrivalTime": null,
    "createdAt": "2025-04-01 23:37:28"
  }
}
```

### 6️⃣ 前端显示物流详情对话框
```vue
<el-dialog title="物流详情">
  物流公司: 中通快递
  运单号: 11111
  状态: 运输中
  收货人: jx
  收货电话: 15252393509
  收货地址: 15816165
  发货时间: 2025-04-01 23:37:28
</el-dialog>
```

---

## 核心概念

### 物流状态定义
| 状态值 | 含义 | 对应订单状态 | 用户界面 |
|------|------|----------|---------|
| 0 | 待发货 | 1 (已支付) | info标签 |
| 1 | 运输中 | 2 (已发货) | primary标签 |
| 2 | 已签收 | 3 (已完成) | success标签 |
| 3 | 已取消 | 4 (已取消) | danger标签 |

### 物流表 (Logistics) 字段
- `id`: 物流ID (主键)
- `order_id`: 订单ID (外键，一对一关系)
- `company_name`: 物流公司 (如"中通快递")
- `tracking_number`: 快递单号
- `status`: 物流状态 (0-3)
- `receiver_*`: 收货信息 (名字、电话、地址)
- `expected_arrival_time`: 预计到达时间
- `created_at`/`updated_at`: 时间戳

---

## 管理员发货流程

### 操作步骤 (OrderManagement.vue)
1. 订单列表中，找到状态为"已支付"的订单
2. 点击"发货"按钮
3. 填写物流信息对话框
4. 提交表单

### 提交数据
```javascript
{
  orderId: 114,
  companyName: "中通快递",
  trackingNumber: "11111",
  receiverName: "jx",
  receiverPhone: "15252393509",
  receiverAddress: "15816165",
  expectedArrivalTime: "2025-04-16"
}
```

### 后端处理
```java
LogisticsService.createLogistics(logistics)
  ├─ 验证订单存在且已支付
  ├─ 验证必填字段
  ├─ 设置 status = 1 (已发货)
  ├─ 插入 logistics 表
  ├─ 更新订单状态为 2 (已发货)
  └─ 返回创建的物流信息
```

---

## 用户流程全景

```
支付 → 已支付(status=1)
  ↓
管理员发货
  ↓ [createLogistics]
创建物流(status=1) + 订单变为已发货(status=2)
  ↓
用户点击"查看物流"
  ↓ [getOrderLogistics]
显示物流详情对话框
  ↓
用户确认收货
  ↓ [confirmOrder]
订单完成(status=3) + 物流签收(status=2)
  ↓
可申请售后
```

---

## API 端点一览

### 用户端 API
```
GET  /order/{orderId}/logistics    查看订单物流信息
PUT  /order/{id}/status            确认收货等状态更新
```

### 管理员 API
```
POST   /logistics                   创建物流信息
GET    /logistics/{id}              查询物流详情
GET    /logistics/order/{orderId}   根据订单查物流
GET    /logistics/page              分页查询物流列表
PUT    /logistics/{id}/status       更新物流状态
PUT    /logistics/{id}/sign         物流签收
DELETE /logistics/{id}              删除物流
DELETE /logistics/batch             批量删除物流
```

---

## 数据库表结构

```sql
CREATE TABLE logistics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,          -- 指向order表
  receiver_name VARCHAR(50),
  receiver_phone VARCHAR(20),
  receiver_address VARCHAR(255),
  company_name VARCHAR(50),          -- 快递公司
  tracking_number VARCHAR(50),       -- 快递单号
  status TINYINT DEFAULT 0,          -- 0:待, 1:运输, 2:签收, 3:取消
  expected_arrival_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order_id (order_id),
  INDEX idx_tracking_number (tracking_number)
)
```

---

## 物流与订单状态同步

### 创建物流时
```
订单状态: 1 (已支付) → 2 (已发货)
物流状态: 1 (已发货)
```

### 更新物流状态时
```
物流状态 0 → 订单状态 1
物流状态 1 → 订单状态 2
物流状态 2 → 订单状态 3
物流状态 3 → 订单状态 4
```

### 用户确认收货时
```
订单状态: 2 (已发货) → 3 (已完成)
物流状态: 2 (已签收)
```

---

## 前端关键代码片段

### Order.vue 中显示物流按钮
```vue
<el-button
  v-if="order.status === 2"
  @click="viewLogistics(order)"
>
  查看物流
</el-button>

<!-- 物流状态映射 -->
getLogisticsStatusText(status) {
  return { 0: '待发货', 1: '运输中', 2: '已签收', 3: '已取消' }[status]
}

getLogisticsStatusType(status) {
  return { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' }[status]
}
```

### Order.js 中的 API
```javascript
export function getOrderLogistics(orderId) {
    return request({
        url: `/order/${orderId}/logistics`,
        method: 'get'
    })
}
```

---

## 后端关键代码片段

### LogisticsService 核心方法

#### createLogistics - 创建物流
```java
// 验证订单状态必须为1(已支付)
if (order.getStatus() != 1) {
    return Result.error("-1", "只能为已支付订单创建物流");
}

// 设置物流状态
logistics.setStatus(1);
logisticsMapper.insert(logistics);

// 同步更新订单状态
order.setStatus(2);  // 已发货
orderMapper.updateById(order);
```

#### getLogisticsByOrderId - 查询订单物流
```java
LambdaQueryWrapper<Logistics> queryWrapper = new LambdaQueryWrapper<>();
queryWrapper.eq(Logistics::getOrderId, orderId);
Logistics logistics = logisticsMapper.selectOne(queryWrapper);

// 返回物流信息
return Result.success(logistics);
```

#### updateLogisticsStatus - 更新物流状态
```java
// 根据物流状态映射订单状态
switch (status) {
    case 1: order.setStatus(2); break;  // 已发货
    case 2: order.setStatus(3); break;  // 已完成
    case 3: order.setStatus(4); break;  // 已取消
}
orderMapper.updateById(order);
```

---

## 关键发现

### ✅ 已实现
1. 物流与订单状态自动同步
2. 用户实时查看物流信息
3. 管理员方便的发货操作
4. 数据库性能优化 (索引)
5. 完整的物流生命周期

### ⚠️ 可改进
1. 缺少第三方快递API集成 (不能自动更新物流)
2. 没有物流状态变化历史记录
3. 不支持订单分批发货
4. 缺少物流异常处理逻辑

---

## 快速定位问题

**Q: 用户看不到物流信息?**
- A: 检查 Order.vue 中 viewLogistics() 的 API 调用
- 确保订单状态为 2 (已发货)
- 检查数据库中是否存在对应的 logistics 记录

**Q: 物流创建后订单状态没变?**
- A: 检查 LogisticsService.createLogistics() 中是否调用了 orderMapper.updateById()

**Q: 查不到物流信息?**
- A: 检查 logistics 表中 order_id 是否匹配
- 查看 LogisticsMapper 的索引是否有效

---

## 推荐阅读顺序
1. 先理解数据库表结构 (`sql/db_aps.sql`)
2. 看物流实体定义 (`Logistics.java`)
3. 学习服务层逻辑 (`LogisticsService.java`)
4. 理解控制器路由 (`LogisticsController.java`)
5. 从前端用户交互开始 (`Order.vue` 的 `viewLogistics()`)
6. 跟踪 API 调用 (`order.js` 中的 `getOrderLogistics()`)
7. 查看完整的订单流程

