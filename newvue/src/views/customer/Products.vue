<template>
  <div class="products-page">
    <Header />
    
    <div class="products-container">
      <!-- Mobile Filter Toggle -->
      <div class="mobile-filter-toggle">
        <el-button 
          icon="el-icon-s-operation" 
          @click="showMobileFilters = !showMobileFilters"
        >
          筛选
        </el-button>
      </div>
      
      <div class="sidebar" :class="{ 'mobile-visible': showMobileFilters }">
        <div class="filter-section">
          <h3>产品分类</h3>
          <el-menu
            :default-active="selectedCategory"
            @select="handleCategorySelect"
          >
            <el-menu-item index="all">
              <span>全部产品</span>
            </el-menu-item>
            <el-menu-item
              v-for="category in categories"
              :key="category.id"
              :index="String(category.id)"
            >
              <span>{{ category.name }}</span>
            </el-menu-item>
          </el-menu>
        </div>
        
        <div class="filter-section">
          <h3>价格区间</h3>
          <el-radio-group v-model="priceRange" @change="handleFilterChange">
            <el-radio label="all">全部</el-radio>
            <el-radio label="0-50">0-50元</el-radio>
            <el-radio label="50-100">50-100元</el-radio>
            <el-radio label="100-200">100-200元</el-radio>
            <el-radio label="200+">200元以上</el-radio>
          </el-radio-group>
        </div>
        
        <!-- Mobile Close Button -->
        <div class="mobile-filter-close">
          <el-button type="primary" @click="showMobileFilters = false">
            应用筛选
          </el-button>
        </div>
      </div>
      
      <div class="main-content">
        <div class="toolbar">
          <div class="result-info">
            共找到 <span class="count">{{ total }}</span> 个产品
          </div>
          <div class="sort-options">
            <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
              <el-option label="默认排序" value="default"></el-option>
              <el-option label="价格从低到高" value="price-asc"></el-option>
              <el-option label="价格从高到低" value="price-desc"></el-option>
              <el-option label="销量最高" value="sales"></el-option>
              <el-option label="最新上架" value="new"></el-option>
            </el-select>
          </div>
        </div>
        
        <Loading v-if="loading" :visible="loading" />
        
        <div v-else-if="products.length > 0" class="products-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
        
        <el-empty v-else description="暂无产品"></el-empty>
        
        <Pagination
          v-if="total > 0"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import ProductCard from '@/components/common/ProductCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'Products',
  components: {
    Header,
    Footer,
    ProductCard,
    Pagination,
    Loading
  },
  data() {
    return {
      selectedCategory: 'all',
      priceRange: 'all',
      sortBy: 'default',
      currentPage: 1,
      pageSize: 12,
      total: 0,
      loading: false,
      showMobileFilters: false
    }
  },
  computed: {
    ...mapGetters('product', ['products', 'categories'])
  },
  created() {
    this.loadCategories()
    this.loadProducts()
  },
  methods: {
    ...mapActions('product', ['fetchProducts', 'fetchCategories']),
    ...mapActions('cart', ['addToCart']),
    
    async loadCategories() {
      try {
        await this.fetchCategories()
      } catch (error) {
        console.error('Failed to load categories:', error)
        // 不显示错误消息，静默失败
      }
    },
    
    async loadProducts() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }
        
        if (this.selectedCategory !== 'all') {
          params.categoryId = this.selectedCategory
        }
        
        const response = await this.$store.dispatch('product/fetchProducts', params)
        this.total = response.data?.total || 0
      } catch (error) {
        console.error('Failed to fetch products:', error)
        this.$message.error('获取产品列表失败')
      } finally {
        this.loading = false
      }
    },
    
    handleCategorySelect(index) {
      this.selectedCategory = index
      this.currentPage = 1
      this.loadProducts()
      // Close mobile filters after selection
      if (window.innerWidth <= 768) {
        this.showMobileFilters = false
      }
    },
    
    handleFilterChange() {
      this.currentPage = 1
      this.loadProducts()
    },
    
    handleSortChange() {
      this.currentPage = 1
      this.loadProducts()
    },
    
    handlePageChange({ page, size }) {
      this.currentPage = page
      this.pageSize = size
      this.loadProducts()
    },
    
    async handleAddToCart(product) {
      if (!this.$store.getters['user/isLoggedIn']) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      // Show success message immediately (optimistic)
      const successMsg = this.$message.success('已添加到购物车')
      
      // Add to cart in background (don't await)
      this.addToCart({
        productId: product.id,
        quantity: 1,
        product: product
      }).catch(error => {
        console.error('Add to cart error:', error)
        // Close success message and show error
        successMsg.close()
        this.$message.error('添加失败，已回滚')
      })
    },
    
    handleToggleFavorite(product) {
      if (!this.$store.getters['user/isLoggedIn']) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      this.$message.info('收藏功能开发中')
    }
  }
}
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.products-container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  display: flex;
  gap: 20px;
  width: 100%;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
}

.mobile-filter-toggle {
  display: none;
  margin-bottom: 15px;
}

.mobile-filter-close {
  display: none;
}

.filter-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #303133;
}

.el-menu {
  border: none;
}

.el-radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.main-content {
  flex: 1;
}

.toolbar {
  background: #fff;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-info {
  font-size: 14px;
  color: #606266;
}

.count {
  color: #67c23a;
  font-weight: bold;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .products-container {
    flex-direction: column;
    padding: 12px;
  }
  
  .mobile-filter-toggle {
    display: block;
  }
  
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    max-width: 85%;
    background: #fff;
    z-index: 2000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .sidebar.mobile-visible {
    transform: translateX(0);
  }
  
  .sidebar::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .sidebar.mobile-visible::before {
    opacity: 1;
    pointer-events: auto;
  }
  
  .mobile-filter-close {
    display: block;
    padding: 15px 0;
    position: sticky;
    bottom: 0;
    background: #fff;
  }
  
  .mobile-filter-close .el-button {
    width: 100%;
  }
  
  .filter-section {
    margin-bottom: 15px;
    padding: 15px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .sort-options {
    width: 100%;
  }
  
  .sort-options .el-select {
    width: 100%;
  }
}
</style>
