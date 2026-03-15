/**
 * Global Loading State Management Module
 * Manages loading states for async operations across the application
 */

const state = {
    // Global loading counter (to handle multiple concurrent requests)
    counter: 0,
    // Named loading states for specific operations
    states: {}
}

const mutations = {
    /**
     * Increment global loading counter
     */
    START_LOADING(state) {
        state.counter++
    },

    /**
     * Decrement global loading counter
     */
    STOP_LOADING(state) {
        state.counter = Math.max(0, state.counter - 1)
    },

    /**
     * Reset global loading counter
     */
    RESET_LOADING(state) {
        state.counter = 0
    },

    /**
     * Set named loading state
     * @param {string} name - Loading state name
     * @param {boolean} value - Loading state value
     */
    SET_LOADING_STATE(state, { name, value }) {
        state.states[name] = value
    },

    /**
     * Clear all named loading states
     */
    CLEAR_LOADING_STATES(state) {
        state.states = {}
    }
}

const actions = {
    /**
     * Start a named loading operation
     * @param {Object} context - Vuex context
     * @param {string} name - Operation name
     */
    start({ commit }, name) {
        commit('START_LOADING')
        if (name) {
            commit('SET_LOADING_STATE', { name, value: true })
        }
    },

    /**
     * Stop a named loading operation
     * @param {Object} context - Vuex context
     * @param {string} name - Operation name
     */
    stop({ commit }, name) {
        commit('STOP_LOADING')
        if (name) {
            commit('SET_LOADING_STATE', { name, value: false })
        }
    },

    /**
     * Execute an async function with automatic loading state management
     * @param {Object} context - Vuex context
     * @param {Object} payload - { name: string, action: Function }
     * @returns {Promise} Action result
     */
    async run({ dispatch, commit }, { name, action }) {
        dispatch('start', name)
        try {
            const result = await action()
            return result
        } finally {
            dispatch('stop', name)
        }
    },

    /**
     * Reset all loading states
     * @param {Object} context - Vuex context
     */
    reset({ commit }) {
        commit('RESET_LOADING')
        commit('CLEAR_LOADING_STATES')
    }
}

const getters = {
    /**
     * Check if any loading is in progress
     */
    isLoading: state => state.counter > 0,

    /**
     * Get current loading counter value
     */
    loadingCount: state => state.counter,

    /**
     * Check if a named operation is loading
     */
    isNamedLoading: state => name => !!state.states[name],

    /**
     * Get all named loading states
     */
    loadingStates: state => state.states
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
