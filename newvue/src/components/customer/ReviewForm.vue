<template>
  <div class="review-form">
    <el-form
      ref="reviewForm"
      :model="reviewForm"
      :rules="reviewRules"
      label-position="top"
    >
      <!-- Rating -->
      <el-form-item label="评分" prop="rating">
        <div class="rating-container">
          <el-rate
            v-model="reviewForm.rating"
            :colors="ratingColors"
            show-text
            :texts="ratingTexts"
          ></el-rate>
        </div>
      </el-form-item>

      <!-- Review Content -->
      <el-form-item label="评价内容" prop="content">
        <el-input
          v-model="reviewForm.content"
          type="textarea"
          :rows="6"
          placeholder="分享您的使用体验，帮助其他买家了解这个商品..."
          maxlength="500"
          show-word-limit
        ></el-input>
      </el-form-item>

      <!-- Submit Button -->
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          style="width: 100%"
        >
          {{ submitting ? '提交中...' : '提交评价' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { createReview } from '@/api/review'
import { mapGetters } from 'vuex'

export default {
  name: 'ReviewForm',
  
  props: {
    productId: {
      type: Number,
      required: true
    }
  },
  
  data() {
    return {
      submitting: false,
      reviewForm: {
        rating: 5,
        content: ''
      },
      reviewRules: {
        rating: [
          { required: true, message: '请选择评分', trigger: 'change' },
          { type: 'number', min: 1, max: 5, message: '评分必须在 1-5 之间', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入评价内容', trigger: 'blur' },
          { min: 10, max: 500, message: '评价内容长度在 10 到 500 个字符', trigger: 'blur' }
        ]
      },
      ratingColors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      ratingTexts: ['非常差', '差', '一般', '好', '非常好']
    }
  },
  
  computed: {
    ...mapGetters('user', ['userId'])
  },
  
  methods: {
    handleSubmit() {
      this.$refs.reviewForm.validate(async (valid) => {
        if (!valid) {
          return false
        }
        
        // Check if user is logged in
        if (!this.userId) {
          this.$message.warning('请先登录')
          this.$router.push('/login')
          return
        }
        
        this.submitting = true
        
        try {
          const data = {
            userId: this.userId,
            productId: this.productId,
            rating: this.reviewForm.rating,
            content: this.reviewForm.content.trim()
          }
          
          await createReview(data)
          
          this.$message.success('评价提交成功，等待审核')
          this.$emit('submit-success')
          
          // Reset form
          this.resetForm()
        } catch (error) {
          console.error('Submit review failed:', error)
          
          // Handle specific error messages
          if (error.response && error.response.data && error.response.data.message) {
            this.$message.error(error.response.data.message)
          } else {
            this.$message.error('提交评价失败，请稍后重试')
          }
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.reviewForm = {
        rating: 5,
        content: ''
      }
      if (this.$refs.reviewForm) {
        this.$refs.reviewForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.review-form {
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-container >>> .el-rate {
  height: 32px;
}

.rating-container >>> .el-rate__icon {
  font-size: 28px;
  margin-right: 8px;
}

.rating-container >>> .el-rate__text {
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

/* Form styling */
.review-form >>> .el-form-item__label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
}

.review-form >>> .el-textarea__inner {
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.review-form >>> .el-input__count {
  background-color: transparent;
  font-size: 12px;
}

/* Button styling */
.review-form >>> .el-button--primary {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .review-form {
    padding: 16px;
  }
  
  .rating-container >>> .el-rate__icon {
    font-size: 24px;
    margin-right: 6px;
  }
  
  .rating-container >>> .el-rate__text {
    font-size: 14px;
  }
  
  .review-form >>> .el-form-item__label {
    font-size: 14px;
  }
  
  .review-form >>> .el-textarea__inner {
    font-size: 13px;
  }
  
  .review-form >>> .el-button--primary {
    height: 40px;
    font-size: 15px;
  }
}
</style>
