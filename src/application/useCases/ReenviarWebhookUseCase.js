// src/useCases/ReenviarWebhookUseCase.js
'use strict';

export default class ReenviarWebhookUseCase {
    /**
     * Dependências via objeto:
     * {
     *   webhookRepository, // deve ter findById(id) e update(id, dados)
     *   webhookReprocessadoRepository, // deve ter create(obj)
     *   httpClient // axios-like com post(url, payload, opts)
     * }
     */
    constructor({ webhookRepository, webhookReprocessadoRepository, httpClient } = {}) {
        if (!webhookRepository) throw new Error('webhookRepository missing');
        if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository missing');
        if (!httpClient) throw new Error('httpClient missing');

        this.webhookRepository = webhookRepository;
        this.reprocessadoRepository = webhookReprocessadoRepository;
        this.httpClient = httpClient;
    }

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
            // erro de rede / timeout -> registra reprocessado com motivo
            await this.reprocessadoRepository.create({
                data: webhook.payload,
                cedente_id: webhook.cedente_id || null,
                kind: webhook.kind || 'unknown',
                type: webhook.type || 'unknown',
                servico_id: webhook.servico_id || null,
                protocolo: `error:${err.message}`,
                meta: { errorMessage: err.message }
            });

            // Também pode atualizar contadores de tentativas
            await this.webhookRepository.update(webhook.id, { tentativas: (webhook.tentativas || 0) + 1 });

            return { success: false, error: err.message };
        }
    }
}
