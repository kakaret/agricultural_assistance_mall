import {
    createOrGetSession,
    sendMessage,
    getMessages,
    getSessions,
    getUnreadCount,
    markAsRead
} from '@/api/chat'
import WebSocketClient from '@/utils/websocket'

/**
 * 聊天 Vuex 模块
 * 
 * 状态管理 + 轮询逻辑 + WebSocket 推送
 * 
 * 基于 HTTP 轮询的实现（阶段二）
 * WebSocket 推送升级（阶段三）
 */

const state = {
    // 用户角色和ID
    currentUserId: null,
    currentUserRole: null, // 'CUSTOMER' | 'MERCHANT'

    // 会话列表
    sessions: [],
    sessionsLoading: false,
    sessionsPagination: {
        currentPage: 1,
        size: 10,
        total: 0
    },

    // 当前活跃会话
    currentSessionId: null,
    currentMessages: [],
    messagesLoading: false,
    messagesPagination: {
        currentPage: 1,
        size: 20,
        total: 0
    },

    // 未读消息
    unreadCounts: {}, // { [sessionId]: count }
    totalUnreadCount: 0,

    // 轮询控制
    pollTimer: null,
    pollInterval: 3000, // 3秒轮询一次
    isPolling: false,

    // WebSocket 状态 (阶段三)
    wsConnected: false,
    onlineUsers: new Set(), // 在线用户ID集合
    typingUsers: new Map() // { sessionId: [userId1, userId2, ...] }
}

const mutations = {
    // 设置用户信息
    SET_USER_INFO(state, { userId, userRole }) {
        state.currentUserId = userId
        state.currentUserRole = userRole
    },

    // 会话列表
    SET_SESSIONS(state, sessions) {
        state.sessions = sessions
    },
    SET_SESSIONS_LOADING(state, loading) {
        state.sessionsLoading = loading
    },
    SET_SESSIONS_PAGINATION(state, pagination) {
        state.sessionsPagination = { ...state.sessionsPagination, ...pagination }
    },

    // 当前会话
    SET_CURRENT_SESSION(state, sessionId) {
        state.currentSessionId = sessionId
        state.currentMessages = []
        state.messagesPagination = { currentPage: 1, size: 20, total: 0 }
    },

    // 消息列表
    SET_MESSAGES(state, messages) {
        state.currentMessages = messages
    },
    APPEND_MESSAGES(state, messages) {
        state.currentMessages.push(...messages)
    },
    ADD_MESSAGE(state, message) {
        // 在列表末尾添加新消息
        state.currentMessages.push(message)
    },
    PREPEND_MESSAGE(state, message) {
        state.currentMessages.unshift(message)
    },
    SET_MESSAGES_LOADING(state, loading) {
        state.messagesLoading = loading
    },
    SET_MESSAGES_PAGINATION(state, pagination) {
        state.messagesPagination = { ...state.messagesPagination, ...pagination }
    },

    // 未读消息
    UPDATE_UNREAD_COUNT(state, { sessionId, count }) {
        state.unreadCounts[sessionId] = count
        // 重新计算总未读数
        state.totalUnreadCount = Object.values(state.unreadCounts).reduce((sum, c) => sum + c, 0)
    },
    CLEAR_UNREAD_COUNT(state, sessionId) {
        state.unreadCounts[sessionId] = 0
        state.totalUnreadCount = Object.values(state.unreadCounts).reduce((sum, c) => sum + c, 0)
    },

    // 轮询
    SET_POLLING(state, isPolling) {
        state.isPolling = isPolling
    },
    SET_POLL_TIMER(state, timer) {
        state.pollTimer = timer
    },

    // WebSocket 状态
    SET_WS_CONNECTED(state, connected) {
        state.wsConnected = connected
    },
    ADD_ONLINE_USER(state, userId) {
        state.onlineUsers.add(userId)
    },
    REMOVE_ONLINE_USER(state, userId) {
        state.onlineUsers.delete(userId)
    },
    SET_ONLINE_USERS(state, userIds) {
        state.onlineUsers = new Set(userIds)
    },
    ADD_TYPING_USER(state, { sessionId, userId }) {
        if (!state.typingUsers.has(sessionId)) {
            state.typingUsers.set(sessionId, [])
        }
        const users = state.typingUsers.get(sessionId)
        if (!users.includes(userId)) {
            users.push(userId)
        }
    },
    REMOVE_TYPING_USER(state, { sessionId, userId }) {
        if (state.typingUsers.has(sessionId)) {
            const users = state.typingUsers.get(sessionId)
            const index = users.indexOf(userId)
            if (index > -1) {
                users.splice(index, 1)
            }
        }
    }
}

const actions = {
    /**
     * 初始化聊天模块
     * 
     * @param {Object} commit - Vuex commit
     * @param {Object} rootState - Vuex root state
     */
    async initChat({ commit, rootState }) {
        const userInfo = rootState.user.userInfo
        if (userInfo && userInfo.id) {
            commit('SET_USER_INFO', {
                userId: userInfo.id,
                userRole: rootState.user.isAdmin ? 'MERCHANT' : 'CUSTOMER'
            })
        }
    },

    /**
     * 创建或获取会话
     */
    async createOrGetSession({ commit }, { customerId, merchantId, productId }) {
        try {
            const res = await createOrGetSession(customerId, merchantId, productId)
            if (res.code === '0') {
                return res.data
            }
            throw new Error(res.msg || '创建会话失败')
        } catch (error) {
            console.error('创建会话失败:', error)
            throw error
        }
    },

    /**
     * 发送消息
     */
    async sendMessage({ commit }, { sessionId, senderId, senderRole, content, contentType = 'TEXT' }) {
        try {
            const res = await sendMessage(sessionId, senderId, senderRole, content, contentType)
            if (res.code === '0') {
                // 消息发送成功，添加到本地消息列表
                commit('ADD_MESSAGE', res.data)
                return res.data
            }
            throw new Error(res.msg || '发送消息失败')
        } catch (error) {
            console.error('发送消息失败:', error)
            throw error
        }
    },

    /**
     * 加载会话消息
     */
    async loadMessages({ commit, state }, { sessionId, page = 1 } = {}) {
        commit('SET_MESSAGES_LOADING', true)
        try {
            const res = await getMessages(sessionId, page, state.messagesPagination.size)
            if (res.code === '0') {
                if (page === 1) {
                    commit('SET_MESSAGES', res.data.records)
                } else {
                    commit('APPEND_MESSAGES', res.data.records)
                }
                commit('SET_MESSAGES_PAGINATION', {
                    currentPage: page,
                    total: res.data.total
                })
            }
        } catch (error) {
            console.error('加载消息失败:', error)
        } finally {
            commit('SET_MESSAGES_LOADING', false)
        }
    },

    /**
     * 加载用户会话列表
     */
    async loadSessions({ commit, state }, { page = 1 } = {}) {
        if (!state.currentUserId) return

        commit('SET_SESSIONS_LOADING', true)
        try {
            const res = await getSessions(
                state.currentUserId,
                state.currentUserRole,
                page,
                state.sessionsPagination.size
            )
            if (res.code === '0') {
                if (page === 1) {
                    commit('SET_SESSIONS', res.data.records)
                }
                commit('SET_SESSIONS_PAGINATION', {
                    currentPage: page,
                    total: res.data.total
                })
            }
        } catch (error) {
            console.error('加载会话列表失败:', error)
        } finally {
            commit('SET_SESSIONS_LOADING', false)
        }
    },

    /**
     * 检查未读消息（轮询）
     */
    async checkUnreadMessages({ commit, state }) {
        if (!state.currentSessionId || !state.currentUserId) return

        try {
            const res = await getUnreadCount(state.currentSessionId, state.currentUserId)
            if (res.code === '0') {
                commit('UPDATE_UNREAD_COUNT', {
                    sessionId: state.currentSessionId,
                    count: res.data
                })
            }
        } catch (error) {
            console.error('检查未读消息失败:', error)
        }
    },

    /**
     * 标记会话为已读
     */
    async markSessionAsRead({ commit }, { sessionId, userId }) {
        try {
            const res = await markAsRead(sessionId, userId)
            if (res.code === '0') {
                commit('CLEAR_UNREAD_COUNT', sessionId)
            }
        } catch (error) {
            console.error('标记已读失败:', error)
        }
    },

    /**
     * 启动轮询（消息和未读状态）
     */
    startPolling({ commit, state, dispatch }) {
        if (state.isPolling) return

        commit('SET_POLLING', true)

        // 定期检查未读消息和新消息
        const timer = setInterval(() => {
            if (state.currentSessionId) {
                dispatch('checkUnreadMessages')
                // 可以在这里添加 loadMessages 以检查新消息
            }
        }, state.pollInterval)

        commit('SET_POLL_TIMER', timer)
    },

    /**
     * 停止轮询
     */
    stopPolling({ commit, state }) {
        if (state.pollTimer) {
            clearInterval(state.pollTimer)
            commit('SET_POLL_TIMER', null)
        }
        commit('SET_POLLING', false)
    },

    /**
     * 打开会话（切换会话）
     */
    async openSession({ commit, dispatch }, sessionId) {
        commit('SET_CURRENT_SESSION', sessionId)
        // 加载消息
        await dispatch('loadMessages', { sessionId, page: 1 })
        // 标记为已读
        const userInfo = this.state.user.userInfo
        if (userInfo) {
            await dispatch('markSessionAsRead', { sessionId, userId: userInfo.id })
        }
    },

    /**
     * 连接 WebSocket (阶段三)
     */
    connectWebSocket({ commit, dispatch }, token) {
        return new Promise((resolve, reject) => {
            try {
                WebSocketClient.connect(
                    token,
                    // 消息回调
                    (message) => {
                        dispatch('_onWebSocketMessage', message)
                    },
                    // 连接成功回调
                    () => {
                        commit('SET_WS_CONNECTED', true)
                        console.log('[Chat Store] WebSocket 连接成功')
                        resolve()
                    },
                    // 连接断开回调
                    () => {
                        commit('SET_WS_CONNECTED', false)
                        console.log('[Chat Store] WebSocket 连接断开')
                    }
                )
            } catch (error) {
                console.error('[Chat Store] WebSocket 连接失败:', error)
                reject(error)
            }
        })
    },

    /**
     * 断开 WebSocket 连接
     */
    disconnectWebSocket({ commit }) {
        WebSocketClient.close()
        commit('SET_WS_CONNECTED', false)
    },

    /**
     * 处理来自 WebSocket 的消息
     */
    _onWebSocketMessage({ commit, state }, message) {
        const { type, data, sessionId, userId } = message

        switch (type) {
            case 'message':
                // 接收消息推送
                if (state.currentSessionId === data.sessionId) {
                    commit('ADD_MESSAGE', data)
                }
                break

            case 'typing':
                // 正在输入提示
                commit('ADD_TYPING_USER', { sessionId, userId })
                // 3秒后移除输入状态
                setTimeout(() => {
                    commit('REMOVE_TYPING_USER', { sessionId, userId })
                }, 3000)
                break

            case 'online':
                // 用户上线/下线
                if (data.status) {
                    commit('ADD_ONLINE_USER', userId)
                } else {
                    commit('REMOVE_ONLINE_USER', userId)
                }
                break

            default:
                console.warn('[Chat Store] 未知的 WebSocket 消息类型:', type)
        }
    },

    /**
     * 通过 WebSocket 发送聊天消息
     */
    sendWebSocketMessage({ commit }, { sessionId, content, contentType = 'TEXT' }) {
        return WebSocketClient.sendChatMessage(sessionId, content, contentType)
    },

    /**
     * 发送正在输入提示
     */
    sendTypingStatus({ commit }, sessionId) {
        return WebSocketClient.sendTypingStatus(sessionId)
    }
}

const getters = {
    // 按创建时间倒序排列的会话
    sortedSessions: (state) => {
        return state.sessions.sort((a, b) => {
            const timeA = new Date(a.lastMessageTime || a.createdAt).getTime()
            const timeB = new Date(b.lastMessageTime || b.createdAt).getTime()
            return timeB - timeA
        })
    },

    // 当前会话信息
    currentSession: (state) => {
        return state.sessions.find(s => s.id === state.currentSessionId)
    },

    // 当前会话的未读数
    currentSessionUnreadCount: (state) => {
        return state.unreadCounts[state.currentSessionId] || 0
    },

    // 是否正在轮询
    isPolling: (state) => state.isPolling,

    // 总未读消息数
    totalUnread: (state) => state.totalUnreadCount,

    // WebSocket 连接状态
    wsConnected: (state) => state.wsConnected,

    // 是否有用户正在当前会话输入
    hasTypingUsers: (state) => {
        if (!state.currentSessionId) return false
        const users = state.typingUsers.get(state.currentSessionId)
        return users && users.length > 0
    },

    // 当前会话的输入用户ID列表
    typingUserIds: (state) => {
        if (!state.currentSessionId) return []
        return state.typingUsers.get(state.currentSessionId) || []
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
