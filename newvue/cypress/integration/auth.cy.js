/**
 * Authentication Flow Integration Tests
 * Tests user login, registration, and logout functionality
 */

describe('Authentication Flow', () => {
  const testUser = {
    username: 'testuser_' + Date.now(),
    password: 'Test123456',
    email: `test_${Date.now()}@example.com`,
    phone: '13800138000'
  }

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.visit('/login')
      cy.get('input[type="text"]').should('exist')
      cy.get('input[type="password"]').should('exist')
      cy.get('button[type="submit"]').should('exist')
      cy.contains('登录').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      cy.get('input[type="text"]').type('invaliduser')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
      
      // Should show error message
      cy.get('.el-message--error, .error-message', { timeout: 5000 }).should('be.visible')
    })

    it('should successfully login with valid credentials', () => {
      // Use the known test account
      cy.visit('/login')
      cy.get('input[type="text"]').type('user')
      cy.get('input[type="password"]').type('123456')
      cy.get('button[type="submit"]').click()
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      
      // Should show user is logged in
      cy.contains('user').should('be.visible')
    })

    it('should redirect to login when accessing protected routes', () => {
      cy.visit('/cart')
      
      // Should redirect to login
      cy.url().should('include', '/login')
      cy.contains('登录').should('be.visible')
    })

    it('should redirect back after login', () => {
      // Try to access cart (protected route)
      cy.visit('/cart')
      
      // Login
      cy.get('input[type="text"]').type('user')
      cy.get('input[type="password"]').type('123456')
      cy.get('button[type="submit"]').click()
      
      // Should redirect to cart
      cy.url().should('include', '/cart')
    })
  })

  describe('Registration Page', () => {
    it('should display registration form', () => {
      cy.visit('/register')
      cy.get('input').should('have.length.at.least', 4)
      cy.contains('注册').should('be.visible')
    })

    it('should validate required fields', () => {
      cy.visit('/register')
      cy.get('button[type="submit"]').click()
      
      // Should show validation errors
      cy.get('.el-form-item__error, .error-message', { timeout: 5000 }).should('be.visible')
    })

    it('should validate password confirmation', () => {
      cy.visit('/register')
      cy.get('input[name="username"], input[placeholder*="用户名"]').type(testUser.username)
      cy.get('input[name="password"], input[placeholder*="密码"]').first().type(testUser.password)
      cy.get('input[name="confirmPassword"], input[placeholder*="确认密码"]').type('differentpassword')
      
      // Submit should fail
      cy.get('button[type="submit"]').click()
      cy.contains('密码不一致', { timeout: 5000 }).should('be.visible')
    })

    it('should navigate to login from register page', () => {
      cy.visit('/register')
      cy.contains('登录').click()
      cy.url().should('include', '/login')
    })
  })

  describe('Logout', () => {
    it('should successfully logout', () => {
      // Login first
      cy.visit('/login')
      cy.get('input[type="text"]').type('user')
      cy.get('input[type="password"]').type('123456')
      cy.get('button[type="submit"]').click()
      
      // Wait for login to complete
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      
      // Logout
      cy.get('.user-dropdown, .el-dropdown').first().click()
      cy.contains('退出登录').click()
      
      // Should redirect to home and show login button
      cy.contains('登录').should('be.visible')
    })
  })

  describe('Admin Login', () => {
    it('should redirect admin to dashboard', () => {
      cy.visit('/login')
      cy.get('input[type="text"]').type('Sadmin')
      cy.get('input[type="password"]').type('123456')
      cy.get('button[type="submit"]').click()
      
      // Should redirect to admin dashboard
      cy.url().should('include', '/admin')
      cy.contains('数据统计').should('be.visible')
    })

    it('should block non-admin from admin routes', () => {
      // Login as regular user
      cy.visit('/login')
      cy.get('input[type="text"]').type('user')
      cy.get('input[type="password"]').type('123456')
      cy.get('button[type="submit"]').click()
      
      // Try to access admin route
      cy.visit('/admin')
      
      // Should be redirected
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })
})
