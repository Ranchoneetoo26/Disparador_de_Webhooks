'use strict';

import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import { randomUUID } from 'crypto';

export default class ReenviarWebhookUseCase {
  constructor({ webhookRepository, webhookReprocessadoRepository, httpClient, redisClient } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing');

    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(payload) {
    const input = ReenviarWebhookInput.validate(payload);
    const { product, id, kind, type } = input;

    // Cache Redis
    const cacheKey = `reenviar:${product}:${id.join(',')}`;
    const existeCache = await this.redisClient.get(cacheKey);
    if (existeCache) {
      throw Object.assign(new Error('Requisição duplicada. Tente novamente em 1 hora.'), { status: 400 });
    }

    // Buscar registros no banco
    const registros = await this.webhookRepository.findByIds(product, id);
    if (!registros || registros.length === 0) {
      throw Object.assign(new Error('Nenhum registro encontrado para os IDs informados.'), { status: 400 });
    }

    // Mapeamento de situações
    const situacoesEsperadas = {
      boleto: { disponivel: 'REGISTRADO', cancelado: 'BAIXADO', pago: 'LIQUIDADO' },
      pagamento: { disponivel: 'SCHEDULED', cancelado: 'CANCELLED', pago: 'PAID' },
      pix: { disponivel: 'ACTIVE', cancelado: 'REJECTED', pago: 'LIQUIDATED' },
    };

    const situacaoEsperada = situacoesEsperadas[product][type];

    // Validação de divergência
    const divergentes = registros.filter((r) => r.status !== situacaoEsperada);
    if (divergentes.length > 0) {
      throw Object.assign(
        new Error(`Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado.`),
        { status: 422, ids_invalidos: divergentes.map((d) => d.id) }
      );
    }

    try {
      // Envio do webhook
      const response = await this.httpClient.post(
        'https://webhook.site/SEU_ENDPOINT_TESTE',
        { product, id, kind, type },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const protocolo = response.data?.protocolo || randomUUID();

      // Cachear 1h
      await this.redisClient.setEx(cacheKey, 3600, JSON.stringify({ product, id, kind, type }));

      // Salvar na tabela WebhookReprocessado
      await this.reprocessadoRepository.create({
        data: { product, id, kind, type },
        kind,
        type,
        servico_id: JSON.stringify(id),
        protocolo,
      });

      return { success: true, protocolo };
    } catch (error) {
      console.error('Erro no reenvio do webhook:', error.message);
      throw Object.assign(new Error('Não foi possível gerar a notificação. Tente novamente mais tarde.'), {
        status: 400,
      });
    }
  }
}
