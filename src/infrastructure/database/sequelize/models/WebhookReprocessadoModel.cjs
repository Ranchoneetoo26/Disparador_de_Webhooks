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
      type: DataTypes.JSONB,
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
    servico_id: {
      type: DataTypes.TEXT, // Considerar se JSONB seria melhor se precisar consultar os IDs individualmente
      allowNull: false
    },
    protocolo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // --- CAMPO ADICIONADO ABAIXO ---
    status: {
      type: DataTypes.STRING, // Ex: 'pending', 'sent', 'error'
      allowNull: true // Defina como false e adicione defaultValue se necessário
      // defaultValue: 'pending' // Exemplo se sempre iniciar como pendente
    }
    // --- FIM DO CAMPO ADICIONADO ---
  }, {
    sequelize,
    modelName: 'WebhookReprocessado',
    tableName: 'WebhookReprocessados',
    timestamps: false
  });
  return WebhookReprocessado;
};