package org.example.springboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.springboot.common.Result;
import org.example.springboot.entity.Product;
import org.example.springboot.entity.StockIn;
import org.example.springboot.entity.StockOut;
import org.example.springboot.mapper.ProductMapper;
import org.example.springboot.mapper.StockInMapper;
import org.example.springboot.mapper.StockOutMapper;
import org.example.springboot.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.*;

@Service
public class StockService {
    private static final Logger LOGGER = LoggerFactory.getLogger(StockService.class);

    @Autowired
    private StockInMapper stockInMapper;

    @Autowired
    private StockOutMapper stockOutMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * 获取某商品的操作历史（合并入库+出库记录），按时间倒序、手动分页返回
     */
    public Map<String, Object> getProductStockHistory(Long productId, Integer currentPage, Integer size) {
        // 查询该商品的所有入库记录
        LambdaQueryWrapper<StockIn> inWrapper = new LambdaQueryWrapper<>();
        inWrapper.eq(StockIn::getProductId, productId).orderByDesc(StockIn::getCreatedAt);
        List<StockIn> stockIns = stockInMapper.selectList(inWrapper);

        // 查询该商品的所有出库记录
        LambdaQueryWrapper<StockOut> outWrapper = new LambdaQueryWrapper<>();
        outWrapper.eq(StockOut::getProductId, productId).orderByDesc(StockOut::getCreatedAt);
        List<StockOut> stockOuts = stockOutMapper.selectList(outWrapper);

        // 合并为统一格式的列表
        List<Map<String, Object>> allRecords = new ArrayList<>();

        for (StockIn si : stockIns) {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("id", si.getId());
            record.put("type", "IN");
            record.put("quantity", si.getQuantity());
            record.put("unitPrice", si.getUnitPrice());
            record.put("totalPrice", si.getTotalPrice());
            record.put("remark", si.getRemark());
            record.put("status", si.getStatus());
            record.put("createdAt", si.getCreatedAt());
            // 填充操作人名称
            if (si.getOperatorId() != null) {
                var user = userMapper.selectById(si.getOperatorId());
                record.put("operatorName", user != null ? user.getName() : String.valueOf(si.getOperatorId()));
            } else {
                record.put("operatorName", "-");
            }
            allRecords.add(record);
        }

        for (StockOut so : stockOuts) {
            Map<String, Object> record = new LinkedHashMap<>();
            record.put("id", so.getId());
            record.put("type", "OUT");
            record.put("quantity", so.getQuantity());
            record.put("unitPrice", so.getUnitPrice());
            record.put("totalPrice", so.getTotalPrice());
            record.put("remark", so.getRemark());
            record.put("status", so.getStatus());
            record.put("createdAt", so.getCreatedAt());
            // 填充操作人名称
            if (so.getOperatorId() != null) {
                var user = userMapper.selectById(so.getOperatorId());
                record.put("operatorName", user != null ? user.getName() : String.valueOf(so.getOperatorId()));
            } else {
                record.put("operatorName", "-");
            }
            allRecords.add(record);
        }

        // 按 createdAt 倒序排序
        allRecords.sort((a, b) -> {
            Timestamp ta = (Timestamp) a.get("createdAt");
            Timestamp tb = (Timestamp) b.get("createdAt");
            if (ta == null && tb == null) return 0;
            if (ta == null) return 1;
            if (tb == null) return -1;
            return tb.compareTo(ta);
        });

        // 手动分页
        int total = allRecords.size();
        int fromIndex = (currentPage - 1) * size;
        int toIndex = Math.min(fromIndex + size, total);
        List<Map<String, Object>> pageRecords = (fromIndex < total) ? allRecords.subList(fromIndex, toIndex) : new ArrayList<>();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", pageRecords);
        result.put("total", total);
        result.put("current", currentPage);
        result.put("size", size);

        return result;
    }

    @Transactional
    public Result<?> createStockIn(StockIn stockIn) {
        try {
            // 检查商品是否存在
            Product product = productMapper.selectById(stockIn.getProductId());
            if (product == null) {
                return Result.error("-1", "商品不存在");
            }

            // 计算总价
            stockIn.setTotalPrice(stockIn.getUnitPrice().multiply(new BigDecimal(stockIn.getQuantity())));

            // 更新商品库存
            product.setStock(product.getStock() + stockIn.getQuantity());
            productMapper.updateById(product);

            // 保存入库记录
            int result = stockInMapper.insert(stockIn);
            if (result > 0) {
                LOGGER.info("创建入库记录成功，入库ID：{}", stockIn.getId());
                return Result.success(stockIn);
            }
            return Result.error("-1", "创建入库记录失败");
        } catch (Exception e) {
            LOGGER.error("创建入库记录失败：{}", e.getMessage());
            return Result.error("-1", "创建入库记录失败：" + e.getMessage());
        }
    }

    @Transactional
    public Result<?> createStockOut(StockOut stockOut) {
        try {
            // 检查商品是否存在
            Product product = productMapper.selectById(stockOut.getProductId());
            if (product == null) {
                return Result.error("-1", "商品不存在");
            }

            // 检查库存是否足够
            if (product.getStock() < stockOut.getQuantity()) {
                return Result.error("-1", "库存不足");
            }

            // 计算总价
            stockOut.setTotalPrice(stockOut.getUnitPrice().multiply(new BigDecimal(stockOut.getQuantity())));

            // 更新商品库存
            product.setStock(product.getStock() - stockOut.getQuantity());
            productMapper.updateById(product);

            // 保存出库记录
            int result = stockOutMapper.insert(stockOut);
            if (result > 0) {
                LOGGER.info("创建出库记录成功，出库ID：{}", stockOut.getId());
                return Result.success(stockOut);
            }
            return Result.error("-1", "创建出库记录失败");
        } catch (Exception e) {
            LOGGER.error("创建出库记录失败：{}", e.getMessage());
            return Result.error("-1", "创建出库记录失败：" + e.getMessage());
        }
    }

    // 获取入库记录列表
    public Page<StockIn> getStockInList(Long productId, String supplier, Integer status, Long operatorId,
                                      Integer currentPage, Integer size) {
        LambdaQueryWrapper<StockIn> queryWrapper = new LambdaQueryWrapper<>();
        
        if (productId != null) {
            queryWrapper.eq(StockIn::getProductId, productId);
        }
        if (supplier != null) {
            queryWrapper.like(StockIn::getSupplier, supplier);
        }
        if (status != null) {
            queryWrapper.eq(StockIn::getStatus, status);
        }
        if (operatorId != null) {
            queryWrapper.eq(StockIn::getOperatorId, operatorId);
        }

        queryWrapper.orderByDesc(StockIn::getId);

        Page<StockIn> page = new Page<>(currentPage, size);
        Page<StockIn> result = stockInMapper.selectPage(page, queryWrapper);

        // 填充关联信息
        result.getRecords().forEach(stockIn -> {
            stockIn.setProduct(productMapper.selectById(stockIn.getProductId()));
            stockIn.setOperator(userMapper.selectById(stockIn.getOperatorId()));
        });

        return result;
    }

    // 获取出库记录列表
    public Page<StockOut> getStockOutList(Long productId, Integer type, Integer status, Long operatorId,
                                        String customerName, String orderNo,
                                        Integer currentPage, Integer size) {
        LambdaQueryWrapper<StockOut> queryWrapper = new LambdaQueryWrapper<>();
        
        if (productId != null) {
            queryWrapper.eq(StockOut::getProductId, productId);
        }
        if (type != null) {
            queryWrapper.eq(StockOut::getType, type);
        }
        if (status != null) {
            queryWrapper.eq(StockOut::getStatus, status);
        }
        if (operatorId != null) {
            queryWrapper.eq(StockOut::getOperatorId, operatorId);
        }
        if (customerName != null) {
            queryWrapper.like(StockOut::getCustomerName, customerName);
        }
        if (orderNo != null) {
            queryWrapper.eq(StockOut::getOrderNo, orderNo);
        }

        queryWrapper.orderByDesc(StockOut::getId);

        Page<StockOut> page = new Page<>(currentPage, size);
        Page<StockOut> result = stockOutMapper.selectPage(page, queryWrapper);

        // 填充关联信息
        result.getRecords().forEach(stockOut -> {
            stockOut.setProduct(productMapper.selectById(stockOut.getProductId()));
            stockOut.setOperator(userMapper.selectById(stockOut.getOperatorId()));
        });

        return result;
    }

    // 作废入库记录
    @Transactional
    public Result<?> invalidateStockIn(Long id) {
        try {
            StockIn stockIn = stockInMapper.selectById(id);
            if (stockIn == null) {
                return Result.error("-1", "入库记录不存在");
            }

            if (stockIn.getStatus() == 0) {
                return Result.error("-1", "该记录已作废");
            }

            // 更新商品库存
            Product product = productMapper.selectById(stockIn.getProductId());
            if (product != null) {
                product.setStock(product.getStock() - stockIn.getQuantity());
                productMapper.updateById(product);
            }

            // 更新入库记录状态
            stockIn.setStatus(0);
            stockInMapper.updateById(stockIn);

            return Result.success();
        } catch (Exception e) {
            LOGGER.error("作废入库记录失败：{}", e.getMessage());
            return Result.error("-1", "作废入库记录失败：" + e.getMessage());
        }
    }

    // 作废出库记录
    @Transactional
    public Result<?> invalidateStockOut(Long id) {
        try {
            StockOut stockOut = stockOutMapper.selectById(id);
            if (stockOut == null) {
                return Result.error("-1", "出库记录不存在");
            }

            if (stockOut.getStatus() == 0) {
                return Result.error("-1", "该记录已作废");
            }

            // 更新商品库存
            Product product = productMapper.selectById(stockOut.getProductId());
            if (product != null) {
                product.setStock(product.getStock() + stockOut.getQuantity());
                productMapper.updateById(product);
            }

            // 更新出库记录状态
            stockOut.setStatus(0);
            stockOutMapper.updateById(stockOut);

            return Result.success();
        } catch (Exception e) {
            LOGGER.error("作废出库记录失败：{}", e.getMessage());
            return Result.error("-1", "作废出库记录失败：" + e.getMessage());
        }
    }

    // 删除入库记录
    @Transactional
    public Result<?> deleteStockIn(Long id) {
        try {
            StockIn stockIn = stockInMapper.selectById(id);
            if (stockIn == null) {
                return Result.error("-1", "入库记录不存在");
            }

            // 如果记录状态为正常，需要先作废（减少库存）
            if (stockIn.getStatus() == 1) {
                Result<?> invalidateResult = invalidateStockIn(id);
                if (!invalidateResult.getCode().equals("0")) {
                    return invalidateResult;
                }
            }

            // 删除记录
            int result = stockInMapper.deleteById(id);
            if (result > 0) {
                LOGGER.info("删除入库记录成功，入库ID：{}", id);
                return Result.success();
            }
            return Result.error("-1", "删除入库记录失败");
        } catch (Exception e) {
            LOGGER.error("删除入库记录失败：{}", e.getMessage());
            return Result.error("-1", "删除入库记录失败：" + e.getMessage());
        }
    }

    // 删除出库记录
    @Transactional
    public Result<?> deleteStockOut(Long id) {
        try {
            StockOut stockOut = stockOutMapper.selectById(id);
            if (stockOut == null) {
                return Result.error("-1", "出库记录不存在");
            }

            // 如果记录状态为正常，需要先作废（恢复库存）
            if (stockOut.getStatus() == 1) {
                Result<?> invalidateResult = invalidateStockOut(id);
                if (!invalidateResult.getCode().equals("0")) {
                    return invalidateResult;
                }
            }

            // 删除记录
            int result = stockOutMapper.deleteById(id);
            if (result > 0) {
                LOGGER.info("删除出库记录成功，出库ID：{}", id);
                return Result.success();
            }
            return Result.error("-1", "删除出库记录失败");
        } catch (Exception e) {
            LOGGER.error("删除出库记录失败：{}", e.getMessage());
            return Result.error("-1", "删除出库记录失败：" + e.getMessage());
        }
    }
} 