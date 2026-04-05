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
      <!-- 消息列表 -->
      <div class="messages-wrapper">
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
      </div>

      <!-- 输入框 -->
      <div class="message-input-wrapper">
        <el-input
          v-model="inputContent"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keyup.ctrl.enter="sendMessage"
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
      sending: false
    }
  },

  computed: {
    ...mapState('chat', ['currentMessages', 'messagesLoading']),
    ...mapGetters('chat', ['currentSessionUnreadCount'])
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
    }
  },

  methods: {
    ...mapActions('chat', ['sendMessage', 'loadMessages', 'markSessionAsRead', 'startPolling', 'stopPolling']),

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
        await this.loadChatMessages()
        await this.markSessionAsRead({ sessionId: this.sessionId, userId: this.$store.state.user.userInfo.id })
        this.startPolling()
      }
    },

    async loadChatMessages() {
      if (this.sessionId) {
        await this.loadMessages({ sessionId: this.sessionId, page: 1 })
      }
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
        await this.sendMessage({
          sessionId: this.sessionId,
          senderId: userInfo.id,
          senderRole: 'CUSTOMER',
          content: this.inputContent,
          contentType: 'TEXT'
        })

        this.inputContent = ''
        // 滚动到底部
        this.$nextTick(() => {
          const wrapper = this.$el.querySelector('.messages-list')
          if (wrapper) {
            wrapper.scrollTop = wrapper.scrollHeight
          }
        })
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
    }
  },

  beforeDestroy() {
    this.stopPolling()
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

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #f5f7fa;
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

.message-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.send-button {
  align-self: flex-end;
}
</style>
