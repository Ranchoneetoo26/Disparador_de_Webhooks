"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "WebhookReprocessados"
      ALTER COLUMN "servico_id" TYPE JSONB USING servico_id::jsonb;
    `);

    await queryInterface.changeColumn("WebhookReprocessados", "servico_id", {
      type: Sequelize.JSONB,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("WebhookReprocessados", "servico_id", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
