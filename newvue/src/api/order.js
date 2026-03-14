import request from '@/utils/request'

/**
 * Get user's orders with pagination and filtering
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters {currentPage, size, status}
 * @returns {Promise}
 */
export function getOrders(userId, params) {
    return request({
        url: '/order/page',
        method: 'get',
        params: {
            userId,
            ...params
        }
    })
}

/**
 * Get single order by ID
 * @param {number} id - Order ID
 * @returns {Promise}
 */
export function getOrder(id) {
    return request({
        url: `/order/${id}`,
        method: 'get'
    })
}

/**
 * Create new order
 * @param {Object} data - Order data
 * @returns {Promise}
 */
export function createOrder(data) {
    return request({
        url: '/order',
        method: 'post',
        data
    })
}

/**
 * Update order status (admin)
 * @param {number} id - Order ID
 * @param {string} status - Order status
 * @returns {Promise}
 */
export function updateOrderStatus(id, status) {
    return request({
        url: `/order/${id}/status`,
        method: 'put',
        data: { status }
    })
}

/**
 * Cancel order
 * @param {number} id - Order ID
 * @returns {Promise}
 */
export function cancelOrder(id) {
    return request({
        url: `/order/${id}/cancel`,
        method: 'put'
    })
}

/**
 * Get all orders (admin)
 * @param {Object} params - Query parameters {page, size, status, keyword}
 * @returns {Promise}
 */
export function getAllOrders(params) {
    return request({
        url: '/order/page',
        method: 'get',
        params
    })
}

/**
 * Add logistics information to order (admin)
 * @param {number} orderId - Order ID
 * @param {Object} data - Logistics data {trackingNumber, company}
 * @returns {Promise}
 */
export function addLogistics(orderId, data) {
    return request({
        url: `/order/${orderId}/logistics`,
        method: 'post',
        data
    })
}

/**
 * Update logistics information (admin)
 * @param {number} logisticsId - Logistics ID
 * @param {Object} data - Logistics data to update
 * @returns {Promise}
 */
export function updateLogistics(logisticsId, data) {
    return request({
        url: `/logistics/${logisticsId}`,
        method: 'put',
        data
    })
}

/**
 * Get order statistics (admin)
 * @param {Object} params - Query parameters {startDate, endDate}
 * @returns {Promise}
 */
export function getOrderStatistics(params) {
    return request({
        url: '/order/statistics',
        method: 'get',
        params
    })
}
