// src/infrastructure/cache/redis/RedisClient.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis do .env

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

// Cria a instância única do cliente Redis
const redisClient = new Redis({
    host: redisHost,
    port: parseInt(redisPort, 10),
    password: redisPassword,
    maxRetriesPerRequest: 3, // Tenta reconectar algumas vezes
    // lazyConnect: true, // Conecta apenas quando necessário (útil em testes)
});

redisClient.on('connect', () => {
    console.log(`🔌 Conectado ao Redis em ${redisHost}:${redisPort}`);
});

redisClient.on('error', (err) => {
    console.error('❌ Erro na conexão com o Redis:', err);
});

// Função para fechar a conexão de forma limpa
const quitRedis = async () => {
     if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
        console.log('🔌 Desconectando do Redis...');
        try {
            await redisClient.quit();
            console.log('🔌 Desconectado do Redis com sucesso.');
        } catch (err) {
            console.error('❌ Erro ao desconectar do Redis:', err);
        }
    }
};

// Garante que a conexão seja fechada ao encerrar a aplicação
process.on('exit', quitRedis);
// Trata SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    await quitRedis();
    process.exit(0);
});
 // Trata SIGTERM (sinal de término padrão)
process.on('SIGTERM', async () => {
    await quitRedis();
    process.exit(0);
});


export default redisClient;