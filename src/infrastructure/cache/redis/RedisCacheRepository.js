import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis de ambiente do .env

// Configuração da conexão Redis a partir das variáveis de ambiente
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined, // Usa undefined se não houver senha
    db: parseInt(process.env.REDIS_DB || '0', 10),     // Usa DB 0 por padrão
    maxRetriesPerRequest: 3, // Evita retentativas infinitas em caso de falha temporária
    enableReadyCheck: true, // Garante que comandos só rodem quando o cliente estiver pronto
    connectTimeout: 5000, // Timeout de conexão em milissegundos
};

// Cria uma instância única do cliente Redis (padrão Singleton)
let redisClient = null;

function getClient() {
    // Se não houver cliente ou se a conexão foi perdida (status 'end'), tenta criar/recriar
    if (!redisClient || redisClient.status === 'end') {
        console.log(`[Cache] Conectando ao Redis em ${redisConfig.host}:${redisConfig.port} (DB ${redisConfig.db})...`);
        redisClient = new Redis(redisConfig);

        // --- Tratamento de Eventos ---
        redisClient.on('connect', () => {
            console.log('[Cache] Conectado ao Redis.');
        });

        redisClient.on('ready', () => {
            console.log('[Cache] Cliente Redis pronto para uso.');
        });

        redisClient.on('error', (err) => {
            console.error('[Cache] Erro de conexão/operação Redis:', err.message || err);
        });

        redisClient.on('close', () => {
            // console.log('[Cache] Conexão Redis fechada.'); // <-- LOG REMOVIDO/COMENTADO
            // A instância será recriada na próxima chamada a getClient se necessário
        });

        redisClient.on('reconnecting', (delay) => {
            console.log(`[Cache] Tentando reconectar ao Redis em ${delay}ms...`);
        });

        redisClient.on('end', () => {
            // console.log('[Cache] Conexão Redis finalizada (não tentará reconectar automaticamente).'); // <-- LOG REMOVIDO/COMENTADO
            redisClient = null; // Permite recriar na próxima chamada
        });
        // --- Fim do Tratamento de Eventos ---
    }
    return redisClient;
}

// Função para garantir que o cliente está pronto antes de operar
async function ensureReadyClient() {
    const client = getClient();
    if (!client) {
        console.warn('[Cache] Cliente Redis não inicializado.');
        return null;
    }
    if (client.status === 'ready') {
        return client;
    }
    if (client.status === 'connecting' || client.status === 'reconnecting') {
        console.log('[Cache] Aguardando cliente Redis ficar pronto...');
        try {
            // Espera pelo evento 'ready' ou 'error' por um tempo limitado
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout esperando cliente Redis ficar pronto')), redisConfig.connectTimeout || 5000);
                client.once('ready', () => { clearTimeout(timeout); resolve(); });
                client.once('error', (err) => { clearTimeout(timeout); reject(err); });
                // Adiciona listener para 'end' também, caso a conexão falhe permanentemente
                client.once('end', () => { clearTimeout(timeout); reject(new Error('Conexão Redis finalizada enquanto aguardava ficar pronto')); });
            });
            return client;
        } catch (error) {
            console.error('[Cache] Erro ao aguardar cliente Redis:', error.message);
            return null;
        }
    }
    // Se o status for 'close', 'end' ou outro inesperado
    console.warn(`[Cache] Cliente Redis em estado inesperado: ${client.status}`);
    return null;
}


export default class RedisCacheRepository {
    constructor() {
        // A instância é gerenciada internamente
        getClient(); // Tenta iniciar a conexão na instanciação
    }

    async get(key) {
        const client = await ensureReadyClient();
        if (!client) {
            console.warn(`[Cache] GET ${key}: Cliente Redis não disponível.`);
            return null;
        }
        try {
            console.log(`[Cache] GET ${key}`);
            const value = await client.get(key);
            // ioredis retorna null se a chave não existe, que é o esperado
            return value;
        } catch (error) {
            console.error(`[Cache] Erro ao buscar chave ${key}:`, error.message);
            return null;
        }
    }

    async set(key, value, options = {}) {
        const client = await ensureReadyClient();
        if (!client) {
            console.warn(`[Cache] SET ${key}: Cliente Redis não disponível.`);
            return false;
        }

        const { ttl } = options; // Tempo de vida em segundos
        try {
            // Garante que o valor seja string (Redis armazena strings)
            const valueToStore = (typeof value === 'string') ? value : JSON.stringify(value);

            console.log(`[Cache] SET ${key} (TTL: ${ttl && Number.isInteger(ttl) && ttl > 0 ? ttl + 's' : 'Nenhum'})`);

            if (ttl && Number.isInteger(ttl) && ttl > 0) {
                // Usa 'EX' para definir o tempo de expiração em segundos
                await client.set(key, valueToStore, 'EX', ttl);
            } else {
                // Define sem tempo de expiração
                await client.set(key, valueToStore);
            }
            return true; // Sucesso
        } catch (error) {
            console.error(`[Cache] Erro ao definir chave ${key}:`, error.message);
            return false; // Falha
        }
    }

    async disconnect() {
        const client = redisClient; // Pega a instância atual
        if (client && client.status !== 'end') { // Só tenta desconectar se não estiver finalizada
            console.log('[Cache] Desconectando do Redis...'); //
            try {
                // --- ADICIONADO: Remove todos os listeners ---
                client.removeAllListeners(); // Remove listeners de 'connect', 'ready', 'error', 'close', 'reconnecting', 'end'
                // --- FIM DA ADIÇÃO ---

                await client.quit(); // Encerra a conexão graciosamente
                console.log('[Cache] Conexão Redis fechada via quit().'); // Log de confirmação
            } catch (err) {
                console.error('[Cache] Erro ao desconectar do Redis:', err.message); //
            } finally {
                redisClient = null; // Limpa a referência
            }
        } else {
            redisClient = null; // Garante que a referência seja limpa mesmo se já estivesse 'end'
        }
    }
}