"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Webhook extends Model {
    static associate(models) {
    }
  }

  Webhook.init(
    {
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      tentativas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: { 
        type: DataTypes.STRING,
        allowNull: true, 
      },

      cedente_id: { 
        type: DataTypes.INTEGER,
        allowNull: false, 
      },
      product: { 
        type: DataTypes.STRING,
        allowNull: true, 
      },
      kind: { 
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      protocolo: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
     
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at' 
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'updated_at' 
      },
    },
    {
      sequelize,
      modelName: "WebhookModel", 
      tableName: "webhooks", 
      timestamps: true, 
      underscored: true, 
    }
  );
  return Webhook;
};
