<template>
  <div class="category-page">
    <Header />
    
    <div class="category-container">
      <div class="category-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">产品</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentCategory">{{ currentCategory.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <div class="category-info">
          <h2 class="category-title">{{ currentCategory ? currentCategory.name : '分类商品' }}</h2>
          <p v-if="currentCategory && currentCategory.description" class="category-desc">
            {{ currentCategory.description }}
          </p>
          <p v-if="!loading" class="product-count">
            共 <strong>{{ total }}</strong> 个商品
          </p>
        </div>
      </div>
      
      <Loading v-if="loading" :visible="loading" />
      
      <div v-else-if="products.length > 0" class="category-content">
        <div class="filter-bar">
          <div class="sort-options">
            <span class="label">排序：</span>
            <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="price-asc">价格升序</el-radio-button>
              <el-radio-button label="price-desc">价格降序</el-radio-button>
              <el-radio-button label="sales">销量</el-radio-button>
              <el-radio-button label="new">最新</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <div class="products-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
        
        <Pagination
          v-if="total > pageSize"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          @page-change="handlePageChange"
        />
      </div>
      
      <el-empty v-else description="该分类下暂无商品">
        <el-button type="primary" @click="goToProducts">浏览所有商品</el-button>
      </el-empty>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getProducts } from '@/api/product'
import { getCategory } from '@/api/category'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import ProductCard from '@/components/common/ProductCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'Category',
  components: {
    Header,
    Footer,
    ProductCard,
    Pagination,
    Loading
  },
  data() {
    return {
      categoryId: null,
      currentCategory: null,
      products: [],
      loading: false,
      currentPage: 1,
      pageSize: 12,
      total: 0,
      sortBy: 'default'
    }
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.categoryId = newId
          this.currentPage = 1
          this.loadCategory()
          this.loadProducts()
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('cart', ['addToCart']),
    
    async loadCategory() {
      if (!this.categoryId) return
      
      try {
        const response = await getCategory(this.categoryId)
        this.currentCategory = response.data
      } catch (error) {
        console.error('Failed to load category:', error)
      }
    },
    
    async loadProducts() {
      if (!this.categoryId) return
      
      this.loading = true
      try {
        const params = {
          currentPage: this.currentPage,
          size: this.pageSize,
          categoryId: this.categoryId
        }
        
        if (this.sortBy !== 'default') {
          params.sort = this.sortBy
        }
        
        const response = await getProducts(params)
        
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.products = response.data
            this.total = response.data.length
          } else if (response.data.records) {
            this.products = response.data.records
            this.total = response.data.total || 0
          } else {
            this.products = []
            this.total = 0
          }
        }
        
        // Client-side sorting if needed
        if (this.sortBy !== 'default' && this.products.length > 0) {
          this.sortProducts()
        }
      } catch (error) {
        console.error('Failed to load products:', error)
        this.$message.error('加载商品失败')
      } finally {
        this.loading = false
      }
    },
    
    sortProducts() {
      switch (this.sortBy) {
        case 'price-asc':
          this.products.sort((a, b) => {
            const priceA = a.isDiscount ? a.discountPrice : a.price
            const priceB = b.isDiscount ? b.discountPrice : b.price
            return priceA - priceB
          })
          break
        case 'price-desc':
          this.products.sort((a, b) => {
            const priceA = a.isDiscount ? a.discountPrice : a.price
            const priceB = b.isDiscount ? b.discountPrice : b.price
            return priceB - priceA
          })
          break
        case 'sales':
          this.products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          break
        case 'new':
          this.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          break
      }
    },
    
    handleSortChange() {
      this.currentPage = 1
      this.loadProducts()
    },
    
    handlePageChange({ page, size }) {
      this.currentPage = page
      this.pageSize = size
      this.loadProducts()
      window.scrollTo(0, 0)
    },
    
    async handleAddToCart(product) {
      if (!this.$store.getters['user/isLoggedIn']) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      const successMsg = this.$message.success('已添加到购物车')
      
      this.addToCart({
        productId: product.id,
        quantity: 1,
        product: product
      }).catch(error => {
        console.error('Add to cart error:', error)
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
    },
    
    goToProducts() {
      this.$router.push('/products')
    }
  }
}
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.category-container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.category-header {
  background: #fff;
  border-radius: 8px;
  padding: 25px 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-info {
  margin-top: 20px;
}

.category-title {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.category-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.product-count {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.product-count strong {
  color: #67c23a;
  font-size: 16px;
}

.category-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-options .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* Responsive */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .category-container {
    padding: 15px;
  }
  
  .category-header {
    padding: 20px;
  }
  
  .category-title {
    font-size: 22px;
  }
  
  .category-content {
    padding: 15px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .sort-options {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
</style>
