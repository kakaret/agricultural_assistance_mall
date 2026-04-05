package org.example.springboot.config;

import org.example.springboot.handler.ChatWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
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

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(chatWebSocketHandler(), "/ws/chat")
        .addInterceptors(new HttpSessionHandshakeInterceptor(), new WebSocketAuthInterceptor())
        .setAllowedOrigins("*");
  }

  @Bean
  public WebSocketHandler chatWebSocketHandler() {
    return new ChatWebSocketHandler();
  }

  @Bean
  public WebSocketAuthInterceptor webSocketAuthInterceptor() {
    return new WebSocketAuthInterceptor();
  }
}
