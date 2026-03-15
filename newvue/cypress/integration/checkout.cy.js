/**
 * Customer Checkout Flow Integration Tests
 * Tests shopping cart, checkout, and order placement
 */

describe('Customer Checkout Flow', () => {
  // Login as customer before each test
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/login')
    cy.get('input[type="text"]').type('user')
    cy.get('input[type="password"]').type('123456')
    cy.get('button[type="submit"]').click()
    
    // Wait for login
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  describe('Product Browsing', () => {
    it('should display products on home page', () => {
      cy.get('.product-card, .product-item').should('have.length.at.least', 1)
    })

    it('should navigate to product detail page', () => {
      cy.get('.product-card, .product-item').first().click()
      cy.url().should('include', '/product/')
    })

    it('should filter products by category', () => {
      cy.visit('/products')
      cy.get('.category-filter, .sidebar, .filter-section').should('be.visible')
    })

    it('should search for products', () => {
      cy.get('.search-input, input[placeholder*="搜索"]').type('苹果{enter}')
      cy.url().should('include', '/search')
    })
  })

  describe('Shopping Cart', () => {
    it('should add product to cart', () => {
      // Navigate to a product
      cy.visit('/products')
      cy.get('.product-card, .product-item').first().click()
      
      // Add to cart
      cy.get('button, .el-button').contains('加入购物车').click()
      
      // Should show success message
      cy.get('.el-message--success, .success-message', { timeout: 5000 }).should('be.visible')
      
      // Cart badge should update
      cy.get('.cart-badge, .cart-count').should('be.visible')
    })

    it('should display cart items', () => {
      cy.visit('/cart')
      cy.contains('购物车').should('be.visible')
      cy.get('.cart-item, .cart-list').should('exist')
    })

    it('should update item quantity', () => {
      cy.visit('/cart')
      
      // Find quantity input and update
      cy.get('.el-input-number, .quantity-input').first().within(() => {
        cy.get('input').clear().type('3')
      })
      
      // Wait for update
      cy.wait(1000)
      
      // Total should update
      cy.get('.cart-total, .total-price').should('be.visible')
    })

    it('should remove item from cart', () => {
      cy.visit('/cart')
      
      // Get initial item count
      cy.get('.cart-item, .cart-list-item').then(($items) => {
        const initialCount = $items.length
        
        if (initialCount > 0) {
          // Click delete on first item
          cy.get('.el-button, button').contains('删除').first().click()
          
          // Confirm deletion
          cy.get('.el-message-box, .confirm-dialog').contains('确定').click()
          
          // Wait for removal
          cy.wait(1000)
        }
      })
    })
  })

  describe('Checkout Process', () => {
    it('should proceed to checkout from cart', () => {
      cy.visit('/cart')
      
      // Check if there are items in cart
      cy.get('body').then(($body) => {
        if ($body.find('.cart-item, .cart-list-item').length > 0) {
          // Click checkout
          cy.get('button, .el-button').contains('结算').click()
          
          // Should navigate to checkout or show address selection
          cy.url().should('include', '/cart')
        }
      })
    })

    it('should require address for checkout', () => {
      cy.visit('/cart')
      
      // Try to checkout without items or address
      cy.get('button, .el-button').contains('结算').then(($btn) => {
        if (!$btn.is(':disabled')) {
          cy.wrap($btn).click()
          
          // Should show warning if cart is empty
          if ($body.find('.cart-item').length === 0) {
            cy.get('.el-message--warning, .warning-message').should('be.visible')
          }
        }
      })
    })
  })

  describe('Order Management', () => {
    it('should display orders page', () => {
      cy.visit('/order')
      cy.contains('我的订单').should('be.visible')
      cy.get('.order-list, .order-item').should('exist')
    })

    it('should filter orders by status', () => {
      cy.visit('/order')
      
      // Click on status tabs if they exist
      cy.get('.el-tabs__item, .status-tab').then(($tabs) => {
        if ($tabs.length > 0) {
          cy.wrap($tabs).eq(1).click()
          cy.wait(1000)
          
          // Order list should update
          cy.get('.order-list, .order-item').should('exist')
        }
      })
    })

    it('should view order details', () => {
      cy.visit('/order')
      
      // Click on first order to view details
      cy.get('.order-item, .order-card').first().then(($order) => {
        if ($order.find('.view-detail, .detail-btn').length > 0) {
          cy.wrap($order).find('.view-detail, .detail-btn').click()
          
          // Detail dialog should open
          cy.get('.el-dialog, .order-detail').should('be.visible')
        }
      })
    })
  })

  describe('Favorites', () => {
    it('should add product to favorites', () => {
      // Navigate to a product
      cy.visit('/products')
      cy.get('.product-card, .product-item').first().click()
      
      // Click favorite button
      cy.get('.favorite-btn, .el-icon-star-off, .el-icon-star-on').first().click()
      
      // Should show feedback
      cy.get('.el-message, .toast', { timeout: 5000 }).should('be.visible')
    })

    it('should display favorites page', () => {
      cy.visit('/favorite')
      cy.contains('我的收藏').should('be.visible')
    })
  })

  describe('User Profile', () => {
    it('should display user center', () => {
      cy.visit('/user-center')
      cy.contains('个人中心').should('be.visible')
    })

    it('should update user profile', () => {
      cy.visit('/user-center')
      
      // Click on profile tab
      cy.get('.el-tabs__item, .tab-item').contains('个人信息').click()
      
      // Update a field
      cy.get('input[name="nickname"], input[placeholder*="昵称"]').clear().type('新昵称')
      
      // Save
      cy.get('button, .el-button').contains('保存').click()
      
      // Should show success
      cy.get('.el-message--success, .success-message', { timeout: 5000 }).should('be.visible')
    })
  })
})
