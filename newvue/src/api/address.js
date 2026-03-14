import request from '@/utils/request'

/**
 * Get user's addresses
 * @param {number} userId - User ID
 * @returns {Promise}
 */
export function getAddresses(userId) {
    return request({
        url: `/address/user/${userId}`,
        method: 'get'
    })
}

/**
 * Get single address by ID
 * @param {number} id - Address ID
 * @returns {Promise}
 */
export function getAddress(id) {
    return request({
        url: `/address/${id}`,
        method: 'get'
    })
}

/**
 * Create new address
 * @param {Object} data - Address data
 * @returns {Promise}
 */
export function createAddress(data) {
    return request({
        url: '/address',
        method: 'post',
        data
    })
}

/**
 * Update address
 * @param {number} id - Address ID
 * @param {Object} data - Address data to update
 * @returns {Promise}
 */
export function updateAddress(id, data) {
    return request({
        url: `/address/${id}`,
        method: 'put',
        data
    })
}

/**
 * Delete address
 * @param {number} id - Address ID
 * @returns {Promise}
 */
export function deleteAddress(id) {
    return request({
        url: `/address/${id}`,
        method: 'delete'
    })
}

/**
 * Set address as default
 * @param {number} id - Address ID
 * @returns {Promise}
 */
export function setDefaultAddress(id) {
    return request({
        url: `/address/${id}/default`,
        method: 'put'
    })
}

/**
 * Get user's default address
 * @param {number} userId - User ID
 * @returns {Promise}
 */
export function getDefaultAddress(userId) {
    return request({
        url: `/address/user/${userId}/default`,
        method: 'get'
    })
}
