import request from '@/utils/request'

/**
 * Get paginated articles
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getArticles(params) {
    return request({
        url: '/article/page',
        method: 'get',
        params
    })
}

/**
 * Get single article by ID
 * @param {number} id - Article ID
 * @returns {Promise}
 */
export function getArticle(id) {
    return request({
        url: `/article/${id}`,
        method: 'get'
    })
}

/**
 * Create new article (admin)
 * @param {Object} data - Article data
 * @returns {Promise}
 */
export function createArticle(data) {
    return request({
        url: '/article',
        method: 'post',
        data
    })
}

/**
 * Update article (admin)
 * @param {number} id - Article ID
 * @param {Object} data - Article data to update
 * @returns {Promise}
 */
export function updateArticle(id, data) {
    return request({
        url: `/article/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete article (admin)
 * @param {number} id - Article ID
 * @returns {Promise}
 */
export function deleteArticle(id) {
    return request({
        url: `/article/${id}`,
        method: 'delete'
    })
}

/**
 * Increment article view count
 * @param {number} id - Article ID
 * @returns {Promise}
 */
export function incrementViewCount(id) {
    return request({
        url: `/article/${id}/view`,
        method: 'post'
    })
}

/**
 * Get featured articles
 * @param {number} limit - Number of articles to return
 * @returns {Promise}
 */
export function getFeaturedArticles(limit = 5) {
    return request({
        url: '/article/featured',
        method: 'get',
        params: { limit }
    })
}
