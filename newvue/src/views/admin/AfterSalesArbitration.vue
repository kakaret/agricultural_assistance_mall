<template>
  <div class="after-sales-arbitration">
    <h2>售后仲裁</h2>

    <el-table :data="list" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="工单号" width="80"></el-table-column>
      <el-table-column prop="orderId" label="订单号" width="80"></el-table-column>
      <el-table-column label="商品" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.product ? scope.row.product.name : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="买家" width="100">
        <template slot-scope="scope">
          {{ scope.row.user ? scope.row.user.username : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="商家" width="100">
        <template slot-scope="scope">
          {{ scope.row.merchant ? scope.row.merchant.username : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="90">
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
      <el-table-column label="操作" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="viewDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.status === 4"
            size="mini"
            type="warning"
            @click="openArbitrate(scope.row)"
          >仲裁</el-button>
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
    <el-dialog title="售后工单详情" :visible.sync="detailVisible" width="700px">
      <div v-if="current" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单号">{{ current.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ current.orderId }}</el-descriptions-item>
          <el-descriptions-item label="买家">{{ current.user ? current.user.username : '-' }}</el-descriptions-item>
          <el-descriptions-item label="商家">{{ current.merchant ? current.merchant.username : '-' }}</el-descriptions-item>
          <el-descriptions-item label="商品">{{ current.product ? current.product.name : '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ getTypeText(current.type) }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">¥{{ current.refundAmount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(current.status)" size="small">{{ getStatusText(current.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="买家申请原因">{{ current.reason }}</el-descriptions-item>
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
          <el-descriptions-item v-if="current.appealReason" label="买家申诉原因">{{ current.appealReason }}</el-descriptions-item>
          <el-descriptions-item v-if="current.adminRemark" label="平台裁决备注">{{ current.adminRemark }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDate(current.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 仲裁 Dialog -->
    <el-dialog title="仲裁裁决" :visible.sync="arbitrateVisible" width="500px">
      <div v-if="arbitrateTicket" style="margin-bottom:15px;color:#606266;">
        <p><strong>买家原因：</strong>{{ arbitrateTicket.reason }}</p>
        <p v-if="arbitrateTicket.appealReason"><strong>申诉原因：</strong>{{ arbitrateTicket.appealReason }}</p>
        <p v-if="arbitrateTicket.merchantRemark"><strong>商家备注：</strong>{{ arbitrateTicket.merchantRemark }}</p>
      </div>
      <el-form label-width="80px">
        <el-form-item label="备注">
          <el-input v-model="arbitrateRemark" type="textarea" :rows="3" placeholder="请输入裁决备注"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="arbitrateVisible = false">取消</el-button>
        <el-button type="success" :loading="arbitrateSubmitting" @click="doArbitrate(true)">支持买家（退款）</el-button>
        <el-button type="danger" :loading="arbitrateSubmitting" @click="doArbitrate(false)">支持卖家（关闭）</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getAfterSalesList, arbitrateAfterSales } from '@/api/afterSales'
import { getAfterSalesStatusText, getAfterSalesStatusType, getAfterSalesTypeText } from '@/utils/afterSales'
import { formatDate } from '@/utils/date'

export default {
  name: 'AfterSalesArbitration',
  data() {
    return {
      list: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      detailVisible: false,
      current: null,
      arbitrateVisible: false,
      arbitrateSubmitting: false,
      arbitrateTicket: null,
      arbitrateRemark: ''
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
        const res = await getAfterSalesList({
          status: 4,
          currentPage: this.currentPage,
          size: this.pageSize
        })
        if (res.data && res.data.records) {
          this.list = res.data.records
          this.total = res.data.total || 0
        } else {
          this.list = []
          this.total = 0
        }
      } catch (error) {
        console.error('Load arbitration list error:', error)
        this.list = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    viewDetail(row) {
      this.current = row
      this.detailVisible = true
    },

    openArbitrate(row) {
      this.arbitrateTicket = row
      this.arbitrateRemark = ''
      this.arbitrateVisible = true
    },

    async doArbitrate(supportBuyer) {
      this.arbitrateSubmitting = true
      try {
        await arbitrateAfterSales(
          this.arbitrateTicket.id,
          this.userId,
          supportBuyer,
          this.arbitrateRemark
        )
        this.$message.success(supportBuyer ? '已裁决支持买家' : '已裁决支持卖家')
        this.arbitrateVisible = false
        this.loadList()
      } catch (error) {
        console.error('Arbitrate error:', error)
        this.$message.error('仲裁失败')
      } finally {
        this.arbitrateSubmitting = false
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
.after-sales-arbitration {
  padding: 20px;
}

.after-sales-arbitration h2 {
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
