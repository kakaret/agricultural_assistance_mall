<template>
  <div class="home-page">
    <Header />
    
    <div class="home-container">
      <!-- Carousel Section -->
      <section class="carousel-section">
        <Carousel :items="carouselItems" height="450px" />
      </section>
      
      <!-- Categories Section -->
      <section class="categories-section">
        <h2 class="section-title">商品分类</h2>
        <CategoryGrid :categories="categories" />
      </section>
      
      <!-- Recommended Products Section -->
      <section class="products-section">
        <div class="section-header">
          <h2 class="section-title">推荐商品</h2>
          <el-button type="text" @click="goToProducts">查看更多 <i class="el-icon-arrow-right"></i></el-button>
        </div>
        <Loading v-if="loading" :visible="loading" />
        <div v-else class="products-grid">
          <ProductCard
            v-for="product in recommendedProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
      </section>
      
      <!-- New Products Section -->
      <section class="products-section">
        <div class="section-header">
          <h2 class="section-title">新品上市</h2>
          <el-button type="text" @click="goToProducts">查看更多 <i class="el-icon-arrow-right"></i></el-button>
        </div>
        <div class="products-grid">
          <ProductCard
            v-for="product in newProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
      </section>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Carousel from '@/components/customer/Carousel.vue'
import CategoryGrid from '@/components/customer/CategoryGrid.vue'
import ProductCard from '@/components/common/ProductCard.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'Home',
  components: {
    Header,
    Footer,
    Carousel,
    CategoryGrid,
    ProductCard,
    Loading
  },
  data() {
    return {
      loading: false,
      carouselItems: [
        {
          id: 1,
          title: '新鲜农产品 直达您家',
          imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=450&fit=crop',
          linkUrl: '/products'
        },
        {
          id: 2,
          title: '有机蔬菜 健康生活',
          imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=450&fit=crop',
          linkUrl: '/products?categoryId=1'
        },
        {
          id: 3,
          title: '时令水果 新鲜采摘',
          imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1200&h=450&fit=crop',
          linkUrl: '/products?categoryId=2'
        }
      ],
      recommendedProducts: [],
      newProducts: []
    }
  },
  computed: {
    ...mapGetters('product', ['categories'])
  },
  created() {
    this.loadData()
  },
  methods: {
    ...mapActions('product', ['fetchProducts', 'fetchCategories']),
    ...mapActions('cart', ['addToCart']),
    
    async loadData() {
      this.loading = true
      try {
        // Load categories
        await this.fetchCategories()
        
        // Load recommended products (first 8, sorted by sales)
        const recommendedResponse = await this.fetchProducts({
          currentPage: 1,
          size: 8
        })
        const allProducts = recommendedResponse.data?.records || recommendedResponse.data || []
        
        // Sort by sales count and take top 8
        this.recommendedProducts = [...allProducts]
          .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          .slice(0, 8)
        
        // Sort by creation date and take top 8
        this.newProducts = [...allProducts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8)
      } catch (error) {
        console.error('Failed to load home data:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    
    async handleAddToCart(product) {
      if (!this.$store.getters['user/isLoggedIn']) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      // Show success message immediately (optimistic)
      const successMsg = this.$message.success('已添加到购物车')
      
      // Add to cart in background
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
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.home-container {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.carousel-section {
  margin-bottom: 40px;
}

.categories-section,
.products-section {
  margin-bottom: 50px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 20px 0;
  font-weight: 600;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 2px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 15px;
  }
  
  .carousel-section {
    margin-bottom: 30px;
  }
  
  .categories-section,
  .products-section {
    margin-bottom: 30px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
</style>
