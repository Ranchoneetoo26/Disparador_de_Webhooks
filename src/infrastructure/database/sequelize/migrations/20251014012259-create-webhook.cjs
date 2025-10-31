'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Webhooks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING // <-- TIPO STRING
        // autoIncrement: false, <-- REMOVIDO
      },
      url: {
        type: Sequelize.STRING
      },
      payload: {
        type: Sequelize.JSONB
      },
      tentativas: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Precisamos do cedente_id para o seeder
      cedente_id: {
        allowNull: true, // Ou false, dependendo da sua regra
        type: Sequelize.INTEGER,
        references: {
          model: 'Cedentes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
}
