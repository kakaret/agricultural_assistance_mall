<template>
  <div class="auto-reply-management">
    <h2 class="page-title">自动回复管理</h2>

    <el-card class="box-card">
      <!-- 创建按钮 -->
      <div class="header-actions">
        <el-button type="primary" @click="handleCreate">
          新增规则
        </el-button>
      </div>

      <!-- 规则列表 -->
      <el-table
        :data="rules"
        stripe
        border
        :loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="规则ID" width="80"></el-table-column>
        <el-table-column prop="keyword" label="关键词" min-width="150"></el-table-column>
        <el-table-column prop="replyContent" label="回复内容" min-width="200">
          <template slot-scope="{ row }">
            <span :title="row.replyContent">
              {{ row.replyContent.length > 50 ? row.replyContent.substring(0, 50) + '...' : row.replyContent }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template slot-scope="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              style="color: #f56c6c"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="total, prev, pager, next"
        class="pagination"
      ></el-pagination>
    </el-card>

    <!-- 编辑/创建对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-form
        ref="form"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="formData.keyword" placeholder="输入触发关键词"></el-input>
        </el-form-item>

        <el-form-item label="回复内容" prop="replyContent">
          <el-input
            v-model="formData.replyContent"
            type="textarea"
            :rows="4"
            placeholder="输入自动回复的内容"
          ></el-input>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number
            v-model="formData.priority"
            :min="0"
            :max="1000"
          ></el-input-number>
          <span class="priority-hint">（数值越大优先级越高）</span>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
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
import { createAutoReplyRule, updateAutoReplyRule, deleteAutoReplyRule, getAutoReplyRules } from '@/api/chat'
import { formatDate } from '@/utils/date'
import { mapState } from 'vuex'

export default {
  name: 'AutoReplyManagement',

  data() {
    return {
      rules: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,

      dialogVisible: false,
      dialogTitle: '新增规则',
      isEditing: false,
      submitting: false,

      formData: {
        id: null,
        keyword: '',
        replyContent: '',
        priority: 0,
        status: 1
      },

      formRules: {
        keyword: [
          { required: true, message: '关键词不能为空', trigger: 'blur' },
          { min: 1, max: 100, message: '关键词长度1-100字符', trigger: 'blur' }
        ],
        replyContent: [
          { required: true, message: '回复内容不能为空', trigger: 'blur' },
          { min: 1, max: 1000, message: '回复内容长度1-1000字符', trigger: 'blur' }
        ],
        priority: [
          { required: true, message: '优先级不能为空', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    ...mapState('user', ['userInfo'])
  },

  mounted() {
    this.loadRules()
  },

  methods: {
    formatDate,

    async loadRules() {
      if (!this.userInfo || !this.userInfo.id) return

      this.loading = true
      try {
        const res = await getAutoReplyRules(
          this.userInfo.id,
          undefined,
          this.currentPage,
          this.pageSize
        )

        if (res.code === '0') {
          this.rules = res.data.records || []
          this.total = res.data.total || 0
        } else {
          this.$message.error(res.msg || '加载规则失败')
        }
      } catch (error) {
        console.error('加载规则失败:', error)
        this.$message.error('加载规则失败')
      } finally {
        this.loading = false
      }
    },

    handleCreate() {
      this.isEditing = false
      this.dialogTitle = '新增规则'
      this.formData = {
        id: null,
        keyword: '',
        replyContent: '',
        priority: 0,
        status: 1
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },

    handleEdit(row) {
      this.isEditing = true
      this.dialogTitle = '编辑规则'
      this.formData = {
        id: row.id,
        keyword: row.keyword,
        replyContent: row.replyContent,
        priority: row.priority,
        status: row.status
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },

    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return

        this.submitting = true
        try {
          let res
          if (this.isEditing) {
            res = await updateAutoReplyRule(this.formData.id, {
              keyword: this.formData.keyword,
              replyContent: this.formData.replyContent,
              priority: this.formData.priority,
              status: this.formData.status
            })
          } else {
            res = await createAutoReplyRule({
              merchantId: this.userInfo.id,
              keyword: this.formData.keyword,
              replyContent: this.formData.replyContent,
              priority: this.formData.priority,
              status: this.formData.status
            })
          }

          if (res.code === '0') {
            this.$message.success(this.isEditing ? '更新成功' : '创建成功')
            this.dialogVisible = false
            this.loadRules()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } catch (error) {
          console.error('操作失败:', error)
          this.$message.error('操作失败，请重试')
        } finally {
          this.submitting = false
        }
      })
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条规则吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await deleteAutoReplyRule(row.id)
        if (res.code === '0') {
          this.$message.success('删除成功')
          this.loadRules()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
        }
      }
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadRules()
    }
  }
}
</script>

<style scoped>
.auto-reply-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.box-card {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.priority-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
