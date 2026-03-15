<template>
  <div class="notice-management">
    <h2 class="page-title">公告管理</h2>
    
    <DataTable
      :data="notices"
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
          添加公告
        </el-button>
      </template>
      
      <template #tags="{ row }">
        <el-tag v-if="row.tags" :type="getTagColor(row.tags)" size="small">
          {{ row.tags }}
        </el-tag>
        <span v-else style="color: #909399">-</span>
      </template>
    </DataTable>
    
    <!-- Notice Form Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="noticeForm"
        :model="noticeForm"
        :rules="noticeRules"
        label-width="100px"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题"></el-input>
        </el-form-item>
        
        <el-form-item label="公告标签">
          <el-select v-model="noticeForm.tags" placeholder="请选择公告标签（可选）" clearable style="width: 100%">
            <el-option label="通知" value="通知"></el-option>
            <el-option label="警告" value="警告"></el-option>
            <el-option label="紧急" value="紧急"></el-option>
            <el-option label="活动" value="活动"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容"
          ></el-input>
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
import { getAllNotices, createNotice, updateNotice, deleteNotice } from '@/api/notice'

export default {
  name: 'NoticeManagement',
  
  components: {
    DataTable
  },
  
  data() {
    return {
      notices: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      noticeForm: {
        id: null,
        title: '',
        tags: '',
        content: ''
      },
      noticeRules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入公告内容', trigger: 'blur' }
        ]
      },
      columns: [
        { prop: 'id', label: 'ID', width: '80' },
        { prop: 'title', label: '公告标题', minWidth: '200' },
        { prop: 'tags', label: '标签', width: '100', align: 'center', slot: 'tags' },
        { 
          prop: 'content', 
          label: '内容', 
          minWidth: '250',
          formatter: (row) => {
            const content = row.content || ''
            return content.length > 50 ? content.substring(0, 50) + '...' : content
          }
        },
        { 
          prop: 'time', 
          label: '创建时间', 
          width: '180'
        }
      ]
    }
  },
  
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '添加公告' : '编辑公告'
    }
  },
  
  created() {
    this.loadNotices()
  },
  
  methods: {
    async loadNotices() {
      this.loading = true
      try {
        const res = await getAllNotices({
          currentPage: this.currentPage,
          size: this.pageSize,
          keyword: this.searchKeyword
        })
        
        if (res.code === '0') {
          this.notices = res.data.records || []
          this.total = res.data.total || 0
        }
      } catch (error) {
        console.error('Load notices failed:', error)
        this.$message.error('加载公告列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleSearch(keyword) {
      this.searchKeyword = keyword
      this.currentPage = 1
      this.loadNotices()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.currentPage = 1
      this.loadNotices()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadNotices()
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadNotices()
    },
    
    handleAdd() {
      this.dialogMode = 'add'
      this.dialogVisible = true
    },
    
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.noticeForm = {
        id: row.id,
        title: row.title,
        tags: row.tags || '',
        content: row.content
      }
      this.dialogVisible = true
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm(`确定要删除公告"${row.title}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteNotice(row.id)
        this.$message.success('删除成功')
        this.loadNotices()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete notice failed:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    handleSubmit() {
      this.$refs.noticeForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const data = { ...this.noticeForm }
          
          if (this.dialogMode === 'add') {
            await createNotice(data)
            this.$message.success('添加成功')
          } else {
            await updateNotice(data.id, data)
            this.$message.success('更新成功')
          }
          
          this.dialogVisible = false
          this.loadNotices()
        } catch (error) {
          console.error('Submit notice failed:', error)
          this.$message.error(this.dialogMode === 'add' ? '添加失败' : '更新失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.noticeForm = {
        id: null,
        title: '',
        tags: '',
        content: ''
      }
      if (this.$refs.noticeForm) {
        this.$refs.noticeForm.clearValidate()
      }
    },
    
    getTagColor(tags) {
      const colorMap = {
        '通知': 'primary',
        '警告': 'warning',
        '紧急': 'danger',
        '活动': 'success'
      }
      return colorMap[tags] || 'info'
    }
  }
}
</script>

<style scoped>
.notice-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}
</style>
