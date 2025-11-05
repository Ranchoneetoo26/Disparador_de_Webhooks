"use strict";

<<<<<<< HEAD
import { ProtocoloNaoEncontradoException } from '../../domain/exceptions/ProtocoloNaoEncontradoException.js';

export default class ConsultarProtocoloUseCase {
  constructor({ cacheRepository, webhookReprocessadoRepository } = {}) {
    if (!cacheRepository) throw new Error('cacheRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
=======
// --- CORREÇÃO AQUI ---
// Mudamos de "import ... from" para "import { ... } from"
const {
  ProtocoloNaoEncontradoException,
} = require("../../domain/exceptions/ProtocoloNaoEncontradoException.js");
// --- FIM DA CORREÇÃO ---

class ConsultarProtocoloUseCase {
  constructor({ webhookReprocessadoRepository, cacheRepository }) {
    if (!webhookReprocessadoRepository) {
      throw new Error("webhookReprocessadoRepository is required");
    }
    if (!cacheRepository) {
      throw new Error("cacheRepository is required");
    }
    this.repo = webhookReprocessadoRepository;
    this.cache = cacheRepository;
  }
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838

    this.cache = cacheRepository;
    this.repo = webhookReprocessadoRepository;
  }

<<<<<<< HEAD
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
=======
    // 1. Tenta buscar do cache
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        console.log(`[Cache] HIT: Protocolo ${protocolo} encontrado no cache.`);
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error(
        `[Cache] Erro ao parsear protocolo ${protocolo}:`,
        e.message
      );
    }

    console.log(
      `[Cache] MISS: Protocolo ${protocolo} não encontrado no cache.`
    );

    // 2. Se não achar no cache, busca no banco
    const record = await this.repo.findByProtocolo(protocolo);

    if (!record) {
      throw new ProtocoloNaoEncontradoException("Protocolo não encontrado");
    }

    // 3. Salva no cache CONDICIONALMENTE
    if (record && record.status) {
      try {
        await this.cache.set(cacheKey, JSON.stringify(record), { ttl: 3600 });
      } catch (e) {
        console.error(
          `[Cache] Erro ao salvar protocolo ${protocolo} no cache:`,
          e.message
        );
      }
    } else {
      console.log(
        `[Cache] SKIP: Protocolo ${protocolo} (status: ${record?.status}) não será salvo no cache.`
      );
    }

    return record;
  }
}

module.exports = ConsultarProtocoloUseCase;
>>>>>>> ac74577e24c01cb6576b44326ef20c19e70cd838
