// tests/integration/routes/webhookRoutes.spec.js

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

  describe('GET /webhooks', () => {
    it('should return a list of webhooks', async () => {
      // Arrange: Crie alguns webhooks para garantir que a lista não está vazia
      await Webhook.bulkCreate([
        { url: 'http://example.com/1', payload: { a: 1 } },
        { url: 'http://example.com/2', payload: { b: 2 } },
      ]);

      // Act
      const response = await request(app).get('/webhooks');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].url).toBe('http://example.com/1');
    });
  });
}); 