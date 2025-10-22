// tests/integration/routes/webhookRoutes.spec.js

import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
import database from '@database';

const { Webhook, SoftwareHouse, Cedente } = global.db;

describe('Integration Tests for webhookRoutes', () => {
  let softwareHouse;
  let cedente;

  beforeAll(async () => {
    await database.sequelize.sync({ force: true });

    try {
      softwareHouse = await SoftwareHouse.create({
        cnpj: '11111111000111',
        token: 'valid_token_sh',
        status: 'ativo',
        data_criacao: new Date(),
      });

      cedente = await Cedente.create({
        cnpj: '22222222000222',
        token: 'valid_token_ced',
        status: 'ativo',
        softwarehouse_id: softwareHouse.id,
        data_criacao: new Date(),
      });
    } catch (error) {
      console.error('Sequelize Data Error - Falha ao criar pré-requisitos:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    await database.sequelize.close();
  });

  afterEach(async () => {
    await Webhook.destroy({ where: {} });
  });

  describe('POST /webhooks/:id/reenviar', () => {
    it('should return 200 OK and a protocol when resending a valid webhook', async () => {
      const webhookCriado = await Webhook.create({
        cedente_id: cedente.id,
        url: 'https://webhook.site/d2b5b3a8-485a-4643-9831-736024250304',
        payload: { message: 'teste de integração' },
        // ✅✅✅ A CORREÇÃO ESTÁ AQUI ✅✅✅
        status: 'REGISTRADO',
        data_criacao: new Date(),
      });

      const requestBody = { product: 'boleto', kind: 'webhook', type: 'disponivel' };

      const response = await request(app)
        .post(`/webhooks/${webhookCriado.id}/reenviar`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.protocolo).toBeDefined();
    });

    it('should return 400 Bad Request if the webhook does not exist', async () => {
      const idInexistente = 9999;
      const requestBody = { product: 'boleto', kind: 'webhook', type: 'disponivel' };

      const response = await request(app)
        .post(`/webhooks/${idInexistente}/reenviar`)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Nenhum registro encontrado para os IDs informados.');
    });

    it('should return 400 Bad Request if the external URL fails', async () => {
      const webhookComUrlRuim = await Webhook.create({
        cedente_id: cedente.id,
        url: 'http://url-invalida-que-nao-existe.com',
        payload: { message: 'vai falhar' },
        // ✅✅✅ A CORREÇÃO ESTÁ AQUI ✅✅✅
        status: 'REGISTRADO',
        data_criacao: new Date(),
      });

      const requestBody = { product: 'boleto', kind: 'webhook', type: 'disponivel' };

      const response = await request(app)
        .post(`/webhooks/${webhookComUrlRuim.id}/reenviar`)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Não foi possível gerar a notificação. Tente novamente mais tarde.');
    });
  });
});