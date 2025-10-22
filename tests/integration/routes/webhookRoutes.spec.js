import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';

import app from '../../../src/app.js';
import database from '../../../src/infrastructure/database/sequelize/models/index.cjs';

describe('Integration Tests for webhookRoutes', () => {
  let Webhook;
  let SoftwareHouse;
  let Cedente;
  let softwareHouse;
  let cedente;

  beforeAll(async () => {
    if (!database || !database.sequelize) throw new Error('Database not available for tests');
    await database.sequelize.sync({ force: true });

    ({ Webhook, SoftwareHouse, Cedente } = database);

    if (!Webhook || !SoftwareHouse || !Cedente) {
      throw new Error('Models Webhook/SoftwareHouse/Cedente não foram encontrados no objeto database');
    }

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
      if (error.errors) {
        error.errors.forEach(err => console.error(`Campo Falha: ${err.path}, Mensagem: ${err.message}`));
      }
      throw error;
    }
  });

  afterAll(async () => {
    if (database && database.sequelize) {
      await database.sequelize.close();
    }
  });

  afterEach(async () => {
    try {
      await Webhook.destroy({ where: {} });
    } catch (error) {
      // Ignora erros de limpeza se não houver nada para limpar
    }
  });

  describe('POST /webhooks/:id/reenviar', () => {
    const payloadMockValido = {
      product: 'boleto',
      kind: 'webhook',
      type: 'disponivel',
    };

    it('should return 200 OK and success:true when resending a valid webhook', async () => {
      const webhookCriado = await Webhook.create({
        cedente_id: cedente.id,
        url: 'https://httpbin.org/post',
        payload: { message: 'teste de integração' },
        tentativas: 1,
        kind: 'webhook',
        type: 'disponivel',
        status: 'REGISTRADO',
        data_criacao: new Date(),
      });

      const response = await request(app)
        .post(`/webhooks/${webhookCriado.id}/reenviar`)
        .send(payloadMockValido);

      expect(response.status).toBe(200);
      expect(response.body?.success).toBe(true);

      const webhookAtualizado = await Webhook.findByPk(webhookCriado.id);
      expect(typeof webhookAtualizado.tentativas).toBe('number');
    }, 15000);

    it('should return 400 Bad Request if the webhook does not exist', async () => {
      const idInexistente = 999999;

      const response = await request(app)
        .post(`/webhooks/${idInexistente}/reenviar`)
        .send(payloadMockValido);

      expect(response.status).toBe(400);
      expect(response.body?.success).not.toBe(true);
    });

    it('should return an error when the external URL fails', async () => {
      const webhookComUrlRuim = await Webhook.create({
        cedente_id: cedente.id,
        url: 'http://127.0.0.1:9',
        payload: { message: 'vai falhar' },
        tentativas: 1,
        kind: 'webhook',
        type: 'disponivel',
        data_criacao: new Date()
      });

      const response = await request(app)
        .post(`/webhooks/${webhookComUrlRuim.id}/reenviar`)
        .send(payloadMockValido);

      expect(response.status).not.toBe(200);
      expect(response.body?.success).toBeFalsy();
    });
  });
});
