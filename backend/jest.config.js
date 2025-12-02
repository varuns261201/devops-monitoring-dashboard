module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js' // Exclude main file from coverage
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true
};
