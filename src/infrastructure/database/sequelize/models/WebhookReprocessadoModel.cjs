'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WebhookReprocessado extends Model {
    static associate(models) {
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
      type: DataTypes.JSONB, // Mantém JSONB para os dados gerais
      allowNull: false
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
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
    // --- TIPO ALTERADO ABAIXO ---
    servico_id: {
      type: DataTypes.JSONB, // <-- ALTERADO DE TEXT PARA JSONB
      allowNull: false      // Agora pode armazenar o array diretamente
    },
    // --- FIM DA ALTERAÇÃO ---
    protocolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING, // Ex: 'pending', 'sent', 'error'
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'WebhookReprocessado',
    tableName: 'WebhookReprocessados',
    timestamps: false
  });
  return WebhookReprocessado;
};