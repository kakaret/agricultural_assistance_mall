module.exports = {
    devServer: {
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://localhost:1234',
                changeOrigin: true
            }
        }
    },
    lintOnSave: false,
    productionSourceMap: false
}
