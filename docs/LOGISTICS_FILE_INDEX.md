# 📑 物流系统 - 完整文件索引

## 目录结构

```
agricultural_assistance_mall/
├── springboot/
│   └── src/main/java/org/example/springboot/
│       ├── entity/
│       │   └── Logistics.java                    # ✅ 物流实体
│       ├── controller/
│       │   ├── LogisticsController.java          # ✅ 物流控制器
│       │   └── OrderController.java              # ✅ 订单控制器 (包含getOrderLogistics)
│       ├── service/
│       │   ├── LogisticsService.java             # ✅ 物流服务
│       │   └── OrderService.java                 # ✅ 订单服务 (包含getOrderLogistics)
│       └── mapper/
│           ├── LogisticsMapper.java              # ✅ 物流数据访问层
│           └── OrderMapper.java                  # (订单数据访问)
│
├── newvue/
│   └── src/
│       ├── views/
│       │   ├── customer/
│       │   │   └── Order.vue                     # ✅ 用户订单页面 (查看物流)
│       │   └── admin/
│       │       └── OrderManagement.vue           # ✅ 管理员订单管理 (发货)
│       ├── components/
│       │   └── customer/
│       │       ├── OrderDetail.vue               # ✅ 订单详情组件
│       │       └── ...
│       └── api/
│           └── order.js                          # ✅ 订单API文件
│
├── sql/
│   └── db_aps.sql                                # ✅ 数据库SQL文件
│
└── docs/
    ├── LOGISTICS_ANALYSIS.md                     # ✅ 完整分析报告
    ├── LOGISTICS_QUICK_GUIDE.md                  # ✅ 快速指南
    ├── LOGISTICS_FLOW_DIAGRAM.md                 # ✅ 流程图
    └── LOGISTICS_FILE_INDEX.md                   # 👈 本文件
```

---

## 详细文件说明

### 后端代码 (Backend)

#### 1. Logistics.java (物流实体)
**位置**: `springboot/src/main/java/org/example/springboot/entity/Logistics.java`

**用途**: 定义物流信息的数据模型

**关键字段**:
- `id`: 物流ID (主键)
- `orderId`: 订单ID (外键)
- `companyName`: 快递公司名称
- `trackingNumber`: 快递单号
- `status`: 物流状态 (0-3)
- `receiverName/Phone/Address`: 收货信息
- `expectedArrivalTime`: 预计到达时间
- `createdAt/updatedAt`: 时间戳

**重要注解**:
```java
@TableId(type = IdType.AUTO)        // 自增主键
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")  // 日期格式
@TableField(exist = false)          // order对象，不映射到数据库
```

---

#### 2. LogisticsController.java (物流控制器)
**位置**: `springboot/src/main/java/org/example/springboot/controller/LogisticsController.java`

**用途**: 处理HTTP请求，转发给Service

**主要端点**:
```java
@PostMapping              // 创建物流
@PutMapping("/{id}/status")      // 更新状态
@GetMapping("/{id}")             // 根据物流ID查询
@GetMapping("/order/{orderId}")  // 根据订单ID查询
@GetMapping("/page")             // 分页查询
@PutMapping("/{id}/sign")        // 签收
@DeleteMapping("/{id}")          // 删除
@DeleteMapping("/batch")         // 批量删除
```

**核心方法**:
```java
createLogistics()      // POST /logistics - 创建物流
updateLogisticsStatus()// PUT /logistics/{id}/status - 更新状态
getLogisticsByOrderId()// GET /logistics/order/{orderId} - 查询物流
signLogistics()        // PUT /logistics/{id}/sign - 签收
```

---

#### 3. LogisticsService.java (物流服务)
**位置**: `springboot/src/main/java/org/example/springboot/service/LogisticsService.java`

**用途**: 实现物流业务逻辑

**核心业务方法**:

```java
createLogistics(Logistics logistics)
// 创建物流信息
// ├─ 验证订单存在且已支付
// ├─ 验证必填字段
// ├─ 设置物流状态为1
// ├─ 插入数据库
// └─ 更新订单状态为2

getLogisticsByOrderId(Long orderId)
// 根据订单ID获取物流
// ├─ 查询物流表
// ├─ 填充订单对象
// └─ 返回物流信息

updateLogisticsStatus(Long id, Integer status)
// 更新物流状态
// ├─ 根据状态映射订单状态
// └─ 同时更新订单

signLogistics(Long id)
// 物流签收
// ├─ 更新物流状态为2
// └─ 更新订单状态为3

getLogisticsByPage(...)
// 分页查询
// ├─ 支持按订单ID、状态、商户ID筛选
// ├─ 填充关联信息
// └─ 按创建时间倒序
```

**关键特性**:
- 物流与订单状态自动同步
- 状态转换映射逻辑
- 字段验证和业务规则检查
- 日志记录

---

#### 4. LogisticsMapper.java (数据访问层)
**位置**: `springboot/src/main/java/org/example/springboot/mapper/LogisticsMapper.java`

**用途**: 数据库操作接口

**代码**:
```java
@Mapper
public interface LogisticsMapper extends BaseMapper<Logistics> {
}
```

**继承方法** (来自MyBatisPlus BaseMapper):
- `selectById(id)`: 按ID查询
- `selectOne(queryWrapper)`: 按条件查询单条
- `selectPage(page, queryWrapper)`: 分页查询
- `insert(entity)`: 插入
- `updateById(entity)`: 更新
- `deleteById(id)`: 删除
- `deleteBatchIds(ids)`: 批量删除

---

#### 5. OrderController.java (订单控制器)
**位置**: `springboot/src/main/java/org/example/springboot/controller/OrderController.java`

**涉及物流的方法**:
```java
@GetMapping("/{id}/logistics")
public Result<?> getOrderLogistics(@PathVariable Long id) {
    return orderService.getOrderLogistics(id);
}
```

**用途**: 用户查看订单物流时调用

---

#### 6. OrderService.java (订单服务)
**位置**: `springboot/src/main/java/org/example/springboot/service/OrderService.java`

**涉及物流的方法**:
```java
public Result<?> getOrderLogistics(Long orderId) {
    // 检查订单是否存在
    Order order = orderMapper.selectById(orderId);
    if (order == null) {
        return Result.error("-1", "未找到订单");
    }

    // 查询物流信息
    LambdaQueryWrapper<Logistics> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.eq(Logistics::getOrderId, orderId);
    Logistics logistics = logisticsMapper.selectOne(queryWrapper);
    
    if (logistics != null) {
        // 填充关联信息
        logistics.setOrder(order);
        return Result.success(logistics);
    }
    return Result.error("-1", "未找到物流信息");
}
```

---

### 前端代码 (Frontend)

#### 1. Order.vue (用户订单页面)
**位置**: `newvue/src/views/customer/Order.vue`

**用途**: 展示用户订单列表，提供查看物流功能

**关键代码**:

```vue
<!-- 查看物流按钮 (仅当订单已发货时显示) -->
<el-button
  v-if="order.status === 2"
  @click="viewLogistics(order)"
>
  查看物流
</el-button>

<!-- 物流详情对话框 -->
<el-dialog
  title="物流详情"
  :visible.sync="logisticsVisible"
>
  <div v-if="logisticsData">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="物流公司">{{ logisticsData.companyName }}</el-descriptions-item>
      <el-descriptions-item label="运单号">{{ logisticsData.trackingNumber }}</el-descriptions-item>
      <el-descriptions-item label="物流状态">
        <el-tag :type="getLogisticsStatusType(logisticsData.status)">
          {{ getLogisticsStatusText(logisticsData.status) }}
        </el-tag>
      </el-descriptions-item>
      ...
    </el-descriptions>
  </div>
</el-dialog>
```

**关键方法**:

```javascript
async viewLogistics(order) {
  this.logisticsVisible = true
  this.logisticsLoading = true
  this.logisticsData = null
  try {
    const res = await getOrderLogistics(order.id)
    if (res.code === '0' && res.data) {
      this.logisticsData = res.data
    }
  } catch (error) {
    this.$message.error('加载物流信息失败')
  } finally {
    this.logisticsLoading = false
  }
}

getLogisticsStatusText(status) {
  const map = { 0: '待发货', 1: '运输中', 2: '已签收', 3: '已取消' }
  return map[status] || '未知'
}

getLogisticsStatusType(status) {
  const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}
```

**数据结构**:
```javascript
data() {
  return {
    orders: [],              // 订单列表
    logisticsVisible: false, // 物流对话框显示状态
    logisticsLoading: false, // 物流加载状态
    logisticsData: null,     // 物流数据
    ...
  }
}
```

---

#### 2. OrderManagement.vue (管理员订单管理)
**位置**: `newvue/src/views/admin/OrderManagement.vue`

**用途**: 管理员发货，填写物流信息

**关键代码**:

```vue
<!-- 发货按钮 -->
<el-button
  v-if="row.status === 1"
  @click="handleShip(row)"
>
  发货
</el-button>

<!-- 物流表单对话框 -->
<el-dialog
  title="添加物流信息"
  :visible.sync="logisticsDialogVisible"
>
  <el-form :model="logisticsForm" :rules="logisticsRules">
    <el-form-item label="物流公司" prop="company">
      <el-select v-model="logisticsForm.company">
        <el-option label="顺丰速运" value="顺丰速运"></el-option>
        <el-option label="中通快递" value="中通快递"></el-option>
        ...
      </el-select>
    </el-form-item>
    <el-form-item label="运单号" prop="trackingNumber">
      <el-input v-model="logisticsForm.trackingNumber"></el-input>
    </el-form-item>
    <el-form-item label="预计到达时间" prop="expectedArrivalTime">
      <el-date-picker v-model="logisticsForm.expectedArrivalTime" type="datetime"></el-date-picker>
    </el-form-item>
  </el-form>
</el-dialog>
```

**关键方法**:

```javascript
handleShip(row) {
  this.currentOrder = row
  this.logisticsForm = { company: '', trackingNumber: '', expectedArrivalTime: null }
  this.logisticsDialogVisible = true
}

async submitLogistics() {
  // 表单验证
  // 调用addLogistics API
  await addLogistics(this.currentOrder.id, {
    companyName: this.logisticsForm.company,
    trackingNumber: this.logisticsForm.trackingNumber,
    expectedArrivalTime: this.logisticsForm.expectedArrivalTime,
    ...
  })
  // 刷新列表
  this.loadOrders()
}
```

---

#### 3. OrderDetail.vue (订单详情组件)
**位置**: `newvue/src/components/customer/OrderDetail.vue`

**用途**: 展示订单详细信息，包括物流信息

**涉及物流的部分**:

```vue
<!-- 物流信息显示 -->
<div v-if="order.logistics" class="detail-section">
  <h3 class="section-title">物流信息</h3>
  <div class="logistics-info">
    <p><strong>物流公司：</strong>{{ order.logistics.companyName || order.logistics.company }}</p>
    <p><strong>运单号：</strong>{{ order.logistics.trackingNumber }}</p>
    <p><strong>物流状态：</strong>
      <el-tag :type="getLogisticsStatusType(order.logistics.status)">
        {{ getLogisticsStatusText(order.logistics.status) }}
      </el-tag>
    </p>
    ...
  </div>
</div>
```

---

#### 4. order.js (API文件)
**位置**: `newvue/src/api/order.js`

**用途**: 定义所有订单相关的API调用

**涉及物流的函数**:

```javascript
/**
 * 获取订单物流信息
 * @param {number} orderId - Order ID
 * @returns {Promise}
 */
export function getOrderLogistics(orderId) {
    return request({
        url: `/order/${orderId}/logistics`,
        method: 'get'
    })
}

/**
 * 添加物流信息
 * @param {number} orderId - Order ID
 * @param {Object} data - Logistics data
 * @returns {Promise}
 */
export function addLogistics(orderId, data) {
    return request({
        url: '/logistics',
        method: 'post',
        data: {
            orderId,
            ...data
        }
    })
}

/**
 * 更新物流状态
 * @param {number} logisticsId - Logistics ID
 * @param {number} status - Logistics status
 * @returns {Promise}
 */
export function updateLogistics(logisticsId, status) {
    return request({
        url: `/logistics/${logisticsId}/status`,
        method: 'put',
        params: { status }
    })
}
```

---

### 数据库 (Database)

#### db_aps.sql (数据库SQL文件)
**位置**: `sql/db_aps.sql`

**涉及物流的部分**:

```sql
-- 物流表定义
CREATE TABLE `logistics` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '物流ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `receiver_name` varchar(50) NOT NULL COMMENT '收货人姓名',
  `receiver_phone` varchar(20) NOT NULL COMMENT '收货人电话',
  `receiver_address` varchar(255) NOT NULL COMMENT '收货地址',
  `company_name` varchar(50) NOT NULL COMMENT '物流公司名称',
  `tracking_number` varchar(50) NOT NULL COMMENT '物流单号',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '物流状态:0待发货,1已发货,2已签收,3已取消',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expected_arrival_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_tracking_number` (`tracking_number`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '物流信息表';

-- 示例数据
INSERT INTO `logistics` VALUES 
(3, 114, 'jx', '15252393509', '15816165', '中通快递', '11111', 1, '2025-04-01 23:37:28', '2025-04-01 23:37:28', NULL),
(4, 42, '张农夫', '13800138004', '广州市天河区某街道4号', '圆通快递', '111111', 1, '2025-04-01 23:38:58', '2025-04-01 23:38:58', NULL),
...;
```

---

## 代码调用链路

### 场景1: 用户查看物流

```
Order.vue
  └─ viewLogistics(order)
     └─ getOrderLogistics(order.id)  [order.js]
        └─ GET /order/{orderId}/logistics
           └─ OrderController.getOrderLogistics(id)
              └─ OrderService.getOrderLogistics(orderId)
                 ├─ orderMapper.selectById(orderId)
                 ├─ logisticsMapper.selectOne(queryWrapper)
                 └─ return Result<Logistics>
                    └─ 显示物流详情对话框
```

### 场景2: 管理员发货

```
OrderManagement.vue
  └─ submitLogistics()
     └─ addLogistics(orderId, data)  [order.js]
        └─ POST /logistics
           └─ LogisticsController.createLogistics(logistics)
              └─ LogisticsService.createLogistics(logistics)
                 ├─ 验证订单状态
                 ├─ logisticsMapper.insert(logistics)
                 ├─ orderMapper.updateById(order)  [status=2]
                 └─ return Result<Logistics>
                    └─ 刷新订单列表
```

---

## 快速参考

### 状态码定义

**物流状态** (logistics.status):
| 值 | 含义 | UI | 订单状态 |
|-|-|-|-|
| 0 | 待发货 | info | 1 |
| 1 | 已发货 | primary | 2 |
| 2 | 已签收 | success | 3 |
| 3 | 已取消 | danger | 4 |

**订单状态** (order.status):
| 值 | 含义 | 物流操作 |
|-|-|-|
| 0 | 待支付 | 无 |
| 1 | 已支付 | 可发货 |
| 2 | 已发货 | 物流存在 |
| 3 | 已完成 | 物流已签收 |
| 4 | 已取消 | 物流已取消 |
| 5+ | 退款/售后 | - |

---

## 文件大小统计

```
后端文件:
  Logistics.java              ~30 行
  LogisticsController.java    ~56 行
  LogisticsService.java       ~284 行
  LogisticsMapper.java        ~8 行
  OrderController.java        (包含getOrderLogistics)
  OrderService.java           (包含getOrderLogistics)

前端文件:
  Order.vue                   ~760 行
  OrderManagement.vue         ~300+ 行
  OrderDetail.vue             ~540 行
  order.js                    ~190 行

数据库文件:
  db_aps.sql                  (包含logistics表)

总计: 物流相关代码约 2000+ 行
```

---

## 推荐学习路径

1. **理解数据模型**
   - 阅读 `Logistics.java`
   - 查看 `sql/db_aps.sql` 中的表定义

2. **学习后端逻辑**
   - `LogisticsService.java` - 核心业务逻辑
   - `LogisticsController.java` - HTTP接口定义
   - `LogisticsMapper.java` - 数据访问

3. **理解前端交互**
   - `Order.vue` - 用户查看物流
   - `OrderManagement.vue` - 管理员发货
   - `order.js` - API调用

4. **跟踪完整流程**
   - 从用户点击"查看物流"开始
   - 追踪API调用 → Controller → Service → Mapper → Database
   - 理解状态同步机制

---

## 常见问题排查

**Q: 物流信息查不到?**
- 检查 `logistics` 表中是否有对应 `order_id` 的记录
- 确认 `LogisticsMapper.selectOne()` 的SQL语句

**Q: 订单状态没有更新?**
- 检查 `LogisticsService.createLogistics()` 中 `orderMapper.updateById(order)` 是否执行
- 检查事务配置

**Q: 查看物流按钮不显示?**
- 检查 `Order.vue` 中 `v-if="order.status === 2"` 的条件
- 确认订单状态确实为2

