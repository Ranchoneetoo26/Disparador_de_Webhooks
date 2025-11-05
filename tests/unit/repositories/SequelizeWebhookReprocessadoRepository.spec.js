"use strict";

const { describe, beforeEach, it, expect } = require("@jest/globals");
const { Op } = require("sequelize");
const SequelizeWebhookReprocessadoRepository = require("@/infrastructure/database/sequelize/repositories/SequelizeWebhookReprocessadoRepository");
const {
  models,
} = require("@/infrastructure/database/sequelize/models/index.cjs");

let repository;

// Mock utilitário Sequelize
const mockSequelize = {
  json: jest.fn((field, value) => ({ mockField: field, mockValue: value })),
  literal: jest.fn((str) => str),
  where: jest.fn((literal, value) => ({ [literal]: value })),
};

describe("SequelizeWebhookReprocessadoRepository Unit Tests", () => {
  beforeEach(() => {
    // Corrigido o nome do model
    models.WebhookReprocessado = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    // Instancia o repositório
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
          kind: "webhook",
        },
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
      });
    });

    it("deve incluir filtro Op.contains para servico_id quando filters.id (array) é fornecido", async () => {
      const serviceIds = ["boleto-123", "pix-456"];
      models.WebhookReprocessado.findAll.mockResolvedValue([]);

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
      });
    });
  });

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
