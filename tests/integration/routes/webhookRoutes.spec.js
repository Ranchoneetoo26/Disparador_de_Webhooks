import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
import database from '@database';
const { Webhook } = database;

describe('Integration Tests for webhookRoutes', () => {
  beforeAll(async () => {
    await database.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await database.sequelize.close();
  });

  describe('POST /webhooks/:id/reenviar', () => {
    it('should return 200 OK and success:true when resending a valid webhook', async () => {
      const webhookCriado = await Webhook.create({
        url: 'https://httpbin.org/post',
        payload: { message: 'teste de integração' },
        tentativas: 1,
      });

      const response = await request(app)
        .post(`/webhooks/${webhookCriado.id}/reenviar`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const webhookAtualizado = await Webhook.findByPk(webhookCriado.id);
      expect(webhookAtualizado.tentativas).toBe(2);
    });

    it('should return 404 Not Found if the webhook does not exist', async () => {
      const idInexistente = 9999;

      const response = await request(app)
        .post(`/webhooks/${idInexistente}/reenviar`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Webhook not found'); // Verifique a sua mensagem de erro real
    });

    it('should return 500 Internal Server Error if the external URL fails', async () => {
      // Arrange: Crie um webhook com uma URL que vai falhar
      const webhookComUrlRuim = await Webhook.create({
        url: 'http://url-invalida-que-nao-existe.com',
        payload: { message: 'vai falhar' },
      });

      // Act
      const response = await request(app)
        .post(`/webhooks/${webhookComUrlRuim.id}/reenviar`)
        .send();

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

});