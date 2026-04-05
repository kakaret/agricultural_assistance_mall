package org.example.springboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.springboot.common.Result;
import org.example.springboot.entity.AutoReplyRule;
import org.example.springboot.entity.User;
import org.example.springboot.mapper.AutoReplyRuleMapper;
import org.example.springboot.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 自动回复规则服务
 * 
 * 负责商家的自动回复规则管理
 */
@Service
public class AutoReplyRuleService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AutoReplyRuleService.class);
    private static final String CACHE_NAME = "autoReplyRules";

    @Autowired
    private AutoReplyRuleMapper autoReplyRuleMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * 创建自动回复规则
     * 
     * @param autoReplyRule 规则对象
     * @return Result
     */
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    public Result<?> createAutoReplyRule(AutoReplyRule autoReplyRule) {
        try {
            // 验证商家存在
            User merchant = userMapper.selectById(autoReplyRule.getMerchantId());
            if (merchant == null) {
                return Result.error("-1", "商家不存在");
            }

            // 验证必填字段
            if (autoReplyRule.getKeyword() == null || autoReplyRule.getKeyword().trim().isEmpty()) {
                return Result.error("-1", "关键词不能为空");
            }
            if (autoReplyRule.getReplyContent() == null || autoReplyRule.getReplyContent().trim().isEmpty()) {
                return Result.error("-1", "回复内容不能为空");
            }

            // 默认状态为启用
            if (autoReplyRule.getStatus() == null) {
                autoReplyRule.setStatus(1);
            }

            // 默认优先级为0
            if (autoReplyRule.getPriority() == null) {
                autoReplyRule.setPriority(0);
            }

            int result = autoReplyRuleMapper.insert(autoReplyRule);
            if (result > 0) {
                LOGGER.info("创建自动回复规则成功，规则ID：{}", autoReplyRule.getId());
                return Result.success(autoReplyRule);
            }
            return Result.error("-1", "创建规则失败");
        } catch (Exception e) {
            LOGGER.error("创建自动回复规则失败：{}", e.getMessage());
            return Result.error("-1", "创建规则失败：" + e.getMessage());
        }
    }

    /**
     * 更新自动回复规则
     * 
     * @param autoReplyRule 规则对象
     * @return Result
     */
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    public Result<?> updateAutoReplyRule(AutoReplyRule autoReplyRule) {
        try {
            AutoReplyRule existing = autoReplyRuleMapper.selectById(autoReplyRule.getId());
            if (existing == null) {
                return Result.error("-1", "规则不存在");
            }

            // 验证必填字段
            if (autoReplyRule.getKeyword() != null && autoReplyRule.getKeyword().trim().isEmpty()) {
                return Result.error("-1", "关键词不能为空");
            }
            if (autoReplyRule.getReplyContent() != null && autoReplyRule.getReplyContent().trim().isEmpty()) {
                return Result.error("-1", "回复内容不能为空");
            }

            int result = autoReplyRuleMapper.updateById(autoReplyRule);
            if (result > 0) {
                LOGGER.info("更新自动回复规则成功，规则ID：{}", autoReplyRule.getId());
                return Result.success(autoReplyRule);
            }
            return Result.error("-1", "更新规则失败");
        } catch (Exception e) {
            LOGGER.error("更新自动回复规则失败：{}", e.getMessage());
            return Result.error("-1", "更新规则失败：" + e.getMessage());
        }
    }

    /**
     * 删除自动回复规则
     * 
     * @param id 规则ID
     * @return Result
     */
    @CacheEvict(value = CACHE_NAME, allEntries = true)
    public Result<?> deleteAutoReplyRule(Long id) {
        try {
            AutoReplyRule rule = autoReplyRuleMapper.selectById(id);
            if (rule == null) {
                return Result.error("-1", "规则不存在");
            }

            int result = autoReplyRuleMapper.deleteById(id);
            if (result > 0) {
                LOGGER.info("删除自动回复规则成功，规则ID：{}", id);
                return Result.success();
            }
            return Result.error("-1", "删除规则失败");
        } catch (Exception e) {
            LOGGER.error("删除自动回复规则失败：{}", e.getMessage());
            return Result.error("-1", "删除规则失败：" + e.getMessage());
        }
    }

    /**
     * 获取单个规则
     * 
     * @param id 规则ID
     * @return Result
     */
    public Result<?> getAutoReplyRule(Long id) {
        try {
            AutoReplyRule rule = autoReplyRuleMapper.selectById(id);
            if (rule == null) {
                return Result.error("-1", "规则不存在");
            }

            // 填充商家信息
            if (rule.getMerchantId() != null) {
                rule.setMerchant(userMapper.selectById(rule.getMerchantId()));
            }

            return Result.success(rule);
        } catch (Exception e) {
            LOGGER.error("获取自动回复规则失败：{}", e.getMessage());
            return Result.error("-1", "获取规则失败：" + e.getMessage());
        }
    }

    /**
     * 分页查询规则
     * 
     * @param merchantId 商家ID
     * @param status 规则状态（可为null）
     * @param currentPage 当前页
     * @param size 每页大小
     * @return Result
     */
    @Cacheable(value = CACHE_NAME, key = "'page_' + #merchantId + '_' + #status + '_' + #currentPage + '_' + #size")
    public Result<?> getAutoReplyRulesByPage(Long merchantId, Integer status, Integer currentPage, Integer size) {
        try {
            Page<AutoReplyRule> page = new Page<>(currentPage, size);
            LambdaQueryWrapper<AutoReplyRule> queryWrapper = new LambdaQueryWrapper<>();

            queryWrapper.eq(AutoReplyRule::getMerchantId, merchantId);
            queryWrapper.eq(status != null, AutoReplyRule::getStatus, status);
            queryWrapper.orderByDesc(AutoReplyRule::getPriority);
            queryWrapper.orderByDesc(AutoReplyRule::getCreatedAt);

            Page<AutoReplyRule> result = autoReplyRuleMapper.selectPage(page, queryWrapper);

            // 填充商家信息
            result.getRecords().forEach(rule -> {
                if (rule.getMerchantId() != null) {
                    rule.setMerchant(userMapper.selectById(rule.getMerchantId()));
                }
            });

            LOGGER.info("分页查询自动回复规则成功，商家ID：{}，当前页：{}", merchantId, currentPage);
            return Result.success(result);
        } catch (Exception e) {
            LOGGER.error("分页查询自动回复规则失败：{}", e.getMessage());
            return Result.error("-1", "查询规则失败：" + e.getMessage());
        }
    }

    /**
     * 获取商家的所有启用规则（用于触发自动回复）
     * 
     * @param merchantId 商家ID
     * @return List
     */
    @Cacheable(value = CACHE_NAME, key = "'enabled_' + #merchantId")
    public List<AutoReplyRule> getEnabledRules(Long merchantId) {
        LambdaQueryWrapper<AutoReplyRule> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AutoReplyRule::getMerchantId, merchantId);
        queryWrapper.eq(AutoReplyRule::getStatus, 1);
        queryWrapper.orderByDesc(AutoReplyRule::getPriority);

        LOGGER.debug("获取商家启用的自动回复规则，商家ID：{}", merchantId);
        return autoReplyRuleMapper.selectList(queryWrapper);
    }
}
