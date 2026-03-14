import request from '@/utils/request'

/**
 * Get product reviews
 * @param {number} productId - Product ID
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getReviews(productId, params) {
    return request({
        url: `/review/product/${productId}`,
        method: 'get',
        params
    })
}

/**
 * Get single review by ID
 * @param {number} id - Review ID
 * @returns {Promise}
 */
export function getReview(id) {
    return request({
        url: `/review/${id}`,
        method: 'get'
    })
}

/**
 * Create new review
 * @param {Object} data - Review data {userId, productId, rating, content}
 * @returns {Promise}
 */
export function createReview(data) {
    return request({
        url: '/review',
        method: 'post',
        data
    })
}

/**
 * Update review
 * @param {number} id - Review ID
 * @param {Object} data - Review data to update
 * @returns {Promise}
 */
export function updateReview(id, data) {
    return request({
        url: `/review/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete review
 * @param {number} id - Review ID
 * @returns {Promise}
 */
export function deleteReview(id) {
    return request({
        url: `/review/${id}`,
        method: 'delete'
    })
}

/**
 * Get user's reviews
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getUserReviews(userId, params) {
    return request({
        url: `/review/user/${userId}`,
        method: 'get',
        params
    })
}

/**
 * Update review status (admin)
 * @param {number} id - Review ID
 * @param {number} status - Status value (0: pending, 1: approved)
 * @returns {Promise}
 */
export function updateReviewStatus(id, status) {
    return request({
        url: `/review/${id}/status`,
        method: 'put',
        data: { status }
    })
}

/**
 * Get all reviews (admin)
 * @param {Object} params - Query parameters {page, size, status}
 * @returns {Promise}
 */
export function getAllReviews(params) {
    return request({
        url: '/review/page',
        method: 'get',
        params
    })
}
