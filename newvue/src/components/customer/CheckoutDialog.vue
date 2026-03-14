<template>
  <el-dialog
    title="确认订单"
    :visible.sync="dialogVisible"
    width="800px"
    :before-close="handleClose"
    class="checkout-dialog"
  >
    <div class="checkout-content">
      <!-- Address Selection -->
      <div class="checkout-section">
        <h3 class="section-title">
          <i class="el-icon-location"></i>
          收货地址
        </h3>
        <AddressSelector
          :addresses="addresses"
          :selected-id="selectedAddressId"
          @select="handleAddressSelect"
          @add="loadAddresses"
          @edit="loadAddresses"
          @delete="loadAddresses"
          @set-default="loadAddresses"
        />
      </div>

      <!-- Order Items -->
      <div class="checkout-section">
        <h3 class="section-title">
          <i class="el-icon-goods"></i>
          商品清单
        </h3>
        <div class="order-items">
          <div
            v-for="item in orderItems"
            :key="item.id"
            class="order-item"
          >
            <img :src="item.product.imageUrl" :alt="item.product.name" class="item-image">
            <div class="item-info">
              <h4 class="item-name">{{ item.product.name }}</h4>
              <p class="item-price">¥{{ getItemPrice(item) }} × {{ item.quantity }}</p>
            </div>
            <div class="item-total">
              ¥{{ (getItemPrice(item) * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="checkout-section">
        <h3 class="section-title">
          <i class="el-icon-document"></i>
          订单金额
        </h3>
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总价</span>
            <span>¥{{ totalAmount }}</span>
          </div>
          <div class="summary-row">
            <span>运费</span>
            <span>¥0.00</span>
          </div>
          <div class="summary-row total">
            <span>应付总额</span>
            <span class="total-price">¥{{ totalAmount }}</span>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmitOrder"
      >
        {{ submitting ? '提交中...' : '提交订单' }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import AddressSelector from './AddressSelector.vue'
import { getAddresses } from '@/api/address'
import { createOrder } from '@/api/order'

export default {
  name: 'CheckoutDialog',
  
  components: {
    AddressSelector
  },
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      dialogVisible: this.visible,
      submitting: false,
      addresses: [],
      selectedAddressId: null
    }
  },
  
  computed: {
    ...mapGetters('user', ['userId']),
    
    orderItems() {
      return this.items
    },
    
    totalAmount() {
      return this.orderItems
        .reduce((sum, item) => {
          return sum + (this.getItemPrice(item) * item.quantity)
        }, 0)
        .toFixed(2)
    },
    
    selectedAddress() {
      return this.addresses.find(addr => addr.id === this.selectedAddressId)
    }
  },
  
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadAddresses()
      }
    },
    
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  
  methods: {
    getItemPrice(item) {
      return item.product.isDiscount ? item.product.discountPrice : item.product.price
    },
    
    async loadAddresses() {
      if (!this.userId) return
      
      try {
        const res = await getAddresses(this.userId)
        if (res.code === '0') {
          this.addresses = res.data || []
          
          // Auto select default address
          const defaultAddr = this.addresses.find(addr => addr.isDefault)
          if (defaultAddr) {
            this.selectedAddressId = defaultAddr.id
          } else if (this.addresses.length > 0) {
            this.selectedAddressId = this.addresses[0].id
          }
        }
      } catch (error) {
        console.error('Load addresses failed:', error)
      }
    },
    
    handleAddressSelect(addressId) {
      this.selectedAddressId = addressId
    },
    
    async handleSubmitOrder() {
      // Validate address
      if (!this.selectedAddressId) {
        this.$message.warning('请选择收货地址')
        return
      }
      
      if (this.orderItems.length === 0) {
        this.$message.warning('订单商品不能为空')
        return
      }
      
      this.submitting = true
      
      try {
        const address = this.selectedAddress
        
        // Create orders for each item
        const orderPromises = this.orderItems.map(item => {
          const orderData = {
            userId: this.userId,
            productId: item.product.id,
            quantity: item.quantity,
            price: this.getItemPrice(item),
            totalPrice: (this.getItemPrice(item) * item.quantity).toFixed(2),
            recvName: address.receiver,
            recvPhone: address.phone,
            recvAddress: address.address,
            status: 0 // 待支付
          }
          
          return createOrder(orderData)
        })
        
        await Promise.all(orderPromises)
        
        this.$message.success('订单提交成功')
        this.$emit('order-success')
        this.handleClose()
        
        // Redirect to order page
        setTimeout(() => {
          this.$router.push('/order')
        }, 1000)
      } catch (error) {
        console.error('Submit order failed:', error)
        this.$message.error('订单提交失败，请重试')
      } finally {
        this.submitting = false
      }
    },
    
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.checkout-dialog >>> .el-dialog__body {
  padding: 20px 30px;
  max-height: 70vh;
  overflow-y: auto;
}

.checkout-content {
  width: 100%;
}

.checkout-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.checkout-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  font-size: 18px;
  color: #409eff;
}

/* Order Items */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.item-total {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
  flex-shrink: 0;
}

/* Order Summary */
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.summary-row.total {
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-price {
  font-size: 20px;
  color: #f56c6c;
}

/* Dialog Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .checkout-dialog >>> .el-dialog {
    width: 95% !important;
  }
  
  .checkout-dialog >>> .el-dialog__body {
    padding: 16px 20px;
  }
  
  .order-item {
    flex-wrap: wrap;
  }
  
  .item-image {
    width: 50px;
    height: 50px;
  }
  
  .item-name {
    font-size: 13px;
  }
  
  .item-price {
    font-size: 12px;
  }
  
  .item-total {
    font-size: 14px;
    width: 100%;
    text-align: right;
  }
}
</style>
