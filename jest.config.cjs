module.exports = {
  testEnvironment: 'node',
  clearMocks: true,

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transform: {
    '^.+\\.[t|j]s$': 'babel-jest',
  },
  moduleNameMapper: {
    '@models/(.*)$': '<rootDir>/src/infrastructure/database/sequelize/models/$1',
    '@database$': '<rootDir>/src/infrastructure/database/sequelize/models/index.js',
    '@/(.*)$': '<rootDir>/src/$1',
  },
};