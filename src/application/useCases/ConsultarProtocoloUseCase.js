'use strict';

// Importamos a exceção (já deve estar assim)
import { ProtocoloNaoEncontradoException } from '../../domain/exceptions/ProtocoloNaoEncontradoException.js';

class ConsultarProtocoloUseCase {
  constructor({ cacheRepository, webhookReprocessadoRepository } = {}) {
    if (!cacheRepository) throw new Error('cacheRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');

    this.cache = cacheRepository;
    this.repo = webhookReprocessadoRepository;
  }

  async execute({ protocolo } = {}) {
    if (!protocolo) throw new Error('protocolo is required');

    const cacheKey = `protocolo:${protocolo}`;

    // 1. Tenta buscar do cache (como antes)
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        console.log(`[Cache] HIT: Protocolo ${protocolo} encontrado no cache.`);
        return JSON.parse(cached);
      } catch (e) {
        console.error(`[Cache] Erro ao parsear protocolo ${protocolo}:`, e.message);
      }
    }
    console.log(`[Cache] MISS: Protocolo ${protocolo} não encontrado no cache.`);

    // 2. Se não está no cache, busca no repositório (como antes)
    const record = await this.repo.findByProtocolo(protocolo);
    if (!record) {
      throw new ProtocoloNaoEncontradoException('Protocolo não encontrado');
    }

    // --- MUDANÇA AQUI: REGRA 3.3 - CACHE CONDICIONAL ---
    // Verificamos o status do registro ANTES de salvar no cache.
    // O PDF pede "sent", mas nós salvamos como "completed".
    if (record.status === 'completed') {
      console.log(`[Cache] SET: Salvando protocolo ${protocolo} (status: ${record.status}) no cache por 1h.`);
      // O Redis salva strings, o 'set' no nosso RedisCacheRepository já faz o stringify.
      await this.cache.set(cacheKey, record, { ttl: 3600 }); // 1 hora
    } else {
      console.log(`[Cache] SKIP: Protocolo ${protocolo} (status: ${record.status}) não será salvo no cache.`);
    }
    // --- FIM DA MUDANÇA ---

    // 3. Retorna o registro do banco
    return record;
  }
}

export default ConsultarProtocoloUseCase;