import request from '@/utils/request'

/**
 * 聊天 API 模块
 * 
 * 负责所有聊天相关的 HTTP 调用
 * 端点前缀: /api/chat, /api/auto-reply
 */

/**
 * 创建或获取聊天会话
 * 
 * 同一买家和商家之间只有一个会话
 * 再次发起时会复用已有会话，更新商品ID
 * 
 * @param {number} customerId - 买家ID
 * @param {number} merchantId - 商家ID
 * @param {number} productId - 商品ID（可选）
 * @returns {Promise}
 */
export const createOrGetSession = (customerId, merchantId, productId) => {
    return request({
        url: '/chat/session',
        method: 'post',
        params: {
            customerId,
            merchantId,
            productId
        }
    })
}

/**
 * 发送消息
 * 
 * 1. 插入消息
 * 2. 更新会话的 last_message_time
 * 3. 如果是买家消息，自动触发自动回复
 * 
 * @param {number} sessionId - 会话ID
 * @param {number} senderId - 发送者ID
 * @param {string} senderRole - 发送者角色（CUSTOMER/MERCHANT/SYSTEM）
 * @param {string} content - 消息内容
 * @param {string} contentType - 消息类型（TEXT/IMAGE）
 * @returns {Promise}
 */
export const sendMessage = (sessionId, senderId, senderRole, content, contentType = 'TEXT') => {
    return request({
        url: '/chat/message',
        method: 'post',
        params: {
            sessionId,
            senderId,
            senderRole,
            content,
            contentType
        }
    })
}

/**
 * 获取会话的消息历史
 * 
 * 分页获取会话中的所有消息
 * 消息按创建时间升序排列
 * 
 * @param {number} sessionId - 会话ID
 * @param {number} currentPage - 当前页（从1开始）
 * @param {number} size - 每页大小
 * @returns {Promise}
 */
export const getMessages = (sessionId, currentPage = 1, size = 20) => {
    return request({
        url: `/chat/session/${sessionId}/messages`,
        method: 'get',
        params: {
            currentPage,
            size
        }
    })
}

/**
 * 获取用户的会话列表
 * 
 * 买家：获取自己发起的所有会话
 * 商家：获取收到的所有会话
 * 
 * 会话按最后消息时间倒序排列
 * 
 * @param {number} userId - 用户ID
 * @param {string} userRole - 用户角色（CUSTOMER/MERCHANT）
 * @param {number} currentPage - 当前页（从1开始）
 * @param {number} size - 每页大小
 * @returns {Promise}
 */
export const getSessions = (userId, userRole, currentPage = 1, size = 10) => {
    return request({
        url: '/chat/sessions',
        method: 'get',
        params: {
            userId,
            userRole,
            currentPage,
            size
        }
    })
}

/**
 * 获取会话的未读消息数
 * 
 * 统计该会话中来自其他用户的未读消息
 * 
 * @param {number} sessionId - 会话ID
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const getUnreadCount = (sessionId, userId) => {
    return request({
        url: '/chat/unread',
        method: 'get',
        params: {
            sessionId,
            userId
        },
        showLoading: false // 轮询不显示全局加载动画
    })
}

/**
 * 标记会话为已读
 * 
 * 更新该会话中所有来自其他用户的消息为已读
 * 
 * @param {number} sessionId - 会话ID
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const markAsRead = (sessionId, userId) => {
    return request({
        url: `/chat/message/read/${sessionId}`,
        method: 'put',
        params: {
            userId
        }
    })
}

/**
 * ============== 自动回复规则 API ==============
 */

/**
 * 创建自动回复规则
 * 
 * @param {Object} rule - 规则对象
 *   - merchantId: 商家ID
 *   - keyword: 触发关键词
 *   - replyContent: 回复内容
 *   - priority: 优先级（可选，默认0）
 *   - status: 状态（可选，默认1=启用）
 * @returns {Promise}
 */
export const createAutoReplyRule = (rule) => {
    return request({
        url: '/auto-reply',
        method: 'post',
        data: rule
    })
}

/**
 * 更新自动回复规则
 * 
 * @param {number} id - 规则ID
 * @param {Object} rule - 规则对象
 * @returns {Promise}
 */
export const updateAutoReplyRule = (id, rule) => {
    return request({
        url: `/auto-reply/${id}`,
        method: 'put',
        data: rule
    })
}

/**
 * 删除自动回复规则
 * 
 * @param {number} id - 规则ID
 * @returns {Promise}
 */
export const deleteAutoReplyRule = (id) => {
    return request({
        url: `/auto-reply/${id}`,
        method: 'delete'
    })
}

/**
 * 获取单个自动回复规则
 * 
 * @param {number} id - 规则ID
 * @returns {Promise}
 */
export const getAutoReplyRule = (id) => {
    return request({
        url: `/auto-reply/${id}`,
        method: 'get'
    })
}

/**
 * 分页查询自动回复规则
 * 
 * 商家可以查看自己的所有规则
 * 可选按状态筛选
 * 
 * @param {number} merchantId - 商家ID
 * @param {number} status - 规则状态（可选）
 * @param {number} currentPage - 当前页
 * @param {number} size - 每页大小
 * @returns {Promise}
 */
export const getAutoReplyRules = (merchantId, status, currentPage = 1, size = 10) => {
    return request({
        url: '/auto-reply/page',
        method: 'get',
        params: {
            merchantId,
            status: status !== undefined ? status : null,
            currentPage,
            size
        }
    })
}
