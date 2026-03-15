/**
 * Cypress Support File
 * Global configurations and custom commands
 */

// Custom command to login
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')
  cy.get('input[type="text"]').type(username)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  
  // Wait for login to complete
  cy.url().should('not.include', '/login')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('.user-dropdown, .el-dropdown').first().click()
  cy.contains('退出登录').click()
})

// Custom command to wait for loading
Cypress.Commands.add('waitForLoading', () => {
  cy.get('.el-loading-mask, .loading-spinner', { timeout: 10000 }).should('not.exist')
})

// Custom command to clear cart
Cypress.Commands.add('clearCart', () => {
  cy.visit('/cart')
  cy.get('body').then(($body) => {
    // Remove all items if any
    while ($body.find('.el-button, button').contains('删除').length > 0) {
      cy.get('.el-button, button').contains('删除').first().click()
      cy.get('.el-message-box, .confirm-dialog').contains('确定').click()
      cy.wait(500)
    }
  })
})

// Before each test
beforeEach(() => {
  // Set viewport
  cy.viewport(1280, 720)
  
  // Intercept API calls for debugging
  cy.intercept('/api/**', (req) => {
    // Log API calls in development
    console.log(`API Call: ${req.method} ${req.url}`)
  })
})

// Ignore specific errors that don't affect tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on certain errors
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  if (err.message.includes('NavigationDuplicated')) {
    return false
  }
  return true
})
