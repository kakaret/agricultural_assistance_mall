import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    // Customer routes
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/customer/Home.vue'),
        meta: { title: '首页' }
    },
    {
        path: '/products',
        name: 'Products',
        component: () => import('@/views/customer/Products.vue'),
        meta: { title: '产品列表' }
    },
    {
        path: '/product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/customer/ProductDetail.vue'),
        meta: { title: '产品详情' }
    },
    {
        path: '/category/:id',
        name: 'Category',
        component: () => import('@/views/customer/Category.vue'),
        meta: { title: '分类产品' }
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/customer/Search.vue'),
        meta: { title: '搜索结果' }
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('@/views/customer/Cart.vue'),
        meta: { title: '购物车', requiresAuth: true }
    },
    {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/customer/Order.vue'),
        meta: { title: '我的订单', requiresAuth: true }
    },
    {
        path: '/favorite',
        name: 'Favorite',
        component: () => import('@/views/customer/Favorite.vue'),
        meta: { title: '我的收藏', requiresAuth: true }
    },
    {
        path: '/user-center',
        name: 'UserCenter',
        component: () => import('@/views/customer/UserCenter.vue'),
        meta: { title: '个人中心', requiresAuth: true }
    },
    {
        path: '/articles',
        name: 'Articles',
        component: () => import('@/views/customer/Articles.vue'),
        meta: { title: '文章列表' }
    },
    {
        path: '/article/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/customer/ArticleDetail.vue'),
        meta: { title: '文章详情' }
    },

    // Auth routes
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/customer/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/customer/Register.vue'),
        meta: { title: '注册' }
    },
    {
        path: '/forget',
        name: 'Forget',
        component: () => import('@/views/customer/Forget.vue'),
        meta: { title: '忘记密码' }
    },

    // Admin routes
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
        redirect: '/admin/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/admin/Dashboard.vue'),
                meta: { title: '数据统计', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'products',
                name: 'ProductManagement',
                component: () => import('@/views/admin/ProductManagement.vue'),
                meta: { title: '产品管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'categories',
                name: 'CategoryManagement',
                component: () => import('@/views/admin/CategoryManagement.vue'),
                meta: { title: '分类管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'orders',
                name: 'OrderManagement',
                component: () => import('@/views/admin/OrderManagement.vue'),
                meta: { title: '订单管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'users',
                name: 'UserManagement',
                component: () => import('@/views/admin/UserManagement.vue'),
                meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'carousels',
                name: 'CarouselManagement',
                component: () => import('@/views/admin/CarouselManagement.vue'),
                meta: { title: '轮播图管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'notices',
                name: 'NoticeManagement',
                component: () => import('@/views/admin/NoticeManagement.vue'),
                meta: { title: '公告管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'articles',
                name: 'ArticleManagement',
                component: () => import('@/views/admin/ArticleManagement.vue'),
                meta: { title: '文章管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'stock',
                name: 'StockManagement',
                component: () => import('@/views/admin/StockManagement.vue'),
                meta: { title: '库存管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'after-sales',
                name: 'AfterSalesManagement',
                component: () => import('@/views/admin/AfterSalesManagement.vue'),
                meta: { title: '售后管理', requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'after-sales-arbitration',
                name: 'AfterSalesArbitration',
                component: () => import('@/views/admin/AfterSalesArbitration.vue'),
                meta: { title: '售后仲裁', requiresAuth: true, requiresAdmin: true }
            }
        ]
    },

    // 404 page
    {
        path: '*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面不存在' }
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }
})

// Suppress duplicate navigation and redirect errors
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => {
        if (err.name !== 'NavigationDuplicated' &&
            !err.message?.includes('Redirected when going from')) {
            throw err
        }
    })
}
const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => {
        if (err.name !== 'NavigationDuplicated' &&
            !err.message?.includes('Redirected when going from')) {
            throw err
        }
    })
}

// Navigation guard
router.beforeEach((to, from, next) => {
    // Set page title
    if (to.meta.title) {
        document.title = `${to.meta.title} - 农产品销售系统`
    }

    // Import store dynamically to avoid circular dependency
    const store = require('@/store').default
    const isLoggedIn = store.getters['user/isLoggedIn']
    const isAdmin = store.getters['user/isAdmin']
    const isMerchant = store.getters['user/isMerchant']

    // Check if route requires admin access
    if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!isLoggedIn) {
            // Not logged in, redirect to login
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else if (!isAdmin && !isMerchant) {
            // Not admin or merchant, redirect to home
            next({ path: '/' })
        } else if (isMerchant && !isAdmin) {
            // Merchant: allowed pages = dashboard, products, categories, orders, stock, after-sales
            const merchantBlocked = ['/admin/users', '/admin/categories', '/admin/articles', '/admin/carousels', '/admin/notices', '/admin/after-sales-arbitration']
            if (merchantBlocked.some(p => to.path.startsWith(p))) {
                next({ path: '/admin/dashboard' })
            } else {
                next()
            }
        } else {
            next()
        }
    }
    // Check if admin/merchant is trying to access customer pages
    else if (isLoggedIn && (isAdmin || isMerchant) && !to.path.startsWith('/admin') && to.path !== '/login' && to.path !== '/register') {
        next({ path: '/admin/dashboard' })
    }
    // Check if route requires authentication (but not admin)
    else if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isLoggedIn) {
            // Not logged in, redirect to login
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            next()
        }
    }
    // No special requirements
    else {
        next()
    }
})

export default router
