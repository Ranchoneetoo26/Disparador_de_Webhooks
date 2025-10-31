'use strict';

import * as dbCjs from './infrastructure/database/sequelize/models/index.cjs';
const db = dbCjs.default; 

module.exports = db;
module.exports.default = db; 