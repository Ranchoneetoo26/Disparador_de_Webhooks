"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insere os dados de teste para Software House
    await queryInterface.bulkInsert(
      "SoftwareHouses",
      [
        {
          // Nome exato da tabela criada pela migration
          cnpj: "11111111000111", // CNPJ usado nos testes
          token: "valid_token_sh", // Token usado nos testes
          status: "ativo",
          data_criacao: new Date(),
          createdAt: new Date(), // Coluna adicionada pela migration
          updatedAt: new Date(), // Coluna adicionada pela migration
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove o dado inserido se precisar reverter o seed
    await queryInterface.bulkDelete(
      "SoftwareHouses",
      { cnpj: "11111111000111" },
      {}
    );
  },
};
