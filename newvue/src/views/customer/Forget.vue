<template>
  <div class="forget-container">
    <div class="forget-card">
      <div class="forget-header">
        <h2>找回密码</h2>
        <p class="subtitle">请输入您的注册邮箱接收验证码</p>
      </div>

      <el-form
        ref="forgetForm"
        :model="forgetForm"
        :rules="forgetRules"
        class="forget-form"
        @submit.native.prevent="handleSubmit"
      >
        <el-form-item prop="email">
          <el-input
            v-model="forgetForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="el-icon-message"
            size="large"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item prop="code">
          <div class="code-container">
            <el-input
              v-model="forgetForm.code"
              placeholder="请输入验证码"
              prefix-icon="el-icon-chat-line-round"
              size="large"
            ></el-input>
            <el-button
              type="success"
              size="large"
              :disabled="codeDisabled"
              @click="sendVerificationCode"
              class="code-btn"
            >
              {{ codeButtonText }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input
            v-model="forgetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            prefix-icon="el-icon-lock"
            size="large"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
            class="submit-btn"
          >
            {{ submitting ? '重置中...' : '重置密码' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="forget-footer">
        <router-link to="/login" class="back-link">
          <i class="el-icon-back"></i>
          返回登录
        </router-link>
      </div>

      <!-- Success Message -->
      <el-alert
        v-if="showSuccess"
        title="密码重置成功"
        type="success"
        description="您的密码已成功重置，3秒后将自动跳转到登录页面。"
        :closable="false"
        show-icon
        class="success-alert"
      ></el-alert>
    </div>
  </div>
</template>

<script>
import { requestPasswordReset, sendEmailCode } from '@/api/user'

export default {
  name: 'Forget',
  
  data() {
    return {
      forgetForm: {
        email: '',
        code: '',
        newPassword: ''
      },
      forgetRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      },
      submitting: false,
      showSuccess: false,
      codeDisabled: false,
      countdown: 0,
      timer: null,
      emailCode: ''
    }
  },
  
  computed: {
    codeButtonText() {
      if (this.countdown > 0) {
        return `${this.countdown}秒后可重发`
      }
      return '发送验证码'
    }
  },
  
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  
  methods: {
    async sendVerificationCode() {
      if (this.codeDisabled) return
      
      // Validate email first
      if (!this.forgetForm.email) {
        this.$message.warning('请先输入邮箱地址')
        return
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.forgetForm.email)) {
        this.$message.warning('请输入正确的邮箱地址')
        return
      }
      
      try {
        const res = await sendEmailCode(this.forgetForm.email)
        
        if (res.code === '0') {
          this.$message.success('验证码已发送到您的邮箱，请查收')
          this.emailCode = res.data
          
          // Start countdown
          this.countdown = 60
          this.codeDisabled = true
          
          this.timer = setInterval(() => {
            if (this.countdown > 0) {
              this.countdown--
            } else {
              clearInterval(this.timer)
              this.countdown = 0
              this.codeDisabled = false
            }
          }, 1000)
        } else {
          this.$message.error(res.msg || '发送验证码失败')
        }
      } catch (error) {
        console.error('Send verification code failed:', error)
        this.$message.error('发送验证码失败，请稍后重试')
      }
    },
    
    handleSubmit() {
      this.$refs.forgetForm.validate(async (valid) => {
        if (!valid) {
          return false
        }
        
        // Verify code
        if (this.forgetForm.code !== this.emailCode) {
          this.$message.error('验证码不正确')
          return
        }
        
        this.submitting = true
        this.showSuccess = false
        
        try {
          await requestPasswordReset(this.forgetForm.email, this.forgetForm.newPassword)
          
          this.showSuccess = true
          this.$message.success('密码重置成功')
          
          // Clear form
          this.forgetForm = {
            email: '',
            code: '',
            newPassword: ''
          }
          this.$refs.forgetForm.clearValidate()
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.$router.push('/login')
          }, 3000)
        } catch (error) {
          console.error('Reset password failed:', error)
          
          // Handle specific error messages
          if (error.response && error.response.data && error.response.data.message) {
            this.$message.error(error.response.data.message)
          } else {
            this.$message.error('重置失败，请检查邮箱地址是否正确')
          }
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style scoped>
.forget-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forget-card {
  width: 100%;
  max-width: 450px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.forget-header {
  text-align: center;
  margin-bottom: 32px;
}

.forget-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.subtitle {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  margin: 0;
}

.forget-form {
  margin-bottom: 24px;
}

.forget-form >>> .el-input__inner {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
}

.forget-form >>> .el-input__prefix {
  left: 15px;
  font-size: 18px;
}

.forget-form >>> .el-input__inner {
  padding-left: 45px;
}

.code-container {
  display: flex;
  gap: 12px;
}

.code-btn {
  flex-shrink: 0;
  width: 130px;
  height: 48px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.forget-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.back-link:hover {
  color: #66b1ff;
}

.back-link i {
  font-size: 16px;
}

.success-alert {
  margin-top: 24px;
}

.success-alert >>> .el-alert__title {
  font-size: 15px;
  font-weight: 600;
}

.success-alert >>> .el-alert__description {
  font-size: 13px;
  line-height: 1.6;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .forget-container {
    padding: 16px;
  }
  
  .forget-card {
    padding: 28px 24px;
  }
  
  .forget-header h2 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 13px;
  }
  
  .forget-form >>> .el-input__inner {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
  }
  
  .code-container {
    gap: 8px;
  }
  
  .code-btn {
    width: 110px;
    height: 44px;
    font-size: 13px;
  }
  
  .submit-btn {
    height: 44px;
    font-size: 15px;
  }
  
  .back-link {
    font-size: 13px;
  }
}
</style>
