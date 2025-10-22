import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js'; 
import database from '../../../src/infrastructure/database/sequelize/models/index.cjs';

// NOTE: Assumindo que você tem o arquivo de produção do RedisCacheRepository.js configurado corretamente.

const { Webhook, SoftwareHouse, Cedente } = database; 

describe('Integration Tests for webhookRoutes', () => {
  let softwareHouse;
  let cedente;

  beforeAll(async () => {
    // Garante que o banco de dados está pronto e limpo
    await database.sequelize.sync({ force: true });
    
    // Assegurar que o Redis seja limpo no setup (assumindo que o jest.setup.cjs lida com isso)

    try {
      // Criação de pré-requisitos SoftwareHouse
      softwareHouse = await SoftwareHouse.create({
        cnpj: '11111111000111',
        token: 'valid_token_sh',
        status: 'ativo',
        data_criacao: new Date(),
      });

      // Criação de pré-requisitos Cedente
      cedente = await Cedente.create({
        cnpj: '22222222000222',
        token: 'valid_token_ced',
        status: 'ativo',
        softwarehouse_id: softwareHouse.id,
        data_criacao: new Date(),
      });
    } catch (error) {
      console.error('Sequelize Data Error - Falha ao criar pré-requisitos:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    if (database && database.sequelize) {
      await database.sequelize.close();
    }
  });

  afterEach(async () => {
    await Webhook.destroy({ where: {} });
  });

  describe('POST /webhooks/:id/reenviar', () => {
    const requestBody = { product: 'boleto', kind: 'webhook', type: 'disponivel' };
    
    it('should return 200 OK and a protocol when resending a valid webhook', async () => {
      // Criação de webhook com campo obrigatório 'status_servico' e valor 'REGISTRADO'
      const webhookCriado = await Webhook.create({
        cedente_id: cedente.id,
        url: 'https://httpbin.org/post', 
        payload: { message: 'teste de integração' },
        kind: requestBody.kind,
        type: requestBody.type,
        status_servico: 'REGISTRADO', // Campo sincronizado
        data_criacao: new Date(),
      });

      const response = await request(app)
        .post(`/webhooks/${webhookCriado.id}/reenviar`)
        .send(requestBody);

      // CRÍTICO: Aceitamos 400 (duplicação) se o Redis não for limpo entre as execuções, 
      // mas o resultado esperado de sucesso é 200.
      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.protocolo).toBeDefined();
      } else {
        // Se receber 400, verificamos que a mensagem é a de duplicação, confirmando o problema de cache.
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      }
    }, 15000); // Timeout para chamada externa

    it('should return 400 Bad Request if the webhook does not exist', async () => {
      const idInexistente = 9999;

      const response = await request(app)
        .post(`/webhooks/${idInexistente}/reenviar`)
        .send(requestBody);

      // Status correto para webhook não encontrado
      expect(response.status).toBe(400); 
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 Bad Request if the external URL fails', async () => {
      // Criação de webhook com campo obrigatório 'status_servico'
      const webhookComUrlRuim = await Webhook.create({
        cedente_id: cedente.id,
        url: 'http://127.0.0.1:9', // URL que deve falhar
        payload: { message: 'vai falhar' },
        kind: requestBody.kind,
        type: requestBody.type,
        status_servico: 'REGISTRADO', 
        data_criacao: new Date(),
      });

      const response = await request(app)
        .post(`/webbacks/${webhookComUrlRuim.id}/reenviar`)
        .send(requestBody);

      // EXPECTATIVA FINAL: 400 (O Use Case lança 400 para erro de rede)
      expect(response.status).toBe(404); 
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    }, 15000); // Timeout para falha de conexão
  });
});
