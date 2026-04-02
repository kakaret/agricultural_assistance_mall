import request from '@/utils/request'

/**
 * Get paginated products
 * @param {Object} params - Query parameters {page, size, categoryId, keyword, sort, etc.}
 * @returns {Promise}
 */
export function getProducts(params) {
    return request({
        url: '/product/page',
        method: 'get',
        params
    })
}

/**
 * Get single product by ID
 * @param {number} id - Product ID
 * @returns {Promise}
 */
export function getProduct(id) {
    return request({
        url: `/product/${id}`,
        method: 'get'
    })
}

/**
 * Create new product (admin)
 * @param {Object} data - Product data
 * @returns {Promise}
 */
export function createProduct(data) {
    return request({
        url: '/product',
        method: 'post',
        data
    })
}

/**
 * Update product (admin)
 * @param {number} id - Product ID
 * @param {Object} data - Product data to update
 * @returns {Promise}
 */
export function updateProduct(id, data) {
    return request({
        url: `/product/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete product (admin)
 * @param {number} id - Product ID
 * @returns {Promise}
 */
export function deleteProduct(id) {
    return request({
        url: `/product/${id}`,
        method: 'delete'
    })
}

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
 * Get category by ID
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
 * Search products
 * @param {Object} params - Search parameters {keyword, page, size}
 * @returns {Promise}
 */
export function searchProducts(params) {
    return request({
        url: '/product/search',
        method: 'get',
        params
    })
}

/**
 * Get products by category
 * @param {number} categoryId - Category ID
 * @param {Object} params - Query parameters {page, size}
 * @returns {Promise}
 */
export function getProductsByCategory(categoryId, params) {
    return request({
        url: `/product/category/${categoryId}`,
        method: 'get',
        params
    })
}

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Promise}
 */
export function getFeaturedProducts(limit = 8) {
    return request({
        url: '/product/featured',
        method: 'get',
        params: { limit }
    })
}

/**
 * Get new products
 * @param {number} limit - Number of products to return
 * @returns {Promise}
 */
export function getNewProducts(limit = 8) {
    return request({
        url: '/product/new',
        method: 'get',
        params: { limit }
    })
}

/**
 * 获取当季商品（时令推荐）
 */
export function getSeasonalProducts(season, limit = 8) {
    return request({
        url: '/product/seasonal',
        method: 'get',
        params: { season, limit }
    })
}
