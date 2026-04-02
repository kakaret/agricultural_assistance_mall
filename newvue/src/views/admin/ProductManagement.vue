<template>
  <div class="product-management">
    <h2 class="page-title">商品管理</h2>
    
    <DataTable
      :data="products"
      :columns="columns"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @search="handleSearch"
      @reset="handleReset"
      @edit="handleEdit"
      @delete="handleDelete"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #toolbar>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          添加商品
        </el-button>
      </template>
      
      <template #image="{ row }">
        <el-image
          :src="getFullImageUrl(row.imageUrl)"
          :preview-src-list="[getFullImageUrl(row.imageUrl)]"
          fit="cover"
          style="width: 60px; height: 60px; border-radius: 4px"
        ></el-image>
      </template>
      
      <template #price="{ row }">
        <div>
          <div v-if="row.isDiscount" style="color: #f56c6c; font-weight: 600">
            ¥{{ row.discountPrice }}
          </div>
          <div :style="row.isDiscount ? 'text-decoration: line-through; color: #909399; font-size: 12px' : 'font-weight: 600'">
            ¥{{ row.price }}
          </div>
        </div>
      </template>
      
      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          @change="handleStatusChange(row)"
        ></el-switch>
      </template>
    </DataTable>
    
    <!-- Product Form Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="productForm"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片" prop="imageUrl">
          <ImageUploader v-model="productForm.imageUrl" />
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="是否折扣">
          <el-switch v-model="productForm.isDiscount"></el-switch>
        </el-form-item>
        
        <el-form-item v-if="productForm.isDiscount" label="折扣价格" prop="discountPrice">
          <el-input-number
            v-model="productForm.discountPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="库存数量" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="产地" prop="placeOfOrigin">
          <el-input v-model="productForm.placeOfOrigin" placeholder="请输入产地"></el-input>
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="商品状态">
          <el-radio-group v-model="productForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '@/components/admin/DataTable.vue'
import ImageUploader from '@/components/common/ImageUploader.vue'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '@/api/product'
import { getImageUrl } from '@/utils/image'
import { mapGetters } from 'vuex'

export default {
  name: 'ProductManagement',
  
  components: {
    DataTable,
    ImageUploader
  },
  
  data() {
    return {
      products: [],
      categories: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      productForm: {
        id: null,
        name: '',
        categoryId: null,
        imageUrl: '',
        price: 0,
        isDiscount: false,
        discountPrice: 0,
        stock: 0,
        placeOfOrigin: '',
        description: '',
        status: 1
      },
      productRules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ],
        imageUrl: [
          { required: true, message: '请上传商品图片', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        stock: [
          { required: true, message: '请输入库存数量', trigger: 'blur' }
        ]
      },
      columns: [
        { prop: 'id', label: 'ID', width: '80' },
        { prop: 'imageUrl', label: '图片', width: '100', slot: 'image' },
        { prop: 'name', label: '商品名称', minWidth: '150' },
        { prop: 'category.name', label: '分类', width: '120' },
        { prop: 'price', label: '价格', width: '120', slot: 'price' },
        { prop: 'stock', label: '库存', width: '100', align: 'center' },
        { prop: 'salesCount', label: '销量', width: '100', align: 'center' },
        { prop: 'status', label: '状态', width: '100', align: 'center', slot: 'status' }
      ]
    }
  },
  
  computed: {
    ...mapGetters('user', ['userId', 'isAdmin', 'isMerchant']),
    dialogTitle() {
      return this.dialogMode === 'add' ? '添加商品' : '编辑商品'
    }
  },
  
  created() {
    this.loadProducts()
    this.loadCategories()
  },
  
  methods: {
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
          ...(this.isMerchant && !this.isAdmin && { merchantId: this.userId })
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
    
    async loadCategories() {
      try {
        const res = await getCategories()
        if (res.code === '0') {
          this.categories = res.data || []
        }
      } catch (error) {
        console.error('Load categories failed:', error)
      }
    },
    
    handleSearch(keyword) {
      this.searchKeyword = keyword
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
    
    handleAdd() {
      this.dialogMode = 'add'
      this.dialogVisible = true
    },
    
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.productForm = {
        id: row.id,
        name: row.name,
        categoryId: row.category?.id || null,
        imageUrl: row.imageUrl,
        price: row.price,
        isDiscount: row.isDiscount,
        discountPrice: row.discountPrice || 0,
        stock: row.stock,
        placeOfOrigin: row.placeOfOrigin || '',
        description: row.description || '',
        status: row.status
      }
      this.dialogVisible = true
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除商品"${row.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteProduct(row.id)
        this.$message.success('删除成功')
        this.loadProducts()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete product failed:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async handleStatusChange(row) {
      try {
        await updateProduct(row.id, { status: row.status })
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error('Update status failed:', error)
        this.$message.error('状态更新失败')
        row.status = row.status === 1 ? 0 : 1
      }
    },
    
    handleSubmit() {
      this.$refs.productForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const data = { ...this.productForm }
          
          if (this.dialogMode === 'add') {
            await createProduct(data)
            this.$message.success('添加成功')
          } else {
            await updateProduct(data.id, data)
            this.$message.success('更新成功')
          }
          
          this.dialogVisible = false
          this.loadProducts()
        } catch (error) {
          console.error('Submit product failed:', error)
          this.$message.error(this.dialogMode === 'add' ? '添加失败' : '更新失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.productForm = {
        id: null,
        name: '',
        categoryId: null,
        imageUrl: '',
        price: 0,
        isDiscount: false,
        discountPrice: 0,
        stock: 0,
        placeOfOrigin: '',
        description: '',
        status: 1
      }
      if (this.$refs.productForm) {
        this.$refs.productForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.product-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}
</style>
