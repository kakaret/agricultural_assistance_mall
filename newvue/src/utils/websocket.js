/**
 * WebSocket 客户端工具类
 * 
 * 功能:
 * - 连接建立与管理
 * - 心跳检测 (30s)
 * - 断线自动重连 (指数退避: 1s → 2s → 4s → 8s → 16s → 30s)
 * - 消息发送/接收
 * - 连接关闭
 */

class WebSocketClient {
  constructor() {
    this.ws = null
    this.url = null
    this.token = null
    this.messageCallback = null
    this.connectionCallback = null
    this.disconnectionCallback = null
    
    // 心跳相关
    this.heartbeatTimer = null
    this.heartbeatInterval = 30000 // 30秒
    this.pongTimeout = null
    this.pongWaitTime = 45000 // 45秒未收到pong则认为断线
    
    // 重连相关
    this.reconnectTimer = null
    this.reconnectAttempt = 0
    this.maxReconnectAttempts = 6 // 1s, 2s, 4s, 8s, 16s, 30s
    this.reconnectDelays = [1000, 2000, 4000, 8000, 16000, 30000]
    
    // 连接状态
    this.isConnected = false
    this.isManualClose = false
  }

  /**
   * 建立 WebSocket 连接
   * 
   * @param {string} token - JWT token
   * @param {function} messageCallback - 接收消息的回调 (message) => void
   * @param {function} connectionCallback - 连接成功的回调 () => void
   * @param {function} disconnectionCallback - 连接断开的回调 () => void
   */
  connect(token, messageCallback, connectionCallback, disconnectionCallback) {
    this.token = token
    this.messageCallback = messageCallback
    this.connectionCallback = connectionCallback
    this.disconnectionCallback = disconnectionCallback
    this.isManualClose = false
    this.reconnectAttempt = 0
    
    this._doConnect()
  }

  /**
   * 执行连接
   */
  _doConnect() {
    try {
      // 获取 WebSocket 服务器地址
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      this.url = `${protocol}//${host}/ws/chat?token=${this.token}`
      
      console.log('[WebSocket] 开始连接...', this.url)
      
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        this._onOpen()
      }
      
      this.ws.onmessage = (event) => {
        this._onMessage(event)
      }
      
      this.ws.onerror = (event) => {
        this._onError(event)
      }
      
      this.ws.onclose = () => {
        this._onClose()
      }
    } catch (error) {
      console.error('[WebSocket] 连接失败:', error)
      this._scheduleReconnect()
    }
  }

  /**
   * 连接打开时的处理
   */
  _onOpen() {
    console.log('[WebSocket] 连接已建立')
    this.isConnected = true
    this.reconnectAttempt = 0 // 重置重连计数
    
    // 启动心跳检测
    this._startHeartbeat()
    
    // 调用连接成功的回调
    if (this.connectionCallback) {
      this.connectionCallback()
    }
  }

  /**
   * 接收消息时的处理
   */
  _onMessage(event) {
    try {
      const message = JSON.parse(event.data)
      
      // 处理心跳回复
      if (message.type === 'pong') {
        this._onPong()
        return
      }
      
      // 处理其他消息类型
      if (this.messageCallback) {
        this.messageCallback(message)
      }
    } catch (error) {
      console.error('[WebSocket] 解析消息失败:', error, event.data)
    }
  }

  /**
   * 连接错误时的处理
   */
  _onError(event) {
    console.error('[WebSocket] 连接错误:', event)
  }

  /**
   * 连接关闭时的处理
   */
  _onClose() {
    console.log('[WebSocket] 连接已关闭')
    this.isConnected = false
    
    // 清理心跳定时器
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
    
    // 如果不是手动关闭，则尝试重连
    if (!this.isManualClose) {
      this._scheduleReconnect()
    } else {
      // 调用断开回调
      if (this.disconnectionCallback) {
        this.disconnectionCallback()
      }
    }
  }

  /**
   * 启动心跳检测
   */
  _startHeartbeat() {
    // 清理已存在的心跳定时器
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    
    // 每 30 秒发送一次 ping
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this._sendPing()
      }
    }, this.heartbeatInterval)
  }

  /**
   * 发送 ping 消息
   */
  _sendPing() {
    try {
      this.send({ type: 'ping' })
      
      // 设置 pong 超时计时器
      if (this.pongTimeout) {
        clearTimeout(this.pongTimeout)
      }
      
      this.pongTimeout = setTimeout(() => {
        console.warn('[WebSocket] 未收到 pong 回复，断线重连...')
        this.close()
        this._scheduleReconnect()
      }, this.pongWaitTime)
    } catch (error) {
      console.error('[WebSocket] 发送 ping 失败:', error)
    }
  }

  /**
   * 收到 pong 消息
   */
  _onPong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
  }

  /**
   * 安排重连
   */
  _scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.error('[WebSocket] 重连次数已达上限，停止重连')
      if (this.disconnectionCallback) {
        this.disconnectionCallback()
      }
      return
    }
    
    const delay = this.reconnectDelays[this.reconnectAttempt]
    console.log(`[WebSocket] ${this.reconnectAttempt + 1}/${this.maxReconnectAttempts} 秒后重连 (延迟 ${delay}ms)`)
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt++
      this._doConnect()
    }, delay)
  }

  /**
   * 发送消息
   * 
   * @param {object} message - 消息对象
   */
  send(message) {
    if (!this.isConnected) {
      console.warn('[WebSocket] 未连接，无法发送消息')
      return false
    }
    
    try {
      this.ws.send(JSON.stringify(message))
      console.log('[WebSocket] 消息已发送:', message)
      return true
    } catch (error) {
      console.error('[WebSocket] 发送消息失败:', error)
      return false
    }
  }

  /**
   * 发送聊天消息
   * 
   * @param {number} sessionId - 会话ID
   * @param {string} content - 消息内容
   * @param {string} contentType - 消息类型 (TEXT/IMAGE)
   */
  sendChatMessage(sessionId, content, contentType = 'TEXT') {
    return this.send({
      type: 'message',
      sessionId,
      content,
      contentType
    })
  }

  /**
   * 发送正在输入提示
   * 
   * @param {number} sessionId - 会话ID
   */
  sendTypingStatus(sessionId) {
    return this.send({
      type: 'typing',
      sessionId
    })
  }

  /**
   * 关闭连接
   */
  close() {
    this.isManualClose = true
    
    // 清理所有定时器
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    // 关闭 WebSocket
    if (this.ws) {
      try {
        this.ws.close()
      } catch (error) {
        console.error('[WebSocket] 关闭连接失败:', error)
      }
    }
    
    this.isConnected = false
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempt: this.reconnectAttempt,
      url: this.url
    }
  }
}

// 导出单例
export default new WebSocketClient()
