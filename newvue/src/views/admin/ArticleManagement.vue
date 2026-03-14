<template>
  <div class="article-management">
    <h2 class="page-title">文章管理</h2>
    
    <DataTable
      :data="articles"
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
          添加文章
        </el-button>
      </template>
      
      <template #coverImage="{ row }">
        <el-image
          v-if="row.coverImage"
          :src="row.coverImage"
          :preview-src-list="[row.coverImage]"
          fit="cover"
          style="width: 80px; height: 60px; border-radius: 4px"
        ></el-image>
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
    
    <!-- Article Form Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="900px"
      @close="resetForm"
      class="article-dialog"
    >
      <el-form
        ref="articleForm"
        :model="articleForm"
        :rules="articleRules"
        label-width="100px"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题"></el-input>
        </el-form-item>
        
        <el-form-item label="封面图片">
          <ImageUploader v-model="articleForm.coverImage" />
        </el-form-item>
        
        <el-form-item label="文章摘要" prop="summary">
          <el-input
            v-model="articleForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
        
        <el-form-item label="作者">
          <el-input v-model="articleForm.author" placeholder="请输入作者名称"></el-input>
        </el-form-item>
        
        <el-form-item label="文章内容" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="15"
            placeholder="请输入文章内容（支持HTML）"
          ></el-input>
          <div class="form-tip">支持HTML格式，可以包含图片、链接等</div>
        </el-form-item>
        
        <el-form-item label="文章状态">
          <el-radio-group v-model="articleForm.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">草稿</el-radio>
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
import { getAllArticles, createArticle, updateArticle, deleteArticle } from '@/api/article'
import { formatDate } from '@/utils/date'

export default {
  name: 'ArticleManagement',
  
  components: {
    DataTable,
    ImageUploader
  },
  
  data() {
    return {
      articles: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      articleForm: {
        id: null,
        title: '',
        summary: '',
        content: '',
        coverImage: '',
        author: '',
        status: 1
      },
      articleRules: {
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' }
        ],
        summary: [
          { required: true, message: '请输入文章摘要', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ]
      },
      columns: [
        { prop: 'id', label: 'ID', width: '80' },
        { prop: 'coverImage', label: '封面', width: '120', slot: 'coverImage' },
        { prop: 'title', label: '文章标题', minWidth: '200' },
        { 
          prop: 'summary', 
          label: '摘要', 
          minWidth: '200',
          formatter: (row) => {
            return row.summary.length > 40 ? row.summary.substring(0, 40) + '...' : row.summary
          }
        },
        { prop: 'author', label: '作者', width: '120' },
        { prop: 'viewCount', label: '浏览量', width: '100', align: 'center' },
        { prop: 'status', label: '状态', width: '100', align: 'center', slot: 'status' },
        { 
          prop: 'createdAt', 
          label: '创建时间', 
          width: '180',
          formatter: (row) => this.formatDate(row.createdAt)
        }
      ]
    }
  },
  
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '添加文章' : '编辑文章'
    }
  },
  
  created() {
    this.loadArticles()
  },
  
  methods: {
    formatDate,
    
    async loadArticles() {
      this.loading = true
      try {
        const res = await getAllArticles({
          currentPage: this.currentPage,
          size: this.pageSize,
          keyword: this.searchKeyword
        })
        
        if (res.code === '0') {
          this.articles = res.data.records || []
          this.total = res.data.total || 0
        }
      } catch (error) {
        console.error('Load articles failed:', error)
        this.$message.error('加载文章列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleSearch(keyword) {
      this.searchKeyword = keyword
      this.currentPage = 1
      this.loadArticles()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.currentPage = 1
      this.loadArticles()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadArticles()
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadArticles()
    },
    
    handleAdd() {
      this.dialogMode = 'add'
      this.dialogVisible = true
    },
    
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.articleForm = {
        id: row.id,
        title: row.title,
        summary: row.summary,
        content: row.content,
        coverImage: row.coverImage || '',
        author: row.author || '',
        status: row.status
      }
      this.dialogVisible = true
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除文章"${row.title}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteArticle(row.id)
        this.$message.success('删除成功')
        this.loadArticles()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete article failed:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async handleStatusChange(row) {
      try {
        await updateArticle(row.id, { status: row.status })
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error('Update status failed:', error)
        this.$message.error('状态更新失败')
        row.status = row.status === 1 ? 0 : 1
      }
    },
    
    handleSubmit() {
      this.$refs.articleForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const data = { ...this.articleForm }
          
          if (this.dialogMode === 'add') {
            await createArticle(data)
            this.$message.success('添加成功')
          } else {
            await updateArticle(data.id, data)
            this.$message.success('更新成功')
          }
          
          this.dialogVisible = false
          this.loadArticles()
        } catch (error) {
          console.error('Submit article failed:', error)
          this.$message.error(this.dialogMode === 'add' ? '添加失败' : '更新失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.articleForm = {
        id: null,
        title: '',
        summary: '',
        content: '',
        coverImage: '',
        author: '',
        status: 1
      }
      if (this.$refs.articleForm) {
        this.$refs.articleForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.article-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.article-dialog >>> .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
