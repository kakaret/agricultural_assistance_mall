import request from '@/utils/request'

/**
 * Get stock information for a product
 * @param {number} productId - Product ID
 * @returns {Promise}
 */
export function getProductStock(productId) {
    return request({
        url: `/stock/product/${productId}`,
        method: 'get'
    })
}

/**
 * Get all stock records (admin)
 * @param {Object} params - Query parameters {page, size, productId}
 * @returns {Promise}
 */
export function getStockRecords(params) {
    return request({
        url: '/stock/page',
        method: 'get',
        params
    })
}

/**
 * Record stock-in operation (admin)
 * @param {Object} data - Stock-in data {productId, quantity, operator}
 * @returns {Promise}
 */
export function stockIn(data) {
    return request({
        url: '/stock/in',
        method: 'post',
        data
    })
}

/**
 * Record stock-out operation (admin)
 * @param {Object} data - Stock-out data {productId, quantity, operator}
 * @returns {Promise}
 */
export function stockOut(data) {
    return request({
        url: '/stock/out',
        method: 'post',
        data
    })
}

/**
 * Get stock operation history (admin)
 * @param {number} productId - Product ID
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getStockHistory(productId, params) {
    return request({
        url: `/stock/product/${productId}/history`,
        method: 'get',
        params
    })
}

/**
 * Get low stock products (admin)
 * @param {number} threshold - Stock threshold
 * @returns {Promise}
 */
export function getLowStockProducts(threshold = 10) {
    return request({
        url: '/stock/low',
        method: 'get',
        params: { threshold }
    })
}
