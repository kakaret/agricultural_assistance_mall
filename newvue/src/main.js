import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import lazyLoad from './directives/lazyLoad'

// Configure Vue
Vue.config.productionTip = false

// Use Element UI
Vue.use(ElementUI)

// Register global directives
Vue.directive('lazy', lazyLoad)

// Global error handler
Vue.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err)
    console.error('Component:', vm)
    console.error('Error Info:', info)

    // Display user-friendly error message
    ElementUI.Message.error('应用程序遇到错误，请刷新页面重试')
}

// Create Vue instance
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
