<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  errorCaptured(err, vm, info) {
    console.error('Component error:', err)
    console.error('Error info:', info)
    this.$message.error('应用程序遇到错误，请刷新页面重试')
    return false
  }
}
</script>

<style>
@import './assets/styles/responsive.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Element UI customization */
.el-button--primary {
  background-color: #67c23a;
  border-color: #67c23a;
}

.el-button--primary:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}
</style>
