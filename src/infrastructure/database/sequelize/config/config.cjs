const path = require("path");

const env = process.env.NODE_ENV || "development";
const envPath = env === "test" ? ".env.test" : ".env";

require("dotenv").config({ path: path.resolve(process.cwd(), envPath) });

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
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  },
};
