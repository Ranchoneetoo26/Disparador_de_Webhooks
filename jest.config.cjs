// jest.config.cjs

module.exports = {
  testEnvironment: 'node',
  clearMocks: true,

  transform: {
    '^.+\\.[tj]s$': 'babel-jest',
  },

  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/infrastructure/database/sequelize/models/$1',
    '^@database$': '<rootDir>/src/infrastructure/database/sequelize/models/index.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};