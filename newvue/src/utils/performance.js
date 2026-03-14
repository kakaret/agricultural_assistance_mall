/**
 * Performance monitoring utilities
 */

/**
 * Measure execution time of an async function
 * @param {string} label - Label for the measurement
 * @param {Function} fn - Async function to measure
 * @returns {Promise} Result of the function
 */
export async function measureTime(label, fn) {
    const startTime = performance.now()

    try {
        const result = await fn()
        const endTime = performance.now()
        const duration = endTime - startTime

        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)

        return result
    } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime

        console.error(`❌ ${label} failed after ${duration.toFixed(2)}ms:`, error)

        throw error
    }
}

/**
 * Create a performance marker
 * @param {string} name - Marker name
 */
export function mark(name) {
    if (performance.mark) {
        performance.mark(name)
    }
}

/**
 * Measure between two markers
 * @param {string} name - Measurement name
 * @param {string} startMark - Start marker name
 * @param {string} endMark - End marker name
 */
export function measure(name, startMark, endMark) {
    if (performance.measure) {
        try {
            performance.measure(name, startMark, endMark)
            const measures = performance.getEntriesByName(name)
            if (measures.length > 0) {
                const duration = measures[measures.length - 1].duration
                console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
            }
        } catch (error) {
            console.warn('Performance measurement failed:', error)
        }
    }
}

/**
 * Log API request timing
 * @param {string} url - API URL
 * @param {number} duration - Duration in ms
 */
export function logApiTiming(url, duration) {
    const emoji = duration < 100 ? '🚀' : duration < 500 ? '⚡' : '🐌'
    console.log(`${emoji} API ${url}: ${duration.toFixed(2)}ms`)
}
