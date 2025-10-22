try {
  require('dotenv').config({ path: './.env' });
} catch (err) { }

// REMOVE a importação do redisCacheRepository daqui

try {
  const dbModule = require('./src/infrastructure/database/sequelize/models/index.cjs'); //
  const db = dbModule.default || dbModule; //

  console.log("--- DEBUG START ---"); //
  console.log("DB Loaded:", !!db); //
  if (db) { //
    console.log("Webhook in DB:", !!db.Webhook); //
    console.log("Webhook Name:", db.Webhook ? db.Webhook.name : 'N/A'); //
    console.log("DB Keys:", Object.keys(db).filter(key => key.length > 3)); //
  }
  console.log("--- DEBUG END ---"); //

  global.db = db; //

  Object.keys(db).forEach(key => { //
    if (db[key] && db[key].name && typeof db[key] === 'function') { //
       // Verifica se é um modelo Sequelize antes de adicionar ao global (opcional, mas mais seguro)
      if (db[key].init && db[key].associate) {
         global[db[key].name] = db[key];
      }
    }
  });

} catch (err) { //
  console.error("ERRO FATAL ao carregar Models no jest.setup.cjs:", err.message); //
}

async function tryCloseServer() { //
  try { //
    // Tenta carregar o app dinamicamente para evitar conflitos de módulo se app.js for ESM
    const appModule = await import('./src/app.js'); // Use import()
    const app = appModule.default || appModule;
    const server = app.server; // Assume que app exporta o server
    if (server && typeof server.close === 'function') { //
      console.log('Fechando servidor...'); // Log opcional
      await new Promise((resolve, reject) => //
        server.close(err => (err ? reject(err) : resolve())) //
      );
      console.log('Servidor fechado.'); // Log opcional
    }
  } catch (err) { //
     // Não imprime erro se o módulo app não existir ou não tiver server, pois pode ser intencional
     // console.error('Info: Erro ao tentar fechar servidor (pode ser normal se não houver servidor):', err.message);
  }
}

async function tryCloseSequelize() { //
  try { //
    // Usa o global.db que já foi carregado via require
    const db = global.db;
    const sequelize = db?.sequelize; //

    if (sequelize && typeof sequelize.close === 'function') { //
      console.log('Fechando conexão Sequelize...'); // Log opcional
      await sequelize.close(); //
      console.log('Conexão Sequelize fechada.'); // Log opcional
    }
  } catch (err) { //
    console.error('Erro ao fechar Sequelize:', err.message);
  }
}

// Hook que roda DEPOIS de TODOS os testes em TODOS os arquivos
afterAll(async () => { //
  console.log('Executando afterAll...'); // Log opcional

  // Tenta fechar o servidor HTTP (se existir)
  await tryCloseServer(); //

  // Tenta fechar a conexão do Sequelize
  await tryCloseSequelize(); //


  // --- ALTERADO: Tenta desconectar o Redis usando import() dinâmico ---
  try {
    // Carrega o módulo de repositórios dinamicamente DENTRO do afterAll
    const repositoriesModule = await import('./src/infrastructure/database/sequelize/repositories/index.js'); // Use import() aqui
    const redisCacheRepository = repositoriesModule.redisCacheRepository; // Pega a instância exportada

    // Verifica se a instância foi carregada e tem o método disconnect
    if (redisCacheRepository && typeof redisCacheRepository.disconnect === 'function') {
      console.log('Desconectando Redis...'); // Log opcional
      await redisCacheRepository.disconnect();
      console.log('Redis desconectado.'); // Log opcional
    } else {
       console.warn('redisCacheRepository não encontrado ou sem método disconnect após import.');
    }
  } catch (err) {
    console.error('Erro ao importar ou desconectar Redis no afterAll:', err.message);
  }
  // --- FIM DA ALTERAÇÃO ---


  // Reseta timers do Jest se necessário
  if (typeof globalThis !== 'undefined' && typeof globalThis.jest !== 'undefined' && typeof globalThis.jest.useRealTimers === 'function') { //
    globalThis.jest.useRealTimers(); //
  }
  console.log('afterAll concluído.'); // Log opcional
});