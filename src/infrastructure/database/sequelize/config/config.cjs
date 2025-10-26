
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