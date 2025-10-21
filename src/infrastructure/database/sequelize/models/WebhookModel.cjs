'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => { // Alterado para receber sequelize diretamente
  class Webhook extends Model {
    static associate(models) {
      // Defina associações aqui se necessário no futuro
      // Exemplo: this.belongsTo(models.Cedente, { foreignKey: 'cedente_id', as: 'cedente' });
    }
  }

  Webhook.init({
    // ID já é adicionado por padrão pelo Sequelize como primary key
    url: {
      type: DataTypes.STRING,
      allowNull: true // Ou false, dependendo da regra
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true // Ou false
    },
    tentativas: {
      type: DataTypes.INTEGER,
      allowNull: false, // Garantir que não seja nulo
      defaultValue: 0
    },
    // Adicionado cedente_id se for necessário associar
    // cedente_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true, // Ou false, dependendo se todo webhook tem cedente
    //   references: {
    //     model: 'Cedentes',
    //     key: 'id'
    //   }
    // },
     // Adicionados campos da migration que faltavam na definição original
     createdAt: {
       allowNull: false,
       type: DataTypes.DATE
     },
     updatedAt: {
       allowNull: false,
       type: DataTypes.DATE
     }
  }, {
    sequelize,
    modelName: 'Webhook',
    tableName: 'Webhooks', 
  });
  return Webhook;
};