<template>
  <div class="cart-page">
    <Header />
    
    <div class="cart-container">
      <h2 class="page-title">购物车</h2>
      
      <div v-if="cartItems.length > 0" class="cart-content">
        <div class="cart-header">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          <span class="header-label">商品信息</span>
          <span class="header-label">单价</span>
          <span class="header-label">数量</span>
          <span class="header-label">小计</span>
          <span class="header-label">操作</span>
        </div>
        
        <div class="cart-items">
          <CartItem
            v-for="item in cartItems"
            :key="item.id"
            :item="item"
            :selected="item.selected"
            @select="handleItemSelect"
            @update-quantity="handleQuantityChange"
            @remove="handleRemove"
          />
        </div>
        
        <div class="cart-footer">
          <div class="footer-left">
            <el-button @click="handleBatchDelete">批量删除</el-button>
          </div>
          
          <div class="footer-right">
            <div class="total-info">
              <span>已选 <strong>{{ selectedCount }}</strong> 件商品</span>
              <span class="total-label">合计：</span>
              <span class="total-price">¥{{ totalPrice }}</span>
            </div>
            <el-button type="primary" size="large" @click="handleCheckout">
              结算
            </el-button>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="购物车是空的">
        <el-button type="primary" @click="goToProducts">去逛逛</el-button>
      </el-empty>
    </div>
    
    <Footer />
    
    <!-- Checkout Dialog -->
    <CheckoutDialog
      :visible.sync="checkoutDialogVisible"
      :items="selectedItems"
      @order-success="handleOrderSuccess"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'
import CartItem from '@/components/customer/CartItem.vue'
import CheckoutDialog from '@/components/customer/CheckoutDialog.vue'

export default {
  name: 'Cart',
  components: {
    Header,
    Footer,
    CartItem,
    CheckoutDialog
  },
  data() {
    return {
      selectAll: false,
      checkoutDialogVisible: false
    }
  },
  computed: {
    ...mapGetters('cart', ['cartItems', 'cartTotalPrice']),
    ...mapGetters('user', ['userId']),
    
    selectedCount() {
      return this.cartItems.filter(item => item.selected).length
    },
    
    totalPrice() {
      return this.cartItems
        .filter(item => item.selected)
        .reduce((sum, item) => {
          const price = item.product.isDiscount ? item.product.discountPrice : item.product.price
          return sum + (price * item.quantity)
        }, 0)
        .toFixed(2)
    },
    
    selectedItems() {
      return this.cartItems.filter(item => item.selected)
    }
  },
  created() {
    if (this.userId) {
      this.loadCart()
    }
  },
  methods: {
    ...mapActions('cart', ['fetchCart', 'updateQuantity', 'removeFromCart']),
    
    async loadCart() {
      if (!this.userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      try {
        await this.fetchCart(this.userId)
        // Add selected property to each item
        this.cartItems.forEach(item => {
          this.$set(item, 'selected', false)
        })
      } catch (error) {
        console.error('Failed to load cart:', error)
        this.$message.error('加载购物车失败')
      }
    },
    
    handleSelectAll(value) {
      this.cartItems.forEach(item => {
        item.selected = value
      })
    },
    
    handleItemSelect(itemId, value) {
      const item = this.cartItems.find(i => i.id === itemId)
      if (item) {
        item.selected = value
        this.selectAll = this.cartItems.every(item => item.selected)
      }
    },
    
    async handleQuantityChange(itemId, quantity) {
      try {
        await this.updateQuantity({
          itemId,
          quantity
        })
      } catch (error) {
        console.error('Failed to update quantity:', error)
        this.$message.error('更新数量失败')
      }
    },
    
    async handleRemove(itemId) {
      try {
        await this.$confirm('确定要删除该商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await this.removeFromCart(itemId)
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to remove item:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    async handleBatchDelete() {
      const selectedItems = this.cartItems.filter(item => item.selected)
      if (selectedItems.length === 0) {
        this.$message.warning('请选择要删除的商品')
        return
      }
      
      try {
        await this.$confirm(`确定要删除选中的 ${selectedItems.length} 件商品吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        for (const item of selectedItems) {
          await this.removeFromCart(item.id)
        }
        
        this.$message.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to batch delete:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    handleCheckout() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要结算的商品')
        return
      }
      
      if (!this.userId) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      this.checkoutDialogVisible = true
    },
    
    async handleOrderSuccess() {
      // Remove checked out items from cart
      for (const item of this.selectedItems) {
        await this.removeFromCart(item.id)
      }
      
      // Reload cart
      await this.loadCart()
    },
    
    goToProducts() {
      this.$router.push('/products')
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.cart-container {
  flex: 1;
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.cart-header {
  display: grid;
  grid-template-columns: 40px 100px 1fr 120px 150px 100px 80px;
  gap: 20px;
  padding: 15px 20px;
  background: #f5f7fa;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  align-items: center;
}

.header-label {
  text-align: center;
}

.cart-items {
  border-top: 1px solid #ebeef5;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 2px solid #ebeef5;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
}

.total-label {
  font-size: 16px;
  color: #606266;
}

.total-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .cart-header {
    grid-template-columns: 40px 80px 1fr 100px 120px 80px 60px;
  }
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-right {
    width: 100%;
    flex-direction: column;
  }
}
</style>
