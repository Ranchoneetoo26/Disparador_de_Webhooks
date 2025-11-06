"use strict";

const {
  ProtocoloNaoEncontradoException,
} = require("../../domain/exceptions/ProtocoloNaoEncontradoException.js");

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

  async execute(protocolo) {
    const cacheKey = `protocolo:${protocolo}`;

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

    const record = await this.repo.findByProtocolo(protocolo);

    if (!record) {
      throw new ProtocoloNaoEncontradoException("Protocolo não encontrado");
    }

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
