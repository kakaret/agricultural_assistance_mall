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
 * 后端使用 @RequestParam 接收 status，必须通过 params 传递
 * @param {number} id - Order ID
 * @param {number} status - Order status
 * @returns {Promise}
 */
export function updateOrderStatus(id, status) {
    return request({
        url: `/order/${id}/status`,
        method: 'put',
        params: { status }
    })
}

/**
 * Cancel order - 使用 updateOrderStatus 将状态设为4(已取消)
 * @param {number} id - Order ID
 * @returns {Promise}
 */
export function cancelOrder(id) {
    return updateOrderStatus(id, 4)
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
 * 后端接口为 POST /logistics，需要在 data 中传 orderId
 * @param {number} orderId - Order ID
 * @param {Object} data - Logistics data {trackingNumber, company}
 * @returns {Promise}
 */
export function addLogistics(orderId, data) {
    return request({
        url: '/logistics',
        method: 'post',
        data: {
            orderId,
            ...data
        }
    })
}

/**
 * Update logistics status (admin)
 * 后端接口为 PUT /logistics/{id}/status，使用 @RequestParam
 * @param {number} logisticsId - Logistics ID
 * @param {number} status - Logistics status
 * @returns {Promise}
 */
export function updateLogistics(logisticsId, status) {
    return request({
        url: `/logistics/${logisticsId}/status`,
        method: 'put',
        params: { status }
    })
}

/**
 * Get order statistics (admin)
 * 使用后端已有的统计接口
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export function getOrderStatistics(params) {
    return request({
        url: '/statistics/orders/monthly',
        method: 'get',
        params
    })
}
