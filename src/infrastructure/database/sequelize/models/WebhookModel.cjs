// src/infrastructure/database/sequelize/models/WebhookModel.cjs
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Webhook extends Model {
    static associate(models) {
      this.belongsTo(models.Cedente, { foreignKey: 'cedente_id', as: 'cedente' });
    }
  }
  
  Webhook.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    tentativas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Coluna 'cedente_id' (snake_case)
    cedente_id: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    // Colunas de timestamp (camelCase)
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
    
  }, {
    sequelize,
    modelName: 'Webhook',
    tableName: 'Webhooks', 
    timestamps: true,       // <-- MANTÉM (para usar createdAt/updatedAt)
    underscored: false      // <-- ADICIONADO (sobrescreve o global 'true')
  });
  
  return Webhook;
};