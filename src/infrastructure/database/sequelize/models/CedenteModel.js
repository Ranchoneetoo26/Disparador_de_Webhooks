// src/infrastructure/database/sequelize/models/CedenteModel.js
'use strict';

export default (sequelize, DataTypes) => {
  const Cedente = sequelize.define(
    'Cedente',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      data_criacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      cnpj: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true,
      },
      token: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // representa foreign key para SoftwareHouses; a associação é definida no index
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      configuracao_notificacao: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: 'Cedentes', // mantenha o nome conforme suas migrations
      timestamps: false,     // ajuste se usar createdAt/updatedAt
    }
  );

  Cedente.associate = function (models) {
    if (models.SoftwareHouse) {
      Cedente.belongsTo(models.SoftwareHouse, {
        foreignKey: 'token',
        targetKey: 'id',
        as: 'softwareHouse',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });
    }
  };

  return Cedente;
};
