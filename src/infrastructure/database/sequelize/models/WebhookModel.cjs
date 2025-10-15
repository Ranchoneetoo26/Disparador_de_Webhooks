
'use strict';
const { Model, DataTypes } = require('sequelize');

class Webhook extends Model {
  static associate(models) {
    // Defina associações aqui, se houver.
    // Ex: this.belongsTo(models.Cedente, { foreignKey: 'cedente_id' });
  }
}

const initWebhook = (sequelize) => {
  Webhook.init({

    url: DataTypes.STRING,
    payload: DataTypes.JSON,
    tentativas: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

  }, {
    sequelize,
    modelName: 'Webhook',
    tableName: 'webhooks', 
  });
  return Webhook;
};

module.exports = initWebhook;