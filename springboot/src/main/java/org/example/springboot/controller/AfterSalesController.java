package org.example.springboot.controller;

import org.example.springboot.common.Result;
import org.example.springboot.entity.AfterSales;
import org.example.springboot.service.AfterSalesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/afterSales")
public class AfterSalesController {
    private static final Logger LOGGER = LoggerFactory.getLogger(AfterSalesController.class);

    @Autowired
    private AfterSalesService afterSalesService;

    /**
     * 买家提交售后申请
     */
    @PostMapping
    public Result<?> apply(@RequestBody AfterSales afterSales) {
        return afterSalesService.apply(afterSales);
    }

    /**
     * 分页查询售后工单
     */
    @GetMapping("/page")
    public Result<?> getByPage(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long merchantId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "10") Integer size) {
        return afterSalesService.getByPage(userId, merchantId, status, currentPage, size);
    }

    /**
     * 获取售后工单详情
     */
    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        return afterSalesService.getById(id);
    }

    /**
     * 商家同意售后
     */
    @PutMapping("/{id}/approve")
    public Result<?> approve(
            @PathVariable Long id,
            @RequestParam Long merchantId,
            @RequestParam(required = false) String remark) {
        return afterSalesService.merchantApprove(id, merchantId, remark);
    }

    /**
     * 商家拒绝售后
     */
    @PutMapping("/{id}/reject")
    public Result<?> reject(
            @PathVariable Long id,
            @RequestParam Long merchantId,
            @RequestParam(required = false) String remark) {
        return afterSalesService.merchantReject(id, merchantId, remark);
    }

    /**
     * 买家填写退货物流
     */
    @PutMapping("/{id}/return-logistics")
    public Result<?> fillReturnLogistics(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String trackingNo,
            @RequestParam String company) {
        return afterSalesService.fillReturnLogistics(id, userId, trackingNo, company);
    }

    /**
     * 商家确认收货
     */
    @PutMapping("/{id}/confirm-return")
    public Result<?> confirmReturn(
            @PathVariable Long id,
            @RequestParam Long merchantId) {
        return afterSalesService.merchantConfirmReturn(id, merchantId);
    }

    /**
     * 买家申诉
     */
    @PutMapping("/{id}/appeal")
    public Result<?> appeal(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String appealReason) {
        return afterSalesService.customerAppeal(id, userId, appealReason);
    }

    /**
     * Admin仲裁
     */
    @PutMapping("/{id}/arbitrate")
    public Result<?> arbitrate(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestParam boolean supportBuyer,
            @RequestParam(required = false) String adminRemark) {
        return afterSalesService.adminArbitrate(id, adminId, supportBuyer, adminRemark);
    }

    /**
     * 买家取消售后
     */
    @PutMapping("/{id}/cancel")
    public Result<?> cancel(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return afterSalesService.cancelTicket(id, userId);
    }
}
