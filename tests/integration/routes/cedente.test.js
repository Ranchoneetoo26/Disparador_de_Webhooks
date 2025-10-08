// tests/integration/routes/cedente.test.js

// Imports usando os aliases que agora estão funcionando corretamente
import request from 'supertest';
import app from '@/app';
import CedenteModel from '@models/CedenteModel.js';
import { sequelize } from '@database';

// Suíte de testes focada apenas em Cedente
describe('Testes de Integração para a Rota /cedentes', () => {

  // Limpa a tabela antes de cada teste
  beforeEach(async () => {
    await CedenteModel.destroy({ truncate: true, cascade: true });
  });

  // Fecha a conexão com o banco após todos os testes
  afterAll(async () => {
    await sequelize.close();
  });

  // Teste para criar um novo cedente
  describe('POST /cedentes', () => {
    it('Deve criar um novo cedente com sucesso e retornar status 201', async () => {
      const novoCedente = {
        nome: 'Empresa Cedente Final',
        cnpj: '11223344000155',
      };

      const response = await request(app)
        .post('/cedentes') // Verifique se o nome da sua rota está correto
        .send(novoCedente);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(novoCedente.nome);
    });

    it('Deve retornar erro 400 ao tentar criar um cedente sem um campo obrigatório', async () => {
      const cedenteInvalido = {
        cnpj: '55443322000111',
      };

      const response = await request(app)
        .post('/cedentes')
        .send(cedenteInvalido);

      expect(response.status).toBe(400);
    });
  });
});