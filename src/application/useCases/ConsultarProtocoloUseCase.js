import { ProtocoloNaoEncontradoException } from '@/domain/exceptions/ProtocoloNaoEncontradoException';

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
    if (cached) return cached;

    const record = await this.repo.findByProtocolo(protocolo);
    if (!record) {
      throw new ProtocoloNaoEncontradoException('Protocolo não encontrado');
    }

    await this.cache.set(cacheKey, record, { ttl: 3600 });

    return record;
  }
}

export default ConsultarProtocoloUseCase;