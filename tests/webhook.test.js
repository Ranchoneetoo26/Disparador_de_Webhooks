import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
// caminhos relativos apropriados para este arquivo de teste
import app from '../src/app.js';
import database from '../src/infrastructure/database/sequelize/index.js';

describe('Integration Tests for webhookRoutes', () => {
  let Webhook;

  beforeAll(async () => {
    if (!database || !database.sequelize) throw new Error('Database not available for tests');
    // recria as tabelas para um estado limpo
    await database.sequelize.sync({ force: true });

    // tenta obter o model Webhook
    Webhook = database.models?.Webhook || database.Webhook || null;

    if (!Webhook) {
      // Não lança para permitir diagnóstico posterior, mas falha o teste ao usar o model
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
        // ignora
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

      // aceita formatos [] ou { data: [] }
      const bodyArray = Array.isArray(response.body) ? response.body : response.body?.data;
      expect(Array.isArray(bodyArray)).toBe(true);
      expect(bodyArray.length).toBe(0);
    });
  });
});