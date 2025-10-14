'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cedente extends Model {
    static associate(models) {
      // CORREÇÃO: Usar 'softwarehouse_id' como FK e 'token' para autenticação
      this.belongsTo(models.SoftwareHouse, { foreignKey: 'softwarehouse_id', as: 'softwareHouse' });
      this.hasMany(models.Conta, { foreignKey: 'cedente_id', as: 'contas' });
    }
  }
  Cedente.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    data_criacao: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    cnpj: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    
    // CORREÇÃO 1: O token deve ser STRING para aceitar 'valid_token_ced'
    token: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    
    // CORREÇÃO 2: Adicionar a FK que estava faltando no Model
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