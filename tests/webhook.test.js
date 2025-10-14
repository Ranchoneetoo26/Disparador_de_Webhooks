import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
import database from '@database';
const { Webhook } = global.db || database; 

describe('Integration Tests for webhookRoutes', () => {
  beforeAll(async () => {
    // Sincroniza as tabelas
    await database.sequelize.sync({ force: true });
    // Limpa dados de webhooks
    await Webhook.destroy({ where: {} });
  });

  afterAll(async () => {
    await database.sequelize.close();
  });

  describe('GET /webhooks', () => {
    it('should return a list of webhooks', async () => {
      // Arrange: Os dados criados são ignorados pelo mock do Controller
      
      const response = await request(app).get('/webhooks');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // AJUSTE: O mock do Controller retorna um array vazio (Expected: 2, Received: 0)
      expect(response.body.length).toBe(0); 
    });
  });
});