<template>
  <div class="articles-page">
    <Header />
    
    <div class="articles-container">
      <h2 class="page-title">农业资讯</h2>
      
      <Loading v-if="loading" :visible="loading" />
      
      <div v-else-if="articles.length > 0" class="articles-content">
        <div class="articles-grid">
          <div 
            v-for="article in articles" 
            :key="article.id" 
            class="article-card"
            @click="goToArticle(article.id)"
          >
            <div class="article-cover">
              <img 
                v-lazy="getArticleImage(article.coverImage)" 
                :alt="article.title"
                class="lazy-image"
              />
            </div>
            <div class="article-info">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-summary">{{ article.summary }}</p>
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
          </div>
        </div>
        
        <Pagination
          v-if="total > pageSize"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
      
      <el-empty v-else description="暂无文章"></el-empty>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { getArticles } from '@/api/article'
import { getImageUrl, getPlaceholderImage } from '@/utils/image'
import { formatDate } from '@/utils/date'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'Articles',
  components: {
    Header,
    Footer,
    Pagination,
    Loading
  },
  data() {
    return {
      articles: [],
      loading: false,
      currentPage: 1,
      pageSize: 12,
      total: 0
    }
  },
  created() {
    this.loadArticles()
  },
  methods: {
    async loadArticles() {
      this.loading = true
      try {
        const response = await getArticles({
          page: this.currentPage,
          size: this.pageSize
        })
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.articles = response.data
            this.total = response.data.length
          } else if (response.data.records) {
            this.articles = response.data.records
            this.total = response.data.total || 0
          } else {
            this.articles = []
            this.total = 0
          }
        }
      } catch (error) {
        console.error('Failed to load articles:', error)
        this.$message.error('加载文章失败')
      } finally {
        this.loading = false
      }
    },
    
    handlePageChange({ page, size }) {
      this.currentPage = page
      this.pageSize = size
      this.loadArticles()
      window.scrollTo(0, 0)
    },
    
    getArticleImage(imageUrl) {
      return imageUrl ? getImageUrl(imageUrl) : getPlaceholderImage(400, 250)
    },
    
    formatDate(date) {
      return formatDate(date, false)
    },
    
    goToArticle(id) {
      this.$router.push(`/article/${id}`)
    }
  }
}
</script>

<style scoped>
.articles-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.articles-container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 600;
}

.articles-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.article-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #67c23a;
}

.article-cover {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f5f7fa;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s, opacity 0.3s;
  opacity: 0;
}

.article-cover img.lazy-loaded {
  opacity: 1;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-info {
  padding: 20px;
}

.article-title {
  font-size: 18px;
  color: #303133;
  margin: 0 0 12px 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 54px;
}

.article-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 15px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 67px;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.article-meta i {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1200px) {
  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .articles-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .articles-content {
    padding: 20px 15px;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .article-cover {
    height: 200px;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
