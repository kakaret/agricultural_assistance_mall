<template>
  <div class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>专注于提供优质的农产品</p>
          <p>让健康生活触手可及</p>
        </div>
        
        <div class="footer-section">
          <h3>快速链接</h3>
          <router-link to="/">首页</router-link>
          <router-link to="/products">产品列表</router-link>
          <router-link to="/articles">文章资讯</router-link>
        </div>
        
        <div class="footer-section">
          <h3>客户服务</h3>
          <a href="#">帮助中心</a>
          <a href="#">配送说明</a>
          <a href="#">退换货政策</a>
        </div>
        
        <div class="footer-section">
          <h3>联系我们</h3>
          <p><i class="el-icon-phone"></i> 400-123-4567</p>
          <p><i class="el-icon-message"></i> service@example.com</p>
          <p><i class="el-icon-location"></i> 中国·北京</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 农产品销售系统. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #67c23a;
}

.footer-section p,
.footer-section a {
  color: #bdc3c7;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #67c23a;
}

.footer-section i {
  margin-right: 8px;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  padding-top: 20px;
  text-align: center;
  color: #95a5a6;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
