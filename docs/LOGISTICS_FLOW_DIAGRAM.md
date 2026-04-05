# 🏗️ 物流系统架构与流程图

## 系统整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         农业电商平台 - 物流系统                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  前端层 (Vue.js)                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Customer View - Order.vue                                       │   │
│  │  └─ 查看物流按钮 (status=2时显示)                              │   │
│  │     └─ viewLogistics(order) → 弹出对话框                       │   │
│  │        └─ getOrderLogistics(orderId) API调用                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Admin View - OrderManagement.vue                                │   │
│  │  └─ 发货按钮 (status=1时显示)                                  │   │
│  │     └─ handleShip(order) → 打开物流表单对话框                  │   │
│  │        └─ addLogistics(orderId, data) API调用                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ API Layer - order.js                                            │   │
│  │  ├─ getOrderLogistics(orderId)                                  │   │
│  │  ├─ addLogistics(orderId, data)                                 │   │
│  │  └─ updateLogistics(logisticsId, status)                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓ HTTP
┌──────────────────────────────────────────────────────────────────────────┐
│  后端层 (Spring Boot)                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Controller Layer                                                │   │
│  │  ├─ OrderController                                             │   │
│  │  │  └─ getOrderLogistics(id) → /order/{id}/logistics          │   │
│  │  └─ LogisticsController                                         │   │
│  │     ├─ createLogistics() → POST /logistics                     │   │
│  │     ├─ getLogisticsById() → GET /logistics/{id}                │   │
│  │     ├─ getLogisticsByOrderId() → GET /logistics/order/{id}    │   │
│  │     ├─ updateLogisticsStatus() → PUT /logistics/{id}/status   │   │
│  │     └─ signLogistics() → PUT /logistics/{id}/sign             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Service Layer                                                   │   │
│  │  ├─ OrderService.getOrderLogistics(orderId)                    │   │
│  │  │  ├─ 查询订单 (Order表)                                      │   │
│  │  │  ├─ 根据orderId查询物流 (Logistics表)                      │   │
│  │  │  └─ 返回物流信息                                            │   │
│  │  └─ LogisticsService                                            │   │
│  │     ├─ createLogistics()                                       │   │
│  │     │  ├─ 验证订单存在 + 已支付                               │   │
│  │     │  ├─ 验证必填字段                                        │   │
│  │     │  ├─ 插入logistics记录 (status=1)                        │   │
│  │     │  └─ 更新订单状态为2 (已发货)                           │   │
│  │     ├─ updateLogisticsStatus()                                 │   │
│  │     │  ├─ 更新物流状态                                        │   │
│  │     │  └─ 根据物流状态同步更新订单状态                        │   │
│  │     ├─ getLogisticsByOrderId()                                 │   │
│  │     │  ├─ 查询logistics表                                      │   │
│  │     │  └─ 填充关联的订单对象                                  │   │
│  │     └─ signLogistics()                                          │   │
│  │        ├─ 更新物流状态为2 (已签收)                            │   │
│  │        └─ 更新订单状态为3 (已完成)                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Mapper Layer (MyBatis Plus)                                     │   │
│  │  ├─ LogisticsMapper extends BaseMapper<Logistics>              │   │
│  │  └─ OrderMapper extends BaseMapper<Order>                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓ SQL
┌──────────────────────────────────────────────────────────────────────────┐
│  数据库层 (MySQL)                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ logistics 表                                                    │   │
│  │  ┌────────────────────────────────────────────────────────┐   │   │
│  │  │ id | order_id | company_name | tracking_number | ...  │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  │  Index: idx_order_id, idx_tracking_number                     │   │
│  │                                                                │   │
│  │ order 表                                                      │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │ id | user_id | product_id | status | ... | refund_*  │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │  关系: 1对1 = order(1) ← logistics(N)                     │   │
│  │                                                                │   │
│  │ 物流状态映射:                                                 │   │
│  │  ┌───┬────────┬──────────────┐                              │   │
│  │  │ 0 │ 待发货 │ order.status  │                              │   │
│  │  │ 1 │ 已发货 │ order.status  │                              │   │
│  │  │ 2 │ 已签收 │ order.status  │                              │   │
│  │  │ 3 │ 已取消 │ order.status  │                              │   │
│  │  └───┴────────┴──────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 用户查看物流 - 详细时序图

```
时间 ├─────────────────────────────────────────────────────────────────────┤

用户   │ 浏览订单列表（status=2）
      │ 看到"查看物流"按钮
      │ 点击按钮
      │
      │                        ╔════════════════════════════════════╗
      │────────────────────────║  点击"查看物流"事件触发            ║
      │                        ╚═══════════════╤══════════════════╛
      │                                        │
前端   │                                        ▼
      │                          Order.vue: viewLogistics()
      │                          ├─ logisticsVisible = true
      │                          ├─ logisticsLoading = true
      │                          └─ 显示加载中对话框
      │                                        │
      │                          调用 getOrderLogistics(orderId)
      │                                        │
      │                                        ▼
      │                          order.js: request({
      │                            url: `/order/${orderId}/logistics`,
      │                            method: 'get'
      │                          })
      │
      │◄─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ HTTP GET 请求 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─►│
      │                                                                │
后端  │                                                                │
      │                                       OrderController         │
      │                                       getOrderLogistics(id)    │
      │                                               │                │
      │                                               ▼               │
      │                                    OrderService.getOrderLogistics()
      │                                       ├─ orderMapper.selectById(id)
      │                                       ├─ logisticsMapper.selectOne(...)
      │                                       ├─ 填充关联的order对象
      │                                       └─ return Result<Logistics>
      │                                               │                │
      │                                               ▼               │
      │                                    LogisticsMapper.selectOne()
      │                                               │                │
      │                                               ▼               │
      │                                    MySQL: SELECT ... FROM logistics
      │                                           WHERE order_id = ?  │
      │
      │◄─ ─ ─ JSON 响应 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
      │
前端  │ 接收响应
      │ ├─ if (res.code === '0')
      │ ├─ logisticsData = res.data
      │ └─ logisticsLoading = false
      │
      │ 显示物流详情对话框：
      │ ├─ 物流公司: 中通快递
      │ ├─ 运单号: 11111
      │ ├─ 状态: 运输中 (绿色primary标签)
      │ ├─ 收货人: jx
      │ ├─ 收货电话: 15252393509
      │ ├─ 收货地址: 15816165
      │ └─ 发货时间: 2025-04-01 23:37:28

用户   │ 看到物流详情信息
      │ (可关闭对话框或继续操作)
```

---

## 管理员发货 - 详细时序图

```
时间 ├─────────────────────────────────────────────────────────────────────┤

管理员 │ 打开订单管理页面
      │ 看到订单列表（已支付 status=1）
      │ 点击"发货"按钮
      │
      │                        ╔════════════════════════════════════╗
      │────────────────────────║  点击"发货"按钮                    ║
      │                        ╚═══════════════╤══════════════════╛
      │                                        │
前端   │                                        ▼
      │                        OrderManagement.vue: handleShip(row)
      │                        ├─ 打开物流表单对话框
      │                        ├─ currentOrder = row
      │                        └─ logisticsDialogVisible = true
      │
      │ 填写表单：
      │ ├─ 选择物流公司（下拉框）
      │ ├─ 输入运单号
      │ └─ 选择预计到达时间
      │
      │ 点击"确认发货"按钮
      │
      │                        OrderManagement.vue: submitLogistics()
      │                        ├─ 验证表单
      │                        └─ addLogistics(orderId, data)
      │
      │◄─ ─ ─ ─ ─ ─ ─ ─ ─ HTTP POST 请求 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ►│
      │                                                                │
后端  │  order.js API:                                                  │
      │  POST /logistics                                               │
      │  data: {                                                       │
      │    orderId: 114,                                               │
      │    companyName: "中通快递",                                   │
      │    trackingNumber: "11111",                                   │
      │    receiverName: "jx",                                        │
      │    receiverPhone: "15252393509",                              │
      │    receiverAddress: "15816165",                               │
      │    expectedArrivalTime: "2025-04-16"                          │
      │  }                                                             │
      │                                       │                        │
      │                                       ▼                       │
      │                        LogisticsController.createLogistics()  │
      │                                       │                        │
      │                                       ▼                       │
      │                        LogisticsService.createLogistics()     │
      │                         ├─ orderMapper.selectById(orderId)    │
      │                         ├─ 检查订单状态是否为1 (已支付)      │
      │                         ├─ 验证必填字段                     │
      │                         ├─ logistics.setStatus(1)            │
      │                         ├─ logisticsMapper.insert(logistics) │
      │                         ├─ 订单状态设为2 (已发货)            │
      │                         ├─ orderMapper.updateById(order)     │
      │                         └─ return Result<Logistics>          │
      │                                       │                        │
      │                                       ▼                       │
      │                         MySQ: 2个数据库操作                   │
      │                         1. INSERT INTO logistics (...)        │
      │                         2. UPDATE order SET status=2          │
      │
      │◄─ ─ ─ JSON 响应 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
      │
前端  │ 接收成功响应
      │ ├─ 关闭物流表单对话框
      │ ├─ 显示成功提示
      │ └─ 刷新订单列表
      │
      │ 订单状态变为: 已发货 (status=2)
      │ 用户端可以看到"查看物流"按钮了

管理员 │ 看到操作完成
      │ 订单列表已更新
```

---

## 订单状态与物流状态的同步机制

```
                    ┌──────────────────────────────────────────┐
                    │ 订单与物流的状态映射关系                 │
                    └──────────────────────────────────────────┘

创建物流时:
  ┌─────────────────────────────────┐
  │ 订单状态: 1 (已支付)            │  ─┐
  │ 物流创建: status = 1 (已发货)   │   │ [createLogistics]
  │ 订单更新: status = 2 (已发货)   │  ─┘
  └─────────────────────────────────┘

更新物流状态时:
  ┌─────────────────────────────────┐
  │ switch (物流status) {            │
  │   case 0: order.status = 1 ──► 已支付   │
  │   case 1: order.status = 2 ──► 已发货   │
  │   case 2: order.status = 3 ──► 已完成   │
  │   case 3: order.status = 4 ──► 已取消   │
  │ }                               │
  └─────────────────────────────────┘

用户确认收货时:
  ┌─────────────────────────────────┐
  │ 订单状态: 2 → 3 (已完成)         │  ─┐
  │ 物流状态: 2 (已签收)             │   │ [confirmOrder]
  │                                 │  ─┘
  └─────────────────────────────────┘
```

---

## 数据库表间关系

```
                      ┌─────────────────────────────┐
                      │  order 表 (订单)            │
                      ├─────────────────────────────┤
                      │ id (PK)                     │
                      │ user_id (FK)                │
                      │ product_id (FK)             │
                      │ status (0-7)                │
                      │ total_price                 │
                      │ recv_name/phone/address     │
                      │ created_at / updated_at     │
                      └─────────────────────────────┘
                              │
                              │ 1:1
                              │
                      ┌─────────────────────────────┐
                      │  logistics 表 (物流)        │
                      ├─────────────────────────────┤
                      │ id (PK)                     │
                      │ order_id (FK) ◄─────────┐  │
                      │ company_name              │  │
                      │ tracking_number           │  │
                      │ status (0-3)              │  │
                      │ receiver_name/phone/addr  │  │
                      │ expected_arrival_time     │  │
                      │ created_at / updated_at   │  │
                      │                           │  │
                      │ Index: order_id ──────────┘  │
                      │ Index: tracking_number       │
                      └─────────────────────────────┘

    一个订单 → 一条物流记录
    order(1) ──┬─── logistics(N)
              1|  |N
              (实际是1对1)
```

---

## API 请求/响应示例

### 1️⃣ 获取订单物流 (GET /order/{orderId}/logistics)

**请求**:
```http
GET /order/114/logistics HTTP/1.1
Host: api.example.com
Authorization: Bearer token
```

**响应**:
```json
{
  "code": "0",
  "message": "success",
  "data": {
    "id": 3,
    "orderId": 114,
    "receiverName": "jx",
    "receiverPhone": "15252393509",
    "receiverAddress": "15816165",
    "companyName": "中通快递",
    "trackingNumber": "11111",
    "status": 1,
    "expectedArrivalTime": null,
    "createdAt": "2025-04-01 23:37:28",
    "updatedAt": "2025-04-01 23:37:28",
    "order": {
      "id": 114,
      "userId": 1,
      "productId": 5,
      "status": 2,
      "totalPrice": 99.99,
      ...
    }
  }
}
```

### 2️⃣ 创建物流 (POST /logistics)

**请求**:
```http
POST /logistics HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer admin_token

{
  "orderId": 114,
  "companyName": "中通快递",
  "trackingNumber": "11111",
  "receiverName": "jx",
  "receiverPhone": "15252393509",
  "receiverAddress": "15816165",
  "expectedArrivalTime": "2025-04-16 00:00:00"
}
```

**响应**:
```json
{
  "code": "0",
  "message": "success",
  "data": {
    "id": 3,
    "orderId": 114,
    "companyName": "中通快递",
    "trackingNumber": "11111",
    "status": 1,
    "receiverName": "jx",
    "receiverPhone": "15252393509",
    "receiverAddress": "15816165",
    "expectedArrivalTime": "2025-04-16 00:00:00",
    "createdAt": "2025-04-01 23:37:28",
    "updatedAt": "2025-04-01 23:37:28"
  }
}
```

### 3️⃣ 更新物流状态 (PUT /logistics/{id}/status)

**请求**:
```http
PUT /logistics/3/status?status=2 HTTP/1.1
Host: api.example.com
Authorization: Bearer admin_token
```

**响应**:
```json
{
  "code": "0",
  "message": "success",
  "data": {
    "id": 3,
    "status": 2,
    "updatedAt": "2025-04-02 10:00:00"
  }
}
```

---

## 错误处理流程

```
创建物流时可能的错误:
  ├─ 订单不存在
  │  └─ Result.error("-1", "订单不存在")
  │
  ├─ 订单状态不是已支付
  │  └─ Result.error("-1", "只能为已支付订单创建物流")
  │
  ├─ 必填字段缺失
  │  ├─ Result.error("-1", "物流公司名称不能为空")
  │  ├─ Result.error("-1", "收货人姓名不能为空")
  │  ├─ Result.error("-1", "收货人电话不能为空")
  │  └─ Result.error("-1", "收货地址不能为空")
  │
  └─ 数据库异常
     └─ Result.error("-1", "创建物流信息失败：" + e.getMessage())

获取物流时可能的错误:
  ├─ 订单不存在
  │  └─ Result.error("-1", "未找到订单")
  │
  └─ 物流记录不存在
     └─ Result.error("-1", "未找到物流信息")

更新物流状态时可能的错误:
  ├─ 物流不存在
  │  └─ Result.error("-1", "未找到物流信息")
  │
  └─ 数据库异常
     └─ Result.error("-1", "更新物流状态失败：" + e.getMessage())
```

---

## 核心类关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                       Entity 层                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Logistics entity              Order entity                     │
│  ├─ Long id                    ├─ Long id                      │
│  ├─ Long orderId ─────────────► ├─ Long userId                │
│  ├─ String companyName         ├─ Integer status              │
│  ├─ String trackingNumber      ├─ BigDecimal totalPrice       │
│  ├─ Integer status (0-3)       ├─ String recvName             │
│  ├─ String receiverName        ├─ String recvPhone            │
│  ├─ String receiverPhone       ├─ String recvAddress          │
│  ├─ String receiverAddress     └─ ...                         │
│  ├─ Timestamp createdAt                                       │
│  └─ @TableField Order order                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↑
                    (对象注入和关联)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Controller 层                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LogisticsController                OrderController            │
│  ├─ @PostMapping                    ├─ @GetMapping(/{id}/...) │
│  ├─ @PutMapping                     ├─ @PutMapping            │
│  ├─ @GetMapping                     └─ @PostMapping           │
│  └─ @DeleteMapping                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↑
                    (依赖注入Service)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Service 层                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LogisticsService                  OrderService               │
│  ├─ createLogistics()              ├─ getOrderLogistics()     │
│  ├─ getLogisticsById()             ├─ updateOrderStatus()    │
│  ├─ getLogisticsByOrderId()        ├─ confirmOrder()         │
│  ├─ updateLogisticsStatus()        └─ ...                    │
│  ├─ signLogistics()                                           │
│  └─ ...                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↑
                    (依赖注入Mapper)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Mapper 层 (MyBatis Plus)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LogisticsMapper extends BaseMapper<Logistics>                 │
│  ├─ selectById(id)                                             │
│  ├─ selectOne(queryWrapper)                                    │
│  ├─ selectPage(page, queryWrapper)                             │
│  ├─ insert(entity)                                             │
│  ├─ updateById(entity)                                         │
│  ├─ deleteById(id)                                             │
│  └─ deleteBatchIds(ids)                                        │
│                                                                 │
│  OrderMapper extends BaseMapper<Order>                         │
│  └─ (同上)                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                ↑
                    (生成SQL语句)
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      Database 层 (MySQL)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  logistics 表                      order 表                    │
│  (存储物流数据)                   (存储订单数据)               │
│                                                                 │
│  SELECT * FROM logistics                                       │
│  WHERE order_id = ?                                            │
│                                                                 │
│  UPDATE order SET status = 2                                   │
│  WHERE id = ?                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 完整的用户旅程

```
用户旅程 (User Journey) for 物流查看

Stage 1: 浏览商品
  └─ 用户浏览产品列表
     └─ 添加商品到购物车

Stage 2: 下单支付
  └─ 创建订单 (order.status = 0: 待支付)
     └─ 支付成功 (order.status = 1: 已支付)
        └─ 用户等待发货

Stage 3: 发货 (管理员操作)
  └─ 管理员收到待发货订单
     └─ 点击"发货"按钮
        └─ 填写物流信息
           └─ 提交发货
              ├─ 创建logistics记录 (status = 1)
              └─ 订单状态更新 (status = 2: 已发货)

Stage 4: 查看物流 (用户操作)
  └─ 用户收到"已发货"通知
     └─ 进入"我的订单"页面
        └─ 找到订单 (status = 2)
           └─ 点击"查看物流"按钮
              └─ 打开物流详情对话框
                 ├─ 显示物流公司
                 ├─ 显示运单号
                 ├─ 显示物流状态
                 ├─ 显示收货信息
                 └─ 显示预计到达时间

Stage 5: 确认收货
  └─ 用户收到快递
     └─ 点击"确认收货"按钮
        ├─ 订单状态更新 (status = 3: 已完成)
        └─ 物流状态更新 (status = 2: 已签收)

Stage 6: 售后服务
  └─ 用户可以申请售后/退货
     └─ 填写退货物流信息
        └─ 平台处理

End of Journey ✓
```

