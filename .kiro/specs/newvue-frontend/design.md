# Design Document

## Overview

This design document outlines the architecture and implementation approach for building a new Vue.js frontend application for an agricultural product sales system. The application will be built in the `newvue` folder and will communicate with the existing Spring Boot backend API.

The system serves two primary user types:
- **Customers**: Browse products, manage cart, place orders, and interact with content
- **Administrators**: Manage products, orders, inventory, users, and system content

The frontend will be built using Vue 2.x with Vue Router for navigation, Vuex for state management, Element UI for components, and Axios for HTTP requests. The architecture emphasizes component reusability, clear separation of concerns, and maintainable code structure.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vue Application                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Presentation Layer                    │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │   Customer   │  │    Admin     │              │  │
│  │  │     Views    │  │    Views     │              │  │
│  │  └──────────────┘  └──────────────┘              │  │
│  │  ┌──────────────────────────────────────────┐    │  │
│  │  │        Shared Components                  │    │  │
│  │  └──────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Application Layer                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Router  │  │   Vuex   │  │  Utils   │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘        │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Data Access Layer                     │  │
│  │  ┌──────────────────────────────────────────┐     │  │
│  │  │         API Service (Axios)               │     │  │
│  │  └──────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot Backend API                     │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
newvue/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/                    # API service modules
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── user.js
│   │   └── ...
│   ├── assets/                 # Static assets
│   │   ├── images/
│   │   ├── styles/
│   │   └── fonts/
│   ├── components/             # Reusable components
│   │   ├── common/            # Shared components
│   │   └── customer/          # Customer-specific components
│   ├── layouts/               # Layout components
│   │   ├── CustomerLayout.vue
│   │   └── AdminLayout.vue
│   ├── router/                # Vue Router configuration
│   │   └── index.js
│   ├── store/                 # Vuex store
│   │   ├── modules/
│   │   │   ├── user.js
│   │   │   ├── cart.js
│   │   │   └── product.js
│   │   └── index.js
│   ├── utils/                 # Utility functions
│   │   ├── request.js        # Axios instance
│   │   ├── auth.js           # Authentication helpers
│   │   └── validators.js     # Form validators
│   ├── views/                 # Page components
│   │   ├── customer/         # Customer pages
│   │   └── admin/            # Admin pages
│   ├── App.vue
│   └── main.js
├── package.json
└── vue.config.js
```

## Components and Interfaces

### Core Components

#### 1. Layout Components

**CustomerLayout.vue**
- Purpose: Main layout for customer-facing pages
- Contains: Header with navigation, main content area, footer
- Props: None
- Emits: None

**AdminLayout.vue**
- Purpose: Main layout for admin pages
- Contains: Sidebar navigation, header, main content area
- Props: None
- Emits: None

#### 2. Shared Components

**Header Component**
- Purpose: Navigation bar with search, cart icon, user menu
- Props: `isLoggedIn`, `cartCount`, `userInfo`
- Emits: `search`, `logout`

**ProductCard Component**
- Purpose: Display product information in grid/list views
- Props: `product` (object with id, name, price, image, etc.)
- Emits: `add-to-cart`, `toggle-favorite`, `click`

**Pagination Component**
- Purpose: Handle paginated data display
- Props: `total`, `pageSize`, `currentPage`
- Emits: `page-change`

**ImageUploader Component**
- Purpose: Handle image uploads for admin
- Props: `maxSize`, `accept`
- Emits: `upload-success`, `upload-error`

#### 3. Customer-Specific Components

**CartItem Component**
- Purpose: Display cart item with quantity controls
- Props: `item` (product, quantity, price)
- Emits: `update-quantity`, `remove`

**AddressSelector Component**
- Purpose: Select or manage delivery addresses
- Props: `addresses`, `selectedId`
- Emits: `select`, `add`, `edit`, `delete`

**ReviewForm Component**
- Purpose: Submit product reviews
- Props: `productId`
- Emits: `submit-success`

#### 4. Admin-Specific Components

**DataTable Component**
- Purpose: Display and manage tabular data
- Props: `columns`, `data`, `loading`
- Emits: `edit`, `delete`, `sort`, `filter`

**StatisticsCard Component**
- Purpose: Display key metrics
- Props: `title`, `value`, `icon`, `trend`
- Emits: None

### API Service Interfaces

All API services will follow a consistent pattern:

```javascript
// Example: product.js
import request from '@/utils/request'

export default {
  // Get paginated products
  getProducts(params) {
    return request.get('/product/page', { params })
  },
  
  // Get single product
  getProduct(id) {
    return request.get(`/product/${id}`)
  },
  
  // Create product (admin)
  createProduct(data) {
    return request.post('/product', data)
  },
  
  // Update product (admin)
  updateProduct(id, data) {
    return request.put(`/product/${id}`, data)
  },
  
  // Delete product (admin)
  deleteProduct(id) {
    return request.delete(`/product/${id}`)
  }
}
```

### Vuex Store Modules

**User Module**
```javascript
state: {
  userInfo: null,
  token: null,
  isLoggedIn: false,
  role: null
}

mutations: {
  SET_USER_INFO,
  SET_TOKEN,
  CLEAR_USER_INFO
}

actions: {
  login,
  logout,
  refreshUserInfo
}

getters: {
  isAdmin,
  isCustomer,
  userId
}
```

**Cart Module**
```javascript
state: {
  items: [],
  totalCount: 0,
  totalPrice: 0
}

mutations: {
  SET_CART_ITEMS,
  ADD_ITEM,
  UPDATE_ITEM_QUANTITY,
  REMOVE_ITEM,
  CLEAR_CART
}

actions: {
  fetchCart,
  addToCart,
  updateQuantity,
  removeFromCart
}

getters: {
  cartItemCount,
  cartTotalPrice
}
```

**Product Module**
```javascript
state: {
  products: [],
  currentProduct: null,
  categories: [],
  loading: false
}

mutations: {
  SET_PRODUCTS,
  SET_CURRENT_PRODUCT,
  SET_CATEGORIES,
  SET_LOADING
}

actions: {
  fetchProducts,
  fetchProductDetail,
  fetchCategories
}

getters: {
  productById,
  productsByCategory
}
```

## Data Models

### Frontend Data Models

These models represent the structure of data used in the frontend application:

**User**
```javascript
{
  id: Number,
  username: String,
  email: String,
  phone: String,
  avatar: String,
  role: String, // 'USER' | 'ADMIN'
  status: Number,
  createdAt: String
}
```

**Product**
```javascript
{
  id: Number,
  name: String,
  description: String,
  price: Number,
  discountPrice: Number,
  isDiscount: Boolean,
  stock: Number,
  salesCount: Number,
  imageUrl: String,
  category: {
    id: Number,
    name: String
  },
  placeOfOrigin: String,
  status: Number,
  isFavorite: Boolean, // Client-side only
  createdAt: String,
  updatedAt: String
}
```

**CartItem**
```javascript
{
  id: Number,
  userId: Number,
  productId: Number,
  product: Product,
  quantity: Number,
  createdAt: String
}
```

**Order**
```javascript
{
  id: Number,
  userId: Number,
  productId: Number,
  product: Product,
  quantity: Number,
  price: Number,
  totalPrice: Number,
  status: String, // 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  recvName: String,
  recvPhone: String,
  recvAddress: String,
  logistics: {
    id: Number,
    trackingNumber: String,
    company: String,
    status: String
  },
  createdAt: String,
  updatedAt: String
}
```

**Address**
```javascript
{
  id: Number,
  userId: Number,
  receiver: String,
  phone: String,
  address: String,
  isDefault: Boolean,
  createdAt: String
}
```

**Review**
```javascript
{
  id: Number,
  userId: Number,
  productId: Number,
  user: {
    id: Number,
    username: String,
    avatar: String
  },
  rating: Number, // 1-5
  content: String,
  status: Number, // 0: pending, 1: approved
  createdAt: String
}
```

**Article**
```javascript
{
  id: Number,
  title: String,
  summary: String,
  content: String, // HTML content
  coverImage: String,
  author: String,
  viewCount: Number,
  status: Number,
  createdAt: String,
  updatedAt: String
}
```

**Category**
```javascript
{
  id: Number,
  name: String,
  description: String,
  icon: String,
  parentId: Number,
  children: Array<Category>,
  createdAt: String
}
```

**CarouselItem**
```javascript
{
  id: Number,
  title: String,
  imageUrl: String,
  linkUrl: String,
  sort: Number,
  status: Number,
  createdAt: String
}
```

**Notice**
```javascript
{
  id: Number,
  title: String,
  content: String,
  type: String, // 'INFO' | 'WARNING' | 'URGENT'
  status: Number,
  createdAt: String
}
```
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Correctness Properties

Property 1: Category navigation displays correct products
*For any* category selected by a customer, the product list should contain only products belonging to that category
**Validates: Requirements 1.2**

Property 2: Search results match query
*For any* search query entered, all displayed products should match the search terms in name or description
**Validates: Requirements 1.3**

Property 3: Product display completeness
*For any* product displayed in a list or grid, it should include image, name, price, and rating information
**Validates: Requirements 1.4**

Property 4: Product navigation consistency
*For any* product clicked, the application should navigate to the correct product detail page with matching product ID
**Validates: Requirements 1.5**

Property 5: Cart count accuracy
*For any* cart state, the cart count indicator should equal the sum of quantities of all items in the cart
**Validates: Requirements 2.1**

Property 6: Cart total calculation
*For any* cart state, the total price should equal the sum of (quantity × price) for all items
**Validates: Requirements 2.2, 2.3**

Property 7: Cart item removal
*For any* item removed from cart, the item should no longer appear in the cart and the total should be recalculated
**Validates: Requirements 2.4**

Property 8: Cart state preservation on error
*For any* failed cart operation, the cart state should remain unchanged from before the operation
**Validates: Requirements 2.5**

Property 9: Favorite toggle consistency
*For any* product, toggling favorite twice should return to the original favorite state
**Validates: Requirements 3.1**

Property 10: Favorites list accuracy
*For any* user's favorites page, all displayed products should have favorite status true for that user
**Validates: Requirements 3.2**

Property 11: Favorite removal completeness
*For any* product removed from favorites, it should no longer appear in the favorites list
**Validates: Requirements 3.3**

Property 12: Registration form validation
*For any* registration input with missing required fields, the form should display validation errors and prevent submission
**Validates: Requirements 8.2**

Property 13: Authentication token storage
*For any* successful login, a valid authentication token should be stored in local storage
**Validates: Requirements 8.3**

Property 14: Authenticated feature access
*For any* authenticated user, protected routes and features should be accessible
**Validates: Requirements 8.4**

Property 15: Logout data cleanup
*For any* logout operation, all session data (token, user info) should be removed from local storage
**Validates: Requirements 8.5**

Property 16: API request authentication
*For any* API request requiring authentication, the request headers should include the authentication token
**Validates: Requirements 16.2**

Property 17: API response parsing
*For any* successful API response, the JSON data should be correctly parsed into JavaScript objects
**Validates: Requirements 16.3**

Property 18: API error messaging
*For any* API error response, a user-friendly error message should be displayed to the user
**Validates: Requirements 16.4**

Property 19: Token expiration handling
*For any* API request with an expired token, the user should be redirected to the login page
**Validates: Requirements 16.5**

Property 20: UI interaction feedback
*For any* user interaction (click, input, submit), visual feedback should be provided within 100ms
**Validates: Requirements 17.2**

Property 21: Image lazy loading
*For any* page with multiple images, images outside the viewport should not be loaded until scrolled into view
**Validates: Requirements 17.4**

Property 22: Route guard protection
*For any* protected route, unauthenticated users should be redirected to the login page
**Validates: Requirements 18.3**

## Error Handling

### Error Handling Strategy

The application will implement a comprehensive error handling strategy across all layers:

#### 1. API Error Handling

**HTTP Status Code Handling:**
- 401 Unauthorized: Clear session, redirect to login
- 403 Forbidden: Display permission denied message
- 404 Not Found: Display resource not found message
- 500 Server Error: Display generic error message, log details
- Network errors: Display connection error message

**Implementation:**
```javascript
// In request.js interceptor
response.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          store.dispatch('user/logout')
          router.push('/login')
          Message.error('登录已过期，请重新登�?)
          break
        case 403:
          Message.error('您没有权限访问该资源')
          break
        case 404:
          Message.error('请求的资源不存在')
          break
        case 500:
          Message.error('服务器错误，请稍后重�?)
          break
        default:
          Message.error('请求失败，请稍后重试')
      }
    } else {
      Message.error('网络连接失败，请检查网络设�?)
    }
    return Promise.reject(error)
  }
)
```

#### 2. Form Validation Errors

**Client-side Validation:**
- Required field validation
- Format validation (email, phone, etc.)
- Length validation
- Custom business rule validation

**Implementation:**
```javascript
// Using Element UI form validation
rules: {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 �?20 个字�?, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}
```

#### 3. Component Error Boundaries

**Vue Error Handler:**
```javascript
// In main.js
Vue.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', vm)
  console.error('Error Info:', info)
  
  // Log to error tracking service
  // logErrorToService(err, vm, info)
  
  // Display user-friendly message
  Message.error('应用程序遇到错误，请刷新页面重试')
}
```

#### 4. Async Operation Error Handling

**Try-Catch Pattern:**
```javascript
async fetchData() {
  this.loading = true
  try {
    const response = await api.getData()
    this.data = response.data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    this.$message.error('获取数据失败')
  } finally {
    this.loading = false
  }
}
```

#### 5. State Management Error Handling

**Vuex Actions:**
```javascript
actions: {
  async fetchProducts({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const response = await productApi.getProducts(params)
      commit('SET_PRODUCTS', response.data)
      return response
    } catch (error) {
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

The application will use both unit testing and property-based testing to ensure comprehensive coverage:

#### Unit Testing

**Framework:** Jest + Vue Test Utils

**Coverage Areas:**
- Component rendering and props
- User interactions (clicks, inputs)
- Computed properties and watchers
- Vuex store mutations and actions
- Utility functions
- API service modules

**Example Unit Tests:**
```javascript
// ProductCard.spec.js
describe('ProductCard Component', () => {
  it('should display product information correctly', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      imageUrl: '/test.jpg'
    }
    const wrapper = mount(ProductCard, {
      propsData: { product }
    })
    expect(wrapper.find('.product-name').text()).toBe('Test Product')
    expect(wrapper.find('.product-price').text()).toContain('99.99')
  })
  
  it('should emit add-to-cart event when button clicked', () => {
    const wrapper = mount(ProductCard, {
      propsData: { product: mockProduct }
    })
    wrapper.find('.add-to-cart-btn').trigger('click')
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
  })
})
```

#### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each property test tagged with corresponding design property number

**Coverage Areas:**
- Cart calculation logic
- Search and filter operations
- Form validation rules
- State transformations
- API request/response handling

**Example Property Tests:**
```javascript
// cart.property.spec.js
import fc from 'fast-check'

describe('Cart Properties', () => {
  /**
   * Feature: newvue-frontend, Property 5: Cart count accuracy
   */
  it('cart count should equal sum of item quantities', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer(),
          quantity: fc.integer(1, 100)
        })),
        (cartItems) => {
          const cart = new Cart(cartItems)
          const expectedCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
          expect(cart.getItemCount()).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: newvue-frontend, Property 6: Cart total calculation
   */
  it('cart total should equal sum of quantity times price', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          id: fc.integer(),
          price: fc.float(0.01, 1000),
          quantity: fc.integer(1, 100)
        })),
        (cartItems) => {
          const cart = new Cart(cartItems)
          const expectedTotal = cartItems.reduce(
            (sum, item) => sum + (item.price * item.quantity), 
            0
          )
          expect(cart.getTotal()).toBeCloseTo(expectedTotal, 2)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: newvue-frontend, Property 9: Favorite toggle consistency
   */
  it('toggling favorite twice should return to original state', () => {
    fc.assert(
      fc.property(
        fc.record({
          productId: fc.integer(),
          initialFavorite: fc.boolean()
        }),
        ({ productId, initialFavorite }) => {
          const favorites = new FavoritesManager()
          favorites.setFavorite(productId, initialFavorite)
          
          favorites.toggleFavorite(productId)
          favorites.toggleFavorite(productId)
          
          expect(favorites.isFavorite(productId)).toBe(initialFavorite)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

#### Integration Testing

**Framework:** Cypress

**Coverage Areas:**
- End-to-end user flows
- Multi-page navigation
- Authentication flows
- Cart and checkout process
- Admin operations

**Example Integration Test:**
```javascript
// checkout-flow.spec.js
describe('Checkout Flow', () => {
  it('should complete full purchase flow', () => {
    cy.visit('/')
    cy.login('testuser', 'password')
    
    // Browse and add product
    cy.get('.product-card').first().click()
    cy.get('.add-to-cart-btn').click()
    
    // Go to cart
    cy.get('.cart-icon').click()
    cy.url().should('include', '/cart')
    
    // Proceed to checkout
    cy.get('.checkout-btn').click()
    cy.get('.address-selector').select('default-address')
    cy.get('.submit-order-btn').click()
    
    // Verify order created
    cy.contains('订单创建成功')
    cy.url().should('include', '/order')
  })
})
```

### Test Organization

```
tests/
├── unit/
�?  ├── components/
�?  �?  ├── ProductCard.spec.js
�?  �?  ├── CartItem.spec.js
�?  �?  └── ...
�?  ├── store/
�?  �?  ├── user.spec.js
�?  �?  ├── cart.spec.js
�?  �?  └── ...
�?  └── utils/
�?      ├── validators.spec.js
�?      └── ...
├── property/
�?  ├── cart.property.spec.js
�?  ├── favorites.property.spec.js
�?  ├── search.property.spec.js
�?  └── ...
└── e2e/
    ├── customer-flow.spec.js
    ├── admin-flow.spec.js
    └── ...
```

### Testing Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Mock API calls and external services
3. **Test User Behavior**: Focus on testing what users see and do, not implementation details
4. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
5. **Arrange-Act-Assert Pattern**: Structure tests with clear setup, execution, and verification phases
6. **Property Test Tagging**: Always tag property tests with the design property number they validate

### Continuous Integration

Tests will be run automatically on:
- Every commit (unit tests)
- Pull requests (unit + property tests)
- Before deployment (full test suite including e2e)

**CI Configuration Example:**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:property
      - run: npm run test:e2e
```
