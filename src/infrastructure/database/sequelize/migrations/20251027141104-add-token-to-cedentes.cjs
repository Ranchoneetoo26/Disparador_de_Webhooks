"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Cedentes", "token", {
      // Nome da tabela e nome da nova coluna
      type: Sequelize.STRING, // Tipo de dado (igual ao model)
      allowNull: false, // Tornar obrigatório (igual ao model)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Cedentes", "token"); // Comando para reverter
  },
};
