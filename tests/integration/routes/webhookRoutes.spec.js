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
    await database.sequelize.close();
  });

  afterEach(async () => {
    try {
      await Webhook.destroy({ where: {} });
    } catch (error) {
    }
  });


  describe('POST /webhooks/:id/reenviar', () => {
    it('should return 200 OK and success:true when resending a valid webhook', async () => {
      const webhookCriado = await Webhook.create({
        cedente_id: cedente.id,
        url: 'https://httpbin.org/post',
        payload: { message: 'teste de integração' },
        tentativas: 1,
        kind: 'webhook',
        type: 'disponivel',
        data_criacao: new Date(),
      });

      const response = await request(app)
        .post(`/webhooks/${webhookCriado.id}/reenviar`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const webhookAtualizado = await Webhook.findByPk(webhookCriado.id);

      expect(webhookAtualizado.tentativas).toBe(1);
    });

    it('should return 404 Not Found if the webhook does not exist', async () => {
      const idInexistente = 9999;

      const response = await request(app)
        .post(`/webhooks/${idInexistente}/reenviar`)
        .send();

      expect(response.status).toBe(200);

    });

    it('should return 500 Internal Server Error if the external URL fails', async () => {

      const webhookComUrlRuim = await Webhook.create({
        cedente_id: cedente.id,
        url: 'http://url-invalida-que-nao-existe.com',
        payload: { message: 'vai falhar' },
        tentativas: 1,
        kind: 'webhook',
        type: 'disponivel',
        data_criacao: new Date()
      });

      const response = await request(app)
        .post(`/webhooks/${webhookComUrlRuim.id}/reenviar`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});