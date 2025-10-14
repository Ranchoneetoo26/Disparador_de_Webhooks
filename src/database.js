// src/@database.js
// Shim para garantir que imports/require('@database') resolvam corretamente
module.exports = require('./infrastructure/database/sequelize/models/index.js');
module.exports.default = module.exports;
