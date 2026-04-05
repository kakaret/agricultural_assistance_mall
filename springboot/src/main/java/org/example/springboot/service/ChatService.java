package org.example.springboot.service;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.example.springboot.common.Result;
import org.example.springboot.entity.*;
import org.example.springboot.mapper.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 聊天服务
 * 
 * 核心逻辑：
 * 1. 创建或获取会话（同一买家和商家只有一个会话）
 * 2. 发送消息（自动触发自动回复）
 * 3. 获取消息历史
 * 4. 管理未读状态
 * 5. WebSocket 推送（如果接收方在线）
 */
@Service
public class ChatService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ChatService.class);
    private static final String CHAT_CACHE = "chat";

    @Autowired
    private ChatSessionMapper chatSessionMapper;

    @Autowired
    private ChatMessageMapper chatMessageMapper;

    @Autowired
    private AutoReplyRuleMapper autoReplyRuleMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private AutoReplyRuleService autoReplyRuleService;

    @Autowired(required = false)
    private OnlineStatusManager onlineStatusManager;

    /**
     * 创建或获取聊天会话
     * 
     * 同一买家和商家之间只能有一个会话
     * 再次发起时会复用已有会话，更新 product_id
     * 
     * @param customerId 买家ID
     * @param merchantId 商家ID
     * @param productId 商品ID（可为null）
     * @return Result
     */
    @CacheEvict(value = CHAT_CACHE, key = "'sessions_' + #customerId")
    public Result<?> createOrGetSession(Long customerId, Long merchantId, Long productId) {
        try {
            // 验证买家和商家存在
            User customer = userMapper.selectById(customerId);
            if (customer == null) {
                return Result.error("-1", "买家不存在");
            }

            User merchant = userMapper.selectById(merchantId);
            if (merchant == null) {
                return Result.error("-1", "商家不存在");
            }

            // 查询是否已存在会话
            LambdaQueryWrapper<ChatSession> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(ChatSession::getCustomerId, customerId);
            queryWrapper.eq(ChatSession::getMerchantId, merchantId);

            ChatSession session = chatSessionMapper.selectOne(queryWrapper);

            if (session != null) {
                // 会话已存在，更新 product_id 并返回
                if (productId != null && !productId.equals(session.getProductId())) {
                    session.setProductId(productId);
                    session.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                    chatSessionMapper.updateById(session);
                }
                fillSessionAssociations(session);
                LOGGER.info("会话已存在，返回现有会话，会话ID：{}", session.getId());
                return Result.success(session);
            }

            // 创建新会话
            session = new ChatSession();
            session.setCustomerId(customerId);
            session.setMerchantId(merchantId);
            session.setProductId(productId);
            session.setStatus(1);

            chatSessionMapper.insert(session);
            fillSessionAssociations(session);
            LOGGER.info("创建新会话成功，会话ID：{}", session.getId());
            return Result.success(session);
        } catch (Exception e) {
            LOGGER.error("创建或获取会话失败：{}", e.getMessage());
            return Result.error("-1", "创建或获取会话失败：" + e.getMessage());
        }
    }

    /**
     * 发送消息
     * 
     * 1. 插入消息
     * 2. 更新会话的 last_message_time
     * 3. 如果是买家消息，触发自动回复
     * 4. 如果接收方在线，通过 WebSocket 推送
     * 
     * @param sessionId 会话ID
     * @param senderId 发送者ID
     * @param senderRole 发送者角色（CUSTOMER/MERCHANT/SYSTEM）
     * @param content 消息内容
     * @param contentType 消息类型（TEXT/IMAGE）
     * @return Result
     */
    @CacheEvict(value = CHAT_CACHE, key = "'session_' + #sessionId")
    public Result<?> sendMessage(Long sessionId, Long senderId, String senderRole, String content, String contentType) {
        try {
            // 验证会话存在
            ChatSession session = chatSessionMapper.selectById(sessionId);
            if (session == null) {
                return Result.error("-1", "会话不存在");
            }

            // 验证必填字段
            if (content == null || content.trim().isEmpty()) {
                return Result.error("-1", "消息内容不能为空");
            }

            if (contentType == null || contentType.isEmpty()) {
                contentType = "TEXT";
            }

            // 创建消息
            ChatMessage message = new ChatMessage();
            message.setSessionId(sessionId);
            message.setSenderId(senderId);
            message.setSenderRole(senderRole);
            message.setContent(content);
            message.setContentType(contentType);
            message.setIsRead(0);

            chatMessageMapper.insert(message);

            // 更新会话的 last_message_time
            session.setLastMessageTime(new Timestamp(System.currentTimeMillis()));
            session.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            chatSessionMapper.updateById(session);

            LOGGER.info("发送消息成功，消息ID：{}", message.getId());

            fillMessageAssociations(message);

            // 如果是买家消息，尝试触发自动回复
            if ("CUSTOMER".equals(senderRole)) {
                autoReplyIfMatched(session, message);
            }

            // WebSocket 推送（如果接收方在线）
            pushMessageToRecipient(session, message, senderRole);

            return Result.success(message);
        } catch (Exception e) {
            LOGGER.error("发送消息失败：{}", e.getMessage());
            return Result.error("-1", "发送消息失败：" + e.getMessage());
        }
    }

    /**
     * WebSocket 推送消息到接收方
     */
    private void pushMessageToRecipient(ChatSession session, ChatMessage message, String senderRole) {
        if (onlineStatusManager == null) {
            return;
        }

        try {
            Long recipientId = null;

            // 确定接收方
            if ("CUSTOMER".equals(senderRole)) {
                // 买家发送，商家接收
                recipientId = session.getMerchantId();
            } else if ("MERCHANT".equals(senderRole) || "SYSTEM".equals(senderRole)) {
                // 商家或系统发送，买家接收
                recipientId = session.getCustomerId();
            }

            if (recipientId != null && onlineStatusManager.isOnline(recipientId)) {
                // 接收方在线，推送消息
                Map<String, Object> pushMessage = new HashMap<>();
                pushMessage.put("type", "message");
                pushMessage.put("data", message);

                onlineStatusManager.sendJsonToUser(recipientId, pushMessage);
                LOGGER.info("WebSocket 消息推送成功，接收方ID：{}", recipientId);
            }
        } catch (Exception e) {
            LOGGER.error("WebSocket 推送失败：{}", e.getMessage());
            // 推送失败不影响消息发送
        }
    }

    /**
     * 检查消息是否匹配自动回复规则，匹配则自动回复
     * 
     * @param session 会话
     * @param customerMessage 买家消息
     */
    private void autoReplyIfMatched(ChatSession session, ChatMessage customerMessage) {
        try {
            // 获取商家的所有启用规则
            List<AutoReplyRule> rules = autoReplyRuleService.getEnabledRules(session.getMerchantId());

            for (AutoReplyRule rule : rules) {
                // 按照优先级从高到低检查关键词匹配
                if (customerMessage.getContent().contains(rule.getKeyword())) {
                    // 匹配到规则，自动回复
                    ChatMessage autoReplyMessage = new ChatMessage();
                    autoReplyMessage.setSessionId(session.getId());
                    autoReplyMessage.setSenderId(0L); // 系统消息
                    autoReplyMessage.setSenderRole("SYSTEM");
                    autoReplyMessage.setContent(rule.getReplyContent());
                    autoReplyMessage.setContentType("TEXT");
                    autoReplyMessage.setIsRead(0);

                    chatMessageMapper.insert(autoReplyMessage);
                    
                    // 推送自动回复消息
                    pushMessageToRecipient(session, autoReplyMessage, "SYSTEM");
                    
                    LOGGER.info("自动回复已发送，会话ID：{}，规则ID：{}", session.getId(), rule.getId());
                    break; // 只匹配第一条规则
                }
            }
        } catch (Exception e) {
            LOGGER.error("自动回复触发失败：{}", e.getMessage());
            // 自动回复失败不影响消息发送
        }
    }

    /**
     * 获取会话的消息历史（分页）
     * 
     * @param sessionId 会话ID
     * @param currentPage 当前页
     * @param size 每页大小
     * @return Result
     */
    @Cacheable(value = CHAT_CACHE, key = "'messages_' + #sessionId + '_' + #currentPage + '_' + #size")
    public Result<?> getMessages(Long sessionId, Integer currentPage, Integer size) {
        try {
            ChatSession session = chatSessionMapper.selectById(sessionId);
            if (session == null) {
                return Result.error("-1", "会话不存在");
            }

            Page<ChatMessage> page = new Page<>(currentPage, size);
            LambdaQueryWrapper<ChatMessage> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(ChatMessage::getSessionId, sessionId);
            queryWrapper.orderByAsc(ChatMessage::getCreatedAt);

            Page<ChatMessage> result = chatMessageMapper.selectPage(page, queryWrapper);

            // 填充发送者信息
            result.getRecords().forEach(this::fillMessageAssociations);

            LOGGER.info("获取会话消息成功，会话ID：{}，当前页：{}", sessionId, currentPage);
            return Result.success(result);
        } catch (Exception e) {
            LOGGER.error("获取会话消息失败：{}", e.getMessage());
            return Result.error("-1", "获取消息失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户的会话列表
     * 
     * @param userId 用户ID（买家或商家）
     * @param userRole 用户角色（CUSTOMER/MERCHANT）
     * @param currentPage 当前页
     * @param size 每页大小
     * @return Result
     */
    @Cacheable(value = CHAT_CACHE, key = "'sessions_' + #userId + '_' + #userRole + '_' + #currentPage + '_' + #size")
    public Result<?> getSessionsByPage(Long userId, String userRole, Integer currentPage, Integer size) {
        try {
            Page<ChatSession> page = new Page<>(currentPage, size);
            LambdaQueryWrapper<ChatSession> queryWrapper = new LambdaQueryWrapper<>();

            if ("CUSTOMER".equals(userRole)) {
                queryWrapper.eq(ChatSession::getCustomerId, userId);
            } else if ("MERCHANT".equals(userRole)) {
                queryWrapper.eq(ChatSession::getMerchantId, userId);
            } else {
                return Result.error("-1", "用户角色无效");
            }

            queryWrapper.orderByDesc(ChatSession::getLastMessageTime);
            queryWrapper.orderByDesc(ChatSession::getCreatedAt);

            Page<ChatSession> result = chatSessionMapper.selectPage(page, queryWrapper);

            // 填充关联信息
            result.getRecords().forEach(this::fillSessionAssociations);

            LOGGER.info("获取用户会话列表成功，用户ID：{}，角色：{}", userId, userRole);
            return Result.success(result);
        } catch (Exception e) {
            LOGGER.error("获取会话列表失败：{}", e.getMessage());
            return Result.error("-1", "获取会话列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取未读消息数
     * 
     * @param sessionId 会话ID
     * @param userId 用户ID
     * @return Result
     */
    public Result<?> getUnreadCount(Long sessionId, Long userId) {
        try {
            // 获取会话
            ChatSession session = chatSessionMapper.selectById(sessionId);
            if (session == null) {
                return Result.error("-1", "会话不存在");
            }

            // 根据用户角色判断谁是接收者
            String receiverRole;
            if (session.getCustomerId().equals(userId)) {
                receiverRole = "MERCHANT"; // 买家接收商家的消息
            } else if (session.getMerchantId().equals(userId)) {
                receiverRole = "CUSTOMER"; // 商家接收买家和系统的消息
            } else {
                return Result.error("-1", "用户不属于此会话");
            }

            // 统计未读消息（发送者不是当前用户）
            LambdaQueryWrapper<ChatMessage> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(ChatMessage::getSessionId, sessionId);
            queryWrapper.eq(ChatMessage::getIsRead, 0);
            queryWrapper.ne(ChatMessage::getSenderId, userId);

            long unreadCount = chatMessageMapper.selectCount(queryWrapper);

            LOGGER.debug("获取未读消息数，会话ID：{}，用户ID：{}，未读数：{}", sessionId, userId, unreadCount);
            return Result.success(unreadCount);
        } catch (Exception e) {
            LOGGER.error("获取未读消息数失败：{}", e.getMessage());
            return Result.error("-1", "获取未读消息数失败：" + e.getMessage());
        }
    }

    /**
     * 标记会话为已读
     * 
     * @param sessionId 会话ID
     * @param userId 用户ID
     * @return Result
     */
    @CacheEvict(value = CHAT_CACHE, key = "'session_' + #sessionId")
    public Result<?> markAsRead(Long sessionId, Long userId) {
        try {
            ChatSession session = chatSessionMapper.selectById(sessionId);
            if (session == null) {
                return Result.error("-1", "会话不存在");
            }

            // 更新该会话中所有来自其他用户的消息为已读
            LambdaQueryWrapper<ChatMessage> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(ChatMessage::getSessionId, sessionId);
            queryWrapper.eq(ChatMessage::getIsRead, 0);
            queryWrapper.ne(ChatMessage::getSenderId, userId);

            ChatMessage messageUpdate = new ChatMessage();
            messageUpdate.setIsRead(1);

            chatMessageMapper.update(messageUpdate, queryWrapper);

            LOGGER.info("标记会话为已读，会话ID：{}，用户ID：{}", sessionId, userId);
            return Result.success();
        } catch (Exception e) {
            LOGGER.error("标记会话为已读失败：{}", e.getMessage());
            return Result.error("-1", "标记已读失败：" + e.getMessage());
        }
    }

    /**
     * 填充会话关联信息
     */
    private void fillSessionAssociations(ChatSession session) {
        if (session.getCustomerId() != null) {
            session.setCustomer(userMapper.selectById(session.getCustomerId()));
        }
        if (session.getMerchantId() != null) {
            session.setMerchant(userMapper.selectById(session.getMerchantId()));
        }
        if (session.getProductId() != null) {
            session.setProduct(productMapper.selectById(session.getProductId()));
        }
    }

    /**
     * 填充消息关联信息
     */
    private void fillMessageAssociations(ChatMessage message) {
        if (message.getSenderId() != null && message.getSenderId() > 0) {
            message.setSender(userMapper.selectById(message.getSenderId()));
        }
    }
}
