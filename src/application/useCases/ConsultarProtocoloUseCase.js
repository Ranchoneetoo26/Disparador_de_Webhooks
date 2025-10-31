'use strict';

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

    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(`[Cache] Erro ao parsear protocolo ${protocolo}:`, e.message);
      }
    }

    const record = await this.repo.findByProtocolo(protocolo);
    if (!record) {
      throw new ProtocoloNaoEncontradoException('Protocolo não encontrado');
    }

    await this.cache.set(cacheKey, record, { ttl: 3600 });

    return record;
  }
}

export default ConsultarProtocoloUseCase;