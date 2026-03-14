// Lazy loading directive for images
const lazyload = {
    inserted: (el, binding) => {
        // Handle both img elements and elements with img children
        const imageElement = el.nodeName === 'IMG' ? el : el.querySelector('img')

        if (!imageElement) {
            console.warn('Lazy load directive: No img element found')
            return
        }

        const loadImage = () => {
            imageElement.addEventListener('load', () => {
                setTimeout(() => {
                    imageElement.classList.add('lazy-loaded')
                    el.classList.add('loaded')
                }, 100)
            })

            imageElement.addEventListener('error', () => {
                imageElement.classList.add('lazy-error')
                el.classList.add('error')
                console.error('Failed to load image:', binding.value)
            })

            imageElement.src = binding.value
        }

        const createObserver = () => {
            const options = {
                root: null,
                threshold: 0,
                rootMargin: '50px' // Start loading 50px before entering viewport
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadImage()
                        observer.unobserve(el)
                    }
                })
            }, options)

            observer.observe(el)
        }

        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            createObserver()
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            loadImage()
        }
    }
}

export default lazyload
