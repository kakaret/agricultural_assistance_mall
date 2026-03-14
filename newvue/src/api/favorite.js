import request from '@/utils/request'

/**
 * Get user's favorite products
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getFavorites(userId, params) {
    return request({
        url: `/favorite/user/${userId}`,
        method: 'get',
        params
    })
}

/**
 * Add product to favorites
 * @param {Object} data - Favorite data {userId, productId}
 * @returns {Promise}
 */
export function addFavorite(data) {
    return request({
        url: '/favorite',
        method: 'post',
        data
    })
}

/**
 * Remove product from favorites
 * @param {number} id - Favorite ID
 * @returns {Promise}
 */
export function removeFavorite(id) {
    return request({
        url: `/favorite/${id}`,
        method: 'delete'
    })
}

/**
 * Check if product is favorited by user
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise}
 */
export function isFavorite(userId, productId) {
    return request({
        url: `/favorite/check`,
        method: 'get',
        params: { userId, productId }
    })
}

/**
 * Toggle favorite status
 * @param {Object} data - {userId, productId}
 * @returns {Promise}
 */
export function toggleFavorite(data) {
    return request({
        url: '/favorite/toggle',
        method: 'post',
        data
    })
}
