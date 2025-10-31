// src/database.js
'use strict';

// --- CORREÇÃO AQUI ---
// Importamos o CJS module como um namespace
import * as dbCjs from './infrastructure/database/sequelize/models/index.cjs';
const db = dbCjs.default; // O export real está no '.default'
// --- FIM DA CORREÇÃO ---

module.exports = db;
module.exports.default = db; // Garante compatibilidade