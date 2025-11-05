/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const path = require('path');
require('dotenv').config({
  path: path.resolve(process.cwd(), '.env.test'),
});

// Importa o CJS (CommonJS)
// Usamos 'require' aqui porque este arquivo é CJS
const db = require('./src/infrastructure/database/sequelize/models/index.cjs');

// Variável para guardar a instância do Redis
let redisCacheRepositoryInstance;

// Bloco beforeAll para rodar as migrations de teste
beforeAll(async () => {
  try {
    console.log('[Jest Setup] Sincronizando banco de dados de teste (force: true)...');
    // Sobe o banco de dados de teste (limpa e recria)
    await db.sequelize.sync({ force: true });
    console.log('[Jest Setup] Banco de dados sincronizado.');
  } catch (err) {
    console.error('[Jest Setup] Erro na sincronização do DB:', err);
    process.exit(1);
  }

  // Importa dinamicamente o RedisCacheRepository (que é ESM)
  try {
    const RedisCacheRepoModule = await import(
      './src/infrastructure/cache/redis/RedisCacheRepository.js'
    );
    redisCacheRepositoryInstance = new RedisCacheRepoModule.default();
    console.log('[Jest Setup] Instância do RedisCacheRepository criada.');
  } catch (err) {
    console.error(
      '[Jest Setup] Erro ao importar RedisCacheRepository:',
      err.message,
    );
  }
});

// Bloco afterAll para fechar conexões
afterAll(async () => {
  try {
    // Fecha a conexão do Sequelize
    if (db && db.sequelize) {
      await db.sequelize.close();
      console.log('[Jest Teardown] Conexão Sequelize fechada.');
    }
  } catch (err) {
    console.error(
      '[Jest Teardown] Erro ao fechar Sequelize:',
      err.message,
    );
  }

  // Fecha a conexão do Redis
  try {
    if (redisCacheRepositoryInstance && redisCacheRepositoryInstance.disconnect) {
      await redisCacheRepositoryInstance.disconnect();
      console.log('[Jest Teardown] Conexão Redis (singleton) desconectada.');
    } else {
      console.warn(
        '[Jest Teardown] Instância do redisCacheRepository não encontrada ou sem método disconnect.',
      );
    }
  } catch (err) {
    console.error(
      '[Jest Teardown] Erro ao desconectar Redis no afterAll:',
      err.message,
    );
  }
});