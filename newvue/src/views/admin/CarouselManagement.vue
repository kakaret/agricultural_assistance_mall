<template>
  <div class="carousel-management">
    <h2 class="page-title">轮播图管理</h2>
    
    <div class="content-card">
      <div class="toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          添加轮播图
        </el-button>
      </div>
      
      <el-table
        :data="carousels"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        
        <el-table-column label="图片预览" width="200">
          <template slot-scope="scope">
            <el-image
              :src="scope.row.imageUrl"
              :preview-src-list="[scope.row.imageUrl]"
              fit="cover"
              style="width: 160px; height: 90px; border-radius: 4px"
            ></el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="标题" min-width="150"></el-table-column>
        
        <el-table-column prop="linkUrl" label="链接地址" min-width="200" show-overflow-tooltip></el-table-column>
        
        <el-table-column prop="sort" label="排序" width="100" align="center">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.sort"
              :min="0"
              size="small"
              @change="handleSortChange(scope.row)"
            ></el-input-number>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              icon="el-icon-delete"
              style="color: #f56c6c"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- Carousel Form Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="carouselForm"
        :model="carouselForm"
        :rules="carouselRules"
        label-width="100px"
      >
        <el-form-item label="轮播图片" prop="imageUrl">
          <ImageUploader v-model="carouselForm.imageUrl" />
          <div class="form-tip">建议尺寸：1920x600px</div>
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input v-model="carouselForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        
        <el-form-item label="链接地址">
          <el-input v-model="carouselForm.linkUrl" placeholder="请输入链接地址（可选）">
            <template slot="prepend">http://</template>
          </el-input>
          <div class="form-tip">点击轮播图时跳转的链接</div>
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number
            v-model="carouselForm.sort"
            :min="0"
            style="width: 100%"
          ></el-input-number>
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="carouselForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
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
import ImageUploader from '@/components/common/ImageUploader.vue'
import { getAllCarousels, createCarousel, updateCarousel, deleteCarousel, updateCarouselSort } from '@/api/carousel'

export default {
  name: 'CarouselManagement',
  
  components: {
    ImageUploader
  },
  
  data() {
    return {
      carousels: [],
      loading: false,
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      carouselForm: {
        id: null,
        title: '',
        imageUrl: '',
        linkUrl: '',
        sort: 0,
        status: 1
      },
      carouselRules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        imageUrl: [
          { required: true, message: '请上传轮播图片', trigger: 'change' }
        ]
      }
    }
  },
  
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '添加轮播图' : '编辑轮播图'
    }
  },
  
  created() {
    this.loadCarousels()
  },
  
  methods: {
    async loadCarousels() {
      this.loading = true
      try {
        const res = await getAllCarousels()
        if (res.code === '0') {
          this.carousels = res.data || []
        }
      } catch (error) {
        console.error('Load carousels failed:', error)
        this.$message.error('加载轮播图列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleAdd() {
      this.dialogMode = 'add'
      this.dialogVisible = true
    },
    
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.carouselForm = {
        id: row.id,
        title: row.title,
        imageUrl: row.imageUrl,
        linkUrl: row.linkUrl || '',
        sort: row.sort,
        status: row.status
      }
      this.dialogVisible = true
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除轮播图"${row.title}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteCarousel(row.id)
        this.$message.success('删除成功')
        this.loadCarousels()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete carousel failed:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async handleStatusChange(row) {
      try {
        await updateCarousel(row.id, { status: row.status })
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error('Update status failed:', error)
        this.$message.error('状态更新失败')
        row.status = row.status === 1 ? 0 : 1
      }
    },
    
    async handleSortChange(row) {
      try {
        await updateCarouselSort(row.id, row.sort)
        this.$message.success('排序更新成功')
        this.loadCarousels()
      } catch (error) {
        console.error('Update sort failed:', error)
        this.$message.error('排序更新失败')
      }
    },
    
    handleSubmit() {
      this.$refs.carouselForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const data = { ...this.carouselForm }
          
          if (this.dialogMode === 'add') {
            await createCarousel(data)
            this.$message.success('添加成功')
          } else {
            await updateCarousel(data.id, data)
            this.$message.success('更新成功')
          }
          
          this.dialogVisible = false
          this.loadCarousels()
        } catch (error) {
          console.error('Submit carousel failed:', error)
          this.$message.error(this.dialogMode === 'add' ? '添加失败' : '更新失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.carouselForm = {
        id: null,
        title: '',
        imageUrl: '',
        linkUrl: '',
        sort: 0,
        status: 1
      }
      if (this.$refs.carouselForm) {
        this.$refs.carouselForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.carousel-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
