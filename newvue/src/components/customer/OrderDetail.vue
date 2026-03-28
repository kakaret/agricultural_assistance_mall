<template>
  <el-dialog
    title="订单详情"
    :visible.sync="dialogVisible"
    width="700px"
    :before-close="handleClose"
    class="order-detail-dialog"
  >
    <div v-if="loading" class="loading-container">
      <el-spinner></el-spinner>
      <p>加载中...</p>
    </div>

    <div v-else-if="order" class="order-detail">
      <!-- Order Status -->
      <div class="detail-section">
        <h3 class="section-title">订单状态</h3>
        <div class="status-info">
          <el-tag :type="getStatusType(order.status)" size="large">
            {{ getStatusText(order.status) }}
          </el-tag>
          <span class="order-time">下单时间：{{ formatDate(order.createdAt) }}</span>
        </div>
      </div>

      <!-- Product Information -->
      <div class="detail-section">
        <h3 class="section-title">商品信息</h3>
        <div class="product-info">
          <img :src="getProductImage(order.product.imageUrl)" :alt="order.product.name" class="product-image">
          <div class="product-details">
            <h4 class="product-name">{{ order.product.name }}</h4>
            <p class="product-price">¥{{ order.price }}</p>
            <p class="product-quantity">数量：{{ order.quantity }}</p>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="detail-section">
        <h3 class="section-title">订单金额</h3>
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总价</span>
            <span>¥{{ (order.price * order.quantity).toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>实付金额</span>
            <span class="total-price">¥{{ order.totalPrice }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Address -->
      <div class="detail-section">
        <h3 class="section-title">收货信息</h3>
        <div class="address-info">
          <p><strong>收货人：</strong>{{ order.recvName }}</p>
          <p><strong>联系电话：</strong>{{ order.recvPhone }}</p>
          <p><strong>收货地址：</strong>{{ order.recvAddress }}</p>
        </div>
      </div>

      <!-- Logistics Information -->
      <div v-if="order.logistics" class="detail-section">
        <h3 class="section-title">物流信息</h3>
        <div class="logistics-info">
          <p><strong>物流公司：</strong>{{ order.logistics.companyName || order.logistics.company }}</p>
          <p><strong>运单号：</strong>{{ order.logistics.trackingNumber }}</p>
          <p><strong>物流状态：</strong>
            <el-tag :type="getLogisticsStatusType(order.logistics.status)" size="small">
              {{ getLogisticsStatusText(order.logistics.status) }}
            </el-tag>
          </p>
          <p v-if="order.logistics.expectedArrivalTime"><strong>预计到达：</strong>{{ formatDate(order.logistics.expectedArrivalTime) }}</p>
        </div>
      </div>

      <!-- Refund Information -->
      <div v-if="order.refundReason || order.status >= 5" class="detail-section">
        <h3 class="section-title">售后信息</h3>
        <div class="refund-info">
          <p v-if="order.refundReason"><strong>退款原因：</strong>{{ order.refundReason }}</p>
          <p v-if="order.remark && order.status >= 6"><strong>处理备注：</strong>{{ order.remark }}</p>
          <p v-if="order.refundTime"><strong>退款时间：</strong>{{ formatDate(order.refundTime) }}</p>
          <p><strong>退款状态：</strong>
            <el-tag :type="getRefundStatusType(order.refundStatus)" size="small">
              {{ getRefundStatusText(order.refundStatus) }}
            </el-tag>
          </p>
        </div>
      </div>

      <!-- Order Timeline -->
      <div class="detail-section">
        <h3 class="section-title">订单跟踪</h3>
        <el-timeline class="order-timeline">
          <el-timeline-item
            v-for="(item, index) in orderTimeline"
            :key="index"
            :timestamp="item.timestamp"
            :type="item.type"
            placement="top"
          >
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button
        v-if="canCancel"
        type="danger"
        @click="handleCancelOrder"
      >
        取消订单
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getOrder, cancelOrder } from '@/api/order'
import { formatDate } from '@/utils/date'
import { getImageUrl } from '@/utils/image'

export default {
  name: 'OrderDetail',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: Number,
      default: null
    }
  },
  
  data() {
    return {
      dialogVisible: this.visible,
      loading: false,
      order: null
    }
  },
  
  computed: {
    canCancel() {
      return this.order && (this.order.status === 0 || this.order.status === 1)
    },
    
    orderTimeline() {
      if (!this.order) return []
      
      const timeline = []
      
      timeline.push({
        timestamp: this.formatDate(this.order.createdAt),
        content: '订单已创建',
        type: 'primary'
      })
      
      if (this.order.status >= 1 && this.order.status !== 4) {
        timeline.push({
          timestamp: this.formatDate(this.order.updatedAt),
          content: '订单已支付',
          type: 'success'
        })
      }
      
      if (this.order.status >= 2 && this.order.status <= 3) {
        timeline.push({
          timestamp: this.formatDate(this.order.updatedAt),
          content: '订单已发货',
          type: 'success'
        })
      }
      
      if (this.order.status === 3) {
        timeline.push({
          timestamp: this.formatDate(this.order.updatedAt),
          content: '订单已完成',
          type: 'success'
        })
      }
      
      if (this.order.status === 4) {
        timeline.push({
          timestamp: this.formatDate(this.order.updatedAt),
          content: '订单已取消',
          type: 'danger'
        })
      }

      if (this.order.status === 5) {
        timeline.push({
          timestamp: this.formatDate(this.order.updatedAt),
          content: '用户申请退款',
          type: 'warning'
        })
      }

      if (this.order.status === 6) {
        timeline.push({
          timestamp: this.formatDate(this.order.refundTime || this.order.updatedAt),
          content: '退款已完成',
          type: 'success'
        })
      }

      if (this.order.status === 7) {
        timeline.push({
          timestamp: this.formatDate(this.order.updatedAt),
          content: '退款被拒绝',
          type: 'danger'
        })
      }
      
      return timeline
    }
  },
  
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.orderId) {
        this.fetchOrderDetail()
      }
    },
    
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  
  methods: {
    formatDate,
    
    getProductImage(imageUrl) {
      return imageUrl ? getImageUrl(imageUrl) : ''
    },
    
    async fetchOrderDetail() {
      this.loading = true
      try {
        const res = await getOrder(this.orderId)
        if (res.code === '0') {
          this.order = res.data
        } else {
          this.$message.error('获取订单详情失败')
        }
      } catch (error) {
        console.error('Fetch order detail failed:', error)
        this.$message.error('获取订单详情失败')
      } finally {
        this.loading = false
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已发货',
        3: '已完成',
        4: '已取消',
        5: '退款中',
        6: '已退款',
        7: '拒绝退款'
      }
      return statusMap[status] || '未知'
    },
    
    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'primary',
        3: 'success',
        4: 'info',
        5: 'warning',
        6: 'info',
        7: 'danger'
      }
      return typeMap[status] || 'info'
    },

    getLogisticsStatusText(status) {
      const map = { 0: '待发货', 1: '运输中', 2: '已签收', 3: '已取消' }
      return map[status] || '未知'
    },

    getLogisticsStatusType(status) {
      const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' }
      return map[status] || 'info'
    },

    getRefundStatusText(status) {
      const map = { 0: '无退款', 1: '申请退款', 2: '退款中', 3: '已退款', 4: '退款失败' }
      return map[status] || '未知'
    },

    getRefundStatusType(status) {
      const map = { 0: 'info', 1: 'warning', 2: 'warning', 3: 'success', 4: 'danger' }
      return map[status] || 'info'
    },
    
    async handleCancelOrder() {
      try {
        await this.$confirm('确定要取消这个订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await cancelOrder(this.orderId)
        this.$message.success('订单已取消')
        this.$emit('order-cancelled')
        this.handleClose()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Cancel order failed:', error)
          this.$message.error('取消订单失败')
        }
      }
    },
    
    handleClose() {
      this.dialogVisible = false
      this.order = null
    }
  }
}
</script>

<style scoped>
.order-detail-dialog >>> .el-dialog__body {
  padding: 20px 30px;
  max-height: 70vh;
  overflow-y: auto;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-container p {
  margin-top: 16px;
  font-size: 14px;
}

.order-detail {
  width: 100%;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

/* Status Info */
.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-time {
  font-size: 14px;
  color: #606266;
}

/* Product Info */
.product-info {
  display: flex;
  gap: 16px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px 0;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  margin: 0 0 8px 0;
}

.product-quantity {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

/* Order Summary */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.summary-row.total {
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-price {
  font-size: 20px;
  color: #f56c6c;
}

/* Address Info */
.address-info p,
.refund-info p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 8px 0;
}

.address-info p:last-child,
.refund-info p:last-child {
  margin-bottom: 0;
}

.address-info strong,
.refund-info strong {
  color: #303133;
}

/* Logistics Info */
.logistics-info p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 8px 0;
}

.logistics-info p:last-child {
  margin-bottom: 0;
}

.logistics-info strong {
  color: #303133;
}

/* Order Timeline */
.order-timeline {
  padding-left: 8px;
}

.order-timeline >>> .el-timeline-item__timestamp {
  font-size: 13px;
  color: #909399;
}

.order-timeline >>> .el-timeline-item__content {
  font-size: 14px;
  color: #606266;
}

/* Dialog Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .order-detail-dialog >>> .el-dialog {
    width: 95% !important;
  }
  
  .order-detail-dialog >>> .el-dialog__body {
    padding: 16px 20px;
  }
  
  .product-info {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 200px;
  }
  
  .status-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
