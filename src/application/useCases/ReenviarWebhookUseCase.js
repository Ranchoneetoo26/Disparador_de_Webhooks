<<<<<<< HEAD
// src/application/useCases/ReenviarWebhookUseCase.js
'use strict';
=======
"use strict";
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import { randomUUID } from 'crypto';

export default class ReenviarWebhookUseCase {
<<<<<<< HEAD
  constructor({ webhookRepository, webhookReprocessadoRepository, httpClient, redisClient } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing');
=======
  constructor({
    webhookRepository,
    webhookReprocessadoRepository,
    httpClient,
    redisClient,
  } = {}) {
    if (!webhookRepository) throw new Error("webhookRepository missing");
    if (!webhookReprocessadoRepository)
      throw new Error("webhookReprocessadoRepository missing");
    if (!httpClient) throw new Error("httpClient missing");
    if (!redisClient) throw new Error("redisClient missing");
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7

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
      const response = await this.httpClient.post(
        'https://webhook.site/SEU_ENDPOINT_TESTE',
        { product, id, kind, type },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const protocolo = response.data?.protocolo || randomUUID();

      await this.redisClient.setEx(cacheKey, 3600, JSON.stringify({ product, id, kind, type }));

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

      const errorProtocol = `error:${randomUUID()}`;
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
=======
  async execute(payload = {}) {
    // ✅ Verificação de id
    if (!payload?.id) {
      throw new Error("id is required");
    }

    // ✅ Busca o webhook
    const webhook = await this.webhookRepository.findById(payload.id);
    if (!webhook) {
      return { success: false, error: "Webhook not found" };
    }

    try {
      // ✅ Faz o POST do webhook
      const response = await this.httpClient.post(
        webhook.url,
        webhook.payload,
        { timeout: 5000 }
      );

      // ✅ Caso sucesso (2xx)
      if (response && response.status >= 200 && response.status < 300) {
        await this.webhookRepository.update(webhook.id, {
          tentativas: (webhook.tentativas || 0) + 1,
          last_status: response.status,
        });

        return {
          success: true,
          status: response.status,
          data: response.data,
        };
      }

      // ✅ Caso erro de status (não 2xx)
      await this.reprocessadoRepository.create({
        data: webhook.payload,
        cedente_id: webhook.cedente_id || null,
        kind: webhook.kind || "unknown",
        type: webhook.type || "unknown",
        servico_id: webhook.servico_id || null,
        protocolo: `status:${response.status}`,
        meta: { originalStatus: response.status },
      });

      return { success: false, status: response.status };
    } catch (err) {
      // ✅ Caso erro de rede ou exceção
      await this.reprocessadoRepository.create({
        data: webhook.payload,
        cedente_id: webhook.cedente_id || null,
        kind: webhook.kind || "unknown",
        type: webhook.type || "unknown",
        servico_id: webhook.servico_id || null,
        protocolo: `error:${err.message}`,
        meta: { errorMessage: err.message },
      });

      await this.webhookRepository.update(webhook.id, {
        tentativas: (webhook.tentativas || 0) + 1,
      });

      return { success: false, error: err.message };
    }
  }
}
>>>>>>> e8eb97ff05622b90f384c5fbc829e82218ca52c7
