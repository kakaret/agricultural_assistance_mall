import request from '@/utils/request'

/**
 * User login
 * @param {Object} data - Login credentials {username, password}
 * @returns {Promise}
 */
export function login(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data
    })
}

/**
 * User logout
 * @returns {Promise}
 */
export function logout() {
    return request({
        url: '/user/logout',
        method: 'post'
    })
}

/**
 * Get current user info
 * @returns {Promise}
 */
export function getUserInfo() {
    return request({
        url: '/user/info',
        method: 'get'
    })
}

/**
 * User registration
 * @param {Object} data - Registration data
 * @returns {Promise}
 */
export function register(data) {
    return request({
        url: '/user/add',
        method: 'post',
        data
    })
}

/**
 * Update user profile
 * @param {number} id - User ID
 * @param {Object} data - User data to update
 * @returns {Promise}
 */
export function updateUser(id, data) {
    return request({
        url: `/user/${id}`,
        method: 'put',
        data
    })
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise}
 */
export function getUser(id) {
    return request({
        url: `/user/${id}`,
        method: 'get'
    })
}

/**
 * Get paginated user list (admin)
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export function getUsers(params) {
    return request({
        url: '/user/page',
        method: 'get',
        params
    })
}

/**
 * Update user status (admin)
 * @param {number} id - User ID
 * @param {number} status - Status value
 * @returns {Promise}
 */
export function updateUserStatus(id, status) {
    return request({
        url: `/user/${id}/status`,
        method: 'put',
        data: { status }
    })
}

/**
 * Update user role (admin)
 * @param {number} id - User ID
 * @param {string} role - Role value
 * @returns {Promise}
 */
export function updateUserRole(id, role) {
    return request({
        url: `/user/${id}/role`,
        method: 'put',
        data: { role }
    })
}

/**
 * Send email verification code
 * @param {string} email - User email
 * @returns {Promise}
 */
export function sendEmailCode(email) {
    return request({
        url: `/email/findByEmail/${email}`,
        method: 'get'
    })
}

/**
 * Request password reset
 * @param {string} email - User email
 * @param {string} newPassword - New password
 * @returns {Promise}
 */
export function requestPasswordReset(email, newPassword) {
    return request({
        url: '/user/forget',
        method: 'get',
        params: { email, newPassword }
    })
}
