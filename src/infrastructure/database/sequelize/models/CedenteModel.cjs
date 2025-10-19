'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cedente extends Model {
    static associate(models) {
      
      this.belongsTo(models.SoftwareHouse, { foreignKey: 'softwarehouse_id', as: 'softwareHouse' });
      this.hasMany(models.Conta, { foreignKey: 'cedente_id', as: 'contas' });
    }
  }
  Cedente.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    data_criacao: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    cnpj: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    
    token: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    
    softwarehouse_id: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    status: { type: DataTypes.STRING, allowNull: false },
    configuracao_notificacao: { type: DataTypes.JSONB, allowNull: true },
  }, {
    sequelize,
    modelName: 'Cedente',
    tableName: 'Cedentes',
    timestamps: false
  });
  return Cedente;
};