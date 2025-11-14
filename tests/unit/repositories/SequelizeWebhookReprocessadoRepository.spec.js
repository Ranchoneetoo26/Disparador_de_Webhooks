<<<<<<< HEAD
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Op } from 'sequelize';
import SequelizeWebhookReprocessadoRepository from '@/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository';

let mockWebhookReprocessadoModel;
=======
"use strict";

const { describe, beforeEach, it, expect } = require("@jest/globals");
const { Op } = require("sequelize");
const SequelizeWebhookReprocessadoRepository = require("@/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository");
const {
  models,
} = require("@/infrastructure/database/sequelize/models/index.cjs");

>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
let repository;

const mockSequelize = {
  json: jest.fn((field, value) => ({ mockField: field, mockValue: value })),
  literal: jest.fn((str) => str),
  where: jest.fn((literal, value) => ({ [literal]: value })),
};

describe("SequelizeWebhookReprocessadoRepository Unit Tests", () => {
  beforeEach(() => {
<<<<<<< HEAD
    mockWebhookReprocessadoModel = {
=======
    models.WebhookReprocessado = {
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

<<<<<<< HEAD
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
=======
    repository = new SequelizeWebhookReprocessadoRepository(
      models.WebhookReprocessado,
      mockSequelize
    );
  });

  describe("listByDateRangeAndFilters", () => {
    const startDate = new Date("2025-10-01T00:00:00.000Z");
    const endDate = new Date("2025-10-15T23:59:59.999Z");

    it("deve chamar findAll sem filtros adicionais se apenas datas forem fornecidas", async () => {
      models.WebhookReprocessado.findAll.mockResolvedValue([]);
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb

      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: {},
      });

      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledTimes(1);
      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
    });

    it("deve incluir filtro por kind quando fornecido", async () => {
      models.WebhookReprocessado.findAll.mockResolvedValue([]);

      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: { kind: "webhook" },
      });

      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
<<<<<<< HEAD
          kind: 'webhook'
        }
=======
          kind: "webhook",
        },
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      });
    });

    it("deve incluir filtro por type quando fornecido", async () => {
      models.WebhookReprocessado.findAll.mockResolvedValue([]);

      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: { type: "disponivel" },
      });

      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
<<<<<<< HEAD
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
=======
          type: "disponivel",
        },
      });
    });

    it("deve incluir filtro por product (no campo data) quando fornecido", async () => {
      models.WebhookReprocessado.findAll.mockResolvedValue([]);

      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: { product: "boleto" },
      });

      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          [Op.and]: [
            {
              attribute: {
                val: "data->>'product'",
              },
              comparator: "=",
              logic: "boleto",
            },
          ],
        },
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      });
    });

    it("deve incluir filtro Op.contains para servico_id quando filters.id (array) é fornecido", async () => {
      const serviceIds = ["boleto-123", "pix-456"];
      models.WebhookReprocessado.findAll.mockResolvedValue([]);

<<<<<<< HEAD
      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: [] } });
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } }
      });
      mockWebhookReprocessadoModel.findAll.mockClear();

      await repository.listByDateRangeAndFilters({ startDate, endDate, filters: { id: 'nao-e-array' } });
      expect(mockWebhookReprocessadoModel.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } }
=======
      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: { id: serviceIds },
      });

      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: {
          data_criacao: { [Op.between]: [startDate, endDate] },
          servico_id: {
            [Op.contains]: serviceIds,
          },
        },
      });
    });

    it("NÃO deve incluir filtro para servico_id se filters.id for vazio ou não for array", async () => {
      models.WebhookReprocessado.findAll.mockResolvedValue([]);

      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: { id: [] },
      });
      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } },
      });

      models.WebhookReprocessado.findAll.mockClear();

      await repository.listByDateRangeAndFilters({
        startDate,
        endDate,
        filters: { id: "nao-e-array" },
      });
      expect(models.WebhookReprocessado.findAll).toHaveBeenCalledWith({
        where: { data_criacao: { [Op.between]: [startDate, endDate] } },
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      });
    });
  });

<<<<<<< HEAD
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
=======
  describe("findByProtocolo", () => {
    it("deve chamar findOne com o protocolo correto", async () => {
      const uuid = "test-uuid-123";
      models.WebhookReprocessado.findOne.mockResolvedValue({ id: uuid });

      await repository.findByProtocolo({ protocolo: uuid });

      expect(models.WebhookReprocessado.findOne).toHaveBeenCalledWith({
        where: { protocolo: uuid },
      });
    });

    it("deve retornar null se protocolo não for fornecido", async () => {
      const result = await repository.findByProtocolo(null);
      expect(result).toBeNull();
      expect(models.WebhookReprocessado.findOne).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("deve chamar create com os dados fornecidos", async () => {
      const dataToCreate = { data: { key: "value" }, cedente_id: 1 };
      models.WebhookReprocessado.create.mockResolvedValue(dataToCreate);
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb

      await repository.create(dataToCreate);

      expect(models.WebhookReprocessado.create).toHaveBeenCalledWith(
        dataToCreate
      );
    });

    it("deve lançar erro se dados não forem fornecidos", async () => {
      await expect(repository.create(null)).rejects.toThrow(
        "Data is required for creation"
      );
    });
  });
});
