<template>
  <div class="order-page">
    <Header />
    
    <div class="container">
      <h2 class="page-title">我的订单</h2>
      
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部订单" name="all"></el-tab-pane>
        <el-tab-pane label="待支付" name="0"></el-tab-pane>
        <el-tab-pane label="待发货" name="1"></el-tab-pane>
        <el-tab-pane label="待收货" name="2"></el-tab-pane>
        <el-tab-pane label="已完成" name="3"></el-tab-pane>
      </el-tabs>
      
      <Loading v-if="loading" :visible="loading" />
      
      <div v-else-if="orders.length > 0" class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.id }}</span>
            <span class="order-time">{{ formatDate(order.createdAt) }}</span>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
          
          <div class="order-content">
            <div class="product-info">
              <img :src="getProductImage(order.product.imageUrl)" :alt="order.product.name" />
              <div class="product-details">
                <h4>{{ order.product.name }}</h4>
                <p>数量：{{ order.quantity }}</p>
              </div>
            </div>
            
            <div class="order-price">
              <div class="price-label">订单金额</div>
              <div class="price-value">¥{{ order.totalPrice }}</div>
            </div>
            
            <div class="order-actions">
              <el-button size="small" @click="viewDetail(order)">查看详情</el-button>
              <el-button
                v-if="canCancel(order.status)"
                size="small"
                type="danger"
                @click="cancelOrder(order)"
              >
                取消订单
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无订单"></el-empty>
      
      <Pagination
        v-if="total > 0"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
    
    <Footer />
    
    <!-- Order Detail Dialog -->
    <el-dialog
      title="订单详情"
      :visible.sync="detailVisible"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentOrder.product.name }}</el-descriptions-item>
          <el-descriptions-item label="购买数量">{{ currentOrder.quantity }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ currentOrder.price }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.totalPrice }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.recvName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.recvPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentOrder.recvAddress }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.logistics" label="物流信息">
            {{ currentOrder.logistics.company }} - {{ currentOrder.logistics.trackingNumber }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getOrders, cancelOrder as cancelOrderApi } from '@/api/order'
import { getImageUrl, getPlaceholderImage } from '@/utils/image'
import { formatDate } from '@/utils/date'
import { getOrderStatusText, getOrderStatusType, canCancelOrder } from '@/utils/order'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'Order',
  components: {
    Header,
    Footer,
    Pagination,
    Loading
  },
  data() {
    return {
      activeTab: 'all',
      orders: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      detailVisible: false,
      currentOrder: null,
      defaultImage: 'https://via.placeholder.com/80x80?text=Product'
    }
  },
  computed: {
    ...mapGetters('user', ['userId'])
  },
  created() {
    if (this.userId) {
      this.loadOrders()
    }
  },
  methods: {
    async loadOrders() {
      if (!this.userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      this.loading = true
      try {
        const params = {
          currentPage: this.currentPage,
          size: this.pageSize
        }
        
        // Only add status parameter if not viewing all orders
        if (this.activeTab && this.activeTab !== 'all') {
          params.status = this.activeTab
        }
        
        console.log('Loading orders with params:', params)
        const response = await getOrders(this.userId, params)
        
        // Handle paginated response
        if (response.data && response.data.records) {
          this.orders = response.data.records
          this.total = response.data.total || 0
        } else {
          this.orders = []
          this.total = 0
        }
        
        console.log(`Loaded ${this.orders.length} orders for status: ${this.activeTab || 'all'}`)
      } catch (error) {
        console.error('Failed to load orders:', error)
        this.$message.error('加载订单失败')
        this.orders = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    
    handleTabClick(tab) {
      console.log('Tab clicked:', tab.name)
      this.activeTab = tab.name
      this.currentPage = 1
      this.loadOrders()
    },
    
    handlePageChange({ page, size }) {
      this.currentPage = page
      this.pageSize = size
      this.loadOrders()
    },
    
    viewDetail(order) {
      this.currentOrder = order
      this.detailVisible = true
    },
    
    async cancelOrder(order) {
      try {
        await this.$confirm('确定要取消该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await cancelOrderApi(order.id)
        this.$message.success('订单已取消')
        this.loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Cancel order error:', error)
          this.$message.error('取消订单失败')
        }
      }
    },
    
    getProductImage(imageUrl) {
      return imageUrl ? getImageUrl(imageUrl) : getPlaceholderImage(80, 80)
    },
    
    formatDate(dateString) {
      return formatDate(dateString)
    },
    
    getStatusText(status) {
      return getOrderStatusText(status)
    },
    
    getStatusType(status) {
      return getOrderStatusType(status)
    },
    
    canCancel(status) {
      return canCancelOrder(status)
    }
  }
}
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.orders-list {
  margin-top: 20px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.order-no {
  font-size: 14px;
  color: #606266;
}

.order-time {
  font-size: 12px;
  color: #909399;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 150px 150px;
  gap: 20px;
  padding: 20px;
  align-items: center;
}

.product-info {
  display: flex;
  gap: 15px;
}

.product-info img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.product-details h4 {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.product-details p {
  font-size: 12px;
  color: #909399;
}

.order-price {
  text-align: center;
}

.price-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.price-value {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-detail {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .order-content {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .order-price,
  .order-actions {
    text-align: left;
  }
}
</style>
