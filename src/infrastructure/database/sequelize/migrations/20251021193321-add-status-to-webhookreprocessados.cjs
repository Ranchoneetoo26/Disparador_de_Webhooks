'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adiciona a coluna 'status' à tabela 'WebhookReprocessados'
    await queryInterface.addColumn(
      'WebhookReprocessados', // Nome da tabela
      'status', // Nome da nova coluna
      {
        type: Sequelize.STRING,
        allowNull: true, // Ou false se preferir, mas precisaria de defaultValue
        // defaultValue: 'PENDING' // Descomente se quiser um valor padrão
      }
    );
  },

  async down (queryInterface, Sequelize) {
    // Remove a coluna 'status' da tabela 'WebhookReprocessados'
    await queryInterface.removeColumn(
      'WebhookReprocessados', // Nome da tabela
      'status' // Nome da coluna a remover
    );
  }
};