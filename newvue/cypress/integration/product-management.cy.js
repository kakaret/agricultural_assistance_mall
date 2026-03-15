//**
 * Admin Product Management Integration Tests
 * Tests CRUD operations for products in admin panel
 */

describe('Admin Product Management', () => {
  // Login as admin before each test
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/login')
    cy.get('input[type="text"]').type('Sadmin')
    cy.get('input[type="password"]').type('123456')
    cy.get('button[type="submit"]').click()
    
    // Wait for redirect to admin
    cy.url().should('include', '/admin')
    
    // Navigate to product management
    cy.contains('产品管理').click()
    cy.url().should('include', '/admin/products')
  })

  describe('Product List', () => {
    it('should display product list', () => {
      cy.get('.el-table, .data-table').should('be.visible')
      cy.contains('新增产品').should('be.visible')
    })

    it('should search products', () => {
      cy.get('.el-input__inner, input[placeholder*="搜索"]').first().type('苹果')
      cy.get('.el-button, button').contains('搜索').click()
      
      // Wait for results
      cy.wait(1000)
      
      // Table should show results
      cy.get('.el-table__row, .table-row').should('exist')
    })

    it('should filter products by category', () => {
      // Open category filter if exists
      cy.get('.el-select, select').first().click()
      cy.get('.el-select-dropdown__item').first().click()
      
      // Wait for filter to apply
      cy.wait(1000)
      
      // Table should update
      cy.get('.el-table__body, .table-body').should('be.visible')
    })

    it('should navigate through pagination', () => {
      // Check if pagination exists
      cy.get('.el-pagination, .pagination').then(($pagination) => {
        if ($pagination.find('.el-pager__number, .page-number').length > 1) {
          // Click next page
          cy.get('.el-pagination .btn-next, .pagination .next').click()
          cy.wait(1000)
          
          // Table should update
          cy.get('.el-table__body, .table-body').should('be.visible')
        }
      })
    })
  })

  describe('Create Product', () => {
    it('should open create product dialog', () => {
      cy.contains('新增产品').click()
      cy.get('.el-dialog, .modal, .dialog').should('be.visible')
      cy.contains('新增产品').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.contains('新增产品').click()
      cy.get('.el-dialog, .modal').should('be.visible')
      
      // Try to submit without filling required fields
      cy.get('.el-button, button').contains('确定').click()
      
      // Should show validation errors
      cy.get('.el-form-item__error, .error-message', { timeout: 5000 }).should('be.visible')
    })

    it('should create a new product', () => {
      const productName = `测试产品_${Date.now()}`
      
      cy.contains('新增产品').click()
      cy.get('.el-dialog, .modal').should('be.visible')
      
      // Fill in product form
      cy.get('input[name="name"], input[placeholder*="名称"]').type(productName)
      cy.get('input[name="price"], input[placeholder*="价格"]').type('99.99')
      cy.get('input[name="stock"], input[placeholder*="库存"]').type('100')
      cy.get('textarea[name="description"], textarea[placeholder*="描述"]').type('这是一个测试产品')
      
      // Select category if dropdown exists
      cy.get('.el-select, select').then(($select) => {
        if ($select.length > 0) {
          cy.wrap($select).first().click()
          cy.get('.el-select-dropdown__item').first().click()
        }
      })
      
      // Submit
      cy.get('.el-button, button').contains('确定').click()
      
      // Should close dialog and show success message
      cy.get('.el-message--success, .success-message', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Edit Product', () => {
    it('should open edit dialog for existing product', () => {
      // Click edit on first product
      cy.get('.el-button, button').contains('编辑').first().click()
      
      // Edit dialog should open
      cy.get('.el-dialog, .modal').should('be.visible')
      cy.contains('编辑产品').should('be.visible')
    })

    it('should update product information', () => {
      const newPrice = Math.floor(Math.random() * 1000) + 1
      
      // Click edit on first product
      cy.get('.el-button, button').contains('编辑').first().click()
      cy.get('.el-dialog, .modal').should('be.visible')
      
      // Update price
      cy.get('input[name="price"], input[placeholder*="价格"]').clear().type(newPrice.toString())
      
      // Save
      cy.get('.el-button, button').contains('确定').click()
      
      // Should show success message
      cy.get('.el-message--success, .success-message', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Delete Product', () => {
    it('should show confirmation before deleting', () => {
      // Click delete on first product
      cy.get('.el-button, button').contains('删除').first().click()
      
      // Confirmation dialog should appear
      cy.get('.el-message-box, .confirm-dialog', { timeout: 5000 }).should('be.visible')
      cy.contains('确认').should('be.visible')
    })

    it('should cancel deletion when user cancels', () => {
      // Click delete on first product
      cy.get('.el-button, button').contains('删除').first().click()
      
      // Click cancel
      cy.get('.el-message-box, .confirm-dialog').contains('取消').click()
      
      // Dialog should close
      cy.get('.el-message-box, .confirm-dialog').should('not.exist')
    })
  })

  describe('Category Management', () => {
    it('should navigate to category management', () => {
      cy.contains('分类管理').click()
      cy.url().should('include', '/admin/categories')
      cy.contains('分类管理').should('be.visible')
    })

    it('should display category tree', () => {
      cy.contains('分类管理').click()
      cy.get('.el-tree, .category-tree, .tree').should('be.visible')
    })
  })
})
