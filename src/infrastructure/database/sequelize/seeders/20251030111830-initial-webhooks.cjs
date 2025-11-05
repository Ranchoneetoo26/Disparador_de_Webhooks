'use strict';
// Pega o CNPJ do cedente
const CEDENTE_CNPJ = '22222222000222';

module.exports = {
  async up(queryInterface, Sequelize) {
    const cedentes = await queryInterface.sequelize.query(
      `SELECT id from "Cedentes" WHERE cnpj = '${CEDENTE_CNPJ}' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!cedentes || cedentes.length === 0) {
      throw new Error(`Seeder: Cedente com CNPJ ${CEDENTE_CNPJ} não encontrado. Rode o seeder de cedentes primeiro.`);
    }
    const cedenteId = cedentes[0].id;

    // Garante que não haja duplicados antes de inserir
    await queryInterface.bulkDelete('Webhooks', { id: ['boleto-123', 'boleto-456'] }, {});

    await queryInterface.bulkInsert('Webhooks', [
      {
        id: 'boleto-123',
        url: 'https://webhook.site/692cd884-e83d-4319-8a04-6d89fe995108', 
        // --- MUDANÇA AQUI ---
        // O status "REGISTRADO" bate com o type: "disponivel"
        payload: JSON.stringify({ "titulo_id": "123", "status": "REGISTRADO" }),
        tentativas: 0,
        cedente_id: cedenteId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'boleto-456',
        url: 'https://webhook.site/3d413d12-c878-47da-8d0f-23d0c88248bb',
        // --- MUDANÇA AQUI ---
        // O status "REGISTRADO" bate com o type: "disponivel"
        payload: JSON.stringify({ "titulo_id": "456", "status": "REGISTRADO" }),
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