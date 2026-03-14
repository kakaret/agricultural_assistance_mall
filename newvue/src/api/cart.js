import request from '@/utils/request'

/**
 * Get user's cart items
 * @param {number} userId - User ID
 * @returns {Promise}
 */
export function getCart(userId) {
    return request({
        url: `/cart/user/${userId}`,
        method: 'get'
    })
}

/**
 * Add item to cart
 * @param {Object} data - Cart item data {userId, productId, quantity}
 * @returns {Promise}
 */
export function addToCart(data) {
    return request({
        url: '/cart',
        method: 'post',
        data
    })
}

/**
 * Update cart item quantity
 * @param {number} id - Cart item ID
 * @param {Object} data - Update data {quantity}
 * @returns {Promise}
 */
export function updateCartItem(id, data) {
    return request({
        url: `/cart/${id}`,
        method: 'put',
        data
    })
}

/**
 * Remove item from cart
 * @param {number} id - Cart item ID
 * @returns {Promise}
 */
export function removeCartItem(id) {
    return request({
        url: `/cart/${id}`,
        method: 'delete'
    })
}

/**
 * Clear all cart items for a user
 * @param {number} userId - User ID
 * @returns {Promise}
 */
export function clearCart(userId) {
    return request({
        url: `/cart/user/${userId}`,
        method: 'delete'
    })
}

/**
 * Get cart item count for a user
 * @param {number} userId - User ID
 * @returns {Promise}
 */
export function getCartCount(userId) {
    return request({
        url: `/cart/user/${userId}/count`,
        method: 'get'
    })
}
