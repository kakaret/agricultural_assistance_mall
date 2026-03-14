import { getProducts, getProduct, getCategories } from '@/api/product'

const state = {
    products: [],
    currentProduct: null,
    categories: [],
    loading: false,
    error: null
}

const mutations = {
    SET_PRODUCTS(state, products) {
        state.products = products
    },

    SET_CURRENT_PRODUCT(state, product) {
        state.currentProduct = product
    },

    SET_CATEGORIES(state, categories) {
        state.categories = categories
    },

    SET_LOADING(state, loading) {
        state.loading = loading
    },

    SET_ERROR(state, error) {
        state.error = error
    }
}

const actions = {
    /**
     * Fetch products with filters
     * @param {Object} context - Vuex context
     * @param {Object} params - Query parameters {page, size, categoryId, keyword, sort, etc.}
     * @returns {Promise}
     */
    async fetchProducts({ commit }, params = {}) {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        try {
            const response = await getProducts(params)
            const products = response.data?.records || response.data || []
            commit('SET_PRODUCTS', products)
            return response
        } catch (error) {
            commit('SET_ERROR', error.message)
            console.error('Failed to fetch products:', error)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    /**
     * Fetch single product detail
     * @param {Object} context - Vuex context
     * @param {number} productId - Product ID
     * @returns {Promise}
     */
    async fetchProductDetail({ commit }, productId) {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        try {
            const response = await getProduct(productId)
            const product = response.data
            commit('SET_CURRENT_PRODUCT', product)
            return product
        } catch (error) {
            commit('SET_ERROR', error.message)
            console.error('Failed to fetch product detail:', error)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    /**
     * Fetch product categories
     * @param {Object} context - Vuex context
     * @returns {Promise}
     */
    async fetchCategories({ commit }) {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        try {
            const response = await getCategories()
            const categories = response.data || []
            commit('SET_CATEGORIES', categories)
            return categories
        } catch (error) {
            commit('SET_ERROR', error.message)
            console.error('Failed to fetch categories:', error)
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    /**
     * Clear current product
     * @param {Object} context - Vuex context
     */
    clearCurrentProduct({ commit }) {
        commit('SET_CURRENT_PRODUCT', null)
    }
}

const getters = {
    products: state => state.products,
    currentProduct: state => state.currentProduct,
    categories: state => state.categories,
    loading: state => state.loading,
    error: state => state.error,

    /**
     * Get product by ID
     */
    productById: state => id => {
        return state.products.find(product => product.id === id)
    },

    /**
     * Get products by category ID
     */
    productsByCategory: state => categoryId => {
        return state.products.filter(product => product.category?.id === categoryId)
    },

    /**
     * Get featured products (high sales count)
     */
    featuredProducts: state => {
        return [...state.products]
            .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
            .slice(0, 8)
    },

    /**
     * Get new products (recently created)
     */
    newProducts: state => {
        return [...state.products]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
    },

    /**
     * Get discounted products
     */
    discountedProducts: state => {
        return state.products.filter(product => product.isDiscount)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
