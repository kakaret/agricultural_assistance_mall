package org.example.springboot.controller;

import org.example.springboot.common.Result;
import org.example.springboot.entity.ChatMessage;
import org.example.springboot.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 聊天 API 控制器
 * 
 * 负责处理所有聊天相关的 HTTP 请求
 * 
 * 端点前缀: /api/chat
 */
@RestController
@RequestMapping("/chat")
public class ChatController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    /**
     * 创建或获取聊天会话
     * 
     * POST /chat/session
     * 
     * @param customerId 买家ID
     * @param merchantId 商家ID
     * @param productId 商品ID（可选）
     * @return Result
     */
    @PostMapping("/session")
    public Result<?> createOrGetSession(
            @RequestParam Long customerId,
            @RequestParam Long merchantId,
            @RequestParam(required = false) Long productId) {
        LOGGER.info("创建或获取会话，买家ID：{}，商家ID：{}", customerId, merchantId);
        return chatService.createOrGetSession(customerId, merchantId, productId);
    }

    /**
     * 发送消息
     * 
     * POST /chat/message
     * 
     * @param sessionId 会话ID
     * @param senderId 发送者ID
     * @param senderRole 发送者角色（CUSTOMER/MERCHANT/SYSTEM）
     * @param content 消息内容
     * @param contentType 消息类型（TEXT/IMAGE），默认TEXT
     * @return Result
     */
    @PostMapping("/message")
    public Result<?> sendMessage(
            @RequestParam Long sessionId,
            @RequestParam Long senderId,
            @RequestParam String senderRole,
            @RequestParam String content,
            @RequestParam(defaultValue = "TEXT") String contentType) {
        LOGGER.info("发送消息，会话ID：{}，发送者ID：{}，角色：{}", sessionId, senderId, senderRole);
        return chatService.sendMessage(sessionId, senderId, senderRole, content, contentType);
    }

    /**
     * 获取会话的消息历史
     * 
     * GET /chat/session/{id}/messages
     * 
     * @param id 会话ID
     * @param currentPage 当前页（从1开始）
     * @param size 每页大小
     * @return Result
     */
    @GetMapping("/session/{id}/messages")
    public Result<?> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "20") Integer size) {
        LOGGER.info("获取会话消息，会话ID：{}，页码：{}，每页大小：{}", id, currentPage, size);
        return chatService.getMessages(id, currentPage, size);
    }

    /**
     * 获取用户的会话列表
     * 
     * GET /chat/sessions
     * 
     * @param userId 用户ID
     * @param userRole 用户角色（CUSTOMER/MERCHANT）
     * @param currentPage 当前页（从1开始）
     * @param size 每页大小
     * @return Result
     */
    @GetMapping("/sessions")
    public Result<?> getSessionsByPage(
            @RequestParam Long userId,
            @RequestParam String userRole,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(defaultValue = "10") Integer size) {
        LOGGER.info("获取会话列表，用户ID：{}，角色：{}，页码：{}", userId, userRole, currentPage);
        return chatService.getSessionsByPage(userId, userRole, currentPage, size);
    }

    /**
     * 获取未读消息数
     * 
     * GET /chat/unread
     * 
     * @param sessionId 会话ID
     * @param userId 用户ID
     * @return Result
     */
    @GetMapping("/unread")
    public Result<?> getUnreadCount(
            @RequestParam Long sessionId,
            @RequestParam Long userId) {
        LOGGER.debug("获取未读消息数，会话ID：{}，用户ID：{}", sessionId, userId);
        return chatService.getUnreadCount(sessionId, userId);
    }

    /**
     * 标记会话为已读
     * 
     * PUT /chat/message/read/{sessionId}
     * 
     * @param sessionId 会话ID
     * @param userId 用户ID
     * @return Result
     */
    @PutMapping("/message/read/{sessionId}")
    public Result<?> markAsRead(
            @PathVariable Long sessionId,
            @RequestParam Long userId) {
        LOGGER.info("标记会话为已读，会话ID：{}，用户ID：{}", sessionId, userId);
        return chatService.markAsRead(sessionId, userId);
    }
}
