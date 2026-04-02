<template>
  <div class="stock-management">
    <h2 class="page-title">库存管理</h2>
    
    <!-- Stock Level Table -->
    <el-card class="stock-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">当前库存</span>
        <div class="toolbar">
          <el-button type="primary" icon="el-icon-plus" @click="handleStockIn">
            入库
          </el-button>
          <el-button type="warning" icon="el-icon-minus" @click="handleStockOut">
            出库
          </el-button>
        </div>
      </div>
      
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品名称"
          prefix-icon="el-icon-search"
          clearable
          style="width: 300px; margin-right: 10px"
          @keyup.enter.native="handleSearch"
        ></el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      
      <el-table
        :data="products"
        v-loading="loading"
        border
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="id" label="商品ID" width="100" align="center"></el-table-column>
        
        <el-table-column label="商品图片" width="100" align="center">
          <template slot-scope="{ row }">
            <el-image
              :src="getFullImageUrl(row.imageUrl)"
              :preview-src-list="[getFullImageUrl(row.imageUrl)]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
            ></el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="商品名称" min-width="150"></el-table-column>
        
        <el-table-column label="分类" width="120">
          <template slot-scope="{ row }">
            {{ row.category?.name || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="stock" label="当前库存" width="120" align="center">
          <template slot-scope="{ row }">
            <span :class="getStockClass(row.stock)">{{ row.stock }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="salesCount" label="销量" width="100" align="center"></el-table-column>
        
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              icon="el-icon-document"
              @click="handleViewHistory(row)"
            >
              操作记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="total > 0"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      ></el-pagination>
    </el-card>
    
    <!-- Stock-In Dialog -->
    <el-dialog
      title="入库"
      :visible.sync="stockInDialogVisible"
      width="560px"
      @close="resetStockInForm"
    >
      <el-form
        ref="stockInForm"
        :model="stockInForm"
        :rules="stockInRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="stockInForm.productId"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="product in allProducts"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            >
              <span style="float: left">{{ product.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                库存: {{ product.stock }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number
            v-model="stockInForm.quantity"
            :min="1"
            :max="10000"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="单价(元)" prop="unitPrice">
          <el-input-number
            v-model="stockInForm.unitPrice"
            :min="0.01"
            :precision="2"
            :step="1"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="供应商">
          <el-input v-model="stockInForm.supplier" placeholder="请输入供应商（可选）"></el-input>
        </el-form-item>
        
        <el-form-item label="入库日期" prop="stockDate">
          <el-date-picker
            v-model="stockInForm.stockDate"
            type="date"
            placeholder="请选择入库日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="操作人ID" prop="operatorId">
          <el-input-number
            v-model="stockInForm.operatorId"
            :min="1"
            placeholder="请输入操作人ID"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="stockInForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="stockInDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleStockInSubmit">
          确定
        </el-button>
      </span>
    </el-dialog>
    
    <!-- Stock-Out Dialog -->
    <el-dialog
      title="出库"
      :visible.sync="stockOutDialogVisible"
      width="560px"
      @close="resetStockOutForm"
    >
      <el-form
        ref="stockOutForm"
        :model="stockOutForm"
        :rules="stockOutRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="stockOutForm.productId"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="product in allProducts"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            >
              <span style="float: left">{{ product.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                库存: {{ product.stock }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number
            v-model="stockOutForm.quantity"
            :min="1"
            :max="getMaxStockOut()"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="单价(元)" prop="unitPrice">
          <el-input-number
            v-model="stockOutForm.unitPrice"
            :min="0.01"
            :precision="2"
            :step="1"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="出库类型" prop="type">
          <el-select v-model="stockOutForm.type" placeholder="请选择出库类型" style="width: 100%">
            <el-option :value="1" label="销售出库"></el-option>
            <el-option :value="2" label="退货出库"></el-option>
            <el-option :value="3" label="报损出库"></el-option>
            <el-option :value="4" label="其他"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作人ID" prop="operatorId">
          <el-input-number
            v-model="stockOutForm.operatorId"
            :min="1"
            placeholder="请输入操作人ID"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="stockOutForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="stockOutDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="submitting" @click="handleStockOutSubmit">
          确定
        </el-button>
      </span>
    </el-dialog>
    
    <!-- Stock History Dialog -->
    <el-dialog
      :title="`${currentProduct ? currentProduct.name : ''} - 操作记录`"
      :visible.sync="historyDialogVisible"
      width="950px"
    >
      <el-table
        :data="historyRecords"
        v-loading="historyLoading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="记录ID" width="80" align="center"></el-table-column>
        
        <el-table-column label="操作类型" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.type === 'IN' ? 'success' : 'warning'" size="small">
              {{ row.type === 'IN' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="数量" width="100" align="center">
          <template slot-scope="{ row }">
            <span :style="{ color: row.type === 'IN' ? '#67c23a' : '#e6a23c' }">
              {{ row.type === 'IN' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="单价" width="100" align="center">
          <template slot-scope="{ row }">
            ¥{{ row.unitPrice != null ? Number(row.unitPrice).toFixed(2) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="总价" width="110" align="center">
          <template slot-scope="{ row }">
            ¥{{ row.totalPrice != null ? Number(row.totalPrice).toFixed(2) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="operatorName" label="操作人" width="100" align="center"></el-table-column>
        
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="mini">
              {{ row.status === 1 ? '正常' : '已作废' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip></el-table-column>
        
        <el-table-column label="操作时间" width="170">
          <template slot-scope="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="historyTotal > 0"
        :current-page="historyPage"
        :page-size="historyPageSize"
        :total="historyTotal"
        layout="total, prev, pager, next"
        style="margin-top: 20px; text-align: right"
        @current-change="handleHistoryPageChange"
      ></el-pagination>
    </el-dialog>
  </div>
</template>

<script>
import { getProducts } from '@/api/product'
import { stockIn, stockOut, getStockHistory } from '@/api/stock'
import { formatDate } from '@/utils/date'
import { getImageUrl } from '@/utils/image'
import { mapGetters } from 'vuex'

export default {
  name: 'StockManagement',
  
  data() {
    return {
      products: [],
      allProducts: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      
      stockInDialogVisible: false,
      stockOutDialogVisible: false,
      historyDialogVisible: false,
      
      submitting: false,
      
      // 入库表单（与后端 StockIn 实体对齐）
      stockInForm: {
        productId: null,
        quantity: 1,
        unitPrice: null,
        supplier: '',
        stockDate: '',
        operatorId: null,
        remark: ''
      },
      stockInRules: {
        productId: [
          { required: true, message: '请选择商品', trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入入库数量', trigger: 'blur' }
        ],
        unitPrice: [
          { required: true, message: '请输入单价', trigger: 'blur' }
        ],
        stockDate: [
          { required: true, message: '请选择入库日期', trigger: 'change' }
        ],
        operatorId: [
          { required: true, message: '请输入操作人ID', trigger: 'blur' }
        ]
      },
      
      // 出库表单（与后端 StockOut 实体对齐）
      stockOutForm: {
        productId: null,
        quantity: 1,
        unitPrice: null,
        type: null,
        operatorId: null,
        remark: ''
      },
      stockOutRules: {
        productId: [
          { required: true, message: '请选择商品', trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入出库数量', trigger: 'blur' }
        ],
        unitPrice: [
          { required: true, message: '请输入单价', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择出库类型', trigger: 'change' }
        ],
        operatorId: [
          { required: true, message: '请输入操作人ID', trigger: 'blur' }
        ]
      },
      
      currentProduct: null,
      historyRecords: [],
      historyLoading: false,
      historyPage: 1,
      historyPageSize: 10,
      historyTotal: 0
    }
  },
  
  computed: {
    ...mapGetters('user', ['userId', 'isAdmin', 'isMerchant']),
    merchantFilter() {
      return this.isMerchant && !this.isAdmin ? { merchantId: this.userId } : {}
    }
  },

  created() {
    this.loadProducts()
    this.loadAllProducts()
  },
  
  methods: {
    formatDate,
    
    getFullImageUrl(url) {
      return getImageUrl(url)
    },
    
    async loadProducts() {
      this.loading = true
      try {
        const res = await getProducts({
          currentPage: this.currentPage,
          size: this.pageSize,
          keyword: this.searchKeyword,
          ...this.merchantFilter
        })
        
        if (res.code === '0') {
          this.products = res.data.records || []
          this.total = res.data.total || 0
        }
      } catch (error) {
        console.error('Load products failed:', error)
        this.$message.error('加载商品列表失败')
      } finally {
        this.loading = false
      }
    },
    
    async loadAllProducts() {
      try {
        const res = await getProducts({
          currentPage: 1,
          size: 1000,
          ...this.merchantFilter
        })
        
        if (res.code === '0') {
          this.allProducts = res.data.records || []
        }
      } catch (error) {
        console.error('Load all products failed:', error)
      }
    },
    
    handleSearch() {
      this.currentPage = 1
      this.loadProducts()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.currentPage = 1
      this.loadProducts()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadProducts()
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadProducts()
    },
    
    handleStockIn() {
      this.stockInDialogVisible = true
    },
    
    handleStockOut() {
      this.stockOutDialogVisible = true
    },
    
    handleStockInSubmit() {
      this.$refs.stockInForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const res = await stockIn(this.stockInForm)
          if (res.code === '0') {
            this.$message.success('入库成功')
            this.stockInDialogVisible = false
            this.loadProducts()
            this.loadAllProducts()
          } else {
            this.$message.error(res.msg || '入库失败')
          }
        } catch (error) {
          console.error('Stock in failed:', error)
          this.$message.error('入库失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    handleStockOutSubmit() {
      this.$refs.stockOutForm.validate(async (valid) => {
        if (!valid) return
        
        // Validate stock availability
        const selectedProduct = this.allProducts.find(p => p.id === this.stockOutForm.productId)
        if (selectedProduct && this.stockOutForm.quantity > selectedProduct.stock) {
          this.$message.error('出库数量不能大于当前库存')
          return
        }
        
        this.submitting = true
        
        try {
          const res = await stockOut(this.stockOutForm)
          if (res.code === '0') {
            this.$message.success('出库成功')
            this.stockOutDialogVisible = false
            this.loadProducts()
            this.loadAllProducts()
          } else {
            this.$message.error(res.msg || '出库失败')
          }
        } catch (error) {
          console.error('Stock out failed:', error)
          this.$message.error('出库失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    async handleViewHistory(row) {
      this.currentProduct = row
      this.historyPage = 1
      this.historyDialogVisible = true
      await this.loadHistory()
    },
    
    async loadHistory() {
      if (!this.currentProduct) return
      
      this.historyLoading = true
      try {
        const res = await getStockHistory(this.currentProduct.id, {
          currentPage: this.historyPage,
          size: this.historyPageSize
        })
        
        if (res.code === '0') {
          this.historyRecords = res.data.records || []
          this.historyTotal = res.data.total || 0
        }
      } catch (error) {
        console.error('Load history failed:', error)
        this.$message.error('加载操作记录失败')
      } finally {
        this.historyLoading = false
      }
    },
    
    handleHistoryPageChange(page) {
      this.historyPage = page
      this.loadHistory()
    },
    
    resetStockInForm() {
      this.stockInForm = {
        productId: null,
        quantity: 1,
        unitPrice: null,
        supplier: '',
        stockDate: '',
        operatorId: null,
        remark: ''
      }
      if (this.$refs.stockInForm) {
        this.$refs.stockInForm.clearValidate()
      }
    },
    
    resetStockOutForm() {
      this.stockOutForm = {
        productId: null,
        quantity: 1,
        unitPrice: null,
        type: null,
        operatorId: null,
        remark: ''
      }
      if (this.$refs.stockOutForm) {
        this.$refs.stockOutForm.clearValidate()
      }
    },
    
    getStockClass(stock) {
      if (stock === 0) return 'stock-zero'
      if (stock < 10) return 'stock-low'
      if (stock < 50) return 'stock-medium'
      return 'stock-high'
    },
    
    getMaxStockOut() {
      if (!this.stockOutForm.productId) return 10000
      const product = this.allProducts.find(p => p.id === this.stockOutForm.productId)
      return product ? product.stock : 10000
    }
  }
}
</script>

<style scoped>
.stock-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.stock-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
}

.stock-zero {
  color: #f56c6c;
  font-weight: 600;
}

.stock-low {
  color: #e6a23c;
  font-weight: 600;
}

.stock-medium {
  color: #409eff;
}

.stock-high {
  color: #67c23a;
}
</style>
