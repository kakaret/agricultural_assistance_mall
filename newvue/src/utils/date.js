/**
 * Date utility functions
 */

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, includeTime = true) {
    if (!dateString) {
        return ''
    }

    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return dateString
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    if (!includeTime) {
        return `${year}-${month}-${day}`
    }

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Format date to relative time (e.g., "2小时前")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
    if (!dateString) {
        return ''
    }

    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
        return formatDate(dateString, false)
    } else if (days > 0) {
        return `${days}天前`
    } else if (hours > 0) {
        return `${hours}小时前`
    } else if (minutes > 0) {
        return `${minutes}分钟前`
    } else {
        return '刚刚'
    }
}
