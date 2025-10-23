'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => { 
  class Webhook extends Model {
    static associate(models) {
      // Associações definidas em outro lugar
    }
  }

  Webhook.init({
    url: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true 
    },
    tentativas: {
      type: DataTypes.INTEGER,
      allowNull: false, 
      defaultValue: 0
    },
    kind: { // Adicionando o campo 'kind' que o Use Case usa
      type: DataTypes.STRING,
      allowNull: false
    },
    type: { // Adicionando o campo 'type' que o Use Case usa
        type: DataTypes.STRING,
        allowNull: false
    },
    status_servico: { // <--- CAMPO CRÍTICO ADICIONADO (Status real do boleto)
        type: DataTypes.STRING,
        allowNull: false
    },
    cedente_id: { // Adicionando a foreign key que faltava
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // Removendo data_criacao, que será tratado pelo Sequelize
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      field: 'data_criacao' // Mantendo o nome da coluna do DB consistente com seu teste
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      field: 'data_atualizacao'
    }
  }, {
    sequelize,
    modelName: 'Webhook',
    tableName: 'Webhooks', 
    // Usamos underscored: true em modelos Sequelize se as colunas forem snake_case (cedente_id, data_criacao)
    underscored: true
  });
  return Webhook;
};
