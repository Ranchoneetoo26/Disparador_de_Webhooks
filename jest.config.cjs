module.exports = {
  testEnvironment: 'node',
  clearMocks: true,

  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  transform: {
    '^.+\\.[tj]s$': 'babel-jest',
  },

  modulePaths: ['<rootDir>/src'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],

  moduleNameMapper: {
    '^@database$': '<rootDir>/src/infrastructure/database/sequelize/models/index.cjs',
    '^@database/(.*)$': '<rootDir>/src/infrastructure/database/sequelize/models/$1',

    '^@/(.*)$': '<rootDir>/src/$1'
  },

  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
};
