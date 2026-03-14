<template>
  <div v-if="visible" :class="['loading-container', { fullscreen }]">
    <div class="loading-content">
      <i class="el-icon-loading loading-icon"></i>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: '加载中...'
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.loading-icon {
  font-size: 48px;
  color: #67c23a;
  animation: rotate 1.5s linear infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
