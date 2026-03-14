/**
 * Image utility functions
 */

/**
 * Get full image URL
 * @param {string} imagePath - Image path from backend
 * @returns {string} Full image URL
 */
export function getImageUrl(imagePath) {
    if (!imagePath) {
        return ''
    }

    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }

    // Add /api prefix (will be proxied to backend)
    // If path starts with /, keep it, otherwise add /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`

    return `/api${path}`
}

/**
 * Get default placeholder image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Placeholder text
 * @returns {string} Placeholder image URL
 */
export function getPlaceholderImage(width = 300, height = 300, text = 'Product') {
    return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`
}
