'use strict';
// Usamos 'import' em vez de 'require'
import { Model } from 'sequelize';

// Usamos 'export default' em vez de 'module.exports'
export default (sequelize, DataTypes) => {
  class SoftwareHouse extends Model {
    static associate(models) {
      // Associações futuras
    }
  }
  SoftwareHouse.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    cnpj: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SoftwareHouse',
  });
  return SoftwareHouse;
};