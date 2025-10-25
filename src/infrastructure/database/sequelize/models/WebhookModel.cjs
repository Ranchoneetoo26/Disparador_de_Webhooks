"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Webhook extends Model {
    static associate(models) {
      // Definir associações aqui, se houver
      // Exemplo: Se um Webhook pertence a um Cedente
      // Webhook.belongsTo(models.Cedente, { foreignKey: 'cedente_id', as: 'cedente' });
    }
  }

  Webhook.init(
    {
      // Seus campos existentes
      url: {
        type: DataTypes.STRING,
        allowNull: true, // Ou false se for obrigatório
      },
      payload: {
        type: DataTypes.JSON, // Ou DataTypes.TEXT se preferir armazenar como string JSON
        allowNull: true,
      },
      tentativas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: { // Adicionei 'status' que você usa no teste
        type: DataTypes.STRING,
        allowNull: true, // Ou false e defaultValue:'pendente', por exemplo
      },

      // --- INÍCIO DA CORREÇÃO ---
      // Campos que estavam faltando e são usados no seu código/testes
      cedente_id: { // Chave estrangeira para Cedente
        type: DataTypes.INTEGER,
        allowNull: false, // Geralmente obrigatório
        // Se houver associação definida no CedenteModel e aqui:
        // references: {
        //   model: 'cedentes', // Nome da tabela de cedentes
        //   key: 'id'
        // },
        // onUpdate: 'CASCADE',
        // onDelete: 'SET NULL' // ou 'CASCADE' dependendo da regra de negócio
      },
      product: { // O campo que o ReenvioService precisa
        type: DataTypes.STRING,
        allowNull: true, // Defina como false se for obrigatório
      },
      kind: { // Você usa no teste e no controller
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: { // Você usa no teste e no controller
        type: DataTypes.STRING,
        allowNull: true,
      },
      protocolo: { // Você usa no teste
        type: DataTypes.STRING,
        allowNull: true, // Ou false/unique se necessário
      },
      // data_criacao é geralmente gerenciado pelo Sequelize como createdAt
      // Removi 'data_criacao' explícito pois createdAt/updatedAt já existem
      // --- FIM DA CORREÇÃO ---

      // Timestamps gerenciados pelo Sequelize (mantidos)
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'created_at' // Mapeia para snake_case no banco, se preferir
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: 'updated_at' // Mapeia para snake_case no banco, se preferir
      },
    },
    {
      sequelize,
      modelName: "WebhookModel", // Renomeei para corresponder ao seu uso (WebhookModel)
      tableName: "webhooks", // Nome da tabela no banco
      timestamps: true, // Habilita createdAt e updatedAt
      underscored: true, // Usa snake_case para createdAt/updatedAt (created_at, updated_at) e chaves estrangeiras
    }
  );
  return Webhook;
};
