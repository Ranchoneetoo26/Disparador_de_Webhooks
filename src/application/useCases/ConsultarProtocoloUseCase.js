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
    if (cached) {
      // Tenta parsear caso esteja em string
      try {
        return (typeof cached === 'string') ? JSON.parse(cached) : cached;
      } catch (e) {
        console.error("Erro ao parsear cache em ConsultarProtocolo:", e);
        // Continua para buscar do banco se o cache estiver corrompido
      }
    }

    const record = await this.repo.findByProtocolo(protocolo);
    if (!record) {
      // Retorna 400 conforme requisito (embora 404 seja mais comum)
      const error = new ProtocoloNaoEncontradoException('Protocolo não encontrado.');
      error.status = 400; // Define o status para o controller usar
      throw error;
    }

    // REGRA DE NEGÓCIO 3.3: "Condição para Cache: ... status... deve estar como sent."
    // Assumindo que o 'record' (WebhookReprocessado) tenha um campo 'status'
    // Se o campo 'status' não existir ou a regra for outra, ajuste este 'if'.
    if (record.status === 'sent') {
      // Salva em cache por 1 hora (3600 segundos)
      await this.cache.set(cacheKey, JSON.stringify(record), { ttl: 3600 });
    }

    return record;
  }
}

export default ConsultarProtocoloUseCase;
