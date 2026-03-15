/**
 * Loading Interceptor Plugin
 * Automatically manages global loading state based on HTTP requests
 */

import store from '@/store'

// Track active requests to prevent loading state flickering
let activeRequests = 0
let loadingTimer = null

/**
 * Request interceptor - starts loading
 */
export function requestInterceptor(config) {
    activeRequests++

    // Debounce loading start to prevent flickering for fast requests
    if (loadingTimer) {
        clearTimeout(loadingTimer)
    }

    loadingTimer = setTimeout(() => {
        if (activeRequests > 0) {
            store.commit('loading/START_LOADING')
        }
    }, 150) // Only show loading for requests taking longer than 150ms

    return config
}

/**
 * Response interceptor - stops loading
 */
export function responseInterceptor(response) {
    stopLoading()
    return response
}

/**
 * Error interceptor - stops loading
 */
export function errorInterceptor(error) {
    stopLoading()
    return Promise.reject(error)
}

/**
 * Stop loading helper
 */
function stopLoading() {
    activeRequests = Math.max(0, activeRequests - 1)

    if (loadingTimer) {
        clearTimeout(loadingTimer)
        loadingTimer = null
    }

    if (activeRequests === 0) {
        store.commit('loading/STOP_LOADING')
    }
}

/**
 * Install loading interceptors on axios instance
 * @param {Object} axios - Axios instance
 */
export function installLoadingInterceptors(axios) {
    axios.interceptors.request.use(requestInterceptor)
    axios.interceptors.response.use(responseInterceptor, errorInterceptor)
}

export default {
    installLoadingInterceptors
}
