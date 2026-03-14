<template>
  <div class="product-card" @click="handleClick">
    <div class="image-container">
      <img 
        v-lazy="getProductImage(product.imageUrl)" 
        :alt="product.name"
        class="lazy-image"
      />
      <div v-if="product.isDiscount" class="discount-badge">
        特惠
      </div>
      <div class="favorite-btn" @click.stop="handleFavorite">
        <i :class="product.isFavorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      
      <div class="product-meta">
        <span class="origin" v-if="product.placeOfOrigin">
          <i class="el-icon-location"></i>
          {{ product.placeOfOrigin }}
        </span>
        <span class="sales">
          已售 {{ product.salesCount || 0 }}
        </span>
      </div>
      
      <div class="product-price">
        <span class="current-price">
          ¥{{ product.isDiscount ? product.discountPrice : product.price }}
        </span>
        <span v-if="product.isDiscount" class="original-price">
          ¥{{ product.price }}
        </span>
      </div>
      
      <div class="product-actions">
        <el-button 
          size="small" 
          type="primary" 
          icon="el-icon-shopping-cart-2"
          @click.stop="handleAddToCart"
        >
          加入购物车
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getImageUrl, getPlaceholderImage } from '@/utils/image'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    getProductImage(imageUrl) {
      return imageUrl ? getImageUrl(imageUrl) : getPlaceholderImage()
    },
    handleClick() {
      this.$emit('click', this.product)
      this.$router.push(`/product/${this.product.id}`)
    },
    
    handleFavorite() {
      this.$emit('toggle-favorite', this.product)
    },
    
    handleAddToCart() {
      this.$emit('add-to-cart', this.product)
    }
  }
}
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s, opacity 0.3s;
  opacity: 0;
}

.image-container img.lazy-loaded {
  opacity: 1;
}

.product-card:hover .image-container img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #f56c6c;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.favorite-btn i {
  font-size: 20px;
  color: #f56c6c;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.origin i {
  margin-right: 4px;
}

.product-price {
  margin-bottom: 12px;
}

.current-price {
  font-size: 22px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
  margin-left: 8px;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.product-actions .el-button {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .product-card {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-name {
    font-size: 14px;
  }
  
  .product-meta {
    font-size: 11px;
  }
  
  .current-price {
    font-size: 18px;
  }
  
  .original-price {
    font-size: 12px;
  }
  
  .discount-badge {
    top: 8px;
    left: 8px;
    padding: 3px 8px;
    font-size: 11px;
  }
  
  .favorite-btn {
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
  }
  
  .favorite-btn i {
    font-size: 18px;
  }
  
  .product-actions .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>
