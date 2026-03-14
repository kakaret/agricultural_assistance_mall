<template>
  <div class="user-management">
    <h2 class="page-title">用户管理</h2>
    
    <DataTable
      :data="users"
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
      <template #toolbar>
        <el-select v-model="filterRole" placeholder="角色筛选" clearable style="width: 150px; margin-right: 12px" @change="handleRoleFilter">
          <el-option label="全部" value=""></el-option>
          <el-option label="超级管理员" value="SUPER_ADMIN"></el-option>
          <el-option label="管理员" value="ADMIN"></el-option>
          <el-option label="商家" value="MERCHANT"></el-option>
          <el-option label="用户" value="USER"></el-option>
        </el-select>
      </template>
      
      <template #avatar="{ row }">
        <el-avatar :src="row.avatar" :size="40">
          {{ row.username ? row.username.charAt(0) : 'U' }}
        </el-avatar>
      </template>
      
      <template #role="{ row }">
        <el-tag :type="getRoleType(row.role)" size="small">
          {{ getRoleText(row.role) }}
        </el-tag>
      </template>
      
      <template #status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="1"
          :inactive-value="0"
          @change="handleStatusChange(row)"
        ></el-switch>
      </template>
      
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
          type="text"
          size="small"
          icon="el-icon-edit"
          @click="handleEditRole(row)"
        >
          修改角色
        </el-button>
      </template>
    </DataTable>
    
    <!-- User Detail Dialog -->
    <el-dialog
      title="用户详情"
      :visible.sync="detailDialogVisible"
      width="600px"
    >
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleType(currentUser.role)">
              {{ getRoleText(currentUser.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
              {{ currentUser.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间" :span="2">
            {{ formatDate(currentUser.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新" :span="2">
            {{ formatDate(currentUser.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
    
    <!-- Edit Role Dialog -->
    <el-dialog
      title="修改用户角色"
      :visible.sync="roleDialogVisible"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <span>{{ currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="当前角色">
          <el-tag :type="getRoleType(currentUser?.role)">
            {{ getRoleText(currentUser?.role) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新角色">
          <el-select v-model="newRole" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="SUPER_ADMIN"></el-option>
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="商家" value="MERCHANT"></el-option>
            <el-option label="用户" value="USER"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleRoleSubmit">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DataTable from '@/components/admin/DataTable.vue'
import { getUsers, updateUserStatus, updateUserRole } from '@/api/user'
import { formatDate } from '@/utils/date'

export default {
  name: 'UserManagement',
  
  components: {
    DataTable
  },
  
  data() {
    return {
      users: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchKeyword: '',
      filterRole: '',
      detailDialogVisible: false,
      roleDialogVisible: false,
      currentUser: null,
      newRole: '',
      submitting: false,
      columns: [
        { prop: 'id', label: 'ID', width: '80' },
        { prop: 'avatar', label: '头像', width: '80', slot: 'avatar' },
        { prop: 'username', label: '用户名', width: '120' },
        { prop: 'name', label: '姓名', width: '120' },
        { prop: 'email', label: '邮箱', minWidth: '180' },
        { prop: 'role', label: '角色', width: '120', align: 'center', slot: 'role' },
        { prop: 'status', label: '状态', width: '100', align: 'center', slot: 'status' },
        { 
          prop: 'createdAt', 
          label: '注册时间', 
          width: '180',
          formatter: (row) => this.formatDate(row.createdAt)
        }
      ]
    }
  },
  
  created() {
    this.loadUsers()
  },
  
  methods: {
    formatDate,
    
    async loadUsers() {
      this.loading = true
      try {
        const res = await getUsers({
          currentPage: this.currentPage,
          size: this.pageSize,
          username: this.searchKeyword,
          role: this.filterRole
        })
        
        if (res.code === '0') {
          this.users = res.data.records || []
          this.total = res.data.total || 0
        }
      } catch (error) {
        console.error('Load users failed:', error)
        this.$message.error('加载用户列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleSearch(keyword) {
      this.searchKeyword = keyword
      this.currentPage = 1
      this.loadUsers()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.filterRole = ''
      this.currentPage = 1
      this.loadUsers()
    },
    
    handleRoleFilter() {
      this.currentPage = 1
      this.loadUsers()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadUsers()
    },
    
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadUsers()
    },
    
    handleViewDetail(row) {
      this.currentUser = row
      this.detailDialogVisible = true
    },
    
    handleEditRole(row) {
      this.currentUser = row
      this.newRole = row.role
      this.roleDialogVisible = true
    },
    
    async handleStatusChange(row) {
      try {
        await updateUserStatus(row.id, row.status)
        this.$message.success('状态更新成功')
      } catch (error) {
        console.error('Update status failed:', error)
        this.$message.error('状态更新失败')
        row.status = row.status === 1 ? 0 : 1
      }
    },
    
    async handleRoleSubmit() {
      if (!this.newRole) {
        this.$message.warning('请选择角色')
        return
      }
      
      if (this.newRole === this.currentUser.role) {
        this.$message.warning('角色未改变')
        return
      }
      
      this.submitting = true
      
      try {
        await updateUserRole(this.currentUser.id, this.newRole)
        this.$message.success('角色更新成功')
        this.roleDialogVisible = false
        this.loadUsers()
      } catch (error) {
        console.error('Update role failed:', error)
        this.$message.error('角色更新失败')
      } finally {
        this.submitting = false
      }
    },
    
    getRoleText(role) {
      const roleMap = {
        'SUPER_ADMIN': '超级管理员',
        'ADMIN': '管理员',
        'MERCHANT': '商家',
        'USER': '用户'
      }
      return roleMap[role] || role
    },
    
    getRoleType(role) {
      const typeMap = {
        'SUPER_ADMIN': 'danger',
        'ADMIN': 'warning',
        'MERCHANT': 'success',
        'USER': 'primary'
      }
      return typeMap[role] || 'info'
    }
  }
}
</script>

<style scoped>
.user-management {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.user-detail {
  padding: 20px 0;
}
</style>
