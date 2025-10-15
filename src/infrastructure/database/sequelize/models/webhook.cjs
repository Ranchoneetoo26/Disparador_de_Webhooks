'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Webhook extends Model {
  
    static associate(models) {
    }
  }
  Webhook.init({
    url: DataTypes.STRING,
    payload: DataTypes.JSON,
    tentativas: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Webhook',
  });
  return Webhook;
};