package org.example.springboot.controller;

import org.example.springboot.common.Result;
import org.example.springboot.entity.AutoReplyRule;
import org.example.springboot.service.AutoReplyRuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 自动回复规则 API 控制器
 * 
 * 负责商家管理自动回复规则
 * 
 * 端点前缀: /api/auto-reply
 */
@RestController
@RequestMapping("/auto-reply")
public class AutoReplyRuleController {
    private static final Logger LOGGER = LoggerFactory.getLogger(AutoReplyRuleController.class);

    @Autowired
    private AutoReplyRuleService autoReplyRuleService;

    /**
     * 创建自动回复规则
     * 
     * POST /auto-reply
     * 
     * @param autoReplyRule 规则对象
     * @return Result
     */
    @PostMapping
    public Result<?> createAutoReplyRule(@RequestBody AutoReplyRule autoReplyRule) {
        LOGGER.info("创建自动回复规则，商家ID：{}", autoReplyRule.getMerchantId());
        return autoReplyRuleService.createAutoReplyRule(autoReplyRule);
    }

    /**
     * 更新自动回复规则
     * 
     * PUT /auto-reply/{id}
     * 
     * @param id 规则ID
     * @param autoReplyRule 规则对象
     * @return Result
     */
    @PutMapping("/{id}")
    public Result<?> updateAutoReplyRule(
            @PathVariable Long id,
            @RequestBody AutoReplyRule autoReplyRule) {
        LOGGER.info("更新自动回复规则，规则ID：{}", id);
        autoReplyRule.setId(id);
        return autoReplyRuleService.updateAutoReplyRule(autoReplyRule);
    }

    /**
     * 删除自动回复规则
     * 
     * DELETE /auto-reply/{id}
     * 
     * @param id 规则ID
     * @return Result
     */
    @DeleteMapping("/{id}")
    public Result<?> deleteAutoReplyRule(@PathVariable Long id) {
        LOGGER.info("删除自动回复规则，规则ID：{}", id);
        return autoReplyRuleService.deleteAutoReplyRule(id);
    }

    /**
     * 获取单个规则
     * 
     * GET /auto-reply/{id}
     * 
     * @param id 规则ID
     * @return Result
     */
    @GetMapping("/{id}")
    public Result<?> getAutoReplyRule(@PathVariable Long id) {
        LOGGER.info("获取自动回复规则，规则ID：{}", id);
        return autoReplyRuleService.getAutoReplyRule(id);
    }

    /**
     * 分页查询商家的规则
     * 
     * GET /auto-reply/page
     * 
     * @param merchantId 商家ID
     * @param status 规则状态（可选）
     * @param currentPage 当前页
     * @param size 每页大小
     * @return Result
     */
    @GetMapping("/page")
    public Result<?> getAutoReplyRulesByPage(
            @RequestParam Long merchantId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "10") Integer size) {
        LOGGER.info("分页查询自动回复规则，商家ID：{}，页码：{}", merchantId, currentPage);
        return autoReplyRuleService.getAutoReplyRulesByPage(merchantId, status, currentPage, size);
    }
}
