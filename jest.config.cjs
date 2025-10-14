// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,

  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  transform: {
    '^.+\\.[tj]s$': 'babel-jest',
  },

  modulePaths: ['<rootDir>/src'],

  // ajuda o resolver do jest a achar módulos dentro do src também
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  moduleNameMapper: {
    '^@database$': '<rootDir>/src/infrastructure/database/sequelize/models/index.cjs',
    '^@database/(.*)$': '<rootDir>/src/infrastructure/database/sequelize/models/$1',

    '^@/(.*)$': '<rootDir>/src/$1'
  },

  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
};
