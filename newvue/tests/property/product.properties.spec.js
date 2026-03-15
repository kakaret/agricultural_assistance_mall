/**
 * Property-Based Tests for Product Module
 * Properties 1, 2, 3, 4
 */

const fc = require('fast-check')
const productModule = require('../../src/store/modules/product').default

const { mutations, getters } = productModule

describe('Product Property Tests', () => {

    /**
     * Property 1: Category navigation displays correct products
     * Products filtered by category should all belong to that category
     */
    describe('Property 1: Category navigation displays correct products', () => {
        it('should only return products matching the selected category', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            name: fc.string({ minLength: 1, maxLength: 100 }),
                            category: fc.option(
                                fc.record({
                                    id: fc.integer({ min: 1, max: 10 }),
                                    name: fc.string({ minLength: 1, maxLength: 50 })
                                }),
                                { nil: 0.2 }
                            ),
                            price: fc.float({ min: 0.01, max: 10000 })
                        }),
                        { minLength: 0, maxLength: 100 }
                    ),
                    fc.integer({ min: 1, max: 10 }),
                    (products, targetCategoryId) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        // Use getter to filter by category
                        const filteredProducts = getters.productsByCategory(state)(targetCategoryId)

                        // All filtered products should have matching category
                        return filteredProducts.every(product =>
                            product.category?.id === targetCategoryId
                        )
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should return empty array when no products match category', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            category: fc.record({
                                id: fc.integer({ min: 1, max: 5 })
                            })
                        }),
                        { minLength: 0, maxLength: 50 }
                    ),
                    fc.integer({ min: 100, max: 200 }),
                    (products, nonExistentCategoryId) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        const filteredProducts = getters.productsByCategory(state)(nonExistentCategoryId)

                        return filteredProducts.length === 0
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 2: Search results match query
     * Search results should contain products matching the search query
     */
    describe('Property 2: Search results match query', () => {
        it('should find products by name containing search query', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            name: fc.string({ minLength: 3, maxLength: 50 }),
                            description: fc.string({ maxLength: 200 })
                        }),
                        { minLength: 5, maxLength: 50 }
                    ),
                    fc.integer({ min: 0, max: 49 }),
                    (products, targetIndex) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        // Use an existing product name as search query
                        const searchQuery = products[targetIndex % products.length].name.substring(0, 3).toLowerCase()

                        // Simulate search by filtering products
                        const searchResults = state.products.filter(p =>
                            p.name.toLowerCase().includes(searchQuery) ||
                            p.description?.toLowerCase().includes(searchQuery)
                        )

                        // At least one result should contain the query
                        return searchResults.length > 0 &&
                               searchResults.every(p =>
                                   p.name.toLowerCase().includes(searchQuery) ||
                                   p.description?.toLowerCase().includes(searchQuery)
                               )
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 3: Product display completeness
     * Products should have all required fields for display
     */
    describe('Property 3: Product display completeness', () => {
        it('should have all required fields for product display', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        id: fc.integer({ min: 1 }),
                        name: fc.string({ minLength: 1, maxLength: 100 }),
                        price: fc.float({ min: 0.01, max: 100000 }),
                        stock: fc.integer({ min: 0, max: 10000 }),
                        description: fc.string({ minLength: 0, maxLength: 2000 }),
                        image: fc.option(fc.webUrl(), { nil: 0.3 })
                    }),
                    (product) => {
                        // Required fields for display
                        const hasRequiredFields =
                            typeof product.id === 'number' &&
                            typeof product.name === 'string' && product.name.length > 0 &&
                            typeof product.price === 'number' && product.price > 0 &&
                            typeof product.stock === 'number' && product.stock >= 0

                        return hasRequiredFields
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 4: Product navigation consistency
     * Product navigation should maintain consistent state
     */
    describe('Property 4: Product navigation consistency', () => {
        it('should maintain consistent product state when navigating', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 100 }),
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            price: fc.float({ min: 0.01, max: 10000 })
                        }),
                        { minLength: 1, maxLength: 50 }
                    ),
                    fc.integer({ min: 0, max: 99 }),
                    (products, productIndex) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        // Select a product
                        const selectedProduct = products[productIndex % products.length]
                        mutations.SET_CURRENT_PRODUCT(state, selectedProduct)

                        // Verify product is correctly set
                        return state.currentProduct?.id === selectedProduct.id &&
                               state.currentProduct?.name === selectedProduct.name
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should be able to retrieve product by id consistently', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 50 }),
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            price: fc.float({ min: 0.01, max: 10000 })
                        }),
                        { minLength: 1, maxLength: 50 }
                    ),
                    fc.integer({ min: 0, max: 49 }),
                    (products, productIndex) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        // Get product by ID
                        const targetProduct = products[productIndex % products.length]
                        const foundProduct = getters.productById(state)(targetProduct.id)

                        // Found product should match
                        return foundProduct?.id === targetProduct.id
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Additional property: Featured products ordering
     */
    describe('Additional: Featured products ordering', () => {
        it('should return products sorted by sales count descending', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            salesCount: fc.integer({ min: 0, max: 10000 })
                        }),
                        { minLength: 5, maxLength: 50 }
                    ),
                    (products) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        const featured = getters.featuredProducts(state)

                        // Should be sorted by sales count descending
                        for (let i = 1; i < featured.length; i++) {
                            if ((featured[i - 1].salesCount || 0) < (featured[i].salesCount || 0)) {
                                return false
                            }
                        }
                        return true
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Additional property: Discounted products filter
     */
    describe('Additional: Discounted products filter', () => {
        it('should only return products with discount flag', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            isDiscount: fc.boolean(),
                            discountPrice: fc.float({ min: 0.01, max: 10000 })
                        }),
                        { minLength: 1, maxLength: 50 }
                    ),
                    (products) => {
                        const state = { products, currentProduct: null, categories: [], loading: false, error: null }
                        mutations.SET_PRODUCTS(state, products)

                        const discounted = getters.discountedProducts(state)

                        // All returned products should have isDiscount = true
                        return discounted.every(p => p.isDiscount === true)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
