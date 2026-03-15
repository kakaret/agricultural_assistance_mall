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
 * Get all articles with pagination (admin)
 * 后端参数为 title（非 keyword），需要做映射
 * @param {Object} params - Query parameters {currentPage, size, keyword}
 * @returns {Promise}
 */
export function getAllArticles(params) {
    const { keyword, ...rest } = params || {}
    return request({
        url: '/article/page',
        method: 'get',
        params: {
            ...rest,
            title: keyword || ''
        }
    })
}

/**
 * Get featured articles
 * 后端暂无此接口，使用 /article/page 带 status=1 替代
 * @param {number} limit - Number of articles to return
 * @returns {Promise}
 */
export function getFeaturedArticles(limit = 5) {
    return request({
        url: '/article/page',
        method: 'get',
        params: { size: limit, status: 1 }
    })
}
