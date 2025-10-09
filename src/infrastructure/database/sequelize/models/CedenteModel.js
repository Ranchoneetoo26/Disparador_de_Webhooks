// src/infrastructure/database/sequelize/models/CedenteModel.js
'use strict';

module.exports = (sequelize, DataTypes) => {
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
        // representa foreign key para SoftwareHouses; a associação será definida no index
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
      tableName: 'Cedentes', // use o nome da tabela da migration
      timestamps: false,     // ajuste conforme sua migration (se tiver createdAt/updatedAt)
    }
  );

  // Associação placeholder — defina depois no models/index.js
  Cedente.associate = function (models) {
    // Exemplo: Cedente pertence a SoftwareHouse (ajuste nomes conforme seu projeto)
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
