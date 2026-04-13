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
        <el-tab-pane label="退款/售后" name="refund"></el-tab-pane>
      </el-tabs>

      <Loading v-if="loading" :visible="loading" />

      <!-- 售后工单列表（退款/售后Tab） -->
      <template v-else-if="activeTab === 'refund'">
        <div v-if="afterSalesList.length > 0" class="orders-list">
          <div v-for="ticket in afterSalesList" :key="ticket.id" class="order-card">
            <div class="order-header">
              <span class="order-no">售后工单号：{{ ticket.id }} | 订单号：{{ ticket.orderId }}</span>
              <span class="order-time">{{ formatDate(ticket.createdAt) }}</span>
              <el-tag :type="getAsStatusType(ticket.status)">
                {{ getAsStatusText(ticket.status) }}
              </el-tag>
            </div>
            <div class="order-content">
              <div class="product-info">
                <img v-if="ticket.product" :src="getProductImage(ticket.product.imageUrl)" :alt="ticket.product.name" />
                <div class="product-details">
                  <h4>{{ ticket.product ? ticket.product.name : '商品已删除' }}</h4>
                  <p>类型：{{ getAsTypeText(ticket.type) }}</p>
                  <p>原因：{{ ticket.reason }}</p>
                  <p v-if="ticket.merchantRemark">商家备注：{{ ticket.merchantRemark }}</p>
                  <p v-if="ticket.adminRemark">平台备注：{{ ticket.adminRemark }}</p>
                </div>
              </div>
              <div class="order-price">
                <div class="price-label">退款金额</div>
                <div class="price-value">¥{{ ticket.refundAmount }}</div>
              </div>
              <div class="order-actions">
                <el-button
                  v-if="ticket.status === 1 && !ticket.returnTrackingNo"
                  size="small"
                  type="primary"
                  @click="openReturnLogistics(ticket)"
                >
                  填写退货物流
                </el-button>
                <el-button
                  v-if="ticket.status === 3"
                  size="small"
                  type="warning"
                  @click="openAppeal(ticket)"
                >
                  申诉
                </el-button>
                <el-button
                  v-if="ticket.status === 0 || ticket.status === 1"
                  size="small"
                  type="danger"
                  @click="handleCancelAfterSales(ticket)"
                >
                  取消售后
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无售后工单"></el-empty>
        <Pagination
          v-if="asTotal > 0"
          :total="asTotal"
          :current-page="asCurrentPage"
          :page-size="asPageSize"
          @page-change="handleAsPageChange"
        />
      </template>

      <!-- 订单列表（其他Tab） -->
      <template v-else>
        <div v-if="orders.length > 0" class="orders-list">
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
                <el-button size="small" icon="el-icon-chat-dot-square" @click="handleContactService(order)">客服</el-button>
                <el-button
                  v-if="order.status === 0"
                  size="small"
                  type="primary"
                  @click="handlePay(order)"
                >
                  去支付
                </el-button>
                <el-button
                  v-if="order.status === 2"
                  size="small"
                  type="success"
                  @click="handleConfirm(order)"
                >
                  确认收货
                </el-button>
                <el-button
                  v-if="order.status === 2"
                  size="small"
                  @click="viewLogistics(order)"
                >
                  查看物流
                </el-button>
                <el-button
                  v-if="order.status === 1 || order.status === 2 || order.status === 3"
                  size="small"
                  type="warning"
                  @click="openAfterSales(order)"
                >
                  申请售后
                </el-button>
                <el-button
                  v-if="order.status === 5"
                  size="small"
                  type="warning"
                  @click="goToAfterSalesTab()"
                >
                  查看售后进度
                </el-button>
                <el-button
                  v-if="order.status === 0"
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
      </template>
    </div>

    <Footer />

    <!-- Chat Window -->
    <ChatWindow :visible.sync="showChatWindow" :session-id="chatSessionId" />

    <!-- Order Detail Dialog -->
    <el-dialog
      title="订单详情"
      :visible.sync="detailVisible"
      width="650px"
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
          <el-descriptions-item v-if="currentOrder.refundReason" label="退款原因">{{ currentOrder.refundReason }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.remark && currentOrder.status >= 5" label="处理备注">{{ currentOrder.remark }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.refundTime" label="退款时间">{{ formatDate(currentOrder.refundTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- Logistics Dialog -->
    <el-dialog
      title="物流详情"
      :visible.sync="logisticsVisible"
      width="550px"
    >
      <div v-if="logisticsLoading" style="text-align:center;padding:40px">
        <i class="el-icon-loading" style="font-size:24px"></i>
        <p>加载物流信息...</p>
      </div>
      <div v-else-if="logisticsData" class="logistics-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="物流公司">{{ logisticsData.companyName }}</el-descriptions-item>
          <el-descriptions-item label="运单号">{{ logisticsData.trackingNumber }}</el-descriptions-item>
          <el-descriptions-item label="物流状态">
            <el-tag :type="getLogisticsStatusType(logisticsData.status)">
              {{ getLogisticsStatusText(logisticsData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="收货人">{{ logisticsData.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="收货电话">{{ logisticsData.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ logisticsData.receiverAddress }}</el-descriptions-item>
          <el-descriptions-item v-if="logisticsData.expectedArrivalTime" label="预计到达">{{ formatDate(logisticsData.expectedArrivalTime) }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ formatDate(logisticsData.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else style="text-align:center;padding:40px;color:#909399">
        <i class="el-icon-truck" style="font-size:48px;margin-bottom:16px;display:block"></i>
        商家正在备货中，发货后可查看物流信息
      </div>
    </el-dialog>

    <!-- 售后申请 Dialog -->
    <el-dialog
      title="申请售后"
      :visible.sync="afterSalesVisible"
      width="550px"
    >
      <el-form label-width="100px">
        <el-form-item label="售后类型">
          <el-radio-group v-model="afterSalesForm.type">
            <el-radio :label="0">仅退款</el-radio>
            <el-radio :label="1">退货退款</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input-number
            v-model="afterSalesForm.refundAmount"
            :min="0.01"
            :max="afterSalesForm.maxAmount"
            :precision="2"
            :step="0.01"
          ></el-input-number>
          <span style="margin-left:10px;color:#909399">最多 ¥{{ afterSalesForm.maxAmount }}</span>
        </el-form-item>
        <el-form-item label="申请原因">
          <el-input
            v-model="afterSalesForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入售后原因"
          ></el-input>
        </el-form-item>
        <el-form-item label="凭证图片">
          <el-upload
            action="/api/file/upload"
            :headers="uploadHeaders"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :file-list="afterSalesForm.fileList"
            accept="image/*"
            :limit="5"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="afterSalesVisible = false">取消</el-button>
        <el-button type="primary" :loading="afterSalesSubmitting" @click="submitAfterSales">提交</el-button>
      </span>
    </el-dialog>

    <!-- 退货物流 Dialog -->
    <el-dialog
      title="填写退货物流"
      :visible.sync="returnLogisticsVisible"
      width="450px"
    >
      <el-form label-width="100px">
        <el-form-item label="快递公司">
          <el-input v-model="returnLogisticsForm.company" placeholder="请输入快递公司"></el-input>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="returnLogisticsForm.trackingNo" placeholder="请输入快递单号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="returnLogisticsVisible = false">取消</el-button>
        <el-button type="primary" :loading="returnLogisticsSubmitting" @click="submitReturnLogistics">提交</el-button>
      </span>
    </el-dialog>

    <!-- 申诉 Dialog -->
    <el-dialog
      title="申诉"
      :visible.sync="appealVisible"
      width="450px"
    >
      <el-form label-width="80px">
        <el-form-item label="申诉原因">
          <el-input
            v-model="appealReason"
            type="textarea"
            :rows="3"
            placeholder="请输入申诉原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="appealVisible = false">取消</el-button>
        <el-button type="primary" :loading="appealSubmitting" @click="submitAppeal">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getOrders, cancelOrder as cancelOrderApi, payOrder, confirmOrder, getOrderLogistics } from '@/api/order'
import { applyAfterSales, getAfterSalesList, fillReturnLogistics, appealAfterSales, cancelAfterSales } from '@/api/afterSales'
import { getImageUrl, getPlaceholderImage } from '@/utils/image'
import { formatDate } from '@/utils/date'
import { getOrderStatusText, getOrderStatusType, canCancelOrder } from '@/utils/order'
import { getAfterSalesStatusText, getAfterSalesStatusType, getAfterSalesTypeText } from '@/utils/afterSales'
import { getToken } from '@/utils/auth'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loading from '@/components/common/Loading.vue'
import ChatWindow from '@/components/ChatWindow.vue'

export default {
  name: 'Order',
  components: {
    Header,
    Footer,
    Pagination,
    Loading,
    ChatWindow
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
      logisticsVisible: false,
      logisticsLoading: false,
      logisticsData: null,
      // 售后申请
      afterSalesVisible: false,
      afterSalesSubmitting: false,
      afterSalesForm: {
        type: 0,
        reason: '',
        refundAmount: 0,
        maxAmount: 0,
        orderId: null,
        fileList: [],
        evidenceUrls: []
      },
      // 售后工单列表
      afterSalesList: [],
      asCurrentPage: 1,
      asPageSize: 10,
      asTotal: 0,
      // 退货物流
      returnLogisticsVisible: false,
      returnLogisticsSubmitting: false,
      returnLogisticsForm: {
        ticketId: null,
        company: '',
        trackingNo: ''
      },
      // 申诉
      appealVisible: false,
      appealSubmitting: false,
      appealReason: '',
      appealTicketId: null,
      // 聊天窗口
      showChatWindow: false,
      chatSessionId: null
    }
  },
  computed: {
    ...mapGetters('user', ['userId', 'token', 'userInfo']),
    uploadHeaders() {
      return { token: getToken() }
    }
  },
  created() {
    if (this.userId) {
      this.loadOrders()
    }
  },
  methods: {
    ...mapActions('chat', ['initChat', 'createOrGetSession']),
    
    async loadOrders() {
      if (!this.userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        if (this.activeTab === 'refund') {
          await this.loadAfterSales()
        } else {
          await this.loadOrderList()
        }
      } finally {
        this.loading = false
      }
    },

    async loadOrderList() {
      try {
        const params = {
          currentPage: this.currentPage,
          size: this.pageSize
        }
        if (this.activeTab && this.activeTab !== 'all') {
          params.status = this.activeTab
        }
        const response = await getOrders(this.userId, params)
        if (response.data && response.data.records) {
          this.orders = response.data.records
          this.total = response.data.total || 0
        } else {
          this.orders = []
          this.total = 0
        }
      } catch (error) {
        console.error('Failed to load orders:', error)
        this.$message.error('加载订单失败')
        this.orders = []
        this.total = 0
      }
    },

    async loadAfterSales() {
      try {
        const res = await getAfterSalesList({
          userId: this.userId,
          currentPage: this.asCurrentPage,
          size: this.asPageSize
        })
        if (res.data && res.data.records) {
          this.afterSalesList = res.data.records
          this.asTotal = res.data.total || 0
        } else {
          this.afterSalesList = []
          this.asTotal = 0
        }
      } catch (error) {
        console.error('Failed to load after sales:', error)
        this.afterSalesList = []
        this.asTotal = 0
      }
    },

    handleTabClick(tab) {
      this.activeTab = tab.name
      this.currentPage = 1
      this.asCurrentPage = 1
      this.loadOrders()
    },

    handlePageChange({ page, size }) {
      this.currentPage = page
      this.pageSize = size
      this.loadOrders()
    },

    handleAsPageChange({ page, size }) {
      this.asCurrentPage = page
      this.asPageSize = size
      this.loadAfterSales()
    },

    viewDetail(order) {
      this.currentOrder = order
      this.detailVisible = true
    },

    async handleContactService(order) {
      try {
        await this.initChat({
          currentUserId: this.userInfo.id,
          currentUserRole: 'CUSTOMER'
        })
        const session = await this.createOrGetSession({
          customerId: this.userInfo.id,
          merchantId: order.product.merchantId,
          productId: order.product.id
        })
        this.chatSessionId = session.id
        this.showChatWindow = true
      } catch (error) {
        console.error('Failed to open chat:', error)
        this.$message.error('打开客服窗口失败')
      }
    },

    async handlePay(order) {
      try {
        await this.$confirm('确定要支付该订单吗？', '确认支付', {
          confirmButtonText: '确定支付',
          cancelButtonText: '取消',
          type: 'info'
        })
        await payOrder(order.id)
        this.$message.success('支付成功')
        this.loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Pay order error:', error)
          this.$message.error('支付失败')
        }
      }
    },

    async handleConfirm(order) {
      try {
        await this.$confirm('确定已收到商品吗？', '确认收货', {
          confirmButtonText: '确认收货',
          cancelButtonText: '取消',
          type: 'info'
        })
        await confirmOrder(order.id)
        this.$message.success('已确认收货')
        this.loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Confirm order error:', error)
          this.$message.error('确认收货失败')
        }
      }
    },

    async viewLogistics(order) {
      this.logisticsVisible = true
      this.logisticsLoading = true
      this.logisticsData = null
      try {
        const res = await getOrderLogistics(order.id)
        if (res.code === '0' && res.data) {
          this.logisticsData = res.data
        }
      } catch (error) {
        console.error('Get logistics error:', error)
      } finally {
        this.logisticsLoading = false
      }
    },

    // ====== 售后申请 ======
    openAfterSales(order) {
      this.afterSalesForm = {
        type: 0,
        reason: '',
        refundAmount: Number(order.totalPrice),
        maxAmount: Number(order.totalPrice),
        orderId: order.id,
        fileList: [],
        evidenceUrls: []
      }
      this.afterSalesVisible = true
    },

    handleUploadSuccess(response) {
      if (response.code === '0' && response.data) {
        this.afterSalesForm.evidenceUrls.push(response.data)
      }
    },

    handleUploadRemove(file) {
      const url = file.response ? file.response.data : file.url
      const idx = this.afterSalesForm.evidenceUrls.indexOf(url)
      if (idx > -1) {
        this.afterSalesForm.evidenceUrls.splice(idx, 1)
      }
    },

    async submitAfterSales() {
      if (!this.afterSalesForm.reason.trim()) {
        this.$message.warning('请输入售后原因')
        return
      }
      if (this.afterSalesForm.refundAmount <= 0) {
        this.$message.warning('请输入退款金额')
        return
      }
      this.afterSalesSubmitting = true
      try {
        await applyAfterSales({
          orderId: this.afterSalesForm.orderId,
          userId: this.userId,
          type: this.afterSalesForm.type,
          reason: this.afterSalesForm.reason,
          refundAmount: this.afterSalesForm.refundAmount,
          evidenceUrls: this.afterSalesForm.evidenceUrls.join(',') || null
        })
        this.$message.success('售后申请已提交')
        this.afterSalesVisible = false
        this.loadOrders()
      } catch (error) {
        console.error('After sales apply error:', error)
        this.$message.error('提交售后申请失败')
      } finally {
        this.afterSalesSubmitting = false
      }
    },

    // ====== 退货物流 ======
    openReturnLogistics(ticket) {
      this.returnLogisticsForm = {
        ticketId: ticket.id,
        company: '',
        trackingNo: ''
      }
      this.returnLogisticsVisible = true
    },

    async submitReturnLogistics() {
      if (!this.returnLogisticsForm.company.trim() || !this.returnLogisticsForm.trackingNo.trim()) {
        this.$message.warning('请填写完整物流信息')
        return
      }
      this.returnLogisticsSubmitting = true
      try {
        await fillReturnLogistics(
          this.returnLogisticsForm.ticketId,
          this.userId,
          this.returnLogisticsForm.trackingNo,
          this.returnLogisticsForm.company
        )
        this.$message.success('退货物流已提交')
        this.returnLogisticsVisible = false
        this.loadAfterSales()
      } catch (error) {
        console.error('Fill return logistics error:', error)
        this.$message.error('提交失败')
      } finally {
        this.returnLogisticsSubmitting = false
      }
    },

    // ====== 申诉 ======
    openAppeal(ticket) {
      this.appealTicketId = ticket.id
      this.appealReason = ''
      this.appealVisible = true
    },

    async submitAppeal() {
      if (!this.appealReason.trim()) {
        this.$message.warning('请输入申诉原因')
        return
      }
      this.appealSubmitting = true
      try {
        await appealAfterSales(this.appealTicketId, this.userId, this.appealReason)
        this.$message.success('申诉已提交')
        this.appealVisible = false
        this.loadAfterSales()
      } catch (error) {
        console.error('Appeal error:', error)
        this.$message.error('申诉失败')
      } finally {
        this.appealSubmitting = false
      }
    },

    // ====== 取消售后 ======
    async handleCancelAfterSales(ticket) {
      try {
        await this.$confirm('确定要取消该售后申请吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await cancelAfterSales(ticket.id, this.userId)
        this.$message.success('售后已取消')
        this.loadAfterSales()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Cancel after sales error:', error)
          this.$message.error('取消失败')
        }
      }
    },

    goToAfterSalesTab() {
      this.activeTab = 'refund'
      this.asCurrentPage = 1
      this.loadAfterSales()
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
    },

    getAsStatusText(status) {
      return getAfterSalesStatusText(status)
    },

    getAsStatusType(status) {
      return getAfterSalesStatusType(status)
    },

    getAsTypeText(type) {
      return getAfterSalesTypeText(type)
    },

    getLogisticsStatusText(status) {
      const map = { 0: '待发货', 1: '运输中', 2: '已签收', 3: '已取消' }
      return map[status] || '未知'
    },

    getLogisticsStatusType(status) {
      const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' }
      return map[status] || 'info'
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
  grid-template-columns: 1fr 150px 180px;
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
  gap: 8px;
}

.order-detail {
  padding: 20px 0;
}

.logistics-detail {
  padding: 10px 0;
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
