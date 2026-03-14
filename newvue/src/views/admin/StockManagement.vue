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
              :src="row.imageUrl"
              :preview-src-list="[row.imageUrl]"
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
      width="500px"
      @close="resetStockForm"
    >
      <el-form
        ref="stockInForm"
        :model="stockForm"
        :rules="stockRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="stockForm.productId"
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
            v-model="stockForm.quantity"
            :min="1"
            :max="10000"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="stockForm.operator" placeholder="请输入操作人"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="stockForm.remark"
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
      width="500px"
      @close="resetStockForm"
    >
      <el-form
        ref="stockOutForm"
        :model="stockForm"
        :rules="stockRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="stockForm.productId"
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
            v-model="stockForm.quantity"
            :min="1"
            :max="getMaxStockOut()"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="操作人" prop="operator">
          <el-input v-model="stockForm.operator" placeholder="请输入操作人"></el-input>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="stockForm.remark"
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
      :title="`${currentProduct?.name || ''} - 操作记录`"
      :visible.sync="historyDialogVisible"
      width="900px"
    >
      <el-table
        :data="historyRecords"
        v-loading="historyLoading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="记录ID" width="100" align="center"></el-table-column>
        
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
        
        <el-table-column prop="stockBefore" label="操作前库存" width="120" align="center"></el-table-column>
        
        <el-table-column prop="stockAfter" label="操作后库存" width="120" align="center"></el-table-column>
        
        <el-table-column prop="operator" label="操作人" width="120" align="center"></el-table-column>
        
        <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
        
        <el-table-column label="操作时间" width="180">
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
      stockForm: {
        productId: null,
        quantity: 1,
        operator: '',
        remark: ''
      },
      stockRules: {
        productId: [
          { required: true, message: '请选择商品', trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        operator: [
          { required: true, message: '请输入操作人', trigger: 'blur' }
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
  
  created() {
    this.loadProducts()
    this.loadAllProducts()
  },
  
  methods: {
    formatDate,
    
    async loadProducts() {
      this.loading = true
      try {
        const res = await getProducts({
          currentPage: this.currentPage,
          size: this.pageSize,
          keyword: this.searchKeyword
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
          size: 1000
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
          await stockIn(this.stockForm)
          this.$message.success('入库成功')
          this.stockInDialogVisible = false
          this.loadProducts()
          this.loadAllProducts()
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
        const selectedProduct = this.allProducts.find(p => p.id === this.stockForm.productId)
        if (selectedProduct && this.stockForm.quantity > selectedProduct.stock) {
          this.$message.error('出库数量不能大于当前库存')
          return
        }
        
        this.submitting = true
        
        try {
          await stockOut(this.stockForm)
          this.$message.success('出库成功')
          this.stockOutDialogVisible = false
          this.loadProducts()
          this.loadAllProducts()
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
    
    resetStockForm() {
      this.stockForm = {
        productId: null,
        quantity: 1,
        operator: '',
        remark: ''
      }
      
      if (this.$refs.stockInForm) {
        this.$refs.stockInForm.clearValidate()
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
      if (!this.stockForm.productId) return 10000
      const product = this.allProducts.find(p => p.id === this.stockForm.productId)
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
