"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
<<<<<<< HEAD
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: 'JSONB USING CAST("servico_id" AS JSONB)', 
      allowNull: false 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
=======
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
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
