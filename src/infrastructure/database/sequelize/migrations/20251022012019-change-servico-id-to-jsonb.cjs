'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Se a coluna atual for TEXT contendo JSON string, convertemos para JSONB com USING
    await queryInterface.sequelize.query(`
      ALTER TABLE "WebhookReprocessados"
      ALTER COLUMN "servico_id" TYPE JSONB USING servico_id::jsonb;
    `);

    // Garantir que a definição do Sequelize fique consistente
    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: Sequelize.JSONB,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverte para TEXT
    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};
