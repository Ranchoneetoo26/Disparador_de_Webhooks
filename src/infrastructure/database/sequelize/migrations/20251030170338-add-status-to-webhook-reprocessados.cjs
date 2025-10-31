'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adiciona a coluna 'status' na tabela 'WebhookReprocessados'
    await queryInterface.addColumn('WebhookReprocessados', 'status', {
      type: Sequelize.STRING,
      allowNull: true // Permite nulo, ou defina um 'defaultValue'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove a coluna 'status'
    await queryInterface.removeColumn('WebhookReprocessados', 'status');
  }
};