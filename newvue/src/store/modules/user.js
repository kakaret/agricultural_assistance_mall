import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/auth'
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/user'

const state = {
    token: getToken(),
    userInfo: getUserInfo(),
    isLoggedIn: !!getToken(),
    role: getUserInfo()?.role || null
}

const mutations = {
    SET_TOKEN(state, token) {
        state.token = token
        state.isLoggedIn = !!token
        if (token) {
            setToken(token)
        } else {
            removeToken()
        }
    },

    SET_USER_INFO(state, userInfo) {
        state.userInfo = userInfo
        state.role = userInfo?.role || null
        if (userInfo) {
            setUserInfo(userInfo)
        } else {
            removeUserInfo()
        }
    },

    CLEAR_USER_INFO(state) {
        state.token = null
        state.userInfo = null
        state.isLoggedIn = false
        state.role = null
        removeToken()
        removeUserInfo()
    }
}

const actions = {
    /**
     * User login
     * @param {Object} context - Vuex context
     * @param {Object} credentials - Login credentials {username, password}
     * @returns {Promise}
     */
    async login({ commit, dispatch }, credentials) {
        try {
            const response = await loginApi(credentials)
            // Backend returns user data directly in response.data
            const userData = response.data

            if (userData.token) {
                commit('SET_TOKEN', userData.token)
            }
            commit('SET_USER_INFO', userData)

            // Load user's cart after successful login
            if (userData.id) {
                try {
                    await dispatch('cart/fetchCart', userData.id, { root: true })
                } catch (error) {
                    console.error('Failed to load cart after login:', error)
                    // Don't throw error, cart loading failure shouldn't prevent login
                }
            }

            return response
        } catch (error) {
            commit('CLEAR_USER_INFO')
            throw error
        }
    },

    /**
     * User logout
     * @param {Object} context - Vuex context
     * @returns {Promise}
     */
    async logout({ commit, dispatch }) {
        try {
            await logoutApi()
        } catch (error) {
            console.error('Logout API error:', error)
        } finally {
            commit('CLEAR_USER_INFO')
            // Clear cart on logout
            dispatch('cart/clearCart', null, { root: true })
        }
    },

    /**
     * Refresh user info
     * @param {Object} context - Vuex context
     * @returns {Promise}
     */
    async refreshUserInfo({ commit, state }) {
        if (!state.token) {
            throw new Error('No token available')
        }

        try {
            const response = await getUserInfoApi()
            const userInfo = response.data

            commit('SET_USER_INFO', userInfo)

            return userInfo
        } catch (error) {
            commit('CLEAR_USER_INFO')
            throw error
        }
    }
}

const getters = {
    token: state => state.token,
    userInfo: state => state.userInfo,
    isLoggedIn: state => state.isLoggedIn,
    role: state => state.role,

    /**
     * Check if user is admin
     */
    isAdmin: state => {
        const adminRoles = ['ADMIN', 'admin', 'SUPER_ADMIN', 'super_admin']
        console.log('Checking isAdmin, role:', state.role, 'isAdmin:', adminRoles.includes(state.role))
        return adminRoles.includes(state.role)
    },

    /**
     * Check if user is customer
     */
    isCustomer: state => state.role === 'USER',

    /**
     * Get user ID
     */
    userId: state => state.userInfo?.id || null,

    /**
     * Get username
     */
    username: state => state.userInfo?.username || '',

    /**
     * Get user avatar
     */
    avatar: state => state.userInfo?.avatar || ''
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
