const path = require('path')

module.exports = {
    devServer: {
        port: 8081,
        proxy: {
            '/api': {
                target: 'http://localhost:1234',
                changeOrigin: true
            },
            '/ws': {
                target: 'http://localhost:1234',
                changeOrigin: true,
                ws: true
            }
        }
    },
    lintOnSave: false,
    productionSourceMap: false,

    // Performance optimization configurations
    configureWebpack: {
        // Enable runtime chunk for long-term caching
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                maxInitialRequests: 6,
                maxAsyncRequests: 8,
                minSize: 20000,
                cacheGroups: {
                    vendor: {
                        name: 'chunk-vendors',
                        test: /[\\/]node_modules[\\/]/,
                        priority: 10,
                        chunks: 'initial'
                    },
                    elementUI: {
                        name: 'chunk-element-ui',
                        priority: 20,
                        test: /[\\/]node_modules[\\/]element-ui[\\/]/
                    },
                    echarts: {
                        name: 'chunk-echarts',
                        priority: 20,
                        test: /[\\/]node_modules[\\/]echarts[\\/]/
                    },
                    commons: {
                        name: 'chunk-commons',
                        minChunks: 2,
                        priority: 5,
                        chunks: 'initial',
                        reuseExistingChunk: true
                    }
                }
            }
        },
        performance: {
            hints: false
        }
    },

    // Chain webpack for advanced configurations
    chainWebpack: config => {
        // Remove default prefetch/preload
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')

        // Optimize images
        config.module
            .rule('images')
            .use('url-loader')
            .tap(options => ({
                ...options,
                limit: 4096
            }))
    },

    // CSS optimization
    css: {
        extract: true,
        sourceMap: false
    }
}
