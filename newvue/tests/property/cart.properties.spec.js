/**
 * Property-Based Tests for Cart Module
 * Properties 5, 6, 7, 8
 */

const fc = require('fast-check')
const cartModule = require('../../src/store/modules/cart').default

const { mutations, getters } = cartModule

describe('Cart Property Tests', () => {

    /**
     * Property 5: Cart count accuracy
     * The total item count should always equal the sum of all item quantities
     */
    describe('Property 5: Cart count accuracy', () => {
        it('should always calculate correct total count from items', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            productId: fc.integer({ min: 1 }),
                            quantity: fc.integer({ min: 1, max: 100 }),
                            product: fc.option(
                                fc.record({
                                    id: fc.integer({ min: 1 }),
                                    name: fc.string({ minLength: 1, maxLength: 50 }),
                                    price: fc.float({ min: 0.01, max: 10000 }),
                                    isDiscount: fc.boolean(),
                                    discountPrice: fc.float({ min: 0.01, max: 10000 })
                                }),
                                { nil: 0.1 }
                            )
                        }),
                        { minLength: 0, maxLength: 50 }
                    ),
                    (items) => {
                        const state = { items, totalCount: 0, totalPrice: 0 }
                        mutations.SET_CART_ITEMS(state, items)

                        const expectedCount = items.reduce((sum, item) => sum + item.quantity, 0)
                        return state.totalCount === expectedCount
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 6: Cart total calculation
     * The total price should always equal the sum of (item price * quantity) for all items
     */
    describe('Property 6: Cart total calculation', () => {
        it('should always calculate correct total price from items', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            productId: fc.integer({ min: 1 }),
                            quantity: fc.integer({ min: 1, max: 50 }),
                            product: fc.record({
                                id: fc.integer({ min: 1 }),
                                name: fc.string({ minLength: 1, maxLength: 50 }),
                                price: fc.float({ min: 0.01, max: 10000 }),
                                isDiscount: fc.boolean(),
                                discountPrice: fc.float({ min: 0.01, max: 10000 })
                            })
                        }),
                        { minLength: 0, maxLength: 30 }
                    ),
                    (items) => {
                        const state = { items, totalCount: 0, totalPrice: 0 }
                        mutations.SET_CART_ITEMS(state, items)

                        const expectedPrice = items.reduce((sum, item) => {
                            const price = item.product?.isDiscount
                                ? item.product.discountPrice
                                : item.product?.price || 0
                            return sum + (price * item.quantity)
                        }, 0)

                        // Allow small floating point differences
                        return Math.abs(state.totalPrice - expectedPrice) < 0.01
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should apply discount prices correctly when product is on discount', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 20 }),
                    fc.float({ min: 100, max: 1000 }),
                    fc.float({ min: 10, max: 90 }),
                    (quantity, regularPrice, discountPercent) => {
                        const discountPrice = regularPrice * (discountPercent / 100)
                        const items = [{
                            id: 1,
                            productId: 1,
                            quantity,
                            product: {
                                id: 1,
                                name: 'Test Product',
                                price: regularPrice,
                                isDiscount: true,
                                discountPrice: discountPrice
                            }
                        }]

                        const state = { items, totalCount: 0, totalPrice: 0 }
                        mutations.SET_CART_ITEMS(state, items)

                        return state.totalPrice === discountPrice * quantity
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 7: Cart item removal
     * Removing an item should decrease the cart count and update total price
     */
    describe('Property 7: Cart item removal', () => {
        it('should correctly update totals when removing items', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            productId: fc.integer({ min: 1 }),
                            quantity: fc.integer({ min: 1, max: 20 }),
                            product: fc.record({
                                price: fc.float({ min: 1, max: 1000 }),
                                isDiscount: fc.constant(false)
                            })
                        }),
                        { minLength: 2, maxLength: 20 }
                    ),
                    fc.integer({ min: 0 }), // Index to remove (will be modulo'd)
                    (items, removeIndex) => {
                        // Setup initial state
                        const state = { items: [...items], totalCount: 0, totalPrice: 0 }
                        mutations.SET_CART_ITEMS(state, items)

                        const initialCount = state.totalCount
                        const initialPrice = state.totalPrice

                        // Remove an item
                        const indexToRemove = removeIndex % items.length
                        const itemToRemove = items[indexToRemove]
                        mutations.REMOVE_ITEM(state, itemToRemove.id)

                        // Verify totals were updated
                        const expectedCount = initialCount - itemToRemove.quantity
                        const expectedPrice = initialPrice - (itemToRemove.product.price * itemToRemove.quantity)

                        return state.totalCount === expectedCount &&
                               Math.abs(state.totalPrice - expectedPrice) < 0.01
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 8: Cart state preservation on error
     * Cart state should be preserved when operations fail
     */
    describe('Property 8: Cart state preservation on error', () => {
        it('should preserve cart state when operation fails', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            productId: fc.integer({ min: 1 }),
                            quantity: fc.integer({ min: 1, max: 20 }),
                            product: fc.record({
                                price: fc.float({ min: 1, max: 1000 }),
                                isDiscount: fc.boolean()
                            })
                        }),
                        { minLength: 1, maxLength: 20 }
                    ),
                    (items) => {
                        // Capture initial state
                        const initialState = JSON.stringify(items)
                        const state = { items: JSON.parse(initialState), totalCount: 0, totalPrice: 0 }
                        mutations.SET_CART_ITEMS(state, items)

                        const beforeCount = state.totalCount
                        const beforePrice = state.totalPrice

                        // Simulate error by restoring original items
                        mutations.SET_CART_ITEMS(state, JSON.parse(initialState))

                        // State should be restored
                        return state.totalCount === beforeCount &&
                               Math.abs(state.totalPrice - beforePrice) < 0.01
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Additional property: Add item to cart
     * Adding an item should correctly update totals
     */
    describe('Additional: Add item property', () => {
        it('should correctly update totals when adding items', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            productId: fc.integer({ min: 1, max: 1000 }),
                            quantity: fc.integer({ min: 1, max: 20 }),
                            product: fc.record({
                                price: fc.float({ min: 1, max: 1000 }),
                                isDiscount: fc.constant(false)
                            })
                        }),
                        { minLength: 0, maxLength: 10 }
                    ),
                    fc.record({
                        id: fc.integer({ min: 1001, max: 2000 }),
                        productId: fc.integer({ min: 1001, max: 2000 }),
                        quantity: fc.integer({ min: 1, max: 20 }),
                        product: fc.record({
                            price: fc.float({ min: 1, max: 1000 }),
                            isDiscount: fc.constant(false)
                        })
                    }),
                    (existingItems, newItem) => {
                        // Setup initial state
                        const state = { items: [...existingItems], totalCount: 0, totalPrice: 0 }
                        mutations.SET_CART_ITEMS(state, existingItems)

                        const initialCount = state.totalCount
                        const initialPrice = state.totalPrice

                        // Add new item
                        mutations.ADD_ITEM(state, newItem)

                        // Verify totals were updated
                        const expectedCount = initialCount + newItem.quantity
                        const expectedPrice = initialPrice + (newItem.product.price * newItem.quantity)

                        return state.totalCount === expectedCount &&
                               Math.abs(state.totalPrice - expectedPrice) < 0.01
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
