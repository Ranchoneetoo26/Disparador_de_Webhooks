'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Comando específico do PostgreSQL para mudar o tipo para JSONB
    // O USING faz a conversão da string JSON armazenada para o tipo JSONB
    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: 'JSONB USING CAST("servico_id" AS JSONB)', // Específico do PostgreSQL
      allowNull: false // Mantém a restrição
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverte para TEXT se necessário (cuidado ao reverter se já houver dados não-JSON)
    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};