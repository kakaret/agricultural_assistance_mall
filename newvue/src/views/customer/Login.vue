<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2>欢迎登录</h2>
        <p>农产品销售系统</p>
      </div>
      
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            size="large"
            @keyup.enter.native="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <router-link to="/forget">忘记密码？</router-link>
        <span class="divider">|</span>
        <router-link to="/register">立即注册</router-link>
      </div>
      
      <div class="back-home">
        <el-button type="text" @click="goHome">
          <i class="el-icon-back"></i> 返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    ...mapActions('user', ['login']),
    
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) {
          return false
        }
        
        this.loading = true
        try {
          await this.login(this.loginForm)
          this.$message.success('登录成功')
          
          // Check if user is admin and redirect accordingly
          const isAdmin = this.$store.getters['user/isAdmin']
          const role = this.$store.getters['user/role']
          
          console.log('Login success, role:', role, 'isAdmin:', isAdmin)
          
          if (isAdmin) {
            // Admin users go to admin dashboard
            this.$router.push('/admin/dashboard')
          } else {
            // Regular users go to home or redirect page
            const redirect = this.$route.query.redirect || '/'
            this.$router.push(redirect)
          }
        } catch (error) {
          console.error('Login error:', error)
          this.$message.error('登录失败，请检查用户名和密码')
        } finally {
          this.loading = false
        }
      })
    },
    
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('https://img1.baidu.com/it/u=2176280983,589576205&fm=253&app=138&f=JPEG?w=889&h=500');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
}

.login-footer {
  text-align: center;
  font-size: 14px;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}

.login-footer a:hover {
  color: #66b1ff;
}

.divider {
  margin: 0 10px;
  color: #dcdfe6;
}

.back-home {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }
}
</style>
