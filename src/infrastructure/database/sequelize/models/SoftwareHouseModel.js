'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SoftwareHouse extends Model {
    static associate(models) {
      // Comente as linhas da associação temporariamente para o nosso teste
      // this.hasMany(models.Cedente, {
      //   foreignKey: 'token',
      //   as: 'cedentes'
      // }); 
    }
  }
  SoftwareHouse.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    cnpj: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'SoftwareHouse',
    tableName: 'SoftwareHouses',
    timestamps: false
  });
  return SoftwareHouse;
};