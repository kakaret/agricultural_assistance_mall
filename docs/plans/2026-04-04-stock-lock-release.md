# 库存锁定与释放功能 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现下单时锁定库存、支付时确认扣减、取消/删除订单时释放库存的完整库存协同机制。

**Architecture:** 在 `createOrder()` 中下单时立即扣减库存（锁定），在 `payOrder()` 中移除重复扣减逻辑，在 `deleteOrder()` 和 `updateOrderStatus(取消)` 中恢复库存（释放）。采用最小改动原则，只修改 `OrderService.java` 一个文件。

**Tech Stack:** Spring Boot, MyBatis-Plus, Java 17

---

### Task 1: 下单时扣减库存（锁定库存）

**Files:**
- Modify: `springboot/src/main/java/org/example/springboot/service/OrderService.java:46-73`

**问题：** `createOrder()` 第63行有注释 `// 更新商品库存` 但没有实际代码，下单时只检查库存不扣减。

- [ ] **Step 1: 修复 createOrder 方法，下单时扣减库存**

在 `OrderService.java` 的 `createOrder()` 方法中，第62-64行处，补充库存扣减逻辑：

将原来的代码：
```java
            if (result > 0) {
                // 更新商品库存

                LOGGER.info("创建订单成功，订单ID：{}", order.getId());
                return Result.success(order);
            }
```

替换为：
```java
            if (result > 0) {
                // 下单时扣减库存（锁定库存）
                product.setStock(product.getStock() - order.getQuantity());
                productMapper.updateById(product);

                LOGGER.info("创建订单成功，订单ID：{}，已锁定库存：{}", order.getId(), order.getQuantity());
                return Result.success(order);
            }
```

- [ ] **Step 2: 为 createOrder 添加 @Transactional 注解**

`createOrder()` 方法当前没有 `@Transactional`，需要添加，确保订单创建和库存扣减在同一事务中。

将：
```java
    public Result<?> createOrder(Order order) {
```

替换为：
```java
    @Transactional
    public Result<?> createOrder(Order order) {
```

- [ ] **Step 3: 验证修改**

启动应用，创建一个订单，检查：
1. 订单创建成功
2. 商品库存减少了对应数量

---

### Task 2: 修改支付逻辑，移除重复扣减

**Files:**
- Modify: `springboot/src/main/java/org/example/springboot/service/OrderService.java:257-283`

**问题：** 既然下单时已经扣减库存，`payOrder()` 中就不应再扣减，否则会双重扣减。只保留增加销量和状态更新。

- [ ] **Step 1: 修改 payOrder 方法**

将原来的代码（第257-283行）：
```java
    @Transactional
    public Result<?> payOrder(Long id){

            Order order = orderMapper.selectById(id);
            if (order == null) {
                return Result.error("-1", "未找到订单");
            }else{

                Product product=productMapper.selectById(order.getProductId());
                if (product!=null){
                    if(product.getStock()<order.getQuantity()){
                        return Result.error("-1", "库存不足");
                    }
                    product.setSalesCount(product.getSalesCount()+order.getQuantity());
                    product.setStock(product.getStock()-order.getQuantity());
                    order.setStatus(1);
                    int res = productMapper.updateById(product);

                    if(res<=0){
                        return  Result.error("-1","支付异常");
                    }
                    updateOrder(order.getId(),order);
                }

            }
        return Result.success();
    }
```

替换为：
```java
    @Transactional
    public Result<?> payOrder(Long id){
        Order order = orderMapper.selectById(id);
        if (order == null) {
            return Result.error("-1", "未找到订单");
        }
        if (order.getStatus() != 0) {
            return Result.error("-1", "订单状态不允许支付");
        }

        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            // 库存已在下单时扣减，此处只增加销量
            product.setSalesCount(product.getSalesCount() + order.getQuantity());
            int res = productMapper.updateById(product);
            if (res <= 0) {
                return Result.error("-1", "支付异常");
            }
        }

        order.setStatus(1);
        updateOrder(order.getId(), order);
        LOGGER.info("订单支付成功，订单ID：{}，增加销量：{}", id, order.getQuantity());
        return Result.success();
    }
```

- [ ] **Step 2: 验证修改**

启动应用，支付一个订单，检查：
1. 订单状态变为1（已支付）
2. 销量增加
3. 库存**没有**再次减少（因为下单时已扣减）

---

### Task 3: 取消订单时释放库存

**Files:**
- Modify: `springboot/src/main/java/org/example/springboot/service/OrderService.java:75-113`

**问题：** `updateOrderStatus()` 在订单取消（status=4）时不恢复库存，也不减销量。

- [ ] **Step 1: 在 updateOrderStatus 中增加取消订单的库存释放逻辑**

在 `updateOrderStatus()` 方法中，第84行 `int result = orderMapper.updateById(order);` 之前，添加取消订单的库存恢复逻辑：

在 `order.setStatus(status);` 之后、`int result = orderMapper.updateById(order);` 之前，插入以下代码：

```java
            // 如果是取消订单，释放库存
            if (status == 4) {
                // 只有待支付(0)和已支付(1)的订单取消时需要恢复库存
                if (order.getLastStatus() == 0 || order.getLastStatus() == null) {
                    // 待支付状态取消：恢复库存（下单时已扣减）
                    Product product = productMapper.selectById(order.getProductId());
                    if (product != null) {
                        product.setStock(product.getStock() + order.getQuantity());
                        productMapper.updateById(product);
                        LOGGER.info("取消订单释放库存，订单ID：{}，恢复数量：{}", id, order.getQuantity());
                    }
                } else if (order.getLastStatus() == 1) {
                    // 已支付状态取消：恢复库存 + 减少销量
                    Product product = productMapper.selectById(order.getProductId());
                    if (product != null) {
                        product.setStock(product.getStock() + order.getQuantity());
                        if (product.getSalesCount() >= order.getQuantity()) {
                            product.setSalesCount(product.getSalesCount() - order.getQuantity());
                        }
                        productMapper.updateById(product);
                        LOGGER.info("取消已支付订单，恢复库存并减少销量，订单ID：{}", id);
                    }
                }
            }
```

- [ ] **Step 2: 为 updateOrderStatus 添加 @Transactional 注解**

`updateOrderStatus()` 方法当前没有 `@Transactional`，需要添加：

将：
```java
    public Result<?> updateOrderStatus(Long id, Integer status) {
```

替换为：
```java
    @Transactional
    public Result<?> updateOrderStatus(Long id, Integer status) {
```

- [ ] **Step 3: 验证修改**

测试取消一个待支付订单，检查：
1. 订单状态变为4（已取消）
2. 库存恢复了对应数量

---

### Task 4: 删除订单时释放库存

**Files:**
- Modify: `springboot/src/main/java/org/example/springboot/service/OrderService.java:116-130`

**问题：** `deleteOrder()` 删除订单时不检查状态、不恢复库存。

- [ ] **Step 1: 修改 deleteOrder 方法，删除待支付订单时恢复库存**

将原来的代码：
```java
    public Result<?> deleteOrder(Long id) {
        try {
            deleteRelation(id);
            int result = orderMapper.deleteById(id);

            if (result > 0) {
                LOGGER.info("删除订单成功，订单ID：{}", id);
                return Result.success();
            }
            return Result.error("-1", "删除订单失败");
        } catch (Exception e) {
            LOGGER.error("删除订单失败：{}", e.getMessage());
            return Result.error("-1", "删除订单失败：" + e.getMessage());
        }
    }
```

替换为：
```java
    @Transactional
    public Result<?> deleteOrder(Long id) {
        try {
            Order order = orderMapper.selectById(id);
            if (order == null) {
                return Result.error("-1", "未找到订单");
            }

            // 如果订单是待支付状态(0)，删除时释放库存
            if (order.getStatus() == 0) {
                Product product = productMapper.selectById(order.getProductId());
                if (product != null) {
                    product.setStock(product.getStock() + order.getQuantity());
                    productMapper.updateById(product);
                    LOGGER.info("删除待支付订单，释放库存，订单ID：{}，恢复数量：{}", id, order.getQuantity());
                }
            }

            deleteRelation(id);
            int result = orderMapper.deleteById(id);

            if (result > 0) {
                LOGGER.info("删除订单成功，订单ID：{}", id);
                return Result.success();
            }
            return Result.error("-1", "删除订单失败");
        } catch (Exception e) {
            LOGGER.error("删除订单失败：{}", e.getMessage());
            return Result.error("-1", "删除订单失败：" + e.getMessage());
        }
    }
```

- [ ] **Step 2: 验证修改**

测试删除一个待支付订单，检查：
1. 订单成功删除
2. 库存恢复了对应数量

---

## 修改影响总结

| 场景 | 修改前 | 修改后 |
|------|--------|--------|
| **下单** | 只检查库存，不扣减 | 检查库存 + 立即扣减（锁定） |
| **支付** | 再次检查并扣减库存 + 增加销量 | 只增加销量（库存已在下单时扣减） |
| **取消订单** | 不做库存操作 | 恢复库存（释放），已支付的还减销量 |
| **删除待支付订单** | 不做库存操作 | 恢复库存（释放） |
| **退款** | 恢复库存 + 减销量 | 不变（保持现有逻辑） |

**只修改 1 个文件：** `OrderService.java`
