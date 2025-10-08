// jest.config.cjs

module.exports = {
  testEnvironment: 'node',

  // Limpa mocks entre cada teste para garantir isolamento
  clearMocks: true,

  // A configuração de aliases, agora com o caminho para o banco de dados corrigido.
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/src/infrastructure/database/sequelize/models/$1',
    
    // <<< CORREÇÃO APLICADA AQUI
    // O caminho correto para o index.js que exporta a conexão do sequelize.
    '^@database$': '<rootDir>/src/infrastructure/database/sequelize/models/index.js',
    
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};