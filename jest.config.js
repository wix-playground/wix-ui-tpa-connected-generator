const nodeModules = require('./scripts/nodeModules.js')

module.exports = {
  transform: {
    '.(ts)$': 'ts-jest',
  },
  modulePaths: nodeModules.find(__dirname),
  cacheDirectory: '<rootDir>/cache/jest',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/dist/coverage',
  testRegex: '\\.test\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  timers: 'fake',
  verbose: false,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    '**/*.{ts,js}',
    '!**/*.d.{ts,js}',
    '!*.{ts,js}',
    '!**/*.test.{ts,js}',
    '!**/node_modules/**',
    '!**/cache/**',
    '!**/dist/**',
    '!**/scripts/**',
    '!**/lib/common/interfaces.ts',
  ],
}
