// src/__tests__/server.test.js
const request = require('supertest');
const app = require('../server'); // Supondo que seu server.js exporte o app

describe('Testes da API Principal', () => {
  test('deve responder com status 200 na rota GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});