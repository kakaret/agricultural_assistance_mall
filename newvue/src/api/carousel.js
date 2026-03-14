import request from '@/utils/request'

/**
 * Get all active carousel items
 * @returns {Promise}
 */
export function getCarousels() {
    return request({
        url: '/carousel/list',
        method: 'get'
    })
}

/**
 * Get single carousel item by ID
 * @param {number} id - Carousel ID
 * @returns {Promise}
 */
export function getCarousel(id) {
    return request({
        url: `/carousel/${id}`,
        method: 'get'
    })
}

/**
 * Create new carousel item (admin)
 * @param {Object} data - Carousel data
 * @returns {Promise}
 */
export function createCarousel(data) {
    return request({
        url: '/carousel',
        method: 'post',
        data
    })
}

/**
 * Update carousel item (admin)
 * @param {number} id - Carousel ID
 * @param {Object} data - Carousel data to update
 * @returns {Promise}
 */
export function updateCarousel(id, data) {
    return request({
        url: `/carousel/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete carousel item (admin)
 * @param {number} id - Carousel ID
 * @returns {Promise}
 */
export function deleteCarousel(id) {
    return request({
        url: `/carousel/${id}`,
        method: 'delete'
    })
}

/**
 * Get all carousel items (admin)
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export function getAllCarousels(params) {
    return request({
        url: '/carousel/page',
        method: 'get',
        params
    })
}

/**
 * Update carousel sort order (admin)
 * @param {number} id - Carousel ID
 * @param {number} sort - Sort order
 * @returns {Promise}
 */
export function updateCarouselSort(id, sort) {
    return request({
        url: `/carousel/${id}/sort`,
        method: 'put',
        data: { sort }
    })
}
