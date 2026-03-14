<template>
  <div class="category-management">
    <h2 class="page-title">分类管理</h2>
    
    <div class="content-card">
      <div class="toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          添加分类
        </el-button>
      </div>
      
      <el-table
        :data="categories"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="分类名称" min-width="200"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="icon" label="图标" width="100" align="center">
          <template slot-scope="scope">
            <i v-if="scope.row.icon" :class="scope.row.icon" style="font-size: 20px"></i>
          </template>
        </el-table-column>
        <el-table-column label="商品数量" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="small">{{ scope.row.productCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
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
    
    <!-- Category Form Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="categoryForm"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        
        <el-form-item label="父级分类">
          <el-select
            v-model="categoryForm.parentId"
            placeholder="请选择父级分类（不选则为顶级分类）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="category in flatCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
              :disabled="category.id === categoryForm.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类图标">
          <el-input v-model="categoryForm.icon" placeholder="请输入图标类名，如：el-icon-goods">
            <template slot="prepend">
              <i v-if="categoryForm.icon" :class="categoryForm.icon"></i>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="分类描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
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
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/category'

export default {
  name: 'CategoryManagement',
  
  data() {
    return {
      categories: [],
      flatCategories: [],
      loading: false,
      dialogVisible: false,
      dialogMode: 'add',
      submitting: false,
      categoryForm: {
        id: null,
        name: '',
        parentId: null,
        icon: '',
        description: ''
      },
      categoryRules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '添加分类' : '编辑分类'
    }
  },
  
  created() {
    this.loadCategories()
  },
  
  methods: {
    async loadCategories() {
      this.loading = true
      try {
        const res = await getCategories()
        if (res.code === '0') {
          const categories = res.data || []
          this.categories = this.buildTree(categories)
          this.flatCategories = categories
        }
      } catch (error) {
        console.error('Load categories failed:', error)
        this.$message.error('加载分类列表失败')
      } finally {
        this.loading = false
      }
    },
    
    buildTree(categories) {
      const map = {}
      const roots = []
      
      // Create map
      categories.forEach(cat => {
        map[cat.id] = { ...cat, children: [] }
      })
      
      // Build tree
      categories.forEach(cat => {
        if (cat.parentId && map[cat.parentId]) {
          map[cat.parentId].children.push(map[cat.id])
        } else {
          roots.push(map[cat.id])
        }
      })
      
      return roots
    },
    
    handleAdd() {
      this.dialogMode = 'add'
      this.dialogVisible = true
    },
    
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.categoryForm = {
        id: row.id,
        name: row.name,
        parentId: row.parentId || null,
        icon: row.icon || '',
        description: row.description || ''
      }
      this.dialogVisible = true
    },
    
    async handleDelete(row) {
      // Check if has children
      if (row.children && row.children.length > 0) {
        this.$message.warning('该分类下有子分类，无法删除')
        return
      }
      
      // Check if has products
      if (row.productCount > 0) {
        this.$message.warning('该分类下有商品，无法删除')
        return
      }
      
      try {
        await this.$confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteCategory(row.id)
        this.$message.success('删除成功')
        this.loadCategories()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete category failed:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    handleSubmit() {
      this.$refs.categoryForm.validate(async (valid) => {
        if (!valid) return
        
        this.submitting = true
        
        try {
          const data = { ...this.categoryForm }
          
          if (this.dialogMode === 'add') {
            await createCategory(data)
            this.$message.success('添加成功')
          } else {
            await updateCategory(data.id, data)
            this.$message.success('更新成功')
          }
          
          this.dialogVisible = false
          this.loadCategories()
        } catch (error) {
          console.error('Submit category failed:', error)
          this.$message.error(this.dialogMode === 'add' ? '添加失败' : '更新失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.categoryForm = {
        id: null,
        name: '',
        parentId: null,
        icon: '',
        description: ''
      }
      if (this.$refs.categoryForm) {
        this.$refs.categoryForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.category-management {
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
</style>
