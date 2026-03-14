<template>
  <div class="product-detail-page">
    <Header />
    
    <div class="container">
      <Loading v-if="loading" :visible="loading" />
      
      <div v-else-if="product" class="product-detail">
        <div class="product-images">
          <img 
            v-lazy="product.imageUrl || defaultImage" 
            :alt="product.name" 
            class="main-image lazy-image" 
          />
        </div>
        
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-meta">
            <span v-if="product.placeOfOrigin" class="origin">
              <i class="el-icon-location"></i>
              产地：{{ product.placeOfOrigin }}
            </span>
            <span class="sales">已售 {{ product.salesCount || 0 }}</span>
          </div>
          
          <div class="price-section">
            <div class="price">
              <span class="label">价格：</span>
              <span class="current-price">
                ¥{{ product.isDiscount ? product.discountPrice : product.price }}
              </span>
              <span v-if="product.isDiscount" class="original-price">
                ¥{{ product.price }}
              </span>
            </div>
            <div class="stock">
              库存：{{ product.stock }} 件
            </div>
          </div>
          
          <div class="quantity-section">
            <span class="label">数量：</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock"
            />
          </div>
          
          <div class="actions">
            <el-button type="primary" size="large" @click="handleAddToCart">
              <i class="el-icon-shopping-cart-2"></i>
              加入购物车
            </el-button>
            <el-button size="large" @click="handleBuyNow">
              立即购买
            </el-button>
            <el-button icon="el-icon-star-off" circle @click="handleToggleFavorite"></el-button>
          </div>
        </div>
      </div>
      
      <div v-if="product" class="product-description">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="description-content">
              <p>{{ product.description || '暂无详细描述' }}</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品评价" name="reviews">
            <div class="reviews-content">
              <p>评价功能开发中...</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import Loading from '@/components/common/Loading.vue'

export default {
  name: 'ProductDetail',
  components: {
    Header,
    Footer,
    Loading
  },
  data() {
    return {
      product: null,
      quantity: 1,
      activeTab: 'detail',
      loading: false,
      defaultImage: 'https://via.placeholder.com/400x400?text=Product'
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn'])
  },
  created() {
    this.loadProduct()
  },
  methods: {
    ...mapActions('product', ['fetchProductDetail']),
    ...mapActions('cart', ['addToCart']),
    
    async loadProduct() {
      const productId = this.$route.params.id
      if (!productId) {
        this.$message.error('产品ID无效')
        this.$router.push('/products')
        return
      }
      
      this.loading = true
      try {
        this.product = await this.fetchProductDetail(productId)
      } catch (error) {
        console.error('Failed to load product:', error)
        this.$message.error('加载产品详情失败')
        this.$router.push('/products')
      } finally {
        this.loading = false
      }
    },
    
    async handleAddToCart() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      // Show success message immediately (optimistic)
      const successMsg = this.$message.success('已添加到购物车')
      
      // Add to cart in background (don't await)
      this.addToCart({
        productId: this.product.id,
        quantity: this.quantity,
        product: this.product
      }).catch(error => {
        console.error('Add to cart error:', error)
        // Close success message and show error
        successMsg.close()
        this.$message.error('添加失败，已回滚')
      })
    },
    
    handleBuyNow() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      this.$message.info('立即购买功能开发中')
    },
    
    handleToggleFavorite() {
      if (!this.isLoggedIn) {
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
.product-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.product-detail {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  margin-bottom: 20px;
}

.product-images {
  position: sticky;
  top: 80px;
}

.main-image {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: opacity 0.3s;
  opacity: 0;
}

.main-image.lazy-loaded {
  opacity: 1;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 24px;
  color: #303133;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

.origin i {
  margin-right: 4px;
}

.price-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.label {
  font-size: 14px;
  color: #606266;
}

.current-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 18px;
  color: #909399;
  text-decoration: line-through;
}

.stock {
  font-size: 14px;
  color: #606266;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.actions {
  display: flex;
  gap: 15px;
  padding-top: 10px;
}

.product-description {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.description-content,
.reviews-content {
  padding: 20px 0;
  line-height: 1.8;
  color: #606266;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .product-images {
    position: static;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions .el-button {
    width: 100%;
  }
}
</style>
