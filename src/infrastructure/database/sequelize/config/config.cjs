require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../../../.env"),
});

console.log("--- DEBUG VARIÁVEIS DE TESTE ---");
console.log("HOST LIDO:", process.env.DB_HOST_TEST);
console.log("PORTA LIDA:", process.env.DB_PORT_TEST);
console.log("USUÁRIO LIDO:", process.env.DB_USERNAME_TEST);
console.log("SENHA LIDA:", process.env.DB_PASSWORD_TEST);
console.log("------------------------------------");

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "disparador_test",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT_TEST || 5433,
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
    port: process.env.DB_PORT_TEST || 5433,
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
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "postgres",
  },
};
