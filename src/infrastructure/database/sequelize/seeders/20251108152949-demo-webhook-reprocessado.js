'use strict';

const REPROCESSADO_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
const PROTOCOLO_ID = 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dataPayload = {
      url: "https://webhook.site/f62f1e17-f67c-4b69-925e-0d2e6ccb8856",
      payload: {
        status: "REGISTRADO"
      }
    };

    await queryInterface.bulkInsert('WebhookReprocessados', [{
      id: REPROCESSADO_ID,
      data: JSON.stringify(dataPayload),
      data_criacao: new Date(),
      cedente_id: 1,
      kind: 'webhook',
      type: 'disponivel',
      servico_id: JSON.stringify({ "id_servico": 1 }),
      protocolo: PROTOCOLO_ID,
      status: 'falha',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('WebhookReprocessados', {
      id: REPROCESSADO_ID
    }, {});
  }
};