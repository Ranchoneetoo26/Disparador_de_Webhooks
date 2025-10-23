// src/infrastructure/cache/redis/RedisCacheRepository.js
import redisClient from './RedisClient.js'; // Importa a instância do cliente

class RedisCacheRepository {
    constructor(client) {
        this.client = client || redisClient; // Usa o Singleton por padrão
         if (!this.client) {
             throw new Error('Cliente Redis não fornecido ou inicializado.');
         }
    }

    /**
     * Busca um valor no cache. Tenta fazer parse JSON.
     */
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (value === null) return null;
            try {
                return JSON.parse(value);
            } catch (e) {
                console.warn(`[Cache] Valor para '${key}' não é JSON, retornando string.`);
                return value;
            }
        } catch (error) {
            console.error(`[Cache] Erro GET '${key}':`, error);
            return null;
        }
    }

    /**
     * Salva um valor no cache (como string JSON) com TTL opcional.
     */
    async set(key, value, options = {}) {
        const { ttl } = options;
        try {
            const stringValue = JSON.stringify(value);
            if (ttl && Number.isInteger(ttl) && ttl > 0) {
                await this.client.set(key, stringValue, 'EX', ttl);
                // console.log(`[Cache] SET ${key} (TTL: ${ttl}s)`); // Log opcional
            } else {
                await this.client.set(key, stringValue);
                // console.log(`[Cache] SET ${key} (sem TTL)`); // Log opcional
            }
            return true;
        } catch (error) {
            console.error(`[Cache] Erro SET '${key}':`, error);
            return false;
        }
    }

    /**
     * Deleta uma chave do cache.
     */
    async del(key) {
         try {
            await this.client.del(key);
            // console.log(`[Cache] DEL ${key}`); // Log opcional
            return true;
        } catch (error) {
            console.error(`[Cache] Erro DEL '${key}':`, error);
            return false;
        }
    }
}

// Exporta uma instância única que usa o cliente Singleton
export default new RedisCacheRepository(redisClient);
