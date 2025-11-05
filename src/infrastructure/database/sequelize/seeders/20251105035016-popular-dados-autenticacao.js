'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // ⚠️ PASSO DE LIMPEZA: Exclui dados em ordem inversa para respeitar as chaves estrangeiras (FKs).
    // Isso garante que a execução do seeder comece de uma base limpa e evita o erro 'already exists'.
    await queryInterface.bulkDelete('Servicos', null, {});
    await queryInterface.bulkDelete('Convenios', null, {});
    await queryInterface.bulkDelete('Contas', null, {});
    await queryInterface.bulkDelete('Cedentes', null, {});
    await queryInterface.bulkDelete('SoftwareHouses', null, {});

    const now = new Date();

    // 1. Insere a SoftwareHouse (CNPJ 11111111000111)
    const softwareHouses = await queryInterface.bulkInsert('SoftwareHouses', [{
      data_criacao: now,
      cnpj: '11111111000111',
      token: 'valid_token_sh',
      status: 'ativo',
      createdAt: now, // CORRIGIDO: Adicionado createdAt
      updatedAt: now  // CORRIGIDO: Adicionado updatedAt
    }], { returning: true });
    const softwareHouseId = softwareHouses[0].id;

    // 2. Insere o Cedente (CNPJ 22222222000222)
    const cedentes = await queryInterface.bulkInsert('Cedentes', [{
      data_criacao: now,
      cnpj: '22222222000222',
      token: 'valid_token_ced',
      software_house_id: softwareHouseId,
      status: 'ativo',
      createdAt: now,
      updatedAt: now
    }], { returning: true });
    const cedenteId = cedentes[0].id;

    // 3. Insere a Conta
    const contas = await queryInterface.bulkInsert('Contas', [{
      data_criacao: now,
      produto: 'boleto',
      banco_codigo: '341',
      cedente_id: cedenteId,
      status: 'ativo',
      createdAt: now, // CORRIGIDO: Adicionado createdAt
      updatedAt: now  // CORRIGIDO: Adicionado updatedAt
    }], { returning: true });
    const contaId = contas[0].id;

    // 4. Insere o Convenio
    const convenios = await queryInterface.bulkInsert('Convenios', [{
      numero_convenio: 'boleto-123',
      data_criacao: now,
      conta_id: contaId,
      createdAt: now, // CORRIGIDO: Adicionado createdAt
      updatedAt: now  // CORRIGIDO: Adicionado updatedAt
    }, {
      numero_convenio: 'boleto-456',
      data_criacao: now,
      conta_id: contaId,
      createdAt: now, // CORRIGIDO: Adicionado createdAt
      updatedAt: now  // CORRIGIDO: Adicionado updatedAt
    }], { returning: true });

    // 5. Insere os Servicos
    await queryInterface.bulkInsert('Servicos', [{
      data_criacao: now,
      convenio_id: convenios[0].id,
      status: 'REGISTRADO',
      createdAt: now, // CORRIGIDO: Adicionado createdAt
      updatedAt: now  // CORRIGIDO: Adicionado updatedAt
    }, {
      data_criacao: now,
      convenio_id: convenios[1].id,
      status: 'REGISTRADO',
      createdAt: now, // CORRIGIDO: Adicionado createdAt
      updatedAt: now  // CORRIGIDO: Adicionado updatedAt
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    // O down é mantido para que 'db:seed:undo:all' funcione.
    await queryInterface.bulkDelete('Servicos', null, {});
    await queryInterface.bulkDelete('Convenios', null, {});
    await queryInterface.bulkDelete('Contas', null, {});
    await queryInterface.bulkDelete('Cedentes', null, {});
    await queryInterface.bulkDelete('SoftwareHouses', null, {});
  }
};