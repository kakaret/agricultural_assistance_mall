<template>
  <div class="image-uploader">
    <el-upload
      class="upload-container"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :accept="accept"
      :disabled="uploading"
    >
      <div v-if="imageUrl && !uploading" class="image-preview">
        <img :src="imageUrl" alt="Preview">
        <div class="image-overlay">
          <i class="el-icon-edit"></i>
          <span>更换图片</span>
        </div>
        <div class="image-actions">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            circle
            @click.stop="handleRemove"
          ></el-button>
        </div>
      </div>
      
      <div v-else-if="uploading" class="upload-progress">
        <el-progress
          type="circle"
          :percentage="uploadProgress"
          :width="100"
        ></el-progress>
        <p class="progress-text">上传中...</p>
      </div>
      
      <div v-else class="upload-placeholder">
        <i class="el-icon-plus"></i>
        <p class="upload-text">点击上传图片</p>
        <p class="upload-hint">
          支持 {{ acceptText }}<br>
          文件大小不超过 {{ maxSizeMB }}MB
        </p>
      </div>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'ImageUploader',
  
  props: {
    value: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB in bytes
    },
    accept: {
      type: String,
      default: 'image/jpeg,image/jpg,image/png,image/gif'
    }
  },
  
  data() {
    return {
      imageUrl: this.value,
      uploading: false,
      uploadProgress: 0
    }
  },
  
  computed: {
    uploadUrl() {
      // Use the backend API base URL for file upload
      return process.env.VUE_APP_BASE_API + '/file/upload'
    },
    
    uploadHeaders() {
      return {
        'Authorization': 'Bearer ' + getToken()
      }
    },
    
    maxSizeMB() {
      return (this.maxSize / (1024 * 1024)).toFixed(0)
    },
    
    acceptText() {
      const types = this.accept.split(',').map(type => {
        return type.split('/')[1].toUpperCase()
      })
      return types.join('、')
    }
  },
  
  watch: {
    value(newVal) {
      this.imageUrl = newVal
    }
  },
  
  methods: {
    beforeUpload(file) {
      // Check file type
      const acceptTypes = this.accept.split(',')
      const isValidType = acceptTypes.includes(file.type)
      
      if (!isValidType) {
        this.$message.error(`只能上传 ${this.acceptText} 格式的图片`)
        return false
      }
      
      // Check file size
      const isValidSize = file.size <= this.maxSize
      
      if (!isValidSize) {
        this.$message.error(`图片大小不能超过 ${this.maxSizeMB}MB`)
        return false
      }
      
      this.uploading = true
      this.uploadProgress = 0
      
      return true
    },
    
    handleProgress(event) {
      this.uploadProgress = Math.floor(event.percent)
    },
    
    handleSuccess(response) {
      this.uploading = false
      this.uploadProgress = 0
      
      // Assuming the response contains the image URL
      if (response && response.data) {
        this.imageUrl = response.data.url || response.data
        this.$emit('input', this.imageUrl)
        this.$emit('upload-success', this.imageUrl)
        this.$message.success('图片上传成功')
      } else {
        this.$message.error('上传失败：响应格式错误')
        this.$emit('upload-error', new Error('Invalid response format'))
      }
    },
    
    handleError(error) {
      this.uploading = false
      this.uploadProgress = 0
      
      console.error('Upload error:', error)
      this.$message.error('图片上传失败，请重试')
      this.$emit('upload-error', error)
    },
    
    handleRemove() {
      this.$confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.imageUrl = ''
        this.$emit('input', '')
        this.$emit('remove')
        this.$message.success('图片已删除')
      }).catch(() => {
        // User cancelled
      })
    }
  }
}
</script>

<style scoped>
.image-uploader {
  display: inline-block;
}

.upload-container {
  width: 100%;
}

.upload-container >>> .el-upload {
  width: 200px;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-container >>> .el-upload:hover {
  border-color: #409eff;
}

.upload-container >>> .el-upload.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Image Preview */
.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: #fff;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-overlay i {
  font-size: 32px;
  margin-bottom: 8px;
}

.image-overlay span {
  font-size: 14px;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.progress-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}

/* Upload Placeholder */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: 20px;
}

.upload-placeholder i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .upload-container >>> .el-upload {
    width: 150px;
    height: 150px;
  }
  
  .upload-placeholder i {
    font-size: 36px;
  }
  
  .upload-text {
    font-size: 13px;
  }
  
  .upload-hint {
    font-size: 11px;
  }
  
  .image-overlay i {
    font-size: 24px;
  }
  
  .image-overlay span {
    font-size: 12px;
  }
}
</style>
