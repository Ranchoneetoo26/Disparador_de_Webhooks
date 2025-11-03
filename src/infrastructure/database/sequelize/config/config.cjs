const path = require("path");

// --- MELHORIA AQUI ---
// Define qual arquivo .env carregar com base no NODE_ENV
// O Jest automaticamente define process.env.NODE_ENV = 'test'
const env = process.env.NODE_ENV || 'development';
const envPath = env === 'test' ? '.env.test' : '.env';

// Carrega o arquivo .env correto
require("dotenv").config({ path: path.resolve(process.cwd(), envPath) });
// --- FIM DA MELHORIA ---

console.log(`--- DEBUG: Carregando env do [${envPath}] ---`);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USERNAME:", process.env.DB_USERNAME);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("-----------------------------------------");

const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "disparador_test",
    host: process.env.DB_HOST || "localhost",
    port: DB_PORT,
    dialect: "postgres",
    dialectModule: require("pg"),
    define: {
      timestamps: true,
      underscored: true,
    },
  },
  test: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "disparador_test",
    host: process.env.DB_HOST || "localhost",
    port: DB_PORT,
    dialect: "postgres",
    dialectModule: require("pg"),
    logging: false, // Correto
    define: {
      timestamps: true,
      underscored: true,
    },
  },
};