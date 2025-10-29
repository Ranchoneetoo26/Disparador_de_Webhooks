// src/infrastructure/database/sequelize/config.js
import path from "path";
import dotenv from "dotenv";

// Carrega .env da raiz do projeto (se houver).
// Se quiser apontar para outro arquivo, comente a linha abaixo e use { path: ... }.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// DEBUG opcional — comente/remova após validar
console.log("--- DEBUG VARIÁVEIS DE AMBIENTE ---");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USERNAME:", process.env.DB_USERNAME);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("-----------------------------------");

// Leitura segura das portas/variáveis com fallback
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
const DEFAULT_DB = process.env.DB_DATABASE || "disparador_test";
const DEFAULT_USER = process.env.DB_USERNAME || "postgres";
const DEFAULT_PASS = process.env.DB_PASSWORD || "postgres";
const DEFAULT_HOST = process.env.DB_HOST || "localhost";

const config = {
  development: {
    username: DEFAULT_USER,
    password: DEFAULT_PASS,
    database: DEFAULT_DB,
    host: DEFAULT_HOST,
    port: DB_PORT,
    dialect: "postgres",
    dialectModule: require("pg"),
    define: {
      timestamps: true,
      underscored: true,
    },
  },

  test: {
    // usa mesmas variáveis, mas com logging desligado
    username: DEFAULT_USER,
    password: DEFAULT_PASS,
    database: DEFAULT_DB,
    host: DEFAULT_HOST,
    port: DB_PORT,
    dialect: "postgres",
    dialectModule: require("pg"),
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },

  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    dialect: process.env.DB_DIALECT || "postgres",
  },
};

export default config;
