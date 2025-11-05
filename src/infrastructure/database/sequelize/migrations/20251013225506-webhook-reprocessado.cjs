'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WebhookReprocessados', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },

      data: {
        allowNull: false,
        type: Sequelize.JSONB
      },

      data_criacao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      cedente_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Cedentes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      kind: {
        allowNull: false,
        type: Sequelize.STRING
      },

      type: {
        allowNull: false,
        type: Sequelize.STRING
      },

      servico_id: {
        allowNull: false,
        type: Sequelize.TEXT
      },

      protocolo: {
        allowNull: false,
        type: Sequelize.UUID
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WebhookReprocessados');
  }
};
