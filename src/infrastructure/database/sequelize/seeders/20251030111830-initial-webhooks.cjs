'use strict';
// Pega o ID do Cedente do seeder anterior
const CEDENTE_CNPJ = '22222222000222';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Encontrar o ID do Cedente que já foi criado
    const cedentes = await queryInterface.sequelize.query(
      `SELECT id from "Cedentes" WHERE cnpj = '${CEDENTE_CNPJ}' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!cedentes || cedentes.length === 0) {
      throw new Error(`Seeder: Cedente com CNPJ ${CEDENTE_CNPJ} não encontrado. Rode o seeder de cedentes primeiro.`);
    }
    const cedenteId = cedentes[0].id;

    // 2. Inserir os webhooks de teste
    await queryInterface.bulkInsert('Webhooks', [
      {
        id: 'boleto-123', // ID de texto que o seu DTO espera
        url: 'https://webhook.site/seu-endpoint-de-teste',
        payload: JSON.stringify({ "titulo_id": "123", "status": "pago" }),
        tentativas: 0,
        cedente_id: cedenteId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'boleto-456', // ID de texto
        url: 'https://webhook.site/seu-endpoint-de-teste',
        payload: JSON.stringify({ "titulo_id": "456", "status": "pago" }),
        tentativas: 0,
        cedente_id: cedenteId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Webhooks', { id: ['boleto-123', 'boleto-456'] }, {});
  }
};