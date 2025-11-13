<<<<<<< HEAD

require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../../../.env"), 
});

console.log("--- DEBUG config.cjs ---");
console.log("NODE_ENV:", process.env.NODE_ENV); // Jest define isso como 'test'
console.log("HOST_TEST LIDO:", process.env.DB_HOST_TEST);
console.log("PORT_TEST LIDO:", process.env.DB_PORT_TEST);

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5433, 
    dialect: process.env.DB_DIALECT || "postgres",
    dialectModule: require("pg"),
    define: { timestamps: true, underscored: true },
  },

  test: {
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_DATABASE_TEST,
    host: process.env.DB_HOST_TEST || "127.0.0.1",
    
    port: parseInt(process.env.DB_PORT_TEST || "5433", 10), 
    dialect: process.env.DB_DIALECT_TEST || "postgres",
    dialectModule: require("pg"),
    logging: false,
    define: { timestamps: true, underscored: true },
  },

  production: {
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_DATABASE_PROD,
    host: process.env.DB_HOST_PROD,
    port: process.env.DB_PORT_PROD,
    dialect: process.env.DB_DIALECT_PROD || "postgres",
    dialectModule: require("pg"),
    define: { timestamps: true, underscored: true },
  },
};
=======
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
>>>>>>> 929a7ec6c858b3cadf7036896999f620d5e879bb
