module.exports = {
    preset: '@vue/cli-plugin-unit-jest',
    testMatch: [
        '**/tests/unit/**/*.spec.js',
        '**/tests/property/**/*.property.spec.js'
    ],
    moduleFileExtensions: ['js', 'json', 'vue'],
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testEnvironment: 'jsdom',
    collectCoverage: false,
    collectCoverageFrom: [
        'src/**/*.{js,vue}',
        '!src/main.js',
        '!**/node_modules/**'
    ]
}
