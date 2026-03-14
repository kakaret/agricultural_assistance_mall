import { getCart, addToCart as addToCartApi, updateCartItem, removeCartItem } from '@/api/cart'

/**
 * Calculate item price based on discount
 * @param {Object} item - Cart item with product info
 * @returns {number} Price to use for calculation
 */
function getItemPrice(item) {
    if (!item.product) return 0
    return item.product.isDiscount ? item.product.discountPrice : item.product.price
}

/**
 * Recalculate cart totals
 * @param {Array} items - Cart items
 * @returns {Object} {totalCount, totalPrice}
 */
function calculateTotals(items) {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => {
        return sum + (getItemPrice(item) * item.quantity)
    }, 0)
    return { totalCount, totalPrice }
}

const state = {
    items: [],
    totalCount: 0,
    totalPrice: 0,
    syncTimer: null // Timer for debouncing sync requests
}

const mutations = {
    SET_CART_ITEMS(state, items) {
        state.items = items
        const totals = calculateTotals(items)
        state.totalCount = totals.totalCount
        state.totalPrice = totals.totalPrice
    },

    ADD_ITEM(state, item) {
        const existingItem = state.items.find(i => i.productId === item.productId)
        if (existingItem) {
            existingItem.quantity += item.quantity
        } else {
            state.items.push(item)
        }

        // Recalculate totals
        const totals = calculateTotals(state.items)
        state.totalCount = totals.totalCount
        state.totalPrice = totals.totalPrice
    },

    UPDATE_ITEM_QUANTITY(state, { itemId, quantity }) {
        const item = state.items.find(i => i.id === itemId)
        if (item) {
            item.quantity = quantity

            // Recalculate totals
            const totals = calculateTotals(state.items)
            state.totalCount = totals.totalCount
            state.totalPrice = totals.totalPrice
        }
    },

    REMOVE_ITEM(state, itemId) {
        const index = state.items.findIndex(i => i.id === itemId)
        if (index !== -1) {
            state.items.splice(index, 1)

            // Recalculate totals
            const totals = calculateTotals(state.items)
            state.totalCount = totals.totalCount
            state.totalPrice = totals.totalPrice
        }
    },

    CLEAR_CART(state) {
        state.items = []
        state.totalCount = 0
        state.totalPrice = 0
    }
}

const actions = {
    /**
     * Fetch cart items from API
     * @param {Object} context - Vuex context
     * @param {number} userId - User ID
     * @returns {Promise}
     */
    async fetchCart({ commit }, userId) {
        try {
            const response = await getCart(userId)
            const items = response.data || []
            commit('SET_CART_ITEMS', items)
            return items
        } catch (error) {
            console.error('Failed to fetch cart:', error)
            throw error
        }
    },

    /**
     * Add item to cart with optimistic update
     * @param {Object} context - Vuex context
     * @param {Object} payload - {productId, quantity, product}
     * @returns {Promise}
     */
    async addToCart({ commit, dispatch, rootGetters, state }, payload) {
        const userId = rootGetters['user/userId']
        if (!userId) {
            throw new Error('User not logged in')
        }

        const { productId, quantity, product } = payload

        // Store previous state for potential rollback
        const previousItems = JSON.parse(JSON.stringify(state.items))

        try {
            // Optimistic update: immediately update UI with product info
            if (product) {
                const optimisticItem = {
                    id: Date.now(), // Temporary ID
                    userId,
                    productId,
                    quantity,
                    product,
                    createdAt: new Date().toISOString()
                }
                commit('ADD_ITEM', optimisticItem)
            }

            // Send request to backend
            const response = await addToCartApi({ productId, quantity, userId })

            // Debounced sync: wait 500ms before syncing to avoid multiple rapid requests
            if (state.syncTimer) {
                clearTimeout(state.syncTimer)
            }
            state.syncTimer = setTimeout(() => {
                dispatch('fetchCart', userId).catch(error => {
                    console.error('Failed to sync cart after add:', error)
                })
            }, 500)

            return response
        } catch (error) {
            // Rollback on error
            commit('SET_CART_ITEMS', previousItems)
            console.error('Failed to add to cart:', error)
            throw error
        }
    },

    /**
     * Update cart item quantity
     * @param {Object} context - Vuex context
     * @param {Object} payload - {itemId, quantity}
     * @returns {Promise}
     */
    async updateQuantity({ commit, state }, { itemId, quantity }) {
        // Store previous state for rollback
        const previousItems = JSON.parse(JSON.stringify(state.items))

        try {
            // Optimistic update
            commit('UPDATE_ITEM_QUANTITY', { itemId, quantity })

            // Update on server
            await updateCartItem(itemId, { quantity })
        } catch (error) {
            // Rollback on error
            commit('SET_CART_ITEMS', previousItems)
            console.error('Failed to update cart item:', error)
            throw error
        }
    },

    /**
     * Remove item from cart
     * @param {Object} context - Vuex context
     * @param {number} itemId - Cart item ID
     * @returns {Promise}
     */
    async removeFromCart({ commit, state }, itemId) {
        // Store previous state for rollback
        const previousItems = JSON.parse(JSON.stringify(state.items))

        try {
            // Optimistic update
            commit('REMOVE_ITEM', itemId)

            // Remove on server
            await removeCartItem(itemId)
        } catch (error) {
            // Rollback on error
            commit('SET_CART_ITEMS', previousItems)
            console.error('Failed to remove cart item:', error)
            throw error
        }
    },

    /**
     * Clear all cart items
     * @param {Object} context - Vuex context
     */
    clearCart({ commit }) {
        commit('CLEAR_CART')
    }
}

const getters = {
    cartItems: state => state.items,

    /**
     * Get total item count in cart
     */
    cartItemCount: state => state.totalCount,

    /**
     * Get total price of cart
     */
    cartTotalPrice: state => state.totalPrice,

    /**
     * Check if cart is empty
     */
    isCartEmpty: state => state.items.length === 0,

    /**
     * Get cart item by product ID
     */
    getItemByProductId: state => productId => {
        return state.items.find(item => item.productId === productId)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
