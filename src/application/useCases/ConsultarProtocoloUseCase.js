// src/application/useCases/ConsultarProtocoloUseCase.js
'use strict';

// --- CORREÇÃO AQUI ---
// Trocamos o alias '@/' por um caminho relativo
import { ProtocoloNaoEncontradoException } from '../../domain/exceptions/ProtocoloNaoEncontradoException.js';
// --- FIM DA CORREÇÃO ---

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

    // 1. Tenta buscar do cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        // O Redis armazena strings, então precisamos fazer o parse
        return JSON.parse(cached);
      } catch (e) {
        // Se o cache estiver corrompido, apenas loga e busca do DB
        console.error(`[Cache] Erro ao parsear protocolo ${protocolo}:`, e.message);
      }
    }

    // 2. Se não está no cache, busca no repositório
    const record = await this.repo.findByProtocolo(protocolo);
    if (!record) {
      throw new ProtocoloNaoEncontradoException('Protocolo não encontrado');
    }

    // 3. Salva no cache antes de retornar
    // O Redis salva strings, o 'set' no nosso RedisCacheRepository já faz o stringify.
    await this.cache.set(cacheKey, record, { ttl: 3600 });

    return record;
  }
}

export default ConsultarProtocoloUseCase;