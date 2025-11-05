'use strict';

import { ProtocoloNaoEncontradoException } from '../../domain/exceptions/ProtocoloNaoEncontradoException.js';

export default class ConsultarProtocoloUseCase {
  constructor({ cacheRepository, webhookReprocessadoRepository } = {}) {
    if (!cacheRepository) throw new Error('cacheRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');

    this.cache = cacheRepository;
    this.repo = webhookReprocessadoRepository;
  }

  // --- CORREÇÃO AQUI ---
  // O UseCase agora recebe a string 'protocolo' direto
  async execute(protocolo) {
    if (!protocolo) throw new ProtocoloNaoEncontradoException('Protocolo é requerido');

    const cacheKey = `protocolo:${protocolo}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        console.log(`[Cache] Protocolo ${protocolo} encontrado no cache.`);
        return JSON.parse(cached);
      } catch (e) {
        console.error('[Cache] Erro ao parsear protocolo do cache:', e.message);
      }
    }

    console.log(`[DB] Protocolo ${protocolo} não encontrado no cache. Buscando no DB...`);
    // Passa apenas a string 'protocolo' para o repositório
    const record = await this.repo.findByProtocolo(protocolo);

    if (!record) {
      throw new ProtocoloNaoEncontradoException('Protocolo não encontrado');
    }

    if (record.status === 'sent') {
      console.log(`[Cache] Protocolo ${protocolo} com status 'sent'. Salvando no cache por 1h.`);
      await this.cache.set(cacheKey, record, { ttl: 3600 });
    } else {
      console.log(`[Cache] Protocolo ${protocolo} com status '${record.status}'. Não será salvo no cache.`);
    }

    return record;
  }
}