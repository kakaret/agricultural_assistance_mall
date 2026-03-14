/**
 * Authentication utility functions
 * Handles token and user info storage in localStorage
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'frontUser'

/**
 * Get authentication token from localStorage
 * @returns {string|null} Token string or null if not found
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

/**
 * Set authentication token in localStorage
 * @param {string} token - Authentication token
 */
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Remove authentication token from localStorage
 */
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY)
}

/**
 * Get user info from localStorage
 * @returns {Object|null} User info object or null if not found
 */
export function getUserInfo() {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    if (userInfo) {
        try {
            return JSON.parse(userInfo)
        } catch (error) {
            console.error('Failed to parse user info:', error)
            return null
        }
    }
    return null
}

/**
 * Set user info in localStorage
 * @param {Object} userInfo - User information object
 */
export function setUserInfo(userInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * Remove user info from localStorage
 */
export function removeUserInfo() {
    localStorage.removeItem(USER_INFO_KEY)
}

/**
 * Clear all authentication data
 * Removes both token and user info
 */
export function clearAuth() {
    removeToken()
    removeUserInfo()
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export function isAuthenticated() {
    return !!getToken()
}
