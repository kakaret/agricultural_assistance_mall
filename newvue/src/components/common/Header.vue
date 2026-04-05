<template>
  <div class="header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo" @click="goHome">
        <i class="el-icon-shopping-bag-2"></i>
        <span>农产品商城</span>
      </div>

      <!-- Navigation -->
      <div class="nav">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/products" class="nav-item">产品</router-link>
        <router-link to="/articles" class="nav-item">文章</router-link>
      </div>

      <!-- Search -->
      <div class="search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索产品"
          @keyup.enter.native="handleSearch"
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>

      <!-- Actions -->
      <div class="actions">
        <!-- Cart -->
        <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
          <el-button icon="el-icon-shopping-cart-2" @click="goToCart">
            购物车
          </el-button>
        </el-badge>

        <!-- Chat Messages Badge -->
        <el-badge v-if="isLoggedIn && userRole === 'CUSTOMER'" :value="unreadChatCount" :hidden="unreadChatCount === 0" class="chat-badge">
          <el-button icon="el-icon-chat-dot-square" @click="goToChat" title="客服消息">
          </el-button>
        </el-badge>

        <!-- User Menu -->
        <el-dropdown v-if="isLoggedIn" @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :src="userInfo && userInfo.avatar" icon="el-icon-user-solid"></el-avatar>
            <span class="username">{{ userInfo && userInfo.username }}</span>
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">
              <i class="el-icon-user"></i> 个人中心
            </el-dropdown-item>
            <el-dropdown-item command="orders">
              <i class="el-icon-document"></i> 我的订单
            </el-dropdown-item>
            <el-dropdown-item command="favorites">
              <i class="el-icon-star-off"></i> 我的收藏
            </el-dropdown-item>
            <el-dropdown-item v-if="isAdmin" command="admin" divided>
              <i class="el-icon-setting"></i> 管理后台
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <i class="el-icon-switch-button"></i> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- Login/Register -->
        <div v-else class="auth-buttons">
          <el-button size="small" @click="goToLogin">登录</el-button>
          <el-button size="small" type="primary" @click="goToRegister">注册</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Header',
  data() {
    return {
      searchKeyword: ''
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'userInfo', 'isAdmin', 'userRole']),
    ...mapGetters('cart', ['cartItemCount']),
    ...mapGetters('chat', ['totalUnread']),
    cartCount() {
      return this.cartItemCount
    },
    unreadChatCount() {
      return this.totalUnread || 0
    }
  },
  mounted() {
    // Initialize chat polling for customers to show unread count
    if (this.isLoggedIn && this.userRole === 'CUSTOMER') {
      this.$store.dispatch('chat/initChat', {
        currentUserId: this.userInfo.id,
        currentUserRole: 'CUSTOMER'
      }).catch(err => {
        console.error('Failed to init chat:', err)
      })
    }
  },
  beforeDestroy() {
    // Stop polling when component is destroyed
    if (this.isLoggedIn && this.userRole === 'CUSTOMER') {
      this.$store.dispatch('chat/stopPolling')
    }
  },
  methods: {
    ...mapActions('user', ['logout']),
    
    goHome() {
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
    
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$router.push({
          path: '/search',
          query: { keyword: this.searchKeyword }
        })
      }
    },
    
    goToCart() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      // Avoid duplicate navigation error
      if (this.$route.path !== '/cart') {
        this.$router.push('/cart')
      }
    },

    goToChat() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      // For merchant, go to chat management page; for customer, open chat window
      if (this.userRole === 'MERCHANT' || this.isAdmin) {
        if (this.$route.path !== '/admin/chat') {
          this.$router.push('/admin/chat')
        }
      }
    },
    
    goToLogin() {
      if (this.$route.path !== '/login') {
        this.$router.push('/login')
      }
    },
    
    goToRegister() {
      if (this.$route.path !== '/register') {
        this.$router.push('/register')
      }
    },
    
    handleCommand(command) {
      switch (command) {
        case 'profile':
          if (this.$route.path !== '/user-center') {
            this.$router.push('/user-center')
          }
          break
        case 'orders':
          if (this.$route.path !== '/order') {
            this.$router.push('/order')
          }
          break
        case 'favorites':
          if (this.$route.path !== '/favorite') {
            this.$router.push('/favorite')
          }
          break
        case 'admin':
          if (this.$route.path !== '/admin') {
            this.$router.push('/admin')
          }
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    
    async handleLogout() {
      try {
        // Stop chat polling before logout
        this.$store.dispatch('chat/stopPolling')
        await this.logout()
        this.$message.success('退出登录成功')
        this.$router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }
}
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 50px;
  height: 70px;
  display: flex;
  align-items: center;
  gap: 50px;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: bold;
  color: #67c23a;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  min-width: 180px;
}

.logo i {
  font-size: 32px;
}

.nav {
  display: flex;
  gap: 45px;
  flex-shrink: 0;
  margin-left: 20px;
}

.nav-item {
  color: #606266;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #67c23a;
  transition: width 0.3s;
}

.nav-item:hover::after,
.nav-item.router-link-active::after {
  width: 100%;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #67c23a;
}

.search {
  flex: 1;
  max-width: 450px;
  min-width: 250px;
  margin: 0 30px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.cart-badge,
.chat-badge {
  margin-right: 5px;
}

.cart-badge ::v-deep .el-button,
.chat-badge ::v-deep .el-button {
  padding: 10px 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

/* Responsive */
@media (max-width: 1200px) {
  .header-container {
    gap: 30px;
    padding: 0 30px;
  }
  
  .nav {
    gap: 30px;
    margin-left: 10px;
  }
  
  .search {
    margin: 0 15px;
  }
}

@media (max-width: 768px) {
  .header-container {
    gap: 15px;
    padding: 0 20px;
    height: 60px;
  }
  
  .logo {
    min-width: 140px;
    font-size: 18px;
  }
  
  .logo i {
    font-size: 26px;
  }
  
  .nav {
    display: none;
  }
  
  .search {
    max-width: 200px;
    margin: 0;
  }
  
  .username {
    display: none;
  }
  
  .actions {
    gap: 10px;
  }
}
</style>
