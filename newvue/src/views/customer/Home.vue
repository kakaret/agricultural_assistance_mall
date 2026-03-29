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

      <!-- Seasonal Products Section (时令推荐) -->
      <section class="products-section seasonal-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="el-icon-sunny" style="color:#67c23a"></i>
            {{ currentSeasonLabel }}好物
          </h2>
          <el-button type="text" @click="goToProducts">查看更多 <i class="el-icon-arrow-right"></i></el-button>
        </div>
        <div v-if="seasonalProducts.length > 0" class="products-grid">
          <ProductCard
            v-for="product in seasonalProducts"
            :key="'s-' + product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>
        <el-empty v-else description="暂无当季商品" :image-size="80"></el-empty>
      </section>

      <!-- Origin Map Section (产地地图) -->
      <section class="map-section">
        <h2 class="section-title">
          <i class="el-icon-map-location" style="color:#409eff"></i>
          产地分布
        </h2>
        <div class="origin-map-container">
          <div ref="originMap" class="origin-map"></div>
          <div v-if="selectedProvince" class="province-products">
            <h3>{{ selectedProvince }} 的农产品</h3>
            <div v-if="provinceProducts.length > 0" class="province-products-grid">
              <div v-for="p in provinceProducts" :key="p.id" class="mini-product" @click="goToProduct(p.id)">
                <img :src="getProductImage(p.imageUrl)" :alt="p.name" />
                <div class="mini-info">
                  <span class="mini-name">{{ p.name }}</span>
                  <span class="mini-price">¥{{ p.isDiscount ? p.discountPrice : p.price }}</span>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无商品" :image-size="60"></el-empty>
          </div>
        </div>
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
import { getSeasonalProducts, getOriginStats, getProductsByOrigin } from '@/api/product'
import { getImageUrl } from '@/utils/image'

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
      newProducts: [],
      seasonalProducts: [],
      originStats: {},
      selectedProvince: null,
      provinceProducts: []
    }
  },
  computed: {
    ...mapGetters('product', ['categories']),
    currentSeasonLabel() {
      const month = new Date().getMonth() + 1
      if (month >= 3 && month <= 5) return '春季'
      if (month >= 6 && month <= 8) return '夏季'
      if (month >= 9 && month <= 11) return '秋季'
      return '冬季'
    }
  },
  created() {
    this.loadData()
  },
  mounted() {
    // ECharts 地图在数据加载后初始化
  },
  beforeDestroy() {
    if (this.mapChart) {
      this.mapChart.dispose()
    }
  },
  methods: {
    ...mapActions('product', ['fetchProducts', 'fetchCategories']),
    ...mapActions('cart', ['addToCart']),

    async loadData() {
      this.loading = true
      try {
        await this.fetchCategories()

        // 并行加载
        const [recommendedResponse, seasonalRes, originRes] = await Promise.all([
          this.fetchProducts({ currentPage: 1, size: 8 }),
          getSeasonalProducts(null, 8).catch(() => ({ data: [] })),
          getOriginStats().catch(() => ({ data: {} }))
        ])

        const allProducts = recommendedResponse.data?.records || recommendedResponse.data || []
        this.recommendedProducts = [...allProducts]
          .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
          .slice(0, 8)
        this.newProducts = [...allProducts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8)

        // 时令推荐
        if (seasonalRes.data && Array.isArray(seasonalRes.data)) {
          this.seasonalProducts = seasonalRes.data
        }

        // 产地分布
        if (originRes.data) {
          this.originStats = originRes.data
          this.$nextTick(() => this.initOriginMap())
        }
      } catch (error) {
        console.error('Failed to load home data:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    async initOriginMap() {
      // 动态引入 ECharts 和中国地图
      const echarts = await import('echarts/core')
      const { MapChart } = await import('echarts/charts')
      const { TooltipComponent, VisualMapComponent, GeoComponent } = await import('echarts/components')
      const { CanvasRenderer } = await import('echarts/renderers')

      echarts.use([MapChart, TooltipComponent, VisualMapComponent, GeoComponent, CanvasRenderer])

      // 加载中国地图 JSON
      let chinaJson
      try {
        const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
        chinaJson = await res.json()
      } catch {
        console.warn('地图数据加载失败')
        return
      }

      echarts.registerMap('china', chinaJson)

      const mapDom = this.$refs.originMap
      if (!mapDom) return
      this.mapChart = echarts.init(mapDom)

      // 构建数据
      const data = Object.entries(this.originStats).map(([name, value]) => ({
        name: name.replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区/g, ''),
        value
      }))

      const maxVal = Math.max(...data.map(d => d.value), 1)

      this.mapChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: p => p.data ? `${p.name}<br/>商品数量：${p.data.value}` : p.name
        },
        visualMap: {
          min: 0,
          max: maxVal,
          left: 'left',
          top: 'bottom',
          text: ['多', '少'],
          inRange: { color: ['#e0f2e9', '#67c23a', '#2d8c1f'] },
          calculable: true
        },
        series: [{
          name: '产地分布',
          type: 'map',
          map: 'china',
          roam: true,
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14 },
            itemStyle: { areaColor: '#ffd666' }
          },
          data
        }]
      })

      this.mapChart.on('click', params => {
        if (params.data && params.data.value > 0) {
          this.loadProvinceProducts(params.name)
        }
      })

      // 响应式
      window.addEventListener('resize', () => this.mapChart && this.mapChart.resize())
    },

    async loadProvinceProducts(province) {
      this.selectedProvince = province
      try {
        const res = await getProductsByOrigin(province, { currentPage: 1, size: 6 })
        if (res.data && res.data.records) {
          this.provinceProducts = res.data.records
        } else {
          this.provinceProducts = []
        }
      } catch {
        this.provinceProducts = []
      }
    },

    getProductImage(imageUrl) {
      return imageUrl ? getImageUrl(imageUrl) : 'https://via.placeholder.com/80x80?text=Product'
    },

    goToProduct(id) {
      this.$router.push(`/product/${id}`)
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

.section-title i {
  margin-right: 6px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Seasonal section highlight */
.seasonal-section {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e1f3d8;
}

/* Origin Map Section */
.map-section {
  margin-bottom: 50px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.origin-map-container {
  display: flex;
  gap: 20px;
}

.origin-map {
  width: 65%;
  height: 450px;
}

.province-products {
  flex: 1;
  min-width: 280px;
}

.province-products h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #67c23a;
}

.province-products-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-product {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid #ebeef5;
}

.mini-product:hover {
  background: #f5f7fa;
  border-color: #67c23a;
}

.mini-product img {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.mini-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.mini-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.mini-price {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
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

  .origin-map-container {
    flex-direction: column;
  }

  .origin-map {
    width: 100%;
    height: 300px;
  }

  .seasonal-section {
    padding: 16px;
  }
}
</style>
