module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  verbose: true,

  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },

  moduleFileExtensions: ['js', 'cjs', 'json', 'node'],

  moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@database$': '<rootDir>/src/infrastructure/database',
  '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  '^@domain/(.*)$': '<rootDir>/src/domain/$1',
  '^@application/(.*)$': '<rootDir>/src/application/$1',
  '^@services/(.*)$': '<rootDir>/src/services/$1',
  '^@tests/(.*)$': '<rootDir>/tests/$1'
},

  moduleDirectories: ['node_modules', 'src'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  testEnvironmentOptions: {
  customExportConditions: ['node', 'node-addons']
},

  transformIgnorePatterns: ['/node_modules/'],

  clearMocks: true
};