const { SoftwareHouse } = require('./models');

async function testarConexao() {
  try {
    console.log('Iniciando teste...');

    const novaSoftwareHouse = await SoftwareHouse.create({
      cnpj: '12345678901235',
      token: 'um-token-secreto-aqui-123',
      status: 'ativo',
    });

    console.log('SoftwareHouse criada com sucesso:', novaSoftwareHouse.toJSON());

    const todasAsCasas = await SoftwareHouse.findAll();
    console.log('Todas as SoftwareHouses no banco:');
    console.log(todasAsCasas.map(sh => sh.toJSON()));

  } catch (error) {
    console.error('Ocorreu um erro durante o teste:', error);
  }
}

testarConexao();