import request from '@/utils/request'

/**
 * Get dashboard statistics (admin)
 * @param {Object} params - Query parameters {startDate, endDate}
 * @returns {Promise}
 */
export function getDashboardStats(params) {
    return request({
        url: '/statistics/dashboard',
        method: 'get',
        params
    })
}

/**
 * Get sales statistics (admin)
 * @param {Object} params - Query parameters {startDate, endDate, groupBy}
 * @returns {Promise}
 */
export function getSalesStats(params) {
    return request({
        url: '/statistics/sales',
        method: 'get',
        params
    })
}

/**
 * Get order statistics (admin)
 * @param {Object} params - Query parameters {startDate, endDate}
 * @returns {Promise}
 */
export function getOrderStats(params) {
    return request({
        url: '/statistics/orders',
        method: 'get',
        params
    })
}

/**
 * Get user statistics (admin)
 * @param {Object} params - Query parameters {startDate, endDate}
 * @returns {Promise}
 */
export function getUserStats(params) {
    return request({
        url: '/statistics/users',
        method: 'get',
        params
    })
}

/**
 * Get product statistics (admin)
 * @param {Object} params - Query parameters {startDate, endDate}
 * @returns {Promise}
 */
export function getProductStats(params) {
    return request({
        url: '/statistics/products',
        method: 'get',
        params
    })
}

/**
 * Get top selling products (admin)
 * @param {Object} params - Query parameters {startDate, endDate, limit}
 * @returns {Promise}
 */
export function getTopProducts(params) {
    return request({
        url: '/statistics/top-products',
        method: 'get',
        params
    })
}
