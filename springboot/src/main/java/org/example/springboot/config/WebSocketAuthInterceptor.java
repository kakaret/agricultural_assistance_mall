package org.example.springboot.config;

import com.auth0.jwt.JWT;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket 认证拦截器 - 握手时验证 token
 */
@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

  @Override
  public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
      WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
    try {
      if (request instanceof ServletServerHttpRequest) {
        ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
        String query = servletRequest.getServletRequest().getQueryString();

        if (query != null && query.contains("token=")) {
          // 从 URL 查询参数提取 token
          String token = extractToken(query);
          if (token != null) {
            // 验证 token，从 JWT audience 中提取 userId
            String userIdStr = JWT.decode(token).getAudience().get(0);
            Long userId = Long.parseLong(userIdStr);
            if (userId != null) {
              attributes.put("userId", userId);
              return true;
            }
          }
        }
      }

      // token 验证失败，拒绝握手
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return false;
    } catch (Exception e) {
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return false;
    }
  }

  @Override
  public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
      WebSocketHandler wsHandler, Exception exception) {
    // 握手后处理
  }

  private String extractToken(String query) {
    String[] params = query.split("&");
    for (String param : params) {
      if (param.startsWith("token=")) {
        return param.substring(6);
      }
    }
    return null;
  }
}
