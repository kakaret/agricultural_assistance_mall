<template>
  <div class="after-sales-management">
    <h2>售后管理</h2>

    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="待审核" name="0"></el-tab-pane>
      <el-tab-pane label="待退货" name="1"></el-tab-pane>
      <el-tab-pane label="已完成" name="2"></el-tab-pane>
      <el-tab-pane label="已拒绝" name="3"></el-tab-pane>
      <el-tab-pane label="平台介入" name="4"></el-tab-pane>
      <el-tab-pane label="已关闭" name="5"></el-tab-pane>
    </el-tabs>

    <el-table :data="list" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="工单号" width="80"></el-table-column>
      <el-table-column prop="orderId" label="订单号" width="80"></el-table-column>
      <el-table-column label="商品" min-width="150">
        <template slot-scope="scope">
          {{ scope.row.product ? scope.row.product.name : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="买家" width="100">
        <template slot-scope="scope">
          {{ scope.row.user ? scope.row.user.username : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template slot-scope="scope">
          {{ getTypeText(scope.row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="退款金额" width="100">
        <template slot-scope="scope">
          <span style="color:#f56c6c">¥{{ scope.row.refundAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="160">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.status === 0"
            size="mini"
            type="success"
            @click="openApprove(scope.row)"
          >同意</el-button>
          <el-button
            v-if="scope.row.status === 0"
            size="mini"
            type="danger"
            @click="openReject(scope.row)"
          >拒绝</el-button>
          <el-button
            v-if="scope.row.status === 1 && scope.row.returnTrackingNo"
            size="mini"
            type="primary"
            @click="handleConfirmReturn(scope.row)"
          >确认收货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top:20px;text-align:right"
      @current-change="loadList"
    ></el-pagination>

    <!-- 详情 Dialog -->
    <el-dialog title="售后工单详情" :visible.sync="detailVisible" width="650px">
      <div v-if="current" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单号">{{ current.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ current.orderId }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ current.user ? current.user.username : '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品">{{ current.product ? current.product.name : '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ getTypeText(current.type) }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">¥{{ current.refundAmount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(current.status)" size="small">{{ getStatusText(current.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请原因">{{ current.reason }}</el-descriptions-item>
          <el-descriptions-item v-if="current.evidenceUrls" label="凭证图片">
            <div class="evidence-images">
              <el-image
                v-for="(url, idx) in current.evidenceUrls.split(',')"
                :key="idx"
                :src="url"
                :preview-src-list="current.evidenceUrls.split(',')"
                style="width:80px;height:80px;margin-right:8px"
                fit="cover"
              ></el-image>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="current.merchantRemark" label="商家备注">{{ current.merchantRemark }}</el-descriptions-item>
          <el-descriptions-item v-if="current.returnTrackingNo" label="退货快递">{{ current.returnCompany }} {{ current.returnTrackingNo }}</el-descriptions-item>
          <el-descriptions-item v-if="current.appealReason" label="申诉原因">{{ current.appealReason }}</el-descriptions-item>
          <el-descriptions-item v-if="current.adminRemark" label="平台备注">{{ current.adminRemark }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDate(current.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 同意/拒绝 Dialog -->
    <el-dialog :title="reviewAction === 'approve' ? '同意售后' : '拒绝售后'" :visible.sync="reviewVisible" width="450px">
      <el-form label-width="80px">
        <el-form-item label="备注">
          <el-input v-model="reviewRemark" type="textarea" :rows="3" placeholder="请输入备注（可选）"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button :type="reviewAction === 'approve' ? 'success' : 'danger'" :loading="reviewSubmitting" @click="submitReview">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getAfterSalesList, approveAfterSales, rejectAfterSales, confirmReturn } from '@/api/afterSales'
import { getAfterSalesStatusText, getAfterSalesStatusType, getAfterSalesTypeText } from '@/utils/afterSales'
import { formatDate } from '@/utils/date'

export default {
  name: 'AfterSalesManagement',
  data() {
    return {
      activeTab: 'all',
      list: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      detailVisible: false,
      current: null,
      reviewVisible: false,
      reviewAction: 'approve',
      reviewRemark: '',
      reviewSubmitting: false,
      reviewTicketId: null
    }
  },
  computed: {
    ...mapGetters('user', ['userId'])
  },
  created() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const params = {
          merchantId: this.userId,
          currentPage: this.currentPage,
          size: this.pageSize
        }
        if (this.activeTab !== 'all') {
          params.status = parseInt(this.activeTab)
        }
        const res = await getAfterSalesList(params)
        if (res.data && res.data.records) {
          this.list = res.data.records
          this.total = res.data.total || 0
        } else {
          this.list = []
          this.total = 0
        }
      } catch (error) {
        console.error('Load after sales list error:', error)
        this.list = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    handleTabClick() {
      this.currentPage = 1
      this.loadList()
    },

    viewDetail(row) {
      this.current = row
      this.detailVisible = true
    },

    openApprove(row) {
      this.reviewTicketId = row.id
      this.reviewAction = 'approve'
      this.reviewRemark = ''
      this.reviewVisible = true
    },

    openReject(row) {
      this.reviewTicketId = row.id
      this.reviewAction = 'reject'
      this.reviewRemark = ''
      this.reviewVisible = true
    },

    async submitReview() {
      this.reviewSubmitting = true
      try {
        if (this.reviewAction === 'approve') {
          await approveAfterSales(this.reviewTicketId, this.userId, this.reviewRemark)
          this.$message.success('已同意售后')
        } else {
          await rejectAfterSales(this.reviewTicketId, this.userId, this.reviewRemark)
          this.$message.success('已拒绝售后')
        }
        this.reviewVisible = false
        this.loadList()
      } catch (error) {
        console.error('Review error:', error)
        this.$message.error('操作失败')
      } finally {
        this.reviewSubmitting = false
      }
    },

    async handleConfirmReturn(row) {
      try {
        await this.$confirm('确认已收到退货商品？确认后将自动退款给买家。', '确认收货', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await confirmReturn(row.id, this.userId)
        this.$message.success('已确认收货并退款')
        this.loadList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Confirm return error:', error)
          this.$message.error('操作失败')
        }
      }
    },

    getStatusText(status) {
      return getAfterSalesStatusText(status)
    },

    getStatusType(status) {
      return getAfterSalesStatusType(status)
    },

    getTypeText(type) {
      return getAfterSalesTypeText(type)
    },

    formatDate(dateString) {
      return formatDate(dateString)
    }
  }
}
</script>

<style scoped>
.after-sales-management {
  padding: 20px;
}

.after-sales-management h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #303133;
}

.detail-content {
  padding: 10px 0;
}

.evidence-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
