const path = require("path");


const envPath = path.resolve(__dirname, "../../../../../.env");
console.log(`[index.cjs] Tentando carregar .env de: ${envPath}`);


const dotenv = require("dotenv");
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.warn(`[index.cjs] AVISO: Não foi possível carregar o .env: ${dotenvResult.error.message}`);
} else {
  console.log("[index.cjs] .env carregado com sucesso.");
}

const SequelizeModule = require("sequelize");
const Sequelize = SequelizeModule.Sequelize;

const isTest = process.env.NODE_ENV === "test";
console.log(`[index.cjs] NODE_ENV=${process.env.NODE_ENV}, isTest=${isTest}`);

const DB_DIALECT = isTest
  ? process.env.DB_DIALECT_TEST
  : process.env.DB_DIALECT;

const DB_HOST = isTest ? process.env.DB_HOST_TEST : process.env.DB_HOST;

const DB_DATABASE = isTest
  ? process.env.DB_DATABASE_TEST
  : process.env.DB_DATABASE;

const DB_USERNAME = isTest
  ? process.env.DB_USERNAME_TEST
  : process.env.DB_USERNAME;

const DB_PASSWORD = isTest
  ? process.env.DB_PASSWORD_TEST
  : process.env.DB_PASSWORD;

const dbPortEnv = isTest ? process.env.DB_PORT_TEST : process.env.DB_PORT;
const DB_PORT = dbPortEnv ? parseInt(dbPortEnv, 10) : (isTest ? 5433 : undefined);

const DB_STORAGE = process.env.DB_STORAGE || ":memory:";

console.log(`[index.cjs] Configuração Sequelize: user=${DB_USERNAME}, db=${DB_DATABASE}, host=${DB_HOST}, port=${DB_PORT || '(default)'}, dialect=${DB_DIALECT}`);

let sequelize;
try {
  const sequelizeOptions = {
    host: DB_HOST,
    dialect: DB_DIALECT,
    storage: DB_STORAGE,
    logging: false,
    dialectOptions: {

      connectTimeout: 10000
    }
  };
  if (DB_PORT) {
    sequelizeOptions.port = DB_PORT;
  }

  sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, sequelizeOptions);
  console.log(`[index.cjs] Instância Sequelize criada.`);

} catch (err) {
  console.error("[index.cjs] FALHA AO CRIAR INSTÂNCIA Sequelize:", err.message);
  throw err; 
}

const models = {};

try {
  models.Cedente = require("./CedenteModel.cjs")(sequelize, SequelizeModule.DataTypes);
  models.SoftwareHouse = require("./SoftwareHouseModel.cjs")(sequelize, SequelizeModule.DataTypes);
  models.Conta = require("./ContaModel.cjs")(sequelize, SequelizeModule.DataTypes);
  models.Convenio = require("./ConvenioModel.cjs")(sequelize, SequelizeModule.DataTypes);
  models.WebhookModel = require("./WebhookModel.cjs")(sequelize, SequelizeModule.DataTypes);
  models.WebhookReprocessado = require("./WebhookReprocessadoModel.cjs")(sequelize, SequelizeModule.DataTypes);

  console.log("[index.cjs] Models carregados:", Object.keys(models));


} catch (err) {
  console.error("[index.cjs] FALHA AO CARREGAR MODELS:", err.message);
  throw err;
}

module.exports = { sequelize, Sequelize, models };
