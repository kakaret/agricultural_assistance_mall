package org.example.springboot.handler;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.example.springboot.service.ChatService;
import org.example.springboot.service.OnlineStatusManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket 聊天处理器 - 处理连接/消息/关闭
 */
@Slf4j
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

  @Autowired
  private ChatService chatService;

  @Autowired
  private OnlineStatusManager onlineStatusManager;

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    Long userId = (Long) session.getAttributes().get("userId");
    if (userId != null) {
      onlineStatusManager.register(userId, session);
      
      // 发送连接成功消息给客户端
      Map<String, Object> message = new HashMap<>();
      message.put("type", "connected");
      message.put("userId", userId);
      message.put("timestamp", System.currentTimeMillis());
      session.sendMessage(new TextMessage(JSON.toJSONString(message)));
      
      log.info("WebSocket connected for user: {}", userId);
    }
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    Long userId = (Long) session.getAttributes().get("userId");
    if (userId == null) {
      session.close();
      return;
    }

    try {
      String payload = message.getPayload();
      JSONObject json = JSON.parseObject(payload);
      String type = json.getString("type");

      switch (type) {
        case "message":
          handleChatMessage(json, userId, session);
          break;
        case "typing":
          handleTypingStatus(json, userId);
          break;
        case "ping":
          handlePing(session);
          break;
        default:
          log.warn("Unknown message type: {}", type);
      }
    } catch (Exception e) {
      log.error("Error handling message from user {}: {}", userId, e.getMessage(), e);
    }
  }

  /**
   * 处理聊天消息
   */
  private void handleChatMessage(JSONObject json, Long userId, WebSocketSession session) throws Exception {
    Long sessionId = json.getLong("sessionId");
    String content = json.getString("content");
    String contentType = json.getString("contentType");
    if (contentType == null) {
      contentType = "TEXT";
    }

    // 从 session 中获取用户信息来确定角色
    Object roleObj = session.getAttributes().get("userRole");
    String senderRole = roleObj != null ? (String) roleObj : "CUSTOMER";

    try {
      // 调用 ChatService 保存消息
      chatService.sendMessage(sessionId, userId, senderRole, content, contentType);
      
      log.info("Message saved: sessionId={}, senderId={}", sessionId, userId);
    } catch (Exception e) {
      log.error("Failed to save message: {}", e.getMessage(), e);
      // 发送错误消息给客户端
      Map<String, Object> errorMsg = new HashMap<>();
      errorMsg.put("type", "error");
      errorMsg.put("message", "Failed to send message");
      session.sendMessage(new TextMessage(JSON.toJSONString(errorMsg)));
    }
  }

  /**
   * 处理正在输入状态
   */
  private void handleTypingStatus(JSONObject json, Long userId) {
    Long sessionId = json.getLong("sessionId");
    
    // 构建正在输入消息
    Map<String, Object> typingMsg = new HashMap<>();
    typingMsg.put("type", "typing");
    typingMsg.put("sessionId", sessionId);
    typingMsg.put("userId", userId);
    typingMsg.put("timestamp", System.currentTimeMillis());
    
    // 可以在这里添加广播逻辑向会话中的其他用户通知正在输入状态
    log.debug("User {} is typing in session {}", userId, sessionId);
  }

  /**
   * 处理心跳 ping
   */
  private void handlePing(WebSocketSession session) throws IOException {
    Map<String, Object> pongMsg = new HashMap<>();
    pongMsg.put("type", "pong");
    pongMsg.put("timestamp", System.currentTimeMillis());
    session.sendMessage(new TextMessage(JSON.toJSONString(pongMsg)));
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    Long userId = (Long) session.getAttributes().get("userId");
    if (userId != null) {
      onlineStatusManager.remove(userId);
      log.info("WebSocket disconnected for user: {}", userId);
    }
  }

  @Override
  public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
    Long userId = (Long) session.getAttributes().get("userId");
    log.error("WebSocket transport error for user {}: {}", userId, exception.getMessage(), exception);
    if (userId != null) {
      onlineStatusManager.remove(userId);
    }
  }
}
