import request from '@/utils/request'

/**
 * Get all categories
 * @returns {Promise}
 */
export function getCategories() {
    return request({
        url: '/category/all',
        method: 'get'
    })
}

/**
 * Get category tree (hierarchical structure)
 * @returns {Promise}
 */
export function getCategoryTree() {
    return request({
        url: '/category/tree',
        method: 'get'
    })
}

/**
 * Get single category by ID
 * @param {number} id - Category ID
 * @returns {Promise}
 */
export function getCategory(id) {
    return request({
        url: `/category/${id}`,
        method: 'get'
    })
}

/**
 * Create new category (admin)
 * @param {Object} data - Category data
 * @returns {Promise}
 */
export function createCategory(data) {
    return request({
        url: '/category',
        method: 'post',
        data
    })
}

/**
 * Update category (admin)
 * @param {number} id - Category ID
 * @param {Object} data - Category data to update
 * @returns {Promise}
 */
export function updateCategory(id, data) {
    return request({
        url: `/category/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete category (admin)
 * @param {number} id - Category ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
    return request({
        url: `/category/${id}`,
        method: 'delete'
    })
}

/**
 * Get products count by category
 * @param {number} id - Category ID
 * @returns {Promise}
 */
export function getCategoryProductCount(id) {
    return request({
        url: `/category/${id}/count`,
        method: 'get'
    })
}
