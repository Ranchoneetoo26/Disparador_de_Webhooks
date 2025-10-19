require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

console.log('--- DEBUG VARIÁVEIS DE TESTE ---');
console.log('HOST LIDO:', process.env.DB_HOST_TEST);
console.log('PORTA LIDA:', process.env.DB_PORT_TEST);
console.log('USUÁRIO LIDO:', process.env.DB_USERNAME_TEST);
console.log('SENHA LIDA:', process.env.DB_PASSWORD_TEST);
console.log('------------------------------------');


module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
  test: {
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_DATABASE_TEST,
    host: process.env.DB_HOST_TEST,
    port: process.env.DB_PORT_TEST,
    dialect: process.env.DB_DIALECT_TEST || 'postgres',
  },
  production: {
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_DATABASE_PROD,
    host: process.env.DB_HOST_PROD,
    port: process.env.DB_PORT_PROD,
    dialect: process.env.DB_DIALECT_PROD || 'postgres',
  },
};