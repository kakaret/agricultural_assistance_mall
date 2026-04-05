package org.example.springboot.config;

import org.example.springboot.handler.ChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

/**
 * WebSocket 配置类
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

  @Autowired
  private ChatWebSocketHandler chatWebSocketHandler;

  @Autowired
  private WebSocketAuthInterceptor webSocketAuthInterceptor;

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(chatWebSocketHandler, "/ws/chat")
        .addInterceptors(new HttpSessionHandshakeInterceptor(), webSocketAuthInterceptor)
        .setAllowedOrigins("*");
  }
}
