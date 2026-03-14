<template>
  <div class="user-center-page">
    <Header />
    
    <div class="user-center-container">
      <div class="user-sidebar">
        <div class="user-profile">
          <el-avatar :size="80" :src="userInfo.avatar" icon="el-icon-user-solid"></el-avatar>
          <h3>{{ userInfo.username }}</h3>
          <p>{{ userInfo.email }}</p>
        </div>
        
        <el-menu :default-active="activeTab" @select="handleMenuSelect">
          <el-menu-item index="profile">
            <i class="el-icon-user"></i>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <i class="el-icon-document"></i>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="addresses">
            <i class="el-icon-location"></i>
            <span>收货地址</span>
          </el-menu-item>
          <el-menu-item index="favorites">
            <i class="el-icon-star-off"></i>
            <span>我的收藏</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="user-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="content-section">
          <h2 class="section-title">个人信息</h2>
          <el-form :model="profileForm" label-width="100px" class="profile-form">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- Orders Tab -->
        <div v-if="activeTab === 'orders'" class="content-section">
          <h2 class="section-title">我的订单</h2>
          <div class="quick-nav">
            <el-button @click="goToOrders">查看所有订单</el-button>
          </div>
        </div>
        
        <!-- Addresses Tab -->
        <div v-if="activeTab === 'addresses'" class="content-section">
          <div class="section-header">
            <h2 class="section-title">收货地址</h2>
            <el-button type="primary" icon="el-icon-plus" @click="handleAddAddress">
              添加地址
            </el-button>
          </div>
          
          <Loading v-if="loadingAddresses" :visible="loadingAddresses" />
          
          <div v-else-if="addresses.length > 0" class="addresses-list">
            <div 
              v-for="address in addresses" 
              :key="address.id" 
              class="address-card"
              :class="{ 'is-default': address.isDefault }"
            >
              <div class="address-info">
                <div class="address-header">
                  <span class="receiver">{{ address.receiver }}</span>
                  <span class="phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
                </div>
                <div class="address-detail">{{ address.address }}</div>
              </div>
              <div class="address-actions">
                <el-button type="text" @click="handleEditAddress(address)">编辑</el-button>
                <el-button type="text" @click="handleDeleteAddress(address)">删除</el-button>
                <el-button 
                  v-if="!address.isDefault" 
                  type="text" 
                  @click="handleSetDefault(address)"
                >
                  设为默认
                </el-button>
              </div>
            </div>
          </div>
          
          <el-empty v-else description="还没有收货地址">
            <el-button type="primary" @click="handleAddAddress">添加地址</el-button>
          </el-empty>
        </div>
        
        <!-- Favorites Tab -->
        <div v-if="activeTab === 'favorites'" class="content-section">
          <h2 class="section-title">我的收藏</h2>
          <div class="quick-nav">
            <el-button @click="goToFavorites">查看所有收藏</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
    
    <!-- Address Dialog -->
    <el-dialog
      :title="addressDialogTitle"
      :visible.sync="addressDialogVisible"
      width="500px"
    >
      <el-form :model="addressForm" :rules="addressRules" ref="addressForm" label-width="80px">
        <el-form-item label="收货人" prop="receiver">
          <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input 
            type="textarea" 
            v-model="addressForm.address" 
            :rows="3"
            placeholder="请输入详细地址"
          ></el-input>
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAddress">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateUser } from '@/api/user'
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'UserCenter',
  components: {
    Header,
    Footer,
    Loading
  },
  data() {
    return {
      activeTab: 'profile',
      profileForm: {
        username: '',
        email: '',
        phone: ''
      },
      addresses: [],
      loadingAddresses: false,
      addressDialogVisible: false,
      addressDialogTitle: '添加地址',
      addressForm: {
        id: null,
        receiver: '',
        phone: '',
        address: '',
        isDefault: false
      },
      addressRules: {
        receiver: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo', 'userId', 'isLoggedIn'])
  },
  created() {
    if (!this.isLoggedIn) {
      this.$message.warning('请先登录')
      this.$router.push('/login')
      return
    }
    
    this.initProfileForm()
    
    // Check if there's a tab query parameter
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
    
    if (this.activeTab === 'addresses') {
      this.loadAddresses()
    }
  },
  methods: {
    initProfileForm() {
      this.profileForm = {
        username: this.userInfo.username || '',
        email: this.userInfo.email || '',
        phone: this.userInfo.phone || ''
      }
    },
    
    handleMenuSelect(index) {
      // Don't navigate if already on this tab
      if (this.activeTab === index && this.$route.query.tab === index) {
        return
      }
      
      this.activeTab = index
      
      // Update URL query parameter only if different
      if (this.$route.query.tab !== index) {
        this.$router.replace({ query: { tab: index } }).catch(err => {
          // Ignore navigation duplicated errors
          if (err.name !== 'NavigationDuplicated') {
            throw err
          }
        })
      }
      
      if (index === 'addresses') {
        this.loadAddresses()
      }
    },
    
    async handleUpdateProfile() {
      try {
        await updateUser(this.userId, {
          email: this.profileForm.email,
          phone: this.profileForm.phone
        })
        this.$message.success('更新成功')
      } catch (error) {
        console.error('Update profile error:', error)
        this.$message.error('更新失败')
      }
    },
    
    async loadAddresses() {
      this.loadingAddresses = true
      try {
        const response = await getAddresses(this.userId)
        this.addresses = response.data || []
      } catch (error) {
        console.error('Load addresses error:', error)
        this.$message.error('加载地址失败')
      } finally {
        this.loadingAddresses = false
      }
    },
    
    handleAddAddress() {
      this.addressDialogTitle = '添加地址'
      this.addressForm = {
        id: null,
        receiver: '',
        phone: '',
        address: '',
        isDefault: false
      }
      this.addressDialogVisible = true
    },
    
    handleEditAddress(address) {
      this.addressDialogTitle = '编辑地址'
      this.addressForm = {
        id: address.id,
        receiver: address.receiver,
        phone: address.phone,
        address: address.address,
        isDefault: address.isDefault
      }
      this.addressDialogVisible = true
    },
    
    async handleSaveAddress() {
      this.$refs.addressForm.validate(async (valid) => {
        if (!valid) return
        
        try {
          const data = {
            userId: this.userId,
            receiver: this.addressForm.receiver,
            phone: this.addressForm.phone,
            address: this.addressForm.address,
            isDefault: this.addressForm.isDefault
          }
          
          if (this.addressForm.id) {
            await updateAddress(this.addressForm.id, data)
            this.$message.success('更新成功')
          } else {
            await createAddress(data)
            this.$message.success('添加成功')
          }
          
          this.addressDialogVisible = false
          this.loadAddresses()
        } catch (error) {
          console.error('Save address error:', error)
          this.$message.error('保存失败')
        }
      })
    },
    
    async handleDeleteAddress(address) {
      try {
        await this.$confirm('确定要删除该地址吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteAddress(address.id)
        this.$message.success('删除成功')
        this.loadAddresses()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Delete address error:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async handleSetDefault(address) {
      try {
        await setDefaultAddress(address.id)
        this.$message.success('设置成功')
        this.loadAddresses()
      } catch (error) {
        console.error('Set default error:', error)
        this.$message.error('设置失败')
      }
    },
    
    goToOrders() {
      this.$router.push('/order')
    },
    
    goToFavorites() {
      this.$router.push('/favorite')
    }
  }
}
</script>

<style scoped>
.user-center-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.user-center-container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
}

.user-sidebar {
  background: #fff;
  border-radius: 8px;
  padding: 30px 0;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-profile {
  text-align: center;
  padding: 0 20px 30px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.user-profile h3 {
  margin: 15px 0 5px;
  font-size: 18px;
  color: #303133;
}

.user-profile p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.user-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-section {
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  color: #303133;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.profile-form {
  max-width: 600px;
}

.quick-nav {
  padding: 20px 0;
}

.addresses-list {
  display: grid;
  gap: 15px;
}

.address-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.address-card:hover {
  border-color: #67c23a;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.1);
}

.address-card.is-default {
  border-color: #67c23a;
  background: #f0f9ff;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
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
  gap: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .user-center-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .user-sidebar {
    padding: 20px 0;
  }
  
  .user-content {
    padding: 20px;
  }
  
  .address-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .address-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
