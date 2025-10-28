'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: 'JSONB USING CAST("servico_id" AS JSONB)',
      allowNull: false 
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn('WebhookReprocessados', 'servico_id', {
      type: Sequelize.TEXT,
      allowNull: false
    });
  }
};