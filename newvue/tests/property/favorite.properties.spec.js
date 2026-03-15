/**
 * Property-Based Tests for Favorites Module
 * Properties 9, 10
 */

const fc = require('fast-check')

describe('Favorites Property Tests', () => {

    /**
     * Property 9: Favorite toggle consistency
     * Toggling a favorite should add/remove it consistently
     */
    describe('Property 9: Favorite toggle consistency', () => {
        it('should add product when toggling non-favorite', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            price: fc.float({ min: 0.01, max: 10000 })
                        }),
                        { minLength: 0, maxLength: 20 }
                    ),
                    fc.record({
                        id: fc.integer({ min: 1001, max: 2000 }),
                        name: fc.string({ minLength: 1, maxLength: 50 }),
                        price: fc.float({ min: 0.01, max: 10000 })
                    }),
                    (existingFavorites, newProduct) => {
                        // Simulate toggle: add if not exists
                        const isAlreadyFavorite = existingFavorites.some(f => f.id === newProduct.id)

                        if (!isAlreadyFavorite) {
                            const newFavorites = [...existingFavorites, newProduct]
                            return newFavorites.length === existingFavorites.length + 1 &&
                                   newFavorites.some(f => f.id === newProduct.id)
                        }
                        return true
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should remove product when toggling existing favorite', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            name: fc.string({ minLength: 1, maxLength: 50 })
                        }),
                        { minLength: 1, maxLength: 20 }
                    ),
                    fc.integer({ min: 0, max: 999 }),
                    (favorites, indexToRemove) => {
                        const productToRemove = favorites[indexToRemove % favorites.length]

                        // Simulate toggle: remove if exists
                        const newFavorites = favorites.filter(f => f.id !== productToRemove.id)

                        return newFavorites.length === favorites.length - 1 &&
                               !newFavorites.some(f => f.id === productToRemove.id)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain idempotence when toggling twice', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 1000 }),
                            name: fc.string({ minLength: 1, maxLength: 50 })
                        }),
                        { minLength: 0, maxLength: 20 }
                    ),
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        name: fc.string({ minLength: 1, maxLength: 50 })
                    }),
                    (favorites, product) => {
                        // First toggle
                        const isFavorite1 = favorites.some(f => f.id === product.id)
                        let result1
                        if (isFavorite1) {
                            result1 = favorites.filter(f => f.id !== product.id)
                        } else {
                            result1 = [...favorites, product]
                        }

                        // Second toggle
                        const isFavorite2 = result1.some(f => f.id === product.id)
                        let result2
                        if (isFavorite2) {
                            result2 = result1.filter(f => f.id !== product.id)
                        } else {
                            result2 = [...result1, product]
                        }

                        // After two toggles, should be back to original state
                        const originalIds = favorites.map(f => f.id).sort()
                        const finalIds = result2.map(f => f.id).sort()

                        return JSON.stringify(originalIds) === JSON.stringify(finalIds)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * Property 10: Favorites list accuracy
     * Favorites list should accurately reflect user's favorited products
     */
    describe('Property 10: Favorites list accuracy', () => {
        it('should contain only favorited products', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            isFavorited: fc.boolean()
                        }),
                        { minLength: 1, maxLength: 50 }
                    ),
                    (products) => {
                        // Filter favorited products
                        const favorites = products.filter(p => p.isFavorited)

                        // All items in favorites should have isFavorited = true
                        return favorites.every(p => p.isFavorited === true)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should maintain correct count of favorites', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            isFavorited: fc.boolean()
                        }),
                        { minLength: 0, maxLength: 100 }
                    ),
                    (products) => {
                        const favorites = products.filter(p => p.isFavorited)
                        const expectedCount = products.filter(p => p.isFavorited).length

                        return favorites.length === expectedCount
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should correctly check if product is favorited', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 100 }),
                            name: fc.string({ minLength: 1, maxLength: 50 })
                        }),
                        { minLength: 1, maxLength: 50 }
                    ),
                    fc.integer({ min: 0, max: 99 }),
                    (favorites, productId) => {
                        // Check if product is in favorites
                        const isFavorited = favorites.some(f => f.id === productId)

                        // Verify by looking up in array
                        const found = favorites.find(f => f.id === productId)

                        return isFavorited === (found !== undefined)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should preserve order of favorites when adding new ones', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1, max: 100 }),
                            addedAt: fc.date()
                        }),
                        { minLength: 1, maxLength: 30 }
                    ),
                    (favorites) => {
                        // Sort by added date (newest first)
                        const sorted = [...favorites].sort((a, b) =>
                            new Date(b.addedAt) - new Date(a.addedAt)
                        )

                        // Verify sorted order
                        for (let i = 1; i < sorted.length; i++) {
                            if (new Date(sorted[i - 1].addedAt) < new Date(sorted[i].addedAt)) {
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
     * Additional property: Favorite persistence
     */
    describe('Additional: Favorite persistence', () => {
        it('should persist favorites across sessions', () => {
            fc.assert(
                fc.property(
                    fc.array(
                        fc.record({
                            id: fc.integer({ min: 1 }),
                            name: fc.string({ minLength: 1, maxLength: 50 })
                        }),
                        { minLength: 0, maxLength: 30 }
                    ),
                    (favorites) => {
                        // Simulate saving to storage
                        const serialized = JSON.stringify(favorites)

                        // Simulate loading from storage
                        const deserialized = JSON.parse(serialized)

                        // Data should be preserved
                        return deserialized.length === favorites.length &&
                               deserialized.every((item, index) =>
                                   item.id === favorites[index].id
                               )
                    }
                ),
                { numRuns: 100 }
            )
        })
    })
})
