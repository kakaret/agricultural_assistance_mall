# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Initialize Vue 2.x project in newvue folder
  - Install core dependencies: vue-router, vuex, element-ui, axios, dompurify
  - Install dev dependencies: @vue/test-utils, jest, fast-check, cypress
  - Configure vue.config.js for API proxy
  - Set up ESLint and code formatting rules
  - _Requirements: 18.1, 18.4, 18.5_

- [ ] 2. Create core utilities and configuration
- [x] 2.1 Implement Axios request interceptor
  - Create src/utils/request.js with Axios instance
  - Configure base URL and timeout
  - Implement request interceptor to add authentication token
  - Implement response interceptor for error handling (401, 403, 404, 500)
  - Add error message display logic
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ]* 2.2 Write property test for API request authentication
  - **Property 16: API request authentication**
  - **Validates: Requirements 16.2**

- [x] 2.3 Create authentication helper utilities
  - Create src/utils/auth.js with token management functions
  - Implement getToken, setToken, removeToken functions
  - Implement getUserInfo, setUserInfo, removeUserInfo functions
  - _Requirements: 8.3, 8.5_

- [x] 2.4 Create form validation utilities
  - Create src/utils/validators.js with common validation rules
  - Implement email, phone, username validators
  - Implement required field and length validators
  - _Requirements: 8.2_

- [ ] 3. Set up Vuex store structure
- [x] 3.1 Create user store module
  - Create src/store/modules/user.js
  - Implement state: userInfo, token, isLoggedIn, role
  - Implement mutations: SET_USER_INFO, SET_TOKEN, CLEAR_USER_INFO
  - Implement actions: login, logout, refreshUserInfo
  - Implement getters: isAdmin, isCustomer, userId
  - _Requirements: 8.3, 8.4, 8.5_

- [ ]* 3.2 Write property test for logout data cleanup
  - **Property 15: Logout data cleanup**
  - **Validates: Requirements 8.5**

- [x] 3.3 Create cart store module
  - Create src/store/modules/cart.js
  - Implement state: items, totalCount, totalPrice
  - Implement mutations: SET_CART_ITEMS, ADD_ITEM, UPDATE_ITEM_QUANTITY, REMOVE_ITEM, CLEAR_CART
  - Implement actions: fetchCart, addToCart, updateQuantity, removeFromCart
  - Implement getters: cartItemCount, cartTotalPrice
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.4 Write property test for cart count accuracy
  - **Property 5: Cart count accuracy**
  - **Validates: Requirements 2.1**

- [ ]* 3.5 Write property test for cart total calculation
  - **Property 6: Cart total calculation**
  - **Validates: Requirements 2.2, 2.3**

- [x] 3.6 Create product store module
  - Create src/store/modules/product.js
  - Implement state: products, currentProduct, categories, loading
  - Implement mutations: SET_PRODUCTS, SET_CURRENT_PRODUCT, SET_CATEGORIES, SET_LOADING
  - Implement actions: fetchProducts, fetchProductDetail, fetchCategories
  - Implement getters: productById, productsByCategory
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3.7 Configure root Vuex store
  - Create src/store/index.js
  - Import and register all store modules
  - Configure Vuex devtools
  - _Requirements: 18.2_

- [ ] 4. Create API service modules
- [x] 4.1 Create product API service
  - Create src/api/product.js
  - Implement getProducts(params) for paginated product list
  - Implement getProduct(id) for single product detail
  - Implement createProduct(data) for admin
  - Implement updateProduct(id, data) for admin
  - Implement deleteProduct(id) for admin
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2, 9.3, 9.4_

- [x] 4.2 Create cart API service
  - Create src/api/cart.js
  - Implement getCart(userId) to fetch user's cart
  - Implement addToCart(data) to add item
  - Implement updateCartItem(id, data) to update quantity
  - Implement removeCartItem(id) to remove item
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4.3 Create order API service
  - Create src/api/order.js
  - Implement getOrders(userId) to fetch user orders
  - Implement getOrder(id) for order details
  - Implement createOrder(data) to place order
  - Implement updateOrderStatus(id, status) for admin
  - _Requirements: 4.1, 4.2, 4.3, 11.1, 11.2, 11.3_

- [x] 4.4 Create user API service
  - Create src/api/user.js
  - Implement register(data) for registration
  - Implement login(credentials) for authentication
  - Implement logout() to end session
  - Implement getUserInfo(id) to get user details
  - Implement updateUser(id, data) for profile updates
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 4.5 Create additional API services
  - Create src/api/favorite.js for favorite operations
  - Create src/api/address.js for address management
  - Create src/api/review.js for product reviews
  - Create src/api/article.js for articles
  - Create src/api/category.js for categories
  - Create src/api/carousel.js for homepage carousels
  - _Requirements: 3.1, 3.2, 5.1, 5.2, 6.1, 7.1, 10.1, 12.1_


- [ ] 5. Configure Vue Router
- [x] 5.1 Create router configuration
  - Create src/router/index.js
  - Define customer routes: /, /products, /product/:id, /cart, /order, /favorite, /user-center, /articles, /article/:id, /search
  - Define auth routes: /login, /register, /forget
  - Define admin routes with lazy loading
  - Configure history mode
  - _Requirements: 1.1, 1.5, 2.2, 3.2, 4.3, 6.1, 7.1, 8.1, 18.3_

- [x] 5.2 Implement route guards
  - Create beforeEach navigation guard
  - Implement authentication check for protected routes
  - Implement redirect to login for unauthenticated users
  - Implement role-based access control
  - _Requirements: 8.4, 18.3_

- [ ]* 5.3 Write property test for route guard protection
  - **Property 22: Route guard protection**
  - **Validates: Requirements 18.3**

- [ ] 6. Create shared components
- [x] 6.1 Create Header component
  - Create src/components/common/Header.vue
  - Implement logo and navigation menu
  - Implement search input with enter key handler
  - Implement cart icon with count badge
  - Implement user dropdown menu (login/logout, profile, favorites)
  - Add responsive design for mobile
  - _Requirements: 1.1, 1.3, 2.1, 8.4, 8.5_

- [x] 6.2 Create Footer component
  - Create src/components/common/Footer.vue
  - Implement footer links and information
  - Add copyright and contact information
  - _Requirements: 1.1_

- [x] 6.3 Create ProductCard component
  - Create src/components/common/ProductCard.vue
  - Display product image, name, price, rating
  - Implement favorite toggle button
  - Implement add to cart button
  - Add hover effects and animations
  - Emit events for cart and favorite actions
  - _Requirements: 1.4, 2.1, 3.1_

- [ ]* 6.4 Write unit tests for ProductCard component
  - Test product information display
  - Test event emissions
  - Test favorite toggle interaction
  - _Requirements: 1.4, 2.1, 3.1_

- [ ]* 6.5 Write property test for product display completeness
  - **Property 3: Product display completeness**
  - **Validates: Requirements 1.4**

- [x] 6.6 Create Pagination component
  - Create src/components/common/Pagination.vue
  - Implement page number display and navigation
  - Implement page size selector
  - Emit page-change events
  - _Requirements: 1.2, 1.3_

- [x] 6.7 Create ImageUploader component
  - Create src/components/common/ImageUploader.vue
  - Implement file selection and preview
  - Implement upload progress display
  - Validate file size and type
  - Emit upload success/error events
  - _Requirements: 9.2, 12.2_

- [x] 6.8 Create Loading component
  - Create src/components/common/Loading.vue
  - Implement spinner animation
  - Support fullscreen and inline modes
  - _Requirements: 17.2_

- [ ] 7. Create customer-specific components
- [x] 7.1 Create CartItem component
  - Create src/components/customer/CartItem.vue
  - Display product info, quantity, and price
  - Implement quantity input with +/- buttons
  - Implement remove button
  - Calculate and display item subtotal
  - Emit update-quantity and remove events
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 7.2 Create AddressSelector component
  - Create src/components/customer/AddressSelector.vue
  - Display list of saved addresses
  - Implement address selection
  - Implement add/edit/delete address actions
  - Show default address indicator
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.3 Create ReviewForm component
  - Create src/components/customer/ReviewForm.vue
  - Implement rating selector (1-5 stars)
  - Implement review text input
  - Implement form validation
  - Emit submit-success event
  - _Requirements: 7.2_

- [x] 7.4 Create Carousel component
  - Create src/components/customer/Carousel.vue
  - Implement image carousel with auto-play
  - Add navigation dots and arrows
  - Support click to navigate to link
  - _Requirements: 1.1_

- [x] 7.5 Create CategoryGrid component
  - Create src/components/customer/CategoryGrid.vue
  - Display categories in grid layout
  - Show category icon and name
  - Implement click to navigate to category page
  - _Requirements: 1.1, 1.2_

- [ ] 8. Create customer views - Authentication
- [x] 8.1 Create Login page
  - Create src/views/customer/Login.vue
  - Implement login form with username and password
  - Add form validation
  - Implement login action with API call
  - Store token and user info on success
  - Redirect to home or previous page
  - Add link to register and forgot password
  - _Requirements: 8.3, 8.4_

- [ ]* 8.2 Write property test for authentication token storage
  - **Property 13: Authentication token storage**
  - **Validates: Requirements 8.3**

- [x] 8.3 Create Register page
  - Create src/views/customer/Register.vue
  - Implement registration form with all required fields
  - Add comprehensive form validation
  - Implement register action with API call
  - Redirect to login on success
  - _Requirements: 8.1, 8.2_

- [ ]* 8.4 Write property test for registration form validation
  - **Property 12: Registration form validation**
  - **Validates: Requirements 8.2**

- [x] 8.5 Create Forgot Password page
  - Create src/views/customer/Forget.vue
  - Implement email input form
  - Add email validation
  - Implement password reset request
  - Display success message
  - _Requirements: 8.6_


- [ ] 9. Create customer views - Product browsing
- [x] 9.1 Create Home page
  - Create src/views/customer/Home.vue
  - Implement carousel section
  - Implement category grid section
  - Implement recommended products section
  - Implement new products section
  - Fetch data from API on mount
  - Add loading states
  - _Requirements: 1.1_

- [x] 9.2 Create Products page
  - Create src/views/customer/Products.vue
  - Implement product grid with ProductCard components
  - Add category filter sidebar
  - Add price range filter
  - Add sort options (price, sales, new)
  - Implement pagination
  - Fetch products from API with filters
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 9.3 Write property test for category navigation
  - **Property 1: Category navigation displays correct products**
  - **Validates: Requirements 1.2**

- [ ]* 9.4 Write property test for search results
  - **Property 2: Search results match query**
  - **Validates: Requirements 1.3**

- [x] 9.5 Create ProductDetail page
  - Create src/views/customer/ProductDetail.vue
  - Display product images with preview
  - Display product information (name, price, description, stock)
  - Implement quantity selector
  - Implement add to cart button
  - Implement buy now button
  - Display product reviews section
  - Add breadcrumb navigation
  - _Requirements: 1.5, 2.1, 7.1_

- [ ]* 9.6 Write property test for product navigation
  - **Property 4: Product navigation consistency**
  - **Validates: Requirements 1.5**

- [x] 9.7 Create Search page
  - Create src/views/customer/Search.vue
  - Display search results in grid
  - Show search query and result count
  - Implement filters and sorting
  - Handle empty results
  - _Requirements: 1.3_

- [x] 9.8 Create Category page
  - Create src/views/customer/Category.vue
  - Display products for selected category
  - Show category name and description
  - Implement filters and sorting
  - Add pagination
  - _Requirements: 1.2_

- [ ] 10. Create customer views - Shopping
- [x] 10.1 Create Cart page
  - Create src/views/customer/Cart.vue
  - Display cart items using CartItem component
  - Show cart summary with total price
  - Implement select all checkbox
  - Implement batch delete
  - Implement checkout button
  - Handle empty cart state
  - _Requirements: 2.2, 2.3, 2.4_

- [ ]* 10.2 Write property test for cart item removal
  - **Property 7: Cart item removal**
  - **Validates: Requirements 2.4**

- [ ]* 10.3 Write property test for cart state preservation
  - **Property 8: Cart state preservation on error**
  - **Validates: Requirements 2.5**

- [x] 10.4 Create Order page
  - Create src/views/customer/Order.vue
  - Display order list with status tabs
  - Show order cards with product info
  - Implement order status filters
  - Add view details button
  - Implement cancel order action
  - _Requirements: 4.3, 4.5_

- [x] 10.5 Create OrderDetail dialog
  - Create order detail modal component
  - Display complete order information
  - Show logistics tracking if available
  - Display order timeline
  - _Requirements: 4.4_

- [x] 10.6 Create Checkout flow
  - Implement checkout process in Cart page
  - Add address selection step
  - Show order summary
  - Implement order submission
  - Redirect to order page on success
  - _Requirements: 4.1, 4.2_

- [ ] 11. Create customer views - User features
- [x] 11.1 Create Favorites page
  - Create src/views/customer/Favorite.vue
  - Display favorited products in grid
  - Implement remove from favorites
  - Implement add to cart from favorites
  - Handle empty favorites state
  - _Requirements: 3.2, 3.3_

- [ ]* 11.2 Write property test for favorite toggle
  - **Property 9: Favorite toggle consistency**
  - **Validates: Requirements 3.1**

- [ ]* 11.3 Write property test for favorites list
  - **Property 10: Favorites list accuracy**
  - **Validates: Requirements 3.2**

- [x] 11.4 Create UserCenter page
  - Create src/views/customer/UserCenter.vue
  - Implement tabs for profile, orders, addresses, reviews
  - Display user profile information
  - Implement profile edit form
  - Implement address management section
  - Display user's reviews
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1_

- [x] 11.5 Create Articles page
  - Create src/views/customer/Articles.vue
  - Display article list with cover images
  - Show article title, summary, and date
  - Implement pagination
  - Add click to view article detail
  - _Requirements: 6.1, 6.3_

- [x] 11.6 Create ArticleDetail page
  - Create src/views/customer/ArticleDetail.vue
  - Display article title and metadata
  - Render article content with HTML formatting
  - Sanitize HTML content for security
  - Add breadcrumb navigation
  - _Requirements: 6.2, 6.4_

- [ ] 12. Checkpoint - Ensure all customer features work
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 13. Create admin layout and components
- [x] 13.1 Create AdminLayout component
  - Create src/layouts/AdminLayout.vue
  - Implement sidebar navigation
  - Implement top header with user info
  - Implement main content area
  - Add responsive design for mobile
  - _Requirements: 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

- [x] 13.2 Create DataTable component
  - Create src/components/admin/DataTable.vue
  - Implement table with sortable columns
  - Add search and filter functionality
  - Implement action buttons (edit, delete)
  - Add pagination
  - Support custom column rendering
  - _Requirements: 9.1, 10.1, 11.1, 13.1, 14.1_

- [x] 13.3 Create StatisticsCard component
  - Create src/components/admin/StatisticsCard.vue
  - Display metric title and value
  - Show icon and trend indicator
  - Add color coding for different metrics
  - _Requirements: 15.1_

- [ ] 14. Create admin views - Product management
- [x] 14.1 Create ProductManagement page
  - Create src/views/admin/ProductManagement.vue
  - Display products in DataTable
  - Implement search and filters
  - Add create product button
  - Implement edit and delete actions
  - _Requirements: 9.1, 9.3, 9.4, 9.5_

- [x] 14.2 Create ProductForm dialog
  - Create product form modal component
  - Implement all product fields
  - Add image upload functionality
  - Implement form validation
  - Support create and edit modes
  - _Requirements: 9.2, 9.3_

- [x] 14.3 Create CategoryManagement page
  - Create src/views/admin/CategoryManagement.vue
  - Display categories in tree structure
  - Implement add/edit/delete category
  - Show product count per category
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 15. Create admin views - Order management
- [x] 15.1 Create OrderManagement page
  - Create src/views/admin/OrderManagement.vue
  - Display orders in DataTable
  - Implement status filters
  - Add view details action
  - Implement status update functionality
  - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [x] 15.2 Create LogisticsForm dialog
  - Create logistics information form
  - Implement tracking number input
  - Add logistics company selector
  - Implement form submission
  - _Requirements: 11.4_

- [ ] 16. Create admin views - Content management
- [x] 16.1 Create CarouselManagement page
  - Create src/views/admin/CarouselManagement.vue
  - Display carousel items with preview
  - Implement add/edit/delete carousel
  - Add image upload
  - Implement sort order management
  - _Requirements: 12.1, 12.2, 12.4_

- [x] 16.2 Create NoticeManagement page
  - Create src/views/admin/NoticeManagement.vue
  - Display notices in DataTable
  - Implement create/edit/delete notice
  - Add notice type selector
  - _Requirements: 12.3, 12.4_

- [x] 16.3 Create ArticleManagement page
  - Create src/views/admin/ArticleManagement.vue
  - Display articles in DataTable
  - Implement create/edit/delete article
  - Add rich text editor for content
  - Implement cover image upload
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 17. Create admin views - User and system management
- [x] 17.1 Create UserManagement page
  - Create src/views/admin/UserManagement.vue
  - Display users in DataTable
  - Show user role and status
  - Implement status toggle (enable/disable)
  - Implement role assignment
  - Add view user details
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 17.2 Create StockManagement page
  - Create src/views/admin/StockManagement.vue
  - Display current stock levels
  - Implement stock-in form
  - Implement stock-out form
  - Show stock operation history
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 17.3 Create Dashboard page
  - Create src/views/admin/Dashboard.vue
  - Display key metrics using StatisticsCard
  - Implement sales chart using ECharts
  - Show order statistics chart
  - Add user growth chart
  - Implement date range selector
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [-] 18. Implement responsive design and optimization
- [x] 18.1 Add responsive styles
  - Review all components for mobile compatibility
  - Add media queries for different screen sizes
  - Test on mobile devices
  - _Requirements: 17.3_

- [x] 18.2 Implement image lazy loading
  - Add lazy loading directive
  - Apply to product images
  - Apply to article images
  - _Requirements: 17.4_

- [ ]* 18.3 Write property test for image lazy loading
  - **Property 21: Image lazy loading**
  - **Validates: Requirements 17.4**

- [x] 18.3 Optimize performance
  - Implement route-level code splitting
  - Add loading states for async operations
  - Optimize bundle size
  - _Requirements: 17.1, 17.5_

- [ ]* 18.4 Write property test for UI interaction feedback
  - **Property 20: UI interaction feedback**
  - **Validates: Requirements 17.2**

- [ ] 19. Create App.vue and main.js
- [x] 19.1 Create App.vue
  - Create src/App.vue
  - Add router-view
  - Add global styles
  - Implement error boundary
  - _Requirements: 18.1_

- [x] 19.2 Create main.js
  - Create src/main.js
  - Import and configure Vue
  - Import and register Element UI
  - Import router and store
  - Configure global error handler
  - Mount Vue application
  - _Requirements: 18.1, 18.5_

- [x] 19.3 Create public/index.html
  - Create HTML template
  - Add meta tags for SEO
  - Add viewport meta for responsive design
  - _Requirements: 17.3_

- [x] 20. Final testing and integration
- [x]* 20.1 Write remaining property tests
  - Write any remaining property tests not yet implemented
  - Ensure all 22 properties are tested
  - Run all property tests with 100+ iterations

- [x]* 20.2 Write integration tests
  - Write Cypress tests for customer checkout flow
  - Write Cypress tests for admin product management
  - Write Cypress tests for authentication flow

- [x] 20.3 Run full test suite
  - Run all unit tests
  - Run all property tests
  - Run all integration tests
  - Fix any failing tests

- [x] 21. Final Checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are implemented
  - Test on different browsers
  - Test responsive design on mobile devices

