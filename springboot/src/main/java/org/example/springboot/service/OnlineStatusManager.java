package org.example.springboot.service;

import com.alibaba.fastjson2.JSON;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 在线用户状态管理
 */
@Slf4j
@Service
public class OnlineStatusManager {

  // userId -> WebSocketSession 映射
  private static final Map<Long, WebSocketSession> onlineSessions = new ConcurrentHashMap<>();

  /**
   * 用户是否在线
   */
  public boolean isOnline(Long userId) {
    WebSocketSession session = onlineSessions.get(userId);
    return session != null && session.isOpen();
  }

  /**
   * 注册用户连接
   */
  public void register(Long userId, WebSocketSession session) {
    onlineSessions.put(userId, session);
    log.info("User {} connected via WebSocket", userId);
  }

  /**
   * 移除用户连接
   */
  public void remove(Long userId) {
    onlineSessions.remove(userId);
    log.info("User {} disconnected from WebSocket", userId);
  }

  /**
   * 向指定用户发送消息
   */
  public void sendToUser(Long userId, String message) {
    WebSocketSession session = onlineSessions.get(userId);
    if (session != null && session.isOpen()) {
      try {
        session.sendMessage(new TextMessage(message));
      } catch (IOException e) {
        log.error("Failed to send message to user {}: {}", userId, e.getMessage());
        remove(userId);
      }
    }
  }

  /**
   * 广播消息给所有在线用户（用于系统通知等）
   */
  public void broadcastToAll(String message) {
    onlineSessions.forEach((userId, session) -> {
      if (session.isOpen()) {
        try {
          session.sendMessage(new TextMessage(message));
        } catch (IOException e) {
          log.error("Failed to broadcast to user {}: {}", userId, e.getMessage());
        }
      }
    });
  }

  /**
   * 获取所有在线用户 ID
   */
  public Set<Long> getOnlineUserIds() {
    return onlineSessions.keySet();
  }

  /**
   * 获取在线用户数量
   */
  public int getOnlineCount() {
    return (int) onlineSessions.values().stream().filter(WebSocketSession::isOpen).count();
  }

  /**
   * 向用户发送 JSON 消息
   */
  public void sendJsonToUser(Long userId, Map<String, Object> messageMap) {
    String message = JSON.toJSONString(messageMap);
    sendToUser(userId, message);
  }
}
