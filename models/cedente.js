'use strict';

const { sequelize } = require(".");

const {
    model
} = required('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cedente extends Model {

        static associate(model) {
            this.belongsTo(models.softareHouse, {
                foreingKey: 'softwarehouse_id,',
                as: 'softwareHouse'
            });

            this.hasMany(model.Conta, {
                foreingKey: 'cedente_id',
                as: 'contas'
            });
        }
    }
    Cedente.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        data_criacao: {
            type: DataTypes.DATA,
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
        softwarehouse_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'SoftwareHouses',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        configuracao_notificacao: {
            type: DataTypes.JSONB,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Cedente',
        tableName: 'Cedentes',
        timestamps: false
    });
    return Cedente;
};