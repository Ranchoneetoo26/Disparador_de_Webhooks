import { sequelize, models } from "../src/infrastructure/database/sequelize/models/index.cjs";
import { jest, describe, expect, afterAll, beforeEach, test } from '@jest/globals';

const { WebhookReprocessado, SoftwareHouse, Cedente } = models;

describe('Integration: Webhook Model Tests', () => {
    jest.setTimeout(10000);

    let createdCedente;
    let createdSoftwareHouse;
    
    beforeEach(async () => {
        await sequelize.sync({ force: true });
        
        createdSoftwareHouse = await SoftwareHouse.create({
            data_criacao: new Date(),
            cnpj: '11111111000111',
            token: 'TOKEN_SH',
            status: 'ativo'
        });

        createdCedente = await Cedente.create({
            data_criacao: new Date(),
            cnpj: '22222222000222',
            token: 'TOKEN_CED',
            softwarehouse_id: createdSoftwareHouse.id,
            status: 'ativo'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('deve criar um registro de Webhook Reprocessado com sucesso', async () => {
        const payloadWebhook = {
            data: { message: 'Dados da requisição falha' },
            data_criacao: new Date(),
            cedente_id: createdCedente.id,
            kind: 'webhook',
            type: 'pago',
            protocolo: 'TESTE-UUID-12345',
            servico_id: JSON.stringify(['servico_id_1']) 
        };

        const webhookCriado = await WebhookReprocessado.create(payloadWebhook);

        expect(webhookCriado).toBeDefined();
        expect(webhookCriado.cedente_id).toBe(createdCedente.id);
        expect(webhookCriado.kind).toBe(payloadWebhook.kind);
        expect(webhookCriado.protocolo).toBe(payloadWebhook.protocolo);
    });
    
    test('não deve criar Webhook Reprocessado sem protocolo', async () => {
        const invalidPayload = {
            data: { message: 'Dados da requisição falha' },
            data_criacao: new Date(),
            cedente_id: createdCedente.id,
            kind: 'webhook',
            type: 'disponivel',
            protocolo: null,
        };

        await expect(WebhookReprocessado.create(invalidPayload)).rejects.toThrow();
    });
});