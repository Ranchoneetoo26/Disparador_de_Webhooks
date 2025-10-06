'use strict'
const {
    Model
} = require('sequelize');
const { sequelize } = require('.');

module.exports = (sequelize, DataTypes) => {
    class Conta extends Model {
        static associate(models) {
            this.belongsTo(models.Cedente, {
                foreignKey: 'cedente_id',
                as: 'cedente'
            });
        }
    }
    Conta.init({
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        data_criacao:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        produto:{
            type: DataTypes.STRING,
            allowNull: false
        },
        banco_codigo:{
            type: DataTypes.STRING,
            allowNull: false
        },
        cedente_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model: 'Cedentes',
                key: 'id'
            }
        },
        status:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        configuracao_notificacao:{
            type: DataTypes.JSONB,
            allowNull: true
        }
    },{
        sequelize,
        modelName: 'Conta',
        tableName: 'Contas',
        timestamps: false
    });
    return Conta;
};