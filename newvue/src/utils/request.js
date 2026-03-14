import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

// Create axios instance
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API || '/api',
    timeout: 15000
})

// Request interceptor
service.interceptors.request.use(
    config => {
        // Add authentication token to headers if available
        if (store.getters.token) {
            config.headers['Authorization'] = `Bearer ${store.getters.token}`
        }

        // Add request start time for performance monitoring
        config.metadata = { startTime: performance.now() }

        return config
    },
    error => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor
service.interceptors.response.use(
    response => {
        // Log API performance in development
        if (process.env.NODE_ENV === 'development' && response.config.metadata) {
            const duration = performance.now() - response.config.metadata.startTime
            const emoji = duration < 100 ? '🚀' : duration < 500 ? '⚡' : '🐌'
            const url = response.config.url
            console.log(`${emoji} API ${url}: ${duration.toFixed(0)}ms`)
        }

        // Return response data directly
        return response.data
    },
    error => {
        console.error('Response error:', error)

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    // Unauthorized - clear session and redirect to login
                    Message.error('登录已过期，请重新登录')
                    store.dispatch('user/logout')
                    router.push('/login')
                    break

                case 403:
                    // Forbidden - no permission
                    Message.error('您没有权限访问该资源')
                    break

                case 404:
                    // Not found
                    Message.error('请求的资源不存在')
                    break

                case 500:
                    // Server error
                    Message.error('服务器错误，请稍后重试')
                    break

                default:
                    // Other errors
                    Message.error(data?.message || '请求失败，请稍后重试')
            }
        } else if (error.request) {
            // Network error - no response received
            Message.error('网络连接失败，请检查网络设置')
        } else {
            // Other errors
            Message.error('请求失败，请稍后重试')
        }

        return Promise.reject(error)
    }
)

export default service
