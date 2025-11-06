const {
  sequelize,
  models,
} = require("../../../src/infrastructure/database/sequelize/models/index.cjs");
const { describe, expect, beforeEach, test } = require("@jest/globals");

const { WebhookReprocessado, Cedente, SoftwareHouse } = models;

describe("Integration Tests for webhookRoutes", () => {
  let softwareHouse, cedente, webhook;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    try {
    } catch (error) {
      console.error(
        "Sequelize Data Error - Falha ao criar pré-requisitos:",
        error.message
      );
    }
  });

  test("should return 401 Unauthorized if auth headers are missing", async () => {});

  test("should return 200 OK when successfully initiating a webhook resend", async () => {});
});
