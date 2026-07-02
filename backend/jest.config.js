const path = require('path');

module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', path.resolve(__dirname, '../node_modules')],
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
