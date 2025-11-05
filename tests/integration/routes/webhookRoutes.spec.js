/* eslint-disable no-undef */
import { describe, test, expect } from '@jest/globals'; // <-- CORREÇÃO 1
import request from 'supertest';
import app from '../../../src/app.js'; // Importa o app Express

describe('Integration: /webhooks Routes', () => {
  // Teste básico de "smoke test"
  test('POST /webhooks - deve falhar com 401 se não houver headers', async () => {
    const response = await request(app)
      .post('/webhooks')
      .send({
        product: 'boleto',
        id: ['boleto-123'],
        kind: 'webhook',
        type: 'pago'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Missing auth headers');
  });
});