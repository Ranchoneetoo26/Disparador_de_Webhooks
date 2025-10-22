'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config(); // Carrega variáveis do .env

const isTest = process.env.NODE_ENV === 'test';

// --- INICIALIZAÇÃO DO SEQUELIZE MOVIDA PARA CIMA ---
const DB_HOST = isTest ? process.env.DB_HOST_TEST : process.env.DB_HOST;
const DB_USERNAME = isTest ? process.env.DB_USERNAME_TEST : process.env.DB_USERNAME;
const DB_PASSWORD = isTest ? process.env.DB_PASSWORD_TEST : process.env.DB_PASSWORD;
const DB_DATABASE = isTest ? process.env.DB_DATABASE_TEST : process.env.DB_DATABASE;
const DB_PORT = isTest ? process.env.DB_PORT_TEST : process.env.DB_PORT;
const DB_DIALECT = isTest ? process.env.DB_DIALECT_TEST : process.env.DB_DIALECT;

// Verifica se as variáveis de banco de dados essenciais estão definidas
if (!DB_DATABASE || !DB_USERNAME || !DB_HOST || !DB_PORT || !DB_DIALECT) {
  console.error("Erro Fatal: Variáveis de ambiente do banco de dados não estão configuradas corretamente. Verifique seu arquivo .env ou as variáveis de ambiente do sistema.");
  // Considerar lançar um erro ou sair do processo em um cenário real
  // throw new Error("Configuração do banco de dados incompleta.");
}

const sequelize = new Sequelize( // Instância criada ANTES de ser usada pelos modelos
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10), // Garante que a porta seja um número
    dialect: DB_DIALECT,
    logging: false, // Desativado para testes e produção, pode ativar para debug
  }
);
// --- FIM DO BLOCO MOVIDO ---

const db = {}; // Objeto para armazenar os modelos e a instância do sequelize

// Carrega e inicializa cada modelo, passando a instância do sequelize e DataTypes
// Usando a forma (sequelize, DataTypes) pois os modelos exportam uma função
const CedenteModel = require('./CedenteModel.cjs')(sequelize, DataTypes);
const ContaModel = require('./ContaModel.cjs')(sequelize, DataTypes);
const ConvenioModel = require('./ConvenioModel.cjs')(sequelize, DataTypes);
const SoftwareHouseModel = require('./SoftwareHouseModel.cjs')(sequelize, DataTypes);
const WebhookModel = require('./WebhookModel.cjs')(sequelize, DataTypes); // Corrigido para inicializar corretamente
const WebhookReprocessadoModel = require('./WebhookReprocessadoModel.cjs')(sequelize, DataTypes);
const ServicoModel = require('./ServicoModel.cjs')(sequelize, DataTypes); // Adicionado ServicoModel

// Adiciona os modelos inicializados ao objeto db
db.Cedente = CedenteModel;
db.Conta = ContaModel;
db.Convenio = ConvenioModel;
db.SoftwareHouse = SoftwareHouseModel;
db.Webhook = WebhookModel;
db.WebhookReprocessado = WebhookReprocessadoModel;
db.Servico = ServicoModel;

// Executa o método associate de cada modelo, se existir
Object.keys(db).forEach(modelName => {
  // Verifica se o modelo tem a função 'associate' antes de chamar
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db); // Passa o objeto db inteiro para as associações
  }
});

// Adiciona a instância e a classe Sequelize ao objeto db para exportação
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exporta o objeto db configurado
module.exports = db;
module.exports.default = db; // Para compatibilidade com import/export