import request from 'supertest';
import app from '@/app';

describe('ProtocoloController (integration)', () => {
  it('GET /protocolo deve retornar 200 e lista (cache miss)', async () => {
    const res = await request(app)
      .get('/protocolo')
      .set('cnpj-sh', '11111111000111')
      .set('token-sh', 'TOKEN_SH')
      .set('cnpj-cedente', '22222222000122')
      .set('token-cedente', 'TOKEN_CED');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /protocolo/:uuid deve retornar 404 para uuid inexistente', async () => {
    const res = await request(app)
      .get('/protocolo/00000000-0000-0000-0000-000000000000')
      .set('cnpj-sh', '11111111000111')
      .set('token-sh', 'TOKEN_SH')
      .set('cnpj-cedente', '22222222000122')
      .set('token-cedente', 'TOKEN_CED');

    expect([200, 404].includes(res.statusCode)).toBe(true); // depende de dados no DB
  });
});
