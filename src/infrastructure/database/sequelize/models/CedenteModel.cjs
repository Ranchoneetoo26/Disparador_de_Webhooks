// src/infrastructure/database/sequelize/models/CedenteModel.cjs
'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cedente extends Model {
    static associate(models) {
      // A FK no 'init' é 'software_house_id', então usamos ela aqui.
      this.belongsTo(models.SoftwareHouse, { foreignKey: 'software_house_id', as: 'softwareHouse' });
      // A FK no 'ContaModel' provavelmente é 'cedente_id'
      this.hasMany(models.Conta, { foreignKey: 'cedente_id', as: 'contas' });
    }
  }
  
  Cedente.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    
    // O nome da propriedade no JS será 'data_criacao' (snake_case)
    // para bater com a coluna do DB
    data_criacao: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW 
    },
    
    cnpj: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    token: { type: DataTypes.STRING, allowNull: false },
    
    // O nome da propriedade no JS será 'software_house_id' (snake_case)
    // para bater com a coluna do DB
    software_house_id: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    
    status: { type: DataTypes.STRING, allowNull: false },
    
    // O nome da propriedade no JS será 'configuracao_notificacao' (snake_case)
    configuracao_notificacao: { 
      type: DataTypes.JSONB, 
      allowNull: true 
    },

    // A migration criou 'createdAt' e 'updatedAt' (camelCase)
    // Então, nós os definimos aqui para que o Sequelize os encontre.
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
    
  }, {
    sequelize,
    modelName: 'Cedente',
    tableName: 'Cedentes',
    timestamps: true,   // <-- MANTÉM (para que o Sequelize use 'createdAt' e 'updatedAt')
    underscored: false, // <-- MANTÉM FALSO (para ele não procurar 'created_at')
  });
  
  return Cedente;
};