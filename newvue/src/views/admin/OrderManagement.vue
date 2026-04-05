<template>
  <div class="order-management">
    <h2 class="page-title">订单管理</h2>
    
    <!-- Filter Tabs -->
    <el-tabs v-model="activeStatus" @tab-click="handleStatusChange" class="status-tabs">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="待支付" name="0"></el-tab-pane>
      <el-tab-pane label="已支付" name="1"></el-tab-pane>
      <el-tab-pane label="已发货" name="2"></el-tab-pane>
      <el-tab-pane label="已完成" name="3"></el-tab-pane>
      <el-tab-pane label="已取消" name="4"></el-tab-pane>
      <el-tab-pane label="退款中" name="5"></el-tab-pane>
      <el-tab-pane label="已退款" name="6"></el-tab-pane>
      <el-tab-pane label="拒绝退款" name="7"></el-tab-pane>
    </el-tabs>
    
    <DataTable
      :data="orders"
      :columns="columns"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :show-edit="false"
      :show-delete="false"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #action="{ row }">
        <el-button
          type="text"
          size="small"
          icon="el-icon-view"
          @click="handleViewDetail(row)"
        >
          查看详情
        </el-button>
        <el-button
          v-if="row.status === 1"
          type="text"
          size="small"
          icon="el-icon-truck"
          @click="handleShip(row)"
        >
          发货
        </el-button>
        <el-button
          v-if="row.status === 5"
          type="text"
          size="small"
          style="color: #E6A23C"
          @click="$router.push('/admin/after-sales')"
        >
          去售后管理处理
        </el-button>
        <el-dropdown v-if="row.status < 3" @command="(cmd) => handleStatusUpdate(row, cmd)">
          <el-button type="text" size="small">
            更多 <i class="el-icon-arrow-down"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="row.status === 0" command="1">标记已支付</el-dropdown-item>
            <el-dropdown-item v-if="row.status === 2" command="3">标记已完成</el-dropdown-item>
            <el-dropdown-item v-if="row.status < 2" command="4" divided>取消订单</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)" size="small">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>
      
      <template #totalPrice="{ row }">
        <span style="color: #f56c6c; font-weight: 600">¥{{ row.totalPrice }}</span>
      </template>
    </DataTable>
    
    <!-- Order Detail Dialog -->
    <el-dialog
      title="订单详情"
      :visible.sync="detailDialogVisible"
      width="800px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentOrder.product?.name }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ currentOrder.quantity }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ currentOrder.price }}</el-descriptions-item>
          <el-descriptions-item label="总价">
            <span style="color: #f56c6c; font-weight: 600">¥{{ currentOrder.totalPrice }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.recvName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.recvPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ currentOrder.recvAddress }}</el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.refundReason" label="退款原因" :span="2">{{ currentOrder.refundReason }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.remark && currentOrder.status >= 5" label="处理备注" :span="2">{{ currentOrder.remark }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.refundTime" label="退款时间">{{ formatDate(currentOrder.refundTime) }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="currentOrder.logistics" class="logistics-info">
          <h4>物流信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流公司">{{ currentOrder.logistics.companyName || currentOrder.logistics.company }}</el-descriptions-item>
            <el-descriptions-item label="运单号">{{ currentOrder.logistics.trackingNumber }}</el-descriptions-item>
            <el-descriptions-item label="物流状态">
              <el-tag :type="getLogisticsStatusType(currentOrder.logistics.status)" size="small">
                {{ getLogisticsStatusText(currentOrder.logistics.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="currentOrder.logistics.expectedArrivalTime" label="预计到达">{{ formatDate(currentOrder.logistics.expectedArrivalTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
    
    <!-- Logistics Form Dialog -->
    <el-dialog
      title="添加物流信息"
      :visible.sync="logisticsDialogVisible"
      width="500px"
    >
      <el-form
        ref="logisticsForm"
        :model="logisticsForm"
        :rules="logisticsRules"
        label-width="100px"
      >
        <el-form-item label="物流公司" prop="companyName">
          <el-select v-model="logisticsForm.companyName" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运"></el-option>
            <el-option label="中通快递" value="中通快递"></el-option>
            <el-option label="圆通速递" value="圆通速递"></el-option>
            <el-option label="申通快递" value="申通快递"></el-option>
            <el-option label="韵达快递" value="韵达快递"></el-option>
            <el-option label="邮政EMS" value="邮政EMS"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="运单号" prop="trackingNumber">
          <el-input v-model="logisticsForm.trackingNumber" placeholder="请输入运单号"></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="logisticsDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleLogisticsSubmit">
          确定
        </el-button>
      </span>
    </el-dialog>

    <!-- Refund Handle Dialog -->
    <el-dialog
      :title="refundAction === 'approve' ? '同意退款' : '拒绝退款'"
      :visible.sync="refundDialogVisible"
      width="450px"
    >
      <el-form label-width="80px">
        <el-form-item v-if="refundCurrentOrder" label="退款原因">
          <span>{{ refundCurrentOrder.refundReason || '无' }}</span>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="refundRemark"
            type="textarea"
            :rows="3"
            :placeholder="refundAction === 'approve' ? '请输入同意退款备注（可选）' : '请输入拒绝原因'"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button
          :type="refundAction === 'approve' ? 'success' : 'danger'"
          :loading="refundSubmitting"
          @click="submitRefundHandle"
        >
          {{ refundAction === 'approve' ? '确认同意' : '确认拒绝' }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '@/components/admin/DataTable.vue'
import { getAllOrders, updateOrderStatus, addLogistics, handleRefund } from '@/api/order'
import { formatDate } from '@/utils/date'
import { mapGetters } from 'vuex'

export default {
  name: 'OrderManagement',
  
  components: {
    DataTable
  },
  
  data() {
    return {
      orders: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      activeStatus: 'all',
      detailDialogVisible: false,
      logisticsDialogVisible: false,
      currentOrder: null,
      submitting: false,
      logisticsForm: {
        companyName: '',
        trackingNumber: ''
      },
      logisticsRules: {
        companyName: [
          { required: true, message: '请选择物流公司', trigger: 'change' }
        ],
        trackingNumber: [
          { required: true, message: '请输入运单号', trigger: 'blur' }
        ]
      },
      refundDialogVisible: false,
      refundAction: '',
      refundRemark: '',
      refundSubmitting: false,
      refundCurrentOrder: null,
      columns: [
        { prop: 'id', label: '订单号', width: '120' },
        { prop: 'product.name', label: '商品名称', minWidth: '150' },
        { prop: 'quantity', label: '数量', width: '80', align: 'center' },
        { prop: 'totalPrice', label: '总价', width: '120', slot: 'totalPrice' },
        { prop: 'recvName', label: '收货人', width: '100' },
        { prop: 'recvPhone', label: '联系电话', width: '120' },
        { prop: 'status', label: '状态', width: '100', align: 'center', slot: 'status' },
        { 
          prop: 'createdAt', 
          label: '下单时间', 
          width: '180',
          formatter: (row) => this.formatDate(row.createdAt)
        }
      ]
    }
  },

  computed: {
    ...mapGetters('user', ['userId', 'isAdmin', 'isMerchant'])
  },

  created() {
    this.loadOrders()
  },
  
  methods: {
    formatDate,
    
    async loadOrders() {
      this.loading = true
      try {
        const params = {
          currentPage: this.currentPage,
          size: this.pageSize
        }
        
        if (this.searchKeyword) {
          params.id = this.searchKeyword
        }
        
        if (this.activeStatus !== 'all') {
          params.status = this.activeStatus
        }

        if (this.isMerchant && !this.isAdmin) {
          params.merchantId = this.userId
        }
        
        const res = await getAllOrders(params)
        
        if (res.code === '0') {
          this.orders = res.data.records || []
          this.total = res.data.total || 0
        }
      } catch (error) {
        console.error('Load orders failed:', error)
        this.$message.error('加载订单列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleStatusChange() {
      this.currentPage = 1
      this.loadOrders()
    },
    
    handleSearch(keyword) {
      this.searchKeyword = keyword
      this.currentPage = 1
      this.loadOrders()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.activeStatus = 'all'
      this.currentPage = 1
      this.loadOrders()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadOrders()
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadOrders()
    },
    
    handleViewDetail(row) {
      this.currentOrder = row
      this.detailDialogVisible = true
    },
    
    handleShip(row) {
      this.currentOrder = row
      this.logisticsDialogVisible = true
    },
    
    async handleStatusUpdate(row, status) {
      try {
        const statusText = this.getStatusText(status)
        await this.$confirm(`确定要将订单状态更新为"${statusText}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await updateOrderStatus(row.id, status)
        this.$message.success('状态更新成功')
        this.loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Update order status failed:', error)
          this.$message.error('状态更新失败')
        }
      }
    },
    
    handleLogisticsSubmit() {
      this.$refs.logisticsForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const res = await addLogistics(this.currentOrder.id, this.logisticsForm)
          if (res.code !== '0') {
            this.$message.error(res.msg || '创建物流信息失败')
            return
          }

          this.$message.success('发货成功')
          this.logisticsDialogVisible = false
          this.loadOrders()
          
          this.logisticsForm = {
            companyName: '',
            trackingNumber: ''
          }
        } catch (error) {
          console.error('Add logistics failed:', error)
          this.$message.error('发货失败')
        } finally {
          this.submitting = false
        }
      })
    },

    handleRefundApprove(row) {
      this.refundCurrentOrder = row
      this.refundAction = 'approve'
      this.refundRemark = ''
      this.refundDialogVisible = true
    },

    handleRefundReject(row) {
      this.refundCurrentOrder = row
      this.refundAction = 'reject'
      this.refundRemark = ''
      this.refundDialogVisible = true
    },

    async submitRefundHandle() {
      if (this.refundAction === 'reject' && !this.refundRemark.trim()) {
        this.$message.warning('拒绝退款时请填写原因')
        return
      }
      this.refundSubmitting = true
      try {
        const status = this.refundAction === 'approve' ? 6 : 7
        await handleRefund(this.refundCurrentOrder.id, status, this.refundRemark || '已处理')
        this.$message.success(this.refundAction === 'approve' ? '已同意退款' : '已拒绝退款')
        this.refundDialogVisible = false
        this.loadOrders()
      } catch (error) {
        console.error('Handle refund failed:', error)
        this.$message.error('处理退款失败')
      } finally {
        this.refundSubmitting = false
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
    }
  }
}
</script>

<style scoped>
.order-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.status-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 20px 20px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.order-detail {
  padding: 20px 0;
}

.logistics-info {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.logistics-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}
</style>
