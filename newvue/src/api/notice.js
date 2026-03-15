import request from '@/utils/request'

/**
 * Get active notices
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getNotices(params) {
    return request({
        url: '/notice/list',
        method: 'get',
        params
    })
}

/**
 * Get single notice by ID
 * @param {number} id - Notice ID
 * @returns {Promise}
 */
export function getNotice(id) {
    return request({
        url: `/notice/${id}`,
        method: 'get'
    })
}

/**
 * Create new notice (admin)
 * @param {Object} data - Notice data
 * @returns {Promise}
 */
export function createNotice(data) {
    return request({
        url: '/notice',
        method: 'post',
        data
    })
}

/**
 * Update notice (admin)
 * @param {number} id - Notice ID
 * @param {Object} data - Notice data to update
 * @returns {Promise}
 */
export function updateNotice(id, data) {
    return request({
        url: `/notice/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete notice (admin)
 * @param {number} id - Notice ID
 * @returns {Promise}
 */
export function deleteNotice(id) {
    return request({
        url: `/notice/${id}`,
        method: 'delete'
    })
}

/**
 * Get all notices (admin)
 * 后端参数为 title（非 keyword），需要做映射
 * @param {Object} params - Query parameters {page, size, type, keyword}
 * @returns {Promise}
 */
export function getAllNotices(params) {
    const { keyword, ...rest } = params || {}
    return request({
        url: '/notice/page',
        method: 'get',
        params: {
            ...rest,
            title: keyword || ''
        }
    })
}
