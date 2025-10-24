import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Op } from 'sequelize'; // Importe o Op para usar nos expects
import SequelizeWebhookReprocessadoRepository from '@/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository';

// Mock do Modelo Sequelize
let mockWebhookReprocessadoModel;
let repository;

describe('SequelizeWebhookReprocessadoRepository Unit Tests', () => {
  beforeEach(() => {
    // Recria o mock antes de cada teste
    mockWebhookReprocessadoModel = {
      findAll: jest.fn(), // Mock para o método findAll
      findOne: jest.fn(), // Mock para findOne (usado por findByProtocolo)
      create: jest.fn(),  // Mock para create
      // Adicione mocks para outros métodos do Sequelize se necessário
    };

    // Instancia o repositório com o modelo mockado
    repository = new SequelizeWebhookReprocessadoRepository({
      WebhookReprocessadoModel: mockWebhookReprocessadoModel
    });
  });

  describe('listByDateRangeAndFilters', () => {
    const startDate = new Date('2025-10-01T00:00:00.000Z');
    const endDate = new Date('2025-10-15T23:59:59.999Z'); // Use T23:59:59 para incluir o dia final

    it('deve chamar findAll sem filtros adicionais se apenas datas forem fornecidas', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]); // Simula retorno vazio
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: {} });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledTimes(1);
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
    });

    it('deve incluir filtro por kind quando fornecido', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { kind: 'webhook' } });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          kind: 'webhook' // Verifica se o filtro foi adicionado
        }
      });
    });

    it('deve incluir filtro por type quando fornecido', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { type: 'disponivel' } });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          type: 'disponivel' // Verifica se o filtro foi adicionado
        }
      });
    });

     it('deve incluir filtro por product (no campo data) quando fornecido', async () => {
       mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
       await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { product: 'boleto' } });

       expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
         where: {
           data_criacao: { [Op.between]: [startDate, endDate] },
           // Verifica a sintaxe específica para consulta JSONB no PostgreSQL
           [`data::jsonb ->> 'produto'`]: 'boleto'
         }
       });
     });

    // *** TESTE PRINCIPAL PARA O FILTRO 'id' (Array) ***
    it('deve incluir filtro Op.contains para servico_id quando filters.id (array) é fornecido', async () => {
      const serviceIds = ['boleto-123', 'pix-456'];
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: serviceIds } });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          servico_id: { // Verifica se a cláusula where para servico_id está correta
            [Op.contains]: serviceIds
          }
        }
      });
    });
    // *** FIM DO TESTE PRINCIPAL ***

    it('NÃO deve incluir filtro para servico_id se filters.id for vazio ou não for array', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);

      // Caso 1: Array vazio
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: [] } });
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } } // Não deve ter filtro servico_id
      });
      mockWebhookReprocessadoModel.findAll.mockClear(); // Limpa para a próxima verificação

      // Caso 2: Não é array
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: 'nao-e-array' } });
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } } // Não deve ter filtro servico_id
      });
    });
  });

  // Adicione testes para findByProtocolo e create também, se desejar
  describe('findByProtocolo', () => {
    it('deve chamar findOne com o protocolo correto', async () => {
       const uuid = 'test-uuid-123';
       mockWebhookReprocessadoModel.findOne.mockResolvedValue({ id: uuid }); // Simula encontrar
       await repository.findByProtocolo(uuid);
       expect(mockWebhookReprocessadoModel.findOne).toHaveBeenCalledWith({
          where: { protocolo: uuid }
       });
    });
     it('deve retornar null se protocolo não for fornecido', async () => {
        const result = await repository.findByProtocolo(null);
        expect(result).toBeNull();
        expect(mockWebhookReprocessadoModel.findOne).not.toHaveBeenCalled();
     });
  });

  describe('create', () => {
     it('deve chamar create com os dados fornecidos', async () => {
         const dataToCreate = { data: { key: 'value' }, cedente_id: 1, /* ... outros campos */ };
         mockWebhookReprocessadoModel.create.mockResolvedValue(dataToCreate); // Simula criação
         await repository.create(dataToCreate);
         expect(mockWebhookReprocessadoModel.create).toHaveBeenCalledWith(dataToCreate);
     });
     it('deve lançar erro se dados não forem fornecidos', async () => {
         await expect(repository.create(null)).rejects.toThrow('Data is required for creation');
     });
  });

});