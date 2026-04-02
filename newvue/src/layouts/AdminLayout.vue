<template>
  <div class="admin-layout">
    <!-- Mobile Menu Backdrop -->
    <div 
      v-if="isMobile && mobileMenuOpen" 
      class="admin-sidebar-backdrop"
      @click="closeMobileMenu"
    ></div>
    
    <!-- Sidebar -->
    <el-aside 
      :width="isCollapse ? '64px' : '200px'" 
      class="admin-sidebar"
      :class="{ 'mobile-open': mobileMenuOpen }"
    >
      <div class="logo-container">
        <i v-if="isCollapse" class="el-icon-s-grid logo-icon"></i>
        <template v-else>
          <i class="el-icon-s-grid logo-icon"></i>
          <span class="logo-text">管理后台</span>
        </template>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
        @select="closeMobileMenu"
      >
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-s-home"></i>
          <span slot="title">仪表盘</span>
        </el-menu-item>

        <el-submenu v-if="isAdmin || isMerchant" index="product">
          <template slot="title">
            <i class="el-icon-goods"></i>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/products">商品列表</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/admin/categories">分类管理</el-menu-item>
        </el-submenu>

        <el-menu-item v-if="isAdmin || isMerchant" index="/admin/orders">
          <i class="el-icon-s-order"></i>
          <span slot="title">订单管理</span>
        </el-menu-item>

        <el-menu-item v-if="isAdmin" index="/admin/users">
          <i class="el-icon-user"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>

        <el-menu-item v-if="isAdmin || isMerchant" index="/admin/stock">
          <i class="el-icon-box"></i>
          <span slot="title">库存管理</span>
        </el-menu-item>

        <el-menu-item v-if="isAdmin || isMerchant" index="/admin/after-sales">
          <i class="el-icon-s-claim"></i>
          <span slot="title">售后管理</span>
        </el-menu-item>

        <el-menu-item v-if="isAdmin" index="/admin/after-sales-arbitration">
          <i class="el-icon-s-check"></i>
          <span slot="title">售后仲裁</span>
        </el-menu-item>

        <el-submenu v-if="isAdmin" index="content">
          <template slot="title">
            <i class="el-icon-document"></i>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/admin/articles">文章管理</el-menu-item>
          <el-menu-item index="/admin/carousels">轮播图管理</el-menu-item>
          <el-menu-item index="/admin/notices">公告管理</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-container class="admin-container">
      <!-- Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <i
            :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
            class="collapse-icon"
            @click="toggleCollapse"
          ></i>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="index"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar || defaultAvatar">
                {{ userInfo.username ? userInfo.username.charAt(0) : 'A' }}
              </el-avatar>
              <span class="username">{{ userInfo.username || '管理员' }}</span>
              <i class="el-icon-arrow-down"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="home">
                <i class="el-icon-s-home"></i> 返回首页
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AdminLayout',

  data() {
    return {
      isCollapse: false,
      mobileMenuOpen: false,
      isMobile: false,
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  },

  computed: {
    ...mapGetters('user', ['userInfo', 'isAdmin', 'isMerchant']),
    
    activeMenu() {
      return this.$route.path
    },
    
    breadcrumbs() {
      const matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      return matched.map(item => ({
        path: item.path,
        title: item.meta.title
      }))
    }
  },
  
  mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
  },
  
  methods: {
    ...mapActions('user', ['logout']),
    
    checkMobile() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.mobileMenuOpen = false
      }
    },
    
    toggleCollapse() {
      if (this.isMobile) {
        this.mobileMenuOpen = !this.mobileMenuOpen
      } else {
        this.isCollapse = !this.isCollapse
      }
    },
    
    closeMobileMenu() {
      if (this.isMobile) {
        this.mobileMenuOpen = false
      }
    },
    
    handleCommand(command) {
      switch (command) {
        case 'profile':
          this.$router.push('/admin/profile')
          break
        case 'home':
          this.$router.push('/')
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    
    async handleLogout() {
      try {
        await this.$confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.logout()
        this.$message.success('退出成功')
        this.$router.push('/login')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Logout failed:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 20px;
  background-color: #2b3a4b;
}

.logo-icon {
  font-size: 28px;
  color: #409eff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.admin-sidebar >>> .el-menu {
  border-right: none;
}

.admin-sidebar >>> .el-menu-item,
.admin-sidebar >>> .el-submenu__title {
  height: 50px;
  line-height: 50px;
}

.admin-sidebar >>> .el-menu-item i,
.admin-sidebar >>> .el-submenu__title i {
  color: #bfcbd9;
  font-size: 16px;
}

.admin-sidebar >>> .el-menu-item.is-active {
  background-color: #263445 !important;
}

.admin-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-left >>> .el-breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
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

.admin-main {
  flex: 1;
  background-color: #f0f2f5;
  overflow-y: auto;
  padding: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }
  
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 2000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 200px !important;
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .admin-sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1999;
  }
  
  .admin-container {
    width: 100%;
  }
  
  .admin-header {
    padding: 0 12px;
    height: 56px;
  }
  
  .admin-main {
    padding: 12px;
  }
  
  .header-left >>> .el-breadcrumb {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .logo-text {
    font-size: 14px;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .admin-main {
    padding: 16px;
  }
}
</style>
