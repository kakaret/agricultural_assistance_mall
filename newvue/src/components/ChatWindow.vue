<template>
  <el-drawer
    title="客服聊天"
    :visible.sync="visible"
    direction="rtl"
    :before-close="handleClose"
    size="400px"
    class="chat-window"
  >
    <div v-if="!sessionId" class="no-session">
      <el-empty description="还没有打开任何聊天"></el-empty>
    </div>

    <div v-else class="chat-container">
      <!-- 在线状态指示器 -->
      <div class="online-status">
        <span :class="['status-indicator', wsConnected ? 'online' : 'offline']"></span>
        <span class="status-text">
          {{ wsConnected ? '实时连接' : '轮询模式' }}
        </span>
        <el-button
          type="text"
          size="mini"
          icon="el-icon-delete"
          class="clear-btn"
          @click="handleClearMessages"
        >清理记录</el-button>
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
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ formatTime(message.createdAt) }}
            </div>
          </div>
        </div>

        <!-- 正在输入提示 -->
        <div v-if="hasTypingUsers" class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-text">对方正在输入...</span>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="message-input-wrapper">
        <el-input
          v-model="inputContent"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keyup.ctrl.enter="sendMessage"
          @input="handleTyping"
        ></el-input>

        <el-button
          type="primary"
          size="small"
          :loading="sending"
          @click="sendMessage"
          class="send-button"
        >
          发送 (Ctrl+Enter)
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'ChatWindow',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    sessionId: {
      type: Number,
      default: null
    }
  },

  data() {
    return {
      inputContent: '',
      sending: false,
      typingTimer: null
    }
  },

  computed: {
    ...mapState('chat', { messages: 'currentMessages', messagesLoading: 'messagesLoading', wsConnected: 'wsConnected' }),
    ...mapGetters('chat', ['currentSessionUnreadCount', 'hasTypingUsers', 'typingUserIds'])
  },

  watch: {
    visible(val) {
      if (val && this.sessionId) {
        this.initChat()
      }
    },
    sessionId(val) {
      if (val) {
        this.loadChatMessages()
      }
    },
    messages() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  },

  methods: {
    ...mapActions('chat', {
      initChatStore: 'initChat',
      sendChatMessage: 'sendMessage',
      loadMessages: 'loadMessages',
      markSessionAsRead: 'markSessionAsRead',
      clearSessionMessages: 'clearSessionMessages',
      startPolling: 'startPolling',
      stopPolling: 'stopPolling',
      connectWebSocket: 'connectWebSocket',
      sendTypingStatus: 'sendTypingStatus'
    }),

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    },

    getMessageClass(message) {
      const userInfo = this.$store.state.user.userInfo
      const isSent = message.senderId === userInfo.id
      return isSent ? 'sent' : 'received'
    },

    async initChat() {
      if (this.sessionId) {
        // 先初始化 store 的用户信息
        await this.initChatStore()
        this.$store.commit('chat/SET_CURRENT_SESSION', this.sessionId)
        
        await this.loadChatMessages()
        await this.markSessionAsRead({ sessionId: this.sessionId, userId: this.$store.state.user.userInfo.id })
        
        // 优先使用 WebSocket，降级到轮询
        if (this.$store.state.user.token) {
          try {
            await this.connectWebSocket(this.$store.state.user.token)
          } catch (error) {
            console.warn('[ChatWindow] WebSocket 连接失败，使用轮询模式')
            this.startPolling()
          }
        } else {
          this.startPolling()
        }
      }
    },

    async loadChatMessages() {
      if (this.sessionId) {
        await this.loadMessages({ sessionId: this.sessionId, page: 1 })
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
        })
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

      if (this.inputContent.trim()) {
        if (this.wsConnected) {
          this.sendTypingStatus(this.sessionId)
        }
      }

      this.typingTimer = setTimeout(() => {
        this.typingTimer = null
      }, 3000)
    },

    async sendMessage() {
      if (!this.inputContent.trim()) {
        this.$message.warning('消息不能为空')
        return
      }

      if (!this.sessionId) {
        this.$message.error('会话不存在')
        return
      }

      this.sending = true
      try {
        const userInfo = this.$store.state.user.userInfo
        await this.sendChatMessage({
          sessionId: this.sessionId,
          senderId: userInfo.id,
          senderRole: 'CUSTOMER',
          content: this.inputContent,
          contentType: 'TEXT'
        })

        this.inputContent = ''
        // 延迟重新加载消息，确保自动回复已入库
        setTimeout(async () => {
          await this.loadChatMessages()
        }, 500)
      } catch (error) {
        this.$message.error('发送失败，请重试')
        console.error('发送消息失败:', error)
      } finally {
        this.sending = false
      }
    },

    handleClose() {
      this.stopPolling()
      this.$emit('update:visible', false)
    },

    async handleClearMessages() {
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
.chat-window {
  display: flex;
  flex-direction: column;
}

.chat-window >>> .el-drawer {
  display: flex;
  flex-direction: column;
}

.chat-window >>> .el-drawer__body {
  display: flex;
  flex-direction: column;
  padding: 16px;
  flex: 1;
  overflow: hidden;
}

.no-session {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}

.clear-btn {
  margin-left: auto;
  color: #909399;
  padding: 0;
}

.clear-btn:hover {
  color: #f56c6c;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #909399;
  transition: background 0.3s ease;
}

.status-indicator.online {
  background: #67c23a;
}

.status-indicator.offline {
  background: #f56c6c;
}

.status-text {
  color: #606266;
  font-weight: 500;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
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
  max-width: 80%;
  word-wrap: break-word;
}

.message.sent {
  align-self: flex-end;
}

.message.received {
  align-self: flex-start;
}

.message-content {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
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
  max-width: 150px;
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
