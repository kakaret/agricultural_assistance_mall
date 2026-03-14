<template>
  <div class="address-selector">
    <!-- Address List -->
    <div v-if="addresses.length > 0" class="address-list">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="address-item"
        :class="{ 'selected': selectedId === address.id, 'default': address.isDefault }"
        @click="handleSelect(address.id)"
      >
        <div class="address-content">
          <div class="address-header">
            <span class="receiver">{{ address.receiver }}</span>
            <span class="phone">{{ address.phone }}</span>
            <el-tag v-if="address.isDefault" size="mini" type="success">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ address.address }}
          </div>
        </div>
        
        <div class="address-actions">
          <el-button
            type="text"
            size="small"
            icon="el-icon-edit"
            @click.stop="handleEdit(address)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            @click.stop="handleDelete(address.id)"
          >
            删除
          </el-button>
          <el-button
            v-if="!address.isDefault"
            type="text"
            size="small"
            @click.stop="handleSetDefault(address.id)"
          >
            设为默认
          </el-button>
        </div>
        
        <div v-if="selectedId === address.id" class="selected-indicator">
          <i class="el-icon-check"></i>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="el-icon-location-outline"></i>
      <p>暂无收货地址</p>
    </div>

    <!-- Add Address Button -->
    <div class="add-address-btn">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
        添加新地址
      </el-button>
    </div>

    <!-- Address Form Dialog -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="addressForm"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="receiver">
          <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        
        <el-form-item label="收货地址" prop="address">
          <el-input
            v-model="addressForm.address"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
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
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'

export default {
  name: 'AddressSelector',
  
  props: {
    addresses: {
      type: Array,
      default: () => []
    },
    selectedId: {
      type: Number,
      default: null
    }
  },
  
  data() {
    return {
      dialogVisible: false,
      dialogMode: 'add', // 'add' or 'edit'
      submitting: false,
      addressForm: {
        id: null,
        receiver: '',
        phone: '',
        address: '',
        isDefault: false
      },
      addressRules: {
        receiver: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入收货地址', trigger: 'blur' },
          { min: 5, max: 200, message: '地址长度在 5 到 200 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  
  computed: {
    dialogTitle() {
      return this.dialogMode === 'add' ? '添加收货地址' : '编辑收货地址'
    }
  },
  
  methods: {
    handleSelect(addressId) {
      this.$emit('select', addressId)
    },
    
    handleAdd() {
      this.dialogMode = 'add'
      this.dialogVisible = true
    },
    
    handleEdit(address) {
      this.dialogMode = 'edit'
      this.addressForm = {
        id: address.id,
        receiver: address.receiver,
        phone: address.phone,
        address: address.address,
        isDefault: address.isDefault
      }
      this.dialogVisible = true
    },
    
    async handleDelete(addressId) {
      try {
        await this.$confirm('确定要删除这个地址吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteAddress(addressId)
        this.$message.success('删除成功')
        this.$emit('delete', addressId)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete address failed:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async handleSetDefault(addressId) {
      try {
        await setDefaultAddress(addressId)
        this.$message.success('设置默认地址成功')
        this.$emit('set-default', addressId)
      } catch (error) {
        console.error('Set default address failed:', error)
        this.$message.error('设置默认地址失败')
      }
    },
    
    handleSubmit() {
      this.$refs.addressForm.validate(async (valid) => {
        if (!valid) {
          return false
        }
        
        this.submitting = true
        
        try {
          const data = {
            receiver: this.addressForm.receiver,
            phone: this.addressForm.phone,
            address: this.addressForm.address,
            isDefault: this.addressForm.isDefault
          }
          
          if (this.dialogMode === 'add') {
            await createAddress(data)
            this.$message.success('添加地址成功')
            this.$emit('add')
          } else {
            await updateAddress(this.addressForm.id, data)
            this.$message.success('更新地址成功')
            this.$emit('edit', this.addressForm.id)
          }
          
          this.dialogVisible = false
        } catch (error) {
          console.error('Submit address failed:', error)
          this.$message.error(this.dialogMode === 'add' ? '添加地址失败' : '更新地址失败')
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.addressForm = {
        id: null,
        receiver: '',
        phone: '',
        address: '',
        isDefault: false
      }
      if (this.$refs.addressForm) {
        this.$refs.addressForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.address-selector {
  width: 100%;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.address-item {
  position: relative;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.address-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.address-item.selected {
  border-color: #409eff;
  background-color: #f0f7ff;
}

.address-item.default {
  border-color: #67c23a;
}

.address-content {
  margin-bottom: 12px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.receiver {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.phone {
  font-size: 14px;
  color: #606266;
}

.address-detail {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.selected-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  background-color: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.add-address-btn {
  text-align: center;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .address-item {
    padding: 12px;
  }
  
  .address-header {
    flex-wrap: wrap;
  }
  
  .receiver {
    font-size: 15px;
  }
  
  .phone {
    font-size: 13px;
  }
  
  .address-detail {
    font-size: 13px;
  }
  
  .address-actions {
    flex-wrap: wrap;
  }
}
</style>
