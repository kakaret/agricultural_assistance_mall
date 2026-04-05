package org.example.springboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.springboot.common.Result;
import org.example.springboot.entity.*;
import org.example.springboot.mapper.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AfterSalesService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AfterSalesService.class);

    @Autowired
    private AfterSalesMapper afterSalesMapper;
    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private ProductMapper productMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private LogisticsMapper logisticsMapper;

    /**
     * 买家提交售后申请
     */
    @Transactional
    public Result<?> apply(AfterSales afterSales) {
        try {
            // 校验订单
            Order order = orderMapper.selectById(afterSales.getOrderId());
            if (order == null) {
                return Result.error("-1", "订单不存在");
            }
            // 只有待发货(1)、已发货(2)、已完成(3)的订单才能申请售后
            if (order.getStatus() != 1 && order.getStatus() != 2 && order.getStatus() != 3) {
                return Result.error("-1", "当前订单状态不允许申请售后");
            }
            // 校验买家身份
            if (!order.getUserId().equals(afterSales.getUserId())) {
                return Result.error("-1", "无权操作此订单");
            }
            // 检查是否已有进行中的售后工单
            LambdaQueryWrapper<AfterSales> existWrapper = new LambdaQueryWrapper<>();
            existWrapper.eq(AfterSales::getOrderId, afterSales.getOrderId())
                    .in(AfterSales::getStatus, Arrays.asList(0, 1, 4));
            Long count = afterSalesMapper.selectCount(existWrapper);
            if (count > 0) {
                return Result.error("-1", "该订单已有进行中的售后工单");
            }

            // 获取商户ID
            Product product = productMapper.selectById(order.getProductId());
            if (product == null) {
                return Result.error("-1", "商品不存在");
            }
            afterSales.setMerchantId(product.getMerchantId());
            afterSales.setStatus(0); // 待审核

            int result = afterSalesMapper.insert(afterSales);
            if (result > 0) {
                // 更新订单状态为退款中
                order.setLastStatus(order.getStatus());
                order.setStatus(5);
                orderMapper.updateById(order);

                LOGGER.info("售后申请提交成功，工单ID：{}，订单ID：{}", afterSales.getId(), afterSales.getOrderId());
                return Result.success(afterSales);
            }
            return Result.error("-1", "提交售后申请失败");
        } catch (Exception e) {
            LOGGER.error("提交售后申请失败：{}", e.getMessage());
            return Result.error("-1", "提交售后申请失败：" + e.getMessage());
        }
    }

    /**
     * 分页查询售后工单
     */
    public Result<?> getByPage(Long userId, Long merchantId, Integer status, Integer currentPage, Integer size) {
        LambdaQueryWrapper<AfterSales> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(AfterSales::getUserId, userId);
        }
        if (merchantId != null) {
            wrapper.eq(AfterSales::getMerchantId, merchantId);
        }
        if (status != null) {
            wrapper.eq(AfterSales::getStatus, status);
        }
        wrapper.orderByDesc(AfterSales::getCreatedAt);

        Page<AfterSales> page = new Page<>(currentPage, size);
        Page<AfterSales> result = afterSalesMapper.selectPage(page, wrapper);

        // 填充关联信息
        result.getRecords().forEach(this::fillRelations);

        return Result.success(result);
    }

    /**
     * 获取售后工单详情
     */
    public Result<?> getById(Long id) {
        AfterSales afterSales = afterSalesMapper.selectById(id);
        if (afterSales == null) {
            return Result.error("-1", "售后工单不存在");
        }
        fillRelations(afterSales);
        return Result.success(afterSales);
    }

    /**
     * 商家同意售后
     */
    @Transactional
    public Result<?> merchantApprove(Long id, Long merchantId, String remark) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (!afterSales.getMerchantId().equals(merchantId)) {
                return Result.error("-1", "无权操作此工单");
            }
            if (afterSales.getStatus() != 0) {
                return Result.error("-1", "当前状态不允许审核");
            }

            afterSales.setMerchantRemark(remark);

            if (afterSales.getType() == 0) {
                // 仅退款：直接完成
                afterSales.setStatus(2);
                afterSalesMapper.updateById(afterSales);
                processRefund(afterSales);
                LOGGER.info("商家同意仅退款，工单ID：{}", id);
            } else {
                // 退货退款：等待买家退货
                afterSales.setStatus(1);
                afterSalesMapper.updateById(afterSales);
                LOGGER.info("商家同意退货退款，等待买家退货，工单ID：{}", id);
            }

            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("商家审核失败：{}", e.getMessage());
            return Result.error("-1", "审核失败：" + e.getMessage());
        }
    }

    /**
     * 商家拒绝售后
     */
    @Transactional
    public Result<?> merchantReject(Long id, Long merchantId, String remark) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (!afterSales.getMerchantId().equals(merchantId)) {
                return Result.error("-1", "无权操作此工单");
            }
            if (afterSales.getStatus() != 0) {
                return Result.error("-1", "当前状态不允许拒绝");
            }

            afterSales.setStatus(3);
            afterSales.setMerchantRemark(remark);
            afterSalesMapper.updateById(afterSales);

            LOGGER.info("商家拒绝售后，工单ID：{}", id);
            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("商家拒绝售后失败：{}", e.getMessage());
            return Result.error("-1", "操作失败：" + e.getMessage());
        }
    }

    /**
     * 买家填写退货物流
     */
    @Transactional
    public Result<?> fillReturnLogistics(Long id, Long userId, String trackingNo, String company) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (!afterSales.getUserId().equals(userId)) {
                return Result.error("-1", "无权操作此工单");
            }
            if (afterSales.getStatus() != 1) {
                return Result.error("-1", "当前状态不需要填写物流");
            }
            if (afterSales.getReturnTrackingNo() != null && !afterSales.getReturnTrackingNo().isEmpty()) {
                return Result.error("-1", "退货物流已填写，不可重复提交");
            }

            afterSales.setReturnTrackingNo(trackingNo);
            afterSales.setReturnCompany(company);
            afterSalesMapper.updateById(afterSales);

            LOGGER.info("买家填写退货物流，工单ID：{}，快递单号：{}", id, trackingNo);
            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("填写退货物流失败：{}", e.getMessage());
            return Result.error("-1", "操作失败：" + e.getMessage());
        }
    }

    /**
     * 商家确认收货并退款
     */
    @Transactional
    public Result<?> merchantConfirmReturn(Long id, Long merchantId) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (!afterSales.getMerchantId().equals(merchantId)) {
                return Result.error("-1", "无权操作此工单");
            }
            if (afterSales.getStatus() != 1) {
                return Result.error("-1", "当前状态不允许确认收货");
            }
            if (afterSales.getReturnTrackingNo() == null || afterSales.getReturnTrackingNo().isEmpty()) {
                return Result.error("-1", "买家尚未填写退货物流");
            }

            afterSales.setStatus(2);
            afterSalesMapper.updateById(afterSales);
            processRefund(afterSales);

            LOGGER.info("商家确认收货并退款，工单ID：{}", id);
            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("确认收货失败：{}", e.getMessage());
            return Result.error("-1", "操作失败：" + e.getMessage());
        }
    }

    /**
     * 买家申诉（商家拒绝后）
     */
    @Transactional
    public Result<?> customerAppeal(Long id, Long userId, String appealReason) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (!afterSales.getUserId().equals(userId)) {
                return Result.error("-1", "无权操作此工单");
            }
            if (afterSales.getStatus() != 3) {
                return Result.error("-1", "当前状态不允许申诉");
            }

            afterSales.setStatus(4);
            afterSales.setAppealReason(appealReason);
            afterSalesMapper.updateById(afterSales);

            LOGGER.info("买家申诉，工单ID：{}", id);
            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("申诉失败：{}", e.getMessage());
            return Result.error("-1", "申诉失败：" + e.getMessage());
        }
    }

    /**
     * Admin仲裁
     * @param supportBuyer true=支持买家(退款), false=支持卖家(关闭)
     */
    @Transactional
    public Result<?> adminArbitrate(Long id, Long adminId, boolean supportBuyer, String adminRemark) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (afterSales.getStatus() != 4) {
                return Result.error("-1", "当前状态不允许仲裁");
            }

            afterSales.setAdminId(adminId);
            afterSales.setAdminRemark(adminRemark);

            if (supportBuyer) {
                afterSales.setStatus(2);
                afterSalesMapper.updateById(afterSales);
                processRefund(afterSales);
                LOGGER.info("Admin仲裁支持买家，工单ID：{}", id);
            } else {
                afterSales.setStatus(5);
                afterSalesMapper.updateById(afterSales);
                restoreOrderStatus(afterSales);
                LOGGER.info("Admin仲裁支持卖家，工单ID：{}", id);
            }

            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("仲裁失败：{}", e.getMessage());
            return Result.error("-1", "仲裁失败：" + e.getMessage());
        }
    }

    /**
     * 买家取消售后
     */
    @Transactional
    public Result<?> cancelTicket(Long id, Long userId) {
        try {
            AfterSales afterSales = afterSalesMapper.selectById(id);
            if (afterSales == null) {
                return Result.error("-1", "售后工单不存在");
            }
            if (!afterSales.getUserId().equals(userId)) {
                return Result.error("-1", "无权操作此工单");
            }
            if (afterSales.getStatus() != 0 && afterSales.getStatus() != 1) {
                return Result.error("-1", "当前状态不允许取消");
            }

            afterSales.setStatus(5);
            afterSalesMapper.updateById(afterSales);
            restoreOrderStatus(afterSales);

            LOGGER.info("买家取消售后，工单ID：{}", id);
            return Result.success(afterSales);
        } catch (Exception e) {
            LOGGER.error("取消售后失败：{}", e.getMessage());
            return Result.error("-1", "取消失败：" + e.getMessage());
        }
    }

    // ========== 私有方法 ==========

    /**
     * 执行退款：恢复库存、更新订单状态、取消物流
     */
    private void processRefund(AfterSales afterSales) {
        Order order = orderMapper.selectById(afterSales.getOrderId());
        if (order == null) return;

        // 恢复库存 + 减销量
        Product product = productMapper.selectById(order.getProductId());
        if (product != null) {
            product.setStock(product.getStock() + order.getQuantity());
            if (product.getSalesCount() >= order.getQuantity()) {
                product.setSalesCount(product.getSalesCount() - order.getQuantity());
            }
            productMapper.updateById(product);
        }

        // 更新订单状态为已退款
        order.setLastStatus(order.getStatus());
        order.setStatus(6);
        order.setRefundStatus(3); // 已退款
        orderMapper.updateById(order);

        // 取消物流
        LambdaQueryWrapper<Logistics> logWrapper = new LambdaQueryWrapper<>();
        logWrapper.eq(Logistics::getOrderId, order.getId());
        Logistics logistics = logisticsMapper.selectOne(logWrapper);
        if (logistics != null) {
            logistics.setStatus(3); // 已取消
            logisticsMapper.updateById(logistics);
        }
    }

    /**
     * 恢复订单到售后前的状态
     */
    private void restoreOrderStatus(AfterSales afterSales) {
        Order order = orderMapper.selectById(afterSales.getOrderId());
        if (order == null) return;

        if (order.getLastStatus() != null) {
            order.setStatus(order.getLastStatus());
        } else {
            order.setStatus(1); // 默认恢复为待发货
        }
        order.setRefundStatus(null);
        orderMapper.updateById(order);
    }

    /**
     * 填充关联信息
     */
    private void fillRelations(AfterSales afterSales) {
        Order order = orderMapper.selectById(afterSales.getOrderId());
        if (order != null) {
            afterSales.setOrder(order);
            Product product = productMapper.selectById(order.getProductId());
            if (product != null) {
                afterSales.setProduct(product);
            }
        }
        afterSales.setUser(userMapper.selectById(afterSales.getUserId()));
        afterSales.setMerchant(userMapper.selectById(afterSales.getMerchantId()));
    }
}
