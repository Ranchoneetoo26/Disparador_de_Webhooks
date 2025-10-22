process.env.NODE_ENV = 'test';
process.env.DB_DIALECT_TEST = 'sqlite';
process.env.DB_STORAGE = ':memory:';

import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '@/app';

import { sequelize, models } from "../../../src/infrastructure/database/sequelize/models/index.cjs";
const { Cedente, WebhookModel, SoftwareHouse } = models;

describe('Integration Tests for webhookRoutes', () => {
    let softwareHouse;
    let cedente;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        try {
            softwareHouse = await SoftwareHouse.create({
                cnpj: '11111111000111',
                token: 'valid_token_sh',
                status: 'ativo',
                data_criacao: new Date()
            });

            cedente = await Cedente.create({
                cnpj: '22222222000222',
                token: 'valid_token_ced',
                status: 'ativo',
                softwarehouse_id: softwareHouse.id,
                data_criacao: new Date()
            });

        } catch (error) {
            console.error('Sequelize Data Error - Falha ao criar pré-requisitos:', error.message);
            throw error;
        }
    });

    afterAll(async () => {
        await sequelize.close();
    });

    afterEach(async () => {
        await WebhookModel.destroy({ where: {} });
    });


    describe('POST /webhooks/:id/reenviar', () => {
        it('should return 401 Unauthorized if auth headers are missing', async () => {
            const response = await request(app)
                .post('/webhooks/1/reenviar')
                .send();

            expect(response.status).toBe(401);
        });

        it('should return 200 OK when successfully initiating a webhook resend', async () => {
            const webhookCriado = await WebhookModel.create({
                cedente_id: cedente.id,
                url: 'https://httpbin.org/post',
                payload: { message: 'teste' },
                tentativas: 1,
                kind: 'webhook',
                type: 'disponivel',
                data_criacao: new Date(),
            });

            const response = await request(app)
                .post(`/webhooks`)
                .set('cnpj-sh', softwareHouse.cnpj) 
                .set('token-sh', softwareHouse.token)
                .set('cnpj-cedente', cedente.cnpj)
                .set('token-cedente', cedente.token)
                .send({product: 'boleto', id:[1,2,3]});
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Webhook reenviado com sucesso.");
        });

    });
});