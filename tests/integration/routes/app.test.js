import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
// corrigido: usar import relativo para evitar alias '@' que o Jest pode não resolver
import app from '../../../src/app.js';

describe('Testes da API Principal', () => {
  it('deve responder com status 200 na rota GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});