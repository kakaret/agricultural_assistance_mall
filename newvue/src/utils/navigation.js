/**
 * Navigation utility functions
 * Provides safe navigation methods that avoid duplicate navigation errors
 */

/**
 * Safely navigate to a route
 * @param {Object} router - Vue Router instance
 * @param {string|Object} location - Route location (path string or route object)
 * @returns {Promise}
 */
export function safeNavigate(router, location) {
    const targetPath = typeof location === 'string' ? location : location.path
    const currentPath = router.currentRoute.path

    // Check if already on target route
    if (currentPath === targetPath) {
        return Promise.resolve()
    }

    // Navigate and catch duplicate navigation errors
    return router.push(location).catch(err => {
        // Ignore navigation duplicated errors
        if (err.name !== 'NavigationDuplicated') {
            throw err
        }
    })
}

/**
 * Safely replace current route
 * @param {Object} router - Vue Router instance
 * @param {string|Object} location - Route location
 * @returns {Promise}
 */
export function safeReplace(router, location) {
    const targetPath = typeof location === 'string' ? location : location.path
    const currentPath = router.currentRoute.path

    if (currentPath === targetPath) {
        return Promise.resolve()
    }

    return router.replace(location).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
            throw err
        }
    })
}

/**
 * Check if currently on a specific route
 * @param {Object} router - Vue Router instance
 * @param {string} path - Route path to check
 * @returns {boolean}
 */
export function isCurrentRoute(router, path) {
    return router.currentRoute.path === path
}

/**
 * Navigate with query parameters
 * @param {Object} router - Vue Router instance
 * @param {string} path - Route path
 * @param {Object} query - Query parameters
 * @returns {Promise}
 */
export function navigateWithQuery(router, path, query) {
    const currentPath = router.currentRoute.path
    const currentQuery = router.currentRoute.query

    // Check if already on same route with same query
    if (currentPath === path && JSON.stringify(currentQuery) === JSON.stringify(query)) {
        return Promise.resolve()
    }

    return router.push({ path, query }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
            throw err
        }
    })
}
