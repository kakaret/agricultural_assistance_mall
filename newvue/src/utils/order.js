/**
 * Order utility functions
 */

/**
 * Order status constants
 */
export const ORDER_STATUS = {
    PENDING: 0,        // 待支付
    PAID: 1,           // 待发货
    SHIPPED: 2,        // 待收货
    COMPLETED: 3,      // 已完成
    CANCELLED: 4,      // 已取消
    REFUNDING: 5,      // 退款中
    REFUNDED: 6,       // 已退款
    REFUND_REJECTED: 7 // 拒绝退款
}

/**
 * Get order status text
 * @param {number} status - Order status code
 * @returns {string} Status text
 */
export function getOrderStatusText(status) {
    const statusMap = {
        [ORDER_STATUS.PENDING]: '待支付',
        [ORDER_STATUS.PAID]: '待发货',
        [ORDER_STATUS.SHIPPED]: '待收货',
        [ORDER_STATUS.COMPLETED]: '已完成',
        [ORDER_STATUS.CANCELLED]: '已取消',
        [ORDER_STATUS.REFUNDING]: '退款中',
        [ORDER_STATUS.REFUNDED]: '已退款',
        [ORDER_STATUS.REFUND_REJECTED]: '拒绝退款'
    }
    return statusMap[status] || `状态${status}`
}

/**
 * Get order status tag type for Element UI
 * @param {number} status - Order status code
 * @returns {string} Tag type (success, warning, danger, info)
 */
export function getOrderStatusType(status) {
    const typeMap = {
        [ORDER_STATUS.PENDING]: 'warning',
        [ORDER_STATUS.PAID]: 'primary',
        [ORDER_STATUS.SHIPPED]: 'info',
        [ORDER_STATUS.COMPLETED]: 'success',
        [ORDER_STATUS.CANCELLED]: 'danger',
        [ORDER_STATUS.REFUNDING]: 'warning',
        [ORDER_STATUS.REFUNDED]: 'info',
        [ORDER_STATUS.REFUND_REJECTED]: 'danger'
    }
    return typeMap[status] || 'info'
}

/**
 * Check if order can be cancelled
 * @param {number} status - Order status code
 * @returns {boolean} Whether order can be cancelled
 */
export function canCancelOrder(status) {
    return status === ORDER_STATUS.PENDING
}

/**
 * Check if order can be paid
 * @param {number} status - Order status code
 * @returns {boolean} Whether order can be paid
 */
export function canPayOrder(status) {
    return status === ORDER_STATUS.PENDING
}

/**
 * Check if order can request refund
 * @param {number} status - Order status code
 * @returns {boolean} Whether order can request refund
 */
export function canRefundOrder(status) {
    return status === ORDER_STATUS.PAID || status === ORDER_STATUS.SHIPPED
}

/**
 * Check if order can be confirmed (received)
 * @param {number} status - Order status code
 * @returns {boolean} Whether order can be confirmed
 */
export function canConfirmOrder(status) {
    return status === ORDER_STATUS.SHIPPED
}

/**
 * Format order price
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export function formatOrderPrice(price) {
    if (price === null || price === undefined) {
        return '¥0.00'
    }
    return `¥${Number(price).toFixed(2)}`
}
