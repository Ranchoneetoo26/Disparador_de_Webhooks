
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
    // Defina os campos da sua tabela de webhooks
    url: DataTypes.STRING,
    payload: DataTypes.JSON,
    tentativas: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Adicione outros campos como last_status, kind, type, etc., se necessário
  }, {
    sequelize,
    modelName: 'Webhook',
    tableName: 'webhooks', // Nome da tabela no banco de dados
  });
  return Webhook;
};

module.exports = initWebhook;