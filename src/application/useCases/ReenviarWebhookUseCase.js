<<<<<<< Updated upstream
<<<<<<< HEAD

=======
>>>>>>> 9732f9d91227b3c2dd336eb73a277dda7748c2fb
=======

>>>>>>> Stashed changes
'use strict';

import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import { randomUUID } from 'crypto';
<<<<<<< Updated upstream

export default class ReenviarWebhookUseCase {
  constructor({ webhookRepository, webhookReprocessadoRepository, httpClient, redisClient } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing');

=======

export default class ReenviarWebhookUseCase {
  constructor({ webhookRepository, webhookReprocessadoRepository, httpClient, redisClient } = {}) {
    if (!webhookRepository) throw new Error('webhookRepository missing');
    if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
    if (!httpClient) throw new Error('httpClient missing');
    if (!redisClient) throw new Error('redisClient missing');

>>>>>>> Stashed changes
    this.webhookRepository = webhookRepository;
    this.reprocessadoRepository = webhookReprocessadoRepository;
    this.httpClient = httpClient;
    this.redisClient = redisClient;
  }

  async execute(payload) {
    const input = ReenviarWebhookInput.validate(payload);
    const { product, id, kind, type } = input;

    const cacheKey = `reenviar:${product}:${id.join(',')}`;
    const existeCache = await this.redisClient.get(cacheKey);
    if (existeCache) {
      throw Object.assign(new Error('Requisição duplicada. Tente novamente em 1 hora.'), { status: 400 });
    }

<<<<<<< Updated upstream
<<<<<<< HEAD
    const registros = await this.webhookRepository.findByIds(product, id);
    if (!registros || registros.length === 0) {
      throw Object.assign(new Error('Nenhum registro encontrado para os IDs informados.'), { status: 400 });
    }

    const situacoesEsperadas = {
      boleto: { disponivel: 'REGISTRADO', cancelado: 'BAIXADO', pago: 'LIQUIDADO' },
      pagamento: { disponivel: 'SCHEDULED', cancelado: 'CANCELLED', pago: 'PAID' },
      pix: { disponivel: 'ACTIVE', cancelado: 'REJECTED', pago: 'LIQUIDATED' },
    };

    const situacaoEsperada = situacoesEsperadas[product][type];

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
      console.error('Erro no reenvio do webhook:', error?.message || error);

      const protocoloErro = `error:${error?.message || 'unknown'}`;
      try {
        await this.reprocessadoRepository.create({
          data: { product, id, kind, type },
          kind,
          type,
          servico_id: JSON.stringify(id),
          protocolo: protocoloErro,
          meta: { errorMessage: error?.message || String(error) },
        });
      } catch (e) {

        console.error('Falha ao registrar reprocessado:', e?.message || e);
      }

      try {
        for (const r of registros) {
          await this.webhookRepository.update(r.id, { tentativas: (r.tentativas || 0) + 1 });
        }
      } catch (e) {
        console.error('Falha ao atualizar tentativas:', e?.message || e);
      }

      throw Object.assign(new Error('Não foi possível gerar a notificação. Tente novamente mais tarde.'), {
        status: 400,
        protocolo: protocoloErro,
      });
    }
  }
}
=======
    /**
     * execute({ id }) - tenta reenviar e retorna { success: boolean, details: any }
     */
    async execute({ id } = {}) {
        if (!id) throw new Error('id is required');

        const webhook = await this.webhookRepository.findById(id);
        if (!webhook) {
            return { success: false, error: 'Webhook not found' };
        }

        try {
            const resp = await this.httpClient.post(webhook.url, webhook.payload, { timeout: 5000 });

            if (resp && resp.status >= 200 && resp.status < 300) {

                await this.webhookRepository.update(webhook.id, { tentativas: (webhook.tentativas || 0) + 1, last_status: resp.status });
                return { success: true, status: resp.status, data: resp.data };
            }

            await this.reprocessadoRepository.create({
                data: webhook.payload,
                cedente_id: webhook.cedente_id || null,
                kind: webhook.kind || 'unknown',
                type: webhook.type || 'unknown',
                servico_id: webhook.servico_id || null,
                protocolo: `status:${resp.status}`,
                meta: { originalStatus: resp.status }
            });

            return { success: false, status: resp.status };
        } catch (err) {
            await this.reprocessadoRepository.create({
                data: webhook.payload,
                cedente_id: webhook.cedente_id || null,
                kind: webhook.kind || 'unknown',
                type: webhook.type || 'unknown',
                servico_id: webhook.servico_id || null,
                protocolo: `error:${err.message}`,
                meta: { errorMessage: err.message }
            });

            await this.webhookRepository.update(webhook.id, { tentativas: (webhook.tentativas || 0) + 1 });

            return { success: false, error: err.message };
        }
    }
}
>>>>>>> 9732f9d91227b3c2dd336eb73a277dda7748c2fb
=======
    const registros = await this.webhookRepository.findByIds(product, id);
    if (!registros || registros.length === 0) {
      throw Object.assign(new Error('Nenhum registro encontrado para os IDs informados.'), { status: 400 });
    }

    const situacoesEsperadas = {
      boleto: { disponivel: 'REGISTRADO', cancelado: 'BAIXADO', pago: 'LIQUIDADO' },
      pagamento: { disponivel: 'SCHEDULED', cancelado: 'CANCELLED', pago: 'PAID' },
      pix: { disponivel: 'ACTIVE', cancelado: 'REJECTED', pago: 'LIQUIDATED' },
    };

    const situacaoEsperada = situacoesEsperadas[product][type];

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
      console.error('Erro no reenvio do webhook:', error?.message || error);

      const protocoloErro = `error:${error?.message || 'unknown'}`;
      try {
        await this.reprocessadoRepository.create({
          data: { product, id, kind, type },
          kind,
          type,
          servico_id: JSON.stringify(id),
          protocolo: protocoloErro,
          meta: { errorMessage: error?.message || String(error) },
        });
      } catch (e) {

        console.error('Falha ao registrar reprocessado:', e?.message || e);
      }

      try {
        for (const r of registros) {
          await this.webhookRepository.update(r.id, { tentativas: (r.tentativas || 0) + 1 });
        }
      } catch (e) {
        console.error('Falha ao atualizar tentativas:', e?.message || e);
      }

      throw Object.assign(new Error('Não foi possível gerar a notificação. Tente novamente mais tarde.'), {
        status: 400,
        protocolo: protocoloErro,
      });
    }
  }
}
>>>>>>> Stashed changes
