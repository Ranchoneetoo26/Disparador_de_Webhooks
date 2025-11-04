"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const softwareHouses = await queryInterface.sequelize.query(
      `SELECT id from "SoftwareHouses" WHERE cnpj = '11111111000111' LIMIT 1;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!softwareHouses || softwareHouses.length === 0) {
      throw new Error(
        "Software House com CNPJ 11111111000111 não encontrada. Execute o seeder de SoftwareHouses primeiro."
      );
    }
    const softwareHouseId = softwareHouses[0].id;

    // Tenta deletar o cedente antes de inserir, para evitar erro de duplicado
    await queryInterface.bulkDelete("Cedentes", { cnpj: "22222222000222" }, {});

    // Insere o cedente
    await queryInterface.bulkInsert(
      "Cedentes",
      [
        {
          cnpj: "22222222000222",
          token: "valid_token_ced",
          status: "ativo",
          software_house_id: softwareHouseId,
          data_criacao: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          configuracao_notificacao: null,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Cedentes", { cnpj: "22222222000222" }, {});
  },
};