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

        <el-loading :active="sessionsLoading" fullscreen></el-loading>

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
              <div class="customer-name">{{ session.customer.name }}</div>
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
              <h3>{{ selectedSession.customer.name }}</h3>
              <p v-if="selectedSession.product" class="product-info">
                商品：{{ selectedSession.product.name }}
              </p>
            </div>
          </div>

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
                <div class="message-sender">{{ getSenderName(message) }}</div>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createdAt) }}</div>
              </div>
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
import { mapState, mapActions } from 'vuex'

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
      unreadCounts: {}
    }
  },

  computed: {
    ...mapState('chat', ['sessions', 'sessionsLoading', 'currentMessages', 'messagesLoading']),
    ...mapState('user', ['userInfo']),

    messages() {
      return this.currentMessages
    },

    filteredSessions() {
      return this.sessions.filter(session =>
        session.customer.name.includes(this.searchKeyword)
      )
    }
  },

  mounted() {
    this.initChat()
    this.loadSessions()
  },

  methods: {
    ...mapActions('chat', ['initChat', 'loadSessions', 'loadMessages', 'sendMessage', 'startPolling', 'stopPolling']),

    async loadSessions() {
      await this.loadSessions({ page: this.currentPage })
    },

    selectSession(session) {
      this.selectedSessionId = session.id
      this.selectedSession = session
      this.loadMessages({ sessionId: session.id, page: 1 })
    },

    async sendReply() {
      if (!this.inputContent.trim()) {
        this.$message.warning('消息不能为空')
        return
      }

      this.sending = true
      try {
        await this.sendMessage({
          sessionId: this.selectedSession.id,
          senderId: this.userInfo.id,
          senderRole: 'MERCHANT',
          content: this.inputContent,
          contentType: 'TEXT'
        })

        this.inputContent = ''
        this.$nextTick(() => {
          const wrapper = this.$el.querySelector('.messages-list')
          if (wrapper) {
            wrapper.scrollTop = wrapper.scrollHeight
          }
        })
      } catch (error) {
        this.$message.error('发送失败，请重试')
      } finally {
        this.sending = false
      }
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
    }
  },

  beforeDestroy() {
    this.stopPolling()
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

.customer-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
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

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ebeef5;
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

.message-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.send-button {
  align-self: flex-end;
}
</style>
