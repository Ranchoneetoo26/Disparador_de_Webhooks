"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Busca o ID da Software House pelo CNPJ para garantir a referência correta
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

    // Insere os dados de teste para Cedente
    await queryInterface.bulkInsert(
      "Cedentes",
      [
        {
          // Nome exato da tabela criada pela migration
          cnpj: "22222222000222", // CNPJ usado nos testes
          token: "valid_token_ced", // Token usado nos testes
          status: "ativo",
          software_house_id: softwareHouseId, // Usa o ID encontrado da Software House
          data_criacao: new Date(),
          configuracao_notificacao: null, // Define como null inicialmente
          // Não precisa createdAt/updatedAt se timestamps: false no Model CedenteModel.cjs
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove o dado inserido se precisar reverter o seed
    await queryInterface.bulkDelete("Cedentes", { cnpj: "22222222000222" }, {});
  },
};
