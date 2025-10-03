require('dotenv').config(); // Carrega as variáveis do .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  },
  test: {
    // Configurações para ambiente de teste, se necessário
  },
  production: {
    // Configurações para ambiente de produção, se necessário
  }
};