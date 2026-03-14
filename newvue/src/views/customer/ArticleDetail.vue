<template>
  <div class="article-detail-page">
    <Header />
    
    <div class="article-container">
      <Loading v-if="loading" :visible="loading" />
      
      <div v-else-if="article" class="article-content">
        <div class="article-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/articles' }">文章</el-breadcrumb-item>
            <el-breadcrumb-item>{{ article.title }}</el-breadcrumb-item>
          </el-breadcrumb>
          
          <h1 class="article-title">{{ article.title }}</h1>
          
          <div class="article-meta">
            <span class="author">
              <i class="el-icon-user"></i>
              {{ article.author || '管理员' }}
            </span>
            <span class="date">
              <i class="el-icon-time"></i>
              {{ formatDate(article.createdAt) }}
            </span>
            <span class="views">
              <i class="el-icon-view"></i>
              {{ article.viewCount || 0 }} 次浏览
            </span>
          </div>
        </div>
        
        <div v-if="article.coverImage" class="article-cover">
          <img 
            v-lazy="getArticleImage(article.coverImage)" 
            :alt="article.title"
            class="lazy-image"
          />
        </div>
        
        <div class="article-body" v-html="sanitizedContent"></div>
        
        <div class="article-footer">
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </div>
      
      <el-empty v-else description="文章不存在"></el-empty>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { getArticle } from '@/api/article'
import { getImageUrl } from '@/utils/image'
import { formatDate } from '@/utils/date'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'ArticleDetail',
  components: {
    Header,
    Footer,
    Loading
  },
  data() {
    return {
      article: null,
      loading: false
    }
  },
  computed: {
    sanitizedContent() {
      if (!this.article || !this.article.content) {
        return ''
      }
      // Sanitize HTML content to prevent XSS attacks
      return DOMPurify.sanitize(this.article.content)
    }
  },
  created() {
    this.loadArticle()
  },
  methods: {
    async loadArticle() {
      const articleId = this.$route.params.id
      if (!articleId) {
        this.$message.error('文章ID无效')
        this.$router.push('/articles')
        return
      }
      
      this.loading = true
      try {
        const response = await getArticle(articleId)
        this.article = response.data
      } catch (error) {
        console.error('Failed to load article:', error)
        this.$message.error('加载文章失败')
      } finally {
        this.loading = false
      }
    },
    
    getArticleImage(imageUrl) {
      return getImageUrl(imageUrl)
    },
    
    formatDate(date) {
      return formatDate(date)
    },
    
    goBack() {
      // Check if can go back in history
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/articles')
      }
    }
  }
}
</script>

<style scoped>
.article-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.article-container {
  flex: 1;
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.article-content {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-header {
  margin-bottom: 30px;
}

.article-title {
  font-size: 32px;
  color: #303133;
  margin: 20px 0;
  font-weight: 600;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 25px;
  font-size: 14px;
  color: #909399;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.article-meta i {
  font-size: 16px;
}

.article-cover {
  width: 100%;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: auto;
  display: block;
  transition: opacity 0.3s;
  opacity: 0;
}

.article-cover img.lazy-loaded {
  opacity: 1;
}

.article-body {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 40px;
}

/* Article content styles */
.article-body ::v-deep h1,
.article-body ::v-deep h2,
.article-body ::v-deep h3,
.article-body ::v-deep h4,
.article-body ::v-deep h5,
.article-body ::v-deep h6 {
  margin: 25px 0 15px;
  font-weight: 600;
  color: #303133;
}

.article-body ::v-deep h1 {
  font-size: 28px;
}

.article-body ::v-deep h2 {
  font-size: 24px;
}

.article-body ::v-deep h3 {
  font-size: 20px;
}

.article-body ::v-deep p {
  margin: 15px 0;
  text-align: justify;
}

.article-body ::v-deep img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px auto;
  border-radius: 4px;
}

.article-body ::v-deep ul,
.article-body ::v-deep ol {
  margin: 15px 0;
  padding-left: 30px;
}

.article-body ::v-deep li {
  margin: 8px 0;
}

.article-body ::v-deep blockquote {
  margin: 20px 0;
  padding: 15px 20px;
  background: #f5f7fa;
  border-left: 4px solid #67c23a;
  color: #606266;
}

.article-body ::v-deep code {
  padding: 2px 6px;
  background: #f5f7fa;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.article-body ::v-deep pre {
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
}

.article-body ::v-deep pre code {
  padding: 0;
  background: none;
}

.article-body ::v-deep a {
  color: #67c23a;
  text-decoration: none;
}

.article-body ::v-deep a:hover {
  text-decoration: underline;
}

.article-footer {
  padding-top: 30px;
  border-top: 1px solid #ebeef5;
}

/* Responsive */
@media (max-width: 768px) {
  .article-container {
    padding: 15px;
  }
  
  .article-content {
    padding: 25px 20px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .article-body {
    font-size: 15px;
  }
  
  .article-body ::v-deep h1 {
    font-size: 22px;
  }
  
  .article-body ::v-deep h2 {
    font-size: 20px;
  }
  
  .article-body ::v-deep h3 {
    font-size: 18px;
  }
}
</style>
