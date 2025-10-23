"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Webhook extends Model {
    static associate(models) {}
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

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Webhook",
      tableName: "webhooks",
    }
  );
  return Webhook;
};
