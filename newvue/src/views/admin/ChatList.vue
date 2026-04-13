<template>
  <div class="chat-list">
    <h2 class="page-title">客服聊天</h2>

    <div class="chat-container">
      <!-- 会话列表 -->
      <div class="sessions-panel">
        <h3>会话列表</h3>

        <el-input
          v-model="searchKeyword"
          placeholder="搜索买家..."
          clearable
          class="search-input"
        ></el-input>

        <div v-loading="sessionsLoading">
        <div v-if="filteredSessions.length === 0" class="no-data">
          <el-empty description="还没有会话"></el-empty>
        </div>

        <div v-else class="sessions-list">
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            :class="['session-item', { active: selectedSessionId === session.id }]"
            @click="selectSession(session)"
          >
            <div class="session-header">
              <div class="customer-info">
                <div class="customer-name">{{ session.customer ? session.customer.name : '未知用户' }}</div>
                <div v-if="session.customer && isCustomerOnline(session.customer.id)" class="online-status">
                  ● 在线
                </div>
              </div>
              <div v-if="getSessionUnreadCount(session.id)" class="unread-badge">
                {{ getSessionUnreadCount(session.id) }}
              </div>
            </div>

            <div class="session-preview">
              {{ getLastMessage(session) }}
            </div>

            <div class="session-time">
              {{ formatTime(session.lastMessageTime || session.createdAt) }}
            </div>
          </div>
        </div>

        </div>

        <el-pagination
          :current-page.sync="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          class="pagination"
        ></el-pagination>
      </div>

      <!-- 聊天窗口 -->
      <div class="chat-panel">
        <div v-if="!selectedSession" class="no-selection">
          <el-empty description="选择一个会话开始聊天"></el-empty>
        </div>

        <div v-else class="chat-wrapper">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="header-info">
                            <h3>{{ selectedSession.customer ? selectedSession.customer.name : '未知用户' }}</h3>
              <p v-if="selectedSession.product" class="product-info">
                商品：{{ selectedSession.product.name }}
              </p>
            </div>
            <div class="header-status">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                @click="handleClearMessages"
              >清理记录</el-button>
              <span :class="['status-indicator', wsConnected ? 'online' : 'offline']"></span>
              <span class="status-text">{{ wsConnected ? '实时连接' : '轮询模式' }}</span>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="messages-wrapper" ref="messagesWrapper">
            <div v-if="messagesLoading" class="loading">
              <el-spinner></el-spinner>
            </div>

            <div v-else class="messages-list">
              <div
                v-for="message in messages"
                :key="message.id"
                :class="['message', getMessageClass(message)]"
              >
                <div class="message-sender">{{ getSenderName(message) }}</div>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createdAt) }}</div>
              </div>
            </div>

            <!-- 正在输入提示 -->
            <div v-if="hasTypingUsers" class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-text">{{ selectedSession.customer.name }} 正在输入...</span>
            </div>
          </div>

          <!-- 消息输入 -->
          <div class="message-input-wrapper">
            <el-input
              v-model="inputContent"
              type="textarea"
              :rows="3"
              placeholder="输入回复..."
              @keyup.ctrl.enter="sendReply"
              @input="handleTyping"
            ></el-input>

            <el-button
              type="primary"
              size="small"
              :loading="sending"
              @click="sendReply"
              class="send-button"
            >
              发送 (Ctrl+Enter)
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'ChatList',

  data() {
    return {
      searchKeyword: '',
      selectedSessionId: null,
      selectedSession: null,
      inputContent: '',
      sending: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      unreadCounts: {},
      typingTimer: null
    }
  },

  computed: {
    ...mapState('chat', ['sessions', 'sessionsLoading', 'currentMessages', 'messagesLoading', 'wsConnected', 'onlineUsers']),
    ...mapState('user', ['userInfo']),
    ...mapGetters('chat', ['hasTypingUsers', 'typingUserIds']),

    messages() {
      return this.currentMessages
    },

    filteredSessions() {
      return this.sessions.filter(session =>
        session.customer && session.customer.name && session.customer.name.includes(this.searchKeyword)
      )
    }
  },

  watch: {
    messages() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  },

  async mounted() {
    await this.initChat()
    await this.loadSessions()
    
    // 优先使用 WebSocket，降级到轮询
    if (this.$store.state.user.token) {
      this.connectWebSocket(this.$store.state.user.token).catch(() => {
        console.warn('[ChatList] WebSocket 连接失败，使用轮询模式')
        this.startPolling()
      })
    } else {
      this.startPolling()
    }
  },

  methods: {
    ...mapActions('chat', {
      initChat: 'initChat',
      fetchSessions: 'loadSessions',
      loadMessages: 'loadMessages',
      sendChatMessage: 'sendMessage',
      clearSessionMessages: 'clearSessionMessages',
      startPolling: 'startPolling',
      stopPolling: 'stopPolling',
      connectWebSocket: 'connectWebSocket',
      sendTypingStatus: 'sendTypingStatus'
    }),

    async loadSessions() {
      await this.fetchSessions({ page: this.currentPage })
    },

    selectSession(session) {
      this.selectedSessionId = session.id
      this.selectedSession = session
      this.$store.commit('chat/SET_CURRENT_SESSION', session.id)
      this.loadMessages({ sessionId: session.id, page: 1 })
    },

    async sendReply() {
      if (!this.inputContent.trim()) {
        this.$message.warning('消息不能为空')
        return
      }

      this.sending = true
      try {
        await this.sendChatMessage({
          sessionId: this.selectedSession.id,
          senderId: this.userInfo.id,
          senderRole: 'MERCHANT',
          content: this.inputContent,
          contentType: 'TEXT'
        })

        this.inputContent = ''
        // 延迟重新加载消息
        setTimeout(async () => {
          await this.loadMessages({ sessionId: this.selectedSession.id, page: 1 })
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        }, 500)
      } catch (error) {
        this.$message.error('发送失败，请重试')
      } finally {
        this.sending = false
      }
    },

    scrollToBottom() {
      const wrapper = this.$refs.messagesWrapper
      if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight
      }
    },

    handleTyping() {
      // 发送正在输入提示 (节流)
      if (this.typingTimer) {
        clearTimeout(this.typingTimer)
      }

      if (this.inputContent.trim() && this.selectedSession && this.wsConnected) {
        this.sendTypingStatus(this.selectedSession.id)
      }

      this.typingTimer = setTimeout(() => {
        this.typingTimer = null
      }, 3000)
    },

    isCustomerOnline(customerId) {
      return this.onlineUsers.has(customerId)
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const today = new Date()
      
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }
      
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    },

    getLastMessage(session) {
      if (!session.messages || session.messages.length === 0) {
        return '还没有消息'
      }
      const lastMsg = session.messages[session.messages.length - 1]
      return lastMsg.content.length > 30 ? lastMsg.content.substring(0, 30) + '...' : lastMsg.content
    },

    getMessageClass(message) {
      return message.senderRole === 'MERCHANT' ? 'sent' : 'received'
    },

    getSenderName(message) {
      if (message.senderRole === 'MERCHANT') {
        return this.userInfo.name
      } else if (message.senderRole === 'SYSTEM') {
        return '系统'
      }
      return this.selectedSession.customer.name
    },

    getSessionUnreadCount(sessionId) {
      return this.unreadCounts[sessionId] || 0
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadSessions()
    },

    async handleClearMessages() {
      if (!this.selectedSession) return
      try {
        await this.$confirm('确定要清理所有聊天记录吗？此操作不可撤销。', '清理记录', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.clearSessionMessages()
        this.$message.success('聊天记录已清理')
      } catch (e) {
        if (e !== 'cancel') {
          this.$message.error('清理失败')
        }
      }
    }
  },

  beforeDestroy() {
    this.stopPolling()
    if (this.typingTimer) {
      clearTimeout(this.typingTimer)
    }
  }
}
</script>

<style scoped>
.chat-list {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.chat-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 120px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sessions-panel {
  width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebeef5;
  padding: 16px;
  overflow: hidden;
}

.sessions-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-input {
  margin-bottom: 12px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.session-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.session-item.active {
  background: #e6f7ff;
  border-color: #409eff;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.customer-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.online-status {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
}

.unread-badge {
  background: #f56c6c;
  color: #fff;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.session-preview {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
  height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.session-time {
  color: #909399;
  font-size: 12px;
  text-align: right;
}

.pagination {
  margin-top: 12px;
  text-align: center;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.product-info {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 0 0;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
}

.status-indicator.online {
  background: #67c23a;
}

.status-text {
  color: #606266;
  font-weight: 500;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background: #f5f7fa;
  position: relative;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
}

.message.received {
  align-self: flex-start;
}

.message-sender {
  font-size: 12px;
  color: #909399;
}

.message.sent .message-sender {
  text-align: right;
}

.message-content {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message.sent .message-content {
  background: #409eff;
  color: #fff;
}

.message.received .message-content {
  background: #fff;
  color: #303133;
  border: 1px solid #dcdfe6;
}

.message-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.message.received .message-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  color: #909399;
  max-width: 300px;
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #909399;
  animation: typing-pulse 1.4s infinite;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-pulse {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.typing-text {
  margin-left: 4px;
}

.message-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.send-button {
  align-self: flex-end;
}
</style>
