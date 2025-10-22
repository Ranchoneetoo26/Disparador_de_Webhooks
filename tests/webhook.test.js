import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import database from '../src/infrastructure/database/sequelize/models/index.cjs';
describe('Integration Tests for webhookRoutes', () => {
  let Webhook;

  beforeAll(async () => {
    if (!database || !database.sequelize) throw new Error('Database not available for tests');
    await database.sequelize.sync({ force: true });

    Webhook = database.models?.Webhook || database.Webhook || null;

    if (!Webhook) {
      console.warn('Modelo Webhook não encontrado em database.models. Algumas asserções podem falhar.');
    } else {
      await Webhook.destroy({ where: {} });
    }
  });

  afterEach(async () => {
    if (Webhook) {
      try {
        await Webhook.destroy({ where: {} });
      } catch (e) {
        
      }
    }
  });

  afterAll(async () => {
    if (database && database.sequelize) {
      await database.sequelize.close();
    }
  });

  describe('GET /webhooks', () => {
    it('should return a list of webhooks (empty array initially)', async () => {
      const response = await request(app).get('/webhooks');

      expect(response.status).toBe(200);

      const bodyArray = Array.isArray(response.body) ? response.body : response.body?.data;
      expect(Array.isArray(bodyArray)).toBe(true);
      expect(bodyArray.length).toBe(0);
    });
  });
});