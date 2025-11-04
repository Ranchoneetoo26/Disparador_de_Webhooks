'use strict';

// CORREÇÃO: O caminho agora é '../../' para subir dois níveis
import { ProtocoloNaoEncontradoException } from '../../domain/exceptions/ProtocoloNaoEncontradoException.js';

export default class ConsultarProtocoloUseCase {
  constructor({ cacheRepository, webhookReprocessadoRepository } = {}) {
    if (!cacheRepository) throw new Error('cacheRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');

    this.cache = cacheRepository;
    this.repo = webhookReprocessadoRepository;
  }

  async execute({ protocolo } = {}) {
    if (!protocolo) throw new ProtocoloNaoEncontradoException('Protocolo é requerido');

    const cacheKey = `protocolo:${protocolo}`;

    // 1. Tenta buscar do cache primeiro
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      try {
        console.log(`[Cache] Protocolo ${protocolo} encontrado no cache.`);
        return JSON.parse(cached);
      } catch (e) {
        console.error('[Cache] Erro ao parsear protocolo do cache:', e.message);
        // Se o cache está corrompido, busca no banco
      }
    }

    // 2. Se não está no cache, busca no banco
    console.log(`[DB] Protocolo ${protocolo} não encontrado no cache. Buscando no DB...`);
    const record = await this.repo.findByProtocolo(protocolo);

    if (!record) {
      throw new ProtocoloNaoEncontradoException('Protocolo não encontrado');
    }

    // 3. CACHE CONDICIONAL (Regra 3.3.I)
    // Só salva em cache se o status for 'sent'
    if (record.status === 'sent') {
      console.log(`[Cache] Protocolo ${protocolo} com status 'sent'. Salvando no cache por 1h.`);
      await this.cache.set(cacheKey, record, { ttl: 3600 }); // 1 hora
    } else {
      console.log(`[Cache] Protocolo ${protocolo} com status '${record.status}'. Não será salvo no cache.`);
    }

    return record;
  }
}