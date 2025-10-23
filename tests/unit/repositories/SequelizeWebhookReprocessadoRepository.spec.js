import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Op } from 'sequelize';
import SequelizeWebhookReprocessadoRepository from '@/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository';

let mockWebhookReprocessadoModel;
let repository;

describe('SequelizeWebhookReprocessadoRepository Unit Tests', () => {
  beforeEach(() => {
    mockWebhookReprocessadoModel = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    repository = new SequelizeWebhookReprocessadoRepository({
      WebhookReprocessadoModel: mockWebhookReprocessadoModel
    });
  });

  describe('listByDateRangeAndFilters', () => {
    const startDate = new Date('2025-10-01T00:00:00.000Z');
    const endDate = new Date('2025-10-15T23:59:59.999Z');

    it('deve chamar findAll sem filtros adicionais se apenas datas forem fornecidas', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
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
          kind: 'webhook'
        }
      });
    });

    it('deve incluir filtro por type quando fornecido', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { type: 'disponivel' } });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          type: 'disponivel'
        }
      });
    });

    it('deve incluir filtro por product (no campo data) quando fornecido', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { product: 'boleto' } });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          [`data::jsonb ->> 'produto'`]: 'boleto'
        }
      });
    });

    it('deve incluir filtro Op.contains para servico_id quando filters.id (array) é fornecido', async () => {
      const serviceIds = ['boleto-123', 'pix-456'];
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: serviceIds } });

      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          servico_id: {
            [Op.contains]: serviceIds
          }
        }
      });
    });

    it('NÃO deve incluir filtro para servico_id se filters.id for vazio ou não for array', async () => {
      mockWebhookReprocessadoModel.findAll.mockResolvedValue([]);

      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: [] } });
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } }
      });
      mockWebhookReprocessadoModel.findAll.mockClear();

      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: 'nao-e-array' } });
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } }
      });
    });
  });

  describe('findByProtocolo', () => {
    it('deve chamar findOne com o protocolo correto', async () => {
      const uuid = 'test-uuid-123';
      mockWebhookReprocessadoModel.findOne.mockResolvedValue({ id: uuid });
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
      const dataToCreate = { data: { key: 'value' }, cedente_id: 1, };
      mockWebhookReprocessadoModel.create.mockResolvedValue(dataToCreate);
      await repository.create(dataToCreate);
      expect(mockWebhookReprocessadoModel.create).toHaveBeenCalledWith(dataToCreate);
    });
    it('deve lançar erro se dados não forem fornecidos', async () => {
      await expect(repository.create(null)).rejects.toThrow('Data is required for creation');
    });
  });

});