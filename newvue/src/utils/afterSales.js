/**
 * 售后工单状态映射
 */

const STATUS_MAP = {
  0: { text: '待审核', color: '#E6A23C', type: 'warning' },
  1: { text: '待退货', color: '#409EFF', type: 'primary' },
  2: { text: '已完成', color: '#67C23A', type: 'success' },
  3: { text: '已拒绝', color: '#F56C6C', type: 'danger' },
  4: { text: '平台介入中', color: '#909399', type: 'info' },
  5: { text: '已关闭', color: '#909399', type: 'info' }
}

const TYPE_MAP = {
  0: '仅退款',
  1: '退货退款'
}

export function getAfterSalesStatusText(status) {
  return STATUS_MAP[status]?.text || '未知'
}

export function getAfterSalesStatusType(status) {
  return STATUS_MAP[status]?.type || 'info'
}

export function getAfterSalesStatusColor(status) {
  return STATUS_MAP[status]?.color || '#909399'
}

export function getAfterSalesTypeText(type) {
  return TYPE_MAP[type] || '未知'
}
