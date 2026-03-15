import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import cart from './modules/cart'
import product from './modules/product'
import loading from './modules/loading'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    getters: {
        token: state => state.user.token
    },
    modules: {
        user,
        cart,
        product,
        loading
    }
})
