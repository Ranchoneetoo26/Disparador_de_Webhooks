
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

<<<<<<< HEAD
  async execute(payload) {
    const input = ReenviarWebhookInput.validate(payload);
    const { product, id, kind, type } = input;

    const cacheKey = `reenviar:${product}:${id.join(',')}`;
    const existeCache = await this.redisClient.get(cacheKey);
    if (existeCache) {
      throw Object.assign(new Error('Requisição duplicada. Tente novamente em 1 hora.'), { status: 400 });
    }

    const registros = await this.webhookRepository.findByIds(product, id);
    if (!registros || registros.length === 0) {
      throw Object.assign(new Error('Nenhum registro encontrado para os IDs informados.'), { status: 400 });
    }

    const situacoesEsperadas = {
      boleto: { disponivel: 'REGISTRADO', cancelado: 'BAIXADO', pago: 'LIQUIDADO' },
      pagamento: { disponivel: 'SCHEDULED ACTIVE', cancelado: 'CANCELLED', pago: 'PAID' },
      pix: { disponivel: 'ACTIVE', cancelado: 'REJECTED', pago: 'LIQUIDATED' },
    };

    const situacaoEsperada = situacoesEsperadas[product]?.[type];

    const divergentes = registros.filter((r) => r.status !== situacaoEsperada);
    if (divergentes.length > 0) {
      throw Object.assign(
        new Error(`Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado.`),
        { status: 422, ids_invalidos: divergentes.map((d) => d.id) }
      );
    }

    try {
=======
  async execute(payload = {}) {
   
    if (!payload?.id) {
      throw new Error("id is required");
    }

    
    const webhook = await this.webhookRepository.findById(payload.id);
    if (!webhook) {
      return { success: false, error: "Webhook not found" };
    }

    try {
     
>>>>>>> 17f3c16869bd4d4beeb6dc8065b71d46bcf810df
      const response = await this.httpClient.post(
        'https://webhook.site/SEU_ENDPOINT_TESTE',
        { product, id, kind, type },
        { headers: { 'Content-Type': 'application/json' } }
      );

<<<<<<< HEAD
      const protocolo = response.data?.protocolo || randomUUID();
=======
     
      if (response && response.status >= 200 && response.status < 300) {
        await this.webhookRepository.update(webhook.id, {
          tentativas: (webhook.tentativas || 0) + 1,
          last_status: response.status,
        });
>>>>>>> 17f3c16869bd4d4beeb6dc8065b71d46bcf810df

      await this.redisClient.setEx(cacheKey, 3600, JSON.stringify({ product, id, kind, type }));

<<<<<<< HEAD
=======
   
>>>>>>> 17f3c16869bd4d4beeb6dc8065b71d46bcf810df
      await this.reprocessadoRepository.create({
        data: { product, id, kind, type },
        kind,
        type,
        servico_id: JSON.stringify(id),
        protocolo,
      });

<<<<<<< HEAD
      return { success: true, protocolo };
    } catch (error) {
      console.error('Erro no reenvio do webhook:', error.message);

      const errorProtocol = `error:${randomUUID()}`;
=======
      return { success: false, status: response.status };
    } catch (err) {
   
>>>>>>> 17f3c16869bd4d4beeb6dc8065b71d46bcf810df
      await this.reprocessadoRepository.create({
        data: payload,
        kind: payload.kind,
        type: payload.type,
        servico_id: JSON.stringify(payload.id),
        protocolo: errorProtocol,
      });

      const registro = registros[0];
      await this.webhookRepository.update(registro.id, {
        tentativas: (registro.tentativas || 0) + 1,
      });

      throw Object.assign(new Error('Não foi possível gerar a notificação. Tente novamente mais tarde.'), {
        status: 400,
      });
    }
  }
}
