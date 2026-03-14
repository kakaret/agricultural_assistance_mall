<template>
  <div class="favorite-page">
    <Header />
    
    <div class="favorite-container">
      <h2 class="page-title">我的收藏</h2>
      
      <Loading v-if="loading" :visible="loading" />
      
      <div v-else-if="favorites.length > 0" class="favorites-content">
        <div class="products-grid">
          <ProductCard
            v-for="item in favorites"
            :key="item.id"
            :product="item.product"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="handleRemoveFavorite"
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
      
      <el-empty v-else description="还没有收藏的商品">
        <el-button type="primary" @click="goToProducts">去逛逛</el-button>
      </el-empty>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { getFavorites, removeFavorite } from '@/api/favorite'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import ProductCard from '@/components/common/ProductCard.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'Favorite',
  components: {
    Header,
    Footer,
    ProductCard,
    Pagination,
    Loading
  },
  data() {
    return {
      favorites: [],
      loading: false,
      currentPage: 1,
      pageSize: 12,
      total: 0
    }
  },
  computed: {
    ...mapGetters('user', ['userId', 'isLoggedIn'])
  },
  created() {
    if (!this.isLoggedIn) {
      this.$message.warning('请先登录')
      this.$router.push('/login')
      return
    }
    this.loadFavorites()
  },
  methods: {
    ...mapActions('cart', ['addToCart']),
    
    async loadFavorites() {
      this.loading = true
      try {
        const response = await getFavorites(this.userId, {
          page: this.currentPage,
          size: this.pageSize
        })
        
        // Handle different response structures
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.favorites = response.data
            this.total = response.data.length
          } else if (response.data.records) {
            this.favorites = response.data.records
            this.total = response.data.total || 0
          } else {
            this.favorites = []
            this.total = 0
          }
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
        this.$message.error('加载收藏失败')
      } finally {
        this.loading = false
      }
    },
    
    async handleAddToCart(product) {
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
    
    async handleRemoveFavorite(product) {
      try {
        await this.$confirm('确定要取消收藏吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // Find favorite item by product ID
        const favoriteItem = this.favorites.find(f => f.product.id === product.id)
        if (favoriteItem) {
          await removeFavorite(favoriteItem.id)
          this.$message.success('已取消收藏')
          this.loadFavorites()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Remove favorite error:', error)
          this.$message.error('取消收藏失败')
        }
      }
    },
    
    handlePageChange({ page, size }) {
      this.currentPage = page
      this.pageSize = size
      this.loadFavorites()
    },
    
    goToProducts() {
      this.$router.push('/products')
    }
  }
}
</script>

<style scoped>
.favorite-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.favorite-container {
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

.favorites-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  .favorite-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .favorites-content {
    padding: 20px 15px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
</style>
