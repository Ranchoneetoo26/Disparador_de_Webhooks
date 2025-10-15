import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
import database from '@database';
const { Webhook } = global.db || database;

describe('Integration Tests for webhookRoutes', () => {
  beforeAll(async () => {

    await database.sequelize.sync({ force: true });

    await Webhook.destroy({ where: {} });
  });

  afterAll(async () => {
    await database.sequelize.close();
  });

  describe('GET /webhooks', () => {
    it('should return a list of webhooks', async () => {

      const response = await request(app).get('/webhooks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});