<template>
  <div class="cart-item">
    <el-checkbox 
      :value="selected" 
      @change="handleSelect"
      class="item-checkbox"
    ></el-checkbox>
    
    <div class="item-image">
      <img :src="productImage" :alt="item.product.name" />
    </div>
    
    <div class="item-info">
      <h4 class="item-name">{{ item.product.name }}</h4>
      <p class="item-origin" v-if="item.product.placeOfOrigin">
        产地：{{ item.product.placeOfOrigin }}
      </p>
    </div>
    
    <div class="item-price">
      <span v-if="item.product.isDiscount" class="discount-price">
        ¥{{ item.product.discountPrice }}
      </span>
      <span :class="{ 'original-price': item.product.isDiscount, 'current-price': !item.product.isDiscount }">
        ¥{{ item.product.price }}
      </span>
    </div>
    
    <div class="item-quantity">
      <el-input-number
        :value="item.quantity"
        :min="1"
        :max="item.product.stock"
        @change="handleQuantityChange"
        size="small"
      ></el-input-number>
      <span class="stock-hint" v-if="item.product.stock < 10">
        仅剩 {{ item.product.stock }} 件
      </span>
    </div>
    
    <div class="item-subtotal">
      <span class="subtotal-label">小计</span>
      <span class="subtotal-price">¥{{ subtotal }}</span>
    </div>
    
    <div class="item-actions">
      <el-button 
        type="text" 
        icon="el-icon-delete" 
        @click="handleRemove"
        class="remove-btn"
      >
        删除
      </el-button>
    </div>
  </div>
</template>

<script>
import { getImageUrl, getPlaceholderImage } from '@/utils/image'

export default {
  name: 'CartItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    productImage() {
      return this.item.product.imageUrl 
        ? getImageUrl(this.item.product.imageUrl) 
        : getPlaceholderImage(100, 100)
    },
    
    subtotal() {
      const price = this.item.product.isDiscount 
        ? this.item.product.discountPrice 
        : this.item.product.price
      return (price * this.item.quantity).toFixed(2)
    }
  },
  methods: {
    handleSelect(value) {
      this.$emit('select', this.item.id, value)
    },
    
    handleQuantityChange(value) {
      if (value !== this.item.quantity) {
        this.$emit('update-quantity', this.item.id, value)
      }
    },
    
    handleRemove() {
      this.$emit('remove', this.item.id)
    }
  }
}
</script>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 40px 100px 1fr 120px 150px 100px 80px;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: box-shadow 0.3s;
}

.cart-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  font-size: 16px;
  color: #303133;
  margin: 0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-origin {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.item-price {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.discount-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.current-price {
  font-size: 18px;
  color: #303133;
  font-weight: bold;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.stock-hint {
  font-size: 12px;
  color: #f56c6c;
}

.item-subtotal {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: center;
}

.subtotal-label {
  font-size: 12px;
  color: #909399;
}

.subtotal-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.item-actions {
  display: flex;
  justify-content: center;
}

.remove-btn {
  color: #909399;
  padding: 0;
}

.remove-btn:hover {
  color: #f56c6c;
}

/* Responsive */
@media (max-width: 1200px) {
  .cart-item {
    grid-template-columns: 40px 80px 1fr 100px 120px 80px 60px;
    gap: 15px;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 768px) {
  .cart-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    padding: 50px 15px 15px 15px;
  }
  
  .item-checkbox {
    position: absolute;
    top: 15px;
    left: 15px;
  }
  
  .item-image {
    width: 100%;
    height: 180px;
  }
  
  .item-info {
    gap: 6px;
  }
  
  .item-name {
    font-size: 15px;
  }
  
  .item-origin {
    font-size: 11px;
  }
  
  .item-price,
  .item-quantity,
  .item-subtotal {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .item-price {
    border-top: 1px solid #f0f0f0;
  }
  
  .subtotal-label {
    font-size: 14px;
    color: #606266;
  }
  
  .item-actions {
    justify-content: flex-end;
    padding-top: 8px;
  }
  
  .remove-btn {
    font-size: 14px;
  }
}
</style>
