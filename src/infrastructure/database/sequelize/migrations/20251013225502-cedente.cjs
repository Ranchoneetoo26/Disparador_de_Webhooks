'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cedentes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      data_criacao: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      cnpj: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(14)
      },

      // >>> COLUNA 'token' ADICIONADA <<<
      token: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING // Ajuste o tamanho conforme a necessidade do seu token (ex: STRING(255))
      },

      software_house_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'SoftwareHouses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      status: {
        allowNull: false,
        type: Sequelize.STRING
      },

      configuracao_notificacao: {
        allowNull: true,
        type: Sequelize.JSONB
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
    await queryInterface.dropTable('Cedentes');
  }
};