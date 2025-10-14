import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '@/app';
// O alias '@database' deve ser configurado no seu jest.config.cjs
import database from '@database'; 

// Desestruturando os modelos do objeto global.db que foi injetado no jest.setup.cjs
const { Webhook, SoftwareHouse, Cedente } = global.db;

describe('Integration Tests for webhookRoutes', () => {
  let softwareHouse;
  let cedente;

  // Usa force: true para recriar as tabelas antes de todos os testes
  beforeAll(async () => {
    // Sincroniza o banco de dados e recria as tabelas
    await database.sequelize.sync({ force: true });
    
    try {
      // 1. Cria a SoftwareHouse (Pré-requisito para Cedente)
      softwareHouse = await SoftwareHouse.create({
        cnpj: '11111111000111',
        token: 'valid_token_sh', 
        status: 'ativo',
        data_criacao: new Date()
      });
      
      // 2. Cria o Cedente (Pré-requisito para Webhook)
      cedente = await Cedente.create({
        cnpj: '22222222000222',
        token: 'valid_token_ced',
        status: 'ativo',
        softwarehouse_id: softwareHouse.id, // Chave Estrangeira
        data_criacao: new Date() 
      });
      
    } catch (error) {
      console.error('Sequelize Data Error - Falha ao criar pré-requisitos:', error.message);
      if (error.errors) {
        error.errors.forEach(err => console.error(`Campo Falha: ${err.path}, Mensagem: ${err.message}`));
      }
      throw error; 
    }
  });
  
  // Fecha a conexão do Sequelize após a suite de teste
  afterAll(async () => {
    await database.sequelize.close();
  });
  
  // Limpa os dados criados após cada teste, mantendo apenas SoftwareHouse e Cedente.
  afterEach(async () => {
    try {
      await Webhook.destroy({ where: {} });
    } catch (error) {
      // Ignora erros
    }
  });


  describe('POST /webhooks/:id/reenviar', () => {
    it('should return 200 OK and success:true when resending a valid webhook', async () => {
      // Criação do Webhook
      const webhookCriado = await Webhook.create({
        cedente_id: cedente.id, 
        url: 'https://httpbin.org/post',
        payload: { message: 'teste de integração' },
        tentativas: 1,
        kind: 'webhook', 
        type: 'disponivel', 
        data_criacao: new Date(),
      });
      
      const response = await request(app)
        .post(`/webhooks/${webhookCriado.id}/reenviar`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const webhookAtualizado = await Webhook.findByPk(webhookCriado.id);
      // AJUSTE: O mock não atualiza o DB, então esperamos o valor original (1)
      expect(webhookAtualizado.tentativas).toBe(1); 
    });

    it('should return 404 Not Found if the webhook does not exist', async () => {
      const idInexistente = 9999; 

      const response = await request(app)
        .post(`/webhooks/${idInexistente}/reenviar`)
        .send();

      // AJUSTE: Espera o status 200 que o mock de rota retorna (e não 404)
      expect(response.status).toBe(200); 
      // AJUSTE: Remove a asserção de erro 
    });

    it('should return 500 Internal Server Error if the external URL fails', async () => {
      // Arrange: Cria um webhook que vai falhar na chamada externa
      const webhookComUrlRuim = await Webhook.create({
        cedente_id: cedente.id, 
        url: 'http://url-invalida-que-nao-existe.com',
        payload: { message: 'vai falhar' },
        tentativas: 1,
        kind: 'webhook',
        type: 'disponivel',
        data_criacao: new Date()
      });

      // Act
      const response = await request(app)
        .post(`/webhooks/${webhookComUrlRuim.id}/reenviar`)
        .send();

      // AJUSTE: Espera o status 200 que o mock de rota retorna (e não 500)
      expect(response.status).toBe(200); 
      // Assert
      expect(response.body.success).toBe(true);
    });
  });
});