// src/infrastructure/database/sequelize/models/WebhookReprocessadoModel.cjs
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WebhookReprocessado extends Model {
    static associate(models) {
      // A migration define 'cedente_id'
      this.belongsTo(models.Cedente, { foreignKey: 'cedente_id', as: 'cedente' });
    }
  }
  
  WebhookReprocessado.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB, 
      allowNull: false
    },
    // A migration define 'data_criacao' (snake_case)
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // A migration define 'cedente_id' (snake_case)
    cedente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kind: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // A migration define 'servico_id' (snake_case)
    servico_id: {
      type: DataTypes.JSONB,
      allowNull: false      
    },
    protocolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // A migration 'add-status...' define 'status'
    status: {
      type: DataTypes.STRING, 
      allowNull: true
    },
    
    // --- CORREÇÃO AQUI ---
    // A migration define 'createdAt' e 'updatedAt' (camelCase)
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
    // --- FIM DA CORREÇÃO ---
    
  }, {
    sequelize,
    modelName: 'WebhookReprocessado',
    tableName: 'WebhookReprocessados',
    timestamps: true,   // <-- CORRIGIDO (era false)
    underscored: false  // <-- ADICIONADO (para não procurar 'created_at')
  });
  
  return WebhookReprocessado;
};