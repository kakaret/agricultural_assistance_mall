import request from '@/utils/request'

/**
 * 买家提交售后申请
 */
export function applyAfterSales(data) {
  return request({
    url: '/afterSales',
    method: 'post',
    data
  })
}

/**
 * 分页查询售后工单
 */
export function getAfterSalesList(params) {
  return request({
    url: '/afterSales/page',
    method: 'get',
    params
  })
}

/**
 * 获取售后工单详情
 */
export function getAfterSalesDetail(id) {
  return request({
    url: `/afterSales/${id}`,
    method: 'get'
  })
}

/**
 * 商家同意售后
 */
export function approveAfterSales(id, merchantId, remark) {
  return request({
    url: `/afterSales/${id}/approve`,
    method: 'put',
    params: { merchantId, remark }
  })
}

/**
 * 商家拒绝售后
 */
export function rejectAfterSales(id, merchantId, remark) {
  return request({
    url: `/afterSales/${id}/reject`,
    method: 'put',
    params: { merchantId, remark }
  })
}

/**
 * 买家填写退货物流
 */
export function fillReturnLogistics(id, userId, trackingNo, company) {
  return request({
    url: `/afterSales/${id}/return-logistics`,
    method: 'put',
    params: { userId, trackingNo, company }
  })
}

/**
 * 商家确认收货
 */
export function confirmReturn(id, merchantId) {
  return request({
    url: `/afterSales/${id}/confirm-return`,
    method: 'put',
    params: { merchantId }
  })
}

/**
 * 买家申诉
 */
export function appealAfterSales(id, userId, appealReason) {
  return request({
    url: `/afterSales/${id}/appeal`,
    method: 'put',
    params: { userId, appealReason }
  })
}

/**
 * Admin仲裁
 */
export function arbitrateAfterSales(id, adminId, supportBuyer, adminRemark) {
  return request({
    url: `/afterSales/${id}/arbitrate`,
    method: 'put',
    params: { adminId, supportBuyer, adminRemark }
  })
}

/**
 * 买家取消售后
 */
export function cancelAfterSales(id, userId) {
  return request({
    url: `/afterSales/${id}/cancel`,
    method: 'put',
    params: { userId }
  })
}
