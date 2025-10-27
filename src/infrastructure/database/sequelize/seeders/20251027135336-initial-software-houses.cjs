"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "SoftwareHouses",
      [
        {
          cnpj: "11111111000111",
          token: "valid_token_sh",
          status: "ativo",
          data_criacao: new Date(),
          // Remova as linhas createdAt e updatedAt daqui
          // createdAt: new Date(), <--- REMOVER
          // updatedAt: new Date()  <--- REMOVER
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "SoftwareHouses",
      { cnpj: "11111111000111" },
      {}
    );
  },
};
