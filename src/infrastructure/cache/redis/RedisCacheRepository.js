'use strict';

import Redis from 'ioredis';

// Esta classe agora NÃO é exportada diretamente
class RedisCacheRepository {
  constructor() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        db: process.env.REDIS_DB || 0,
        maxRetriesPerRequest: 3
      });

      this.client.on('connect', () => console.log('[Cache] Conectando ao Redis...'));
      this.client.on('ready', () => console.log('[Cache] Cliente Redis pronto para uso.'));
      this.client.on('error', (err) => console.error('[Cache] Erro no Redis:', err.message));
    } catch (err) {
      console.error('[Cache] Falha ao criar cliente Redis:', err.message);
    }
  }

  async get(key) {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async set(key, value, options = {}) {
    if (!this.client) return;
    const { ttl } = options;
    if (ttl) {
      // 'EX' é para segundos
      return this.client.set(key, value, 'EX', ttl);
    }
    return this.client.set(key, value);
  }

  async disconnect() {
    if (this.client) {
      console.log('[Cache] Desconectando do Redis...');
      // .quit() é a forma correta de fechar graciosamente
      await this.client.quit(); 
      console.log('[Cache] Conexão Redis fechada via quit().');
      this.client = null; // Libera o cliente
    }
  }
}

// --- CORREÇÃO PRINCIPAL AQUI ---
// 1. Criamos a ÚNICA instância
const instance = new RedisCacheRepository();

// 2. Exportamos a *instância* como 'default'
export default instance;
// --- FIM DA CORREÇÃO ---