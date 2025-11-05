// jest.setup.cjs
'use strict';

// Carrega .env de teste (fallback para .env)
try {
  require('dotenv').config({ path: './.env.test' });
} catch (err) {
  try { require('dotenv').config({ path: './.env' }); } catch (e) {}
}

// Tenta carregar o index dos models de forma síncrona.
// Se usar ESM e falhar no require(), registra o erro e continua.
// Os repositórios devem ser tolerantes ao carregamento tardio dos models.
try {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const indexModule = require('./src/infrastructure/database/sequelize/models/index.cjs');
  const db = indexModule && (indexModule.default || indexModule);
  if (db) {
    global.db = db;
    if (db.sequelize) global.sequelize = db.sequelize;
    if (db.models) {
      global.models = db.models;
      Object.keys(db.models).forEach((m) => {
        if (!global[m]) global[m] = db.models[m];
      });
    }
    console.log('[jest.setup.cjs] DB e models carregados no global com sucesso.');
  } else {
    console.warn('[jest.setup.cjs] require(index.cjs) retornou falsy. Prosseguindo sem models globais.');
  }
} catch (err) {
  // Se index.cjs usar ESM imports, require pode falhar; registramos e seguimos.
  console.error('ERRO ao carregar Models no index.cjs (require):', err && err.message ? err.message : err);
  console.warn('[jest.setup.cjs] Prosseguindo mesmo com erro no require; certifique-se que repositórios são tolerantes a models ausentes.');
}

// afterAll: fecha Sequelize e Redis (se existirem). Definido SINTONICAMENTE.
afterAll(async () => {
  try {
    const sequelize = global.sequelize || (global.db && global.db.sequelize);
    if (sequelize && typeof sequelize.close === 'function') {
      console.log('[Jest] Fechando conexão Sequelize...');
      try { await sequelize.close(); } catch (e) { console.warn('[Jest] Erro ao fechar sequelize (ignored):', e && e.message); }
      console.log('[Jest] Conexão Sequelize fechada.');
    }
  } catch (err) {
    console.error('[Jest] Erro ao fechar Sequelize:', err && err.message ? err.message : err);
  }

  try {
    // tenta desconectar o singleton redis (se foi inicializado)
    let redisRepo;
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const r = require('./src/infrastructure/cache/redis/RedisCacheRepository.js');
      redisRepo = r && (r.default || r);
    } catch (e) {
      // ignore - pode não existir ou ser ESM
      redisRepo = null;
    }

    if (redisRepo && typeof redisRepo.disconnect === 'function') {
      console.log('[Jest] Desconectando Redis (singleton) via disconnect()...');
      try { await redisRepo.disconnect(); } catch (e) { console.warn('[Jest] Erro ao disconnect Redis (ignored):', e && e.message); }
      console.log('[Jest] Redis (singleton) desconectado via disconnect().');
    } else if (redisRepo && typeof redisRepo.quit === 'function') {
      console.log('[Jest] Chamando quit() no Redis...');
      try {
        await new Promise((resolve) => redisRepo.quit(() => resolve()));
      } catch (e) { console.warn('[Jest] Erro ao quit() Redis (ignored):', e && e.message); }
      console.log('[Jest] Redis fechado via quit().');
    } else {
      console.log('[Jest] Nenhuma instância de Redis encontrada para desconectar.');
    }
  } catch (err) {
    console.error('[Jest] Erro ao desconectar Redis:', err && err.message ? err.message : err);
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.jest !== 'undefined' && typeof globalThis.jest.useRealTimers === 'function') {
    globalThis.jest.useRealTimers();
  }
  console.log('[Jest] afterAll concluído.');
});
