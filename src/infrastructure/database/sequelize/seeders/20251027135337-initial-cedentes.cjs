'use strict';
/** @type {import('sequelize-cli').Migration} */

// O CNPJ da SoftwareHouse do seeder anterior
const SOFTWARE_HOUSE_CNPJ = '11111111000111';

// A URL para onde queremos que os webhooks sejam reenviados
const WEBHOOK_SITE_URL = 'https://webhook.site/692cd884-e83d-4319-8a04-6d89fe995108';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Encontrar o ID da SoftwareHouse que já foi criada
    const softwareHouses = await queryInterface.sequelize.query(
      `SELECT id from "SoftwareHouses" WHERE cnpj = '${SOFTWARE_HOUSE_CNPJ}' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!softwareHouses || softwareHouses.length === 0) {
      throw new Error(`Seeder: SoftwareHouse com CNPJ ${SOFTWARE_HOUSE_CNPJ} não encontrada. Rode o seeder de SoftwareHouses primeiro.`);
    }
    const softwareHouseId = softwareHouses[0].id;

    await queryInterface.bulkInsert(
      'Cedentes',
      [
        {
          cnpj: '22222222000222',
          token: 'valid_token_ced',
          status: 'ativo',
          software_house_id: softwareHouseId,
          data_criacao: new Date(),
          
          // --- MUDANÇA AQUI ---
          // Adicionamos a configuração de notificação (baseada no PDF)
          // para que o UseCase possa encontrá-la.
          configuracao_notificacao: JSON.stringify({
            url: WEBHOOK_SITE_URL,
            email: null,
            tipos: {},
            cancelado: true,
            pago: true,
            disponivel: true,
            header: false,
            ativado: true,
            header_campo: "",
            header_valor: "",
            headers_adicionais: [{ "x-empresa-teste": "true" }]
          }),
          // --- FIM DA MUDANÇA ---
          
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cedentes', { cnpj: '22222222000222' }, {});
  }
};
