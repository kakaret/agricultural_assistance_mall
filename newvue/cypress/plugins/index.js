/**
 * Cypress Plugins
 */

module.exports = (on, config) => {
  // Configure browser launch options
  on('before:browser:launch', (browser = {}, launchOptions) => {
    // Enable more verbose logging in Chrome
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--disable-gpu')
      launchOptions.args.push('--disable-dev-shm-usage')
      launchOptions.args.push('--no-sandbox')
    }
    
    return launchOptions
  })

  // Set environment variables
  config.env = {
    ...config.env,
    apiUrl: process.env.VUE_APP_BASE_API || 'http://localhost:8080/api'
  }

  return config
}
