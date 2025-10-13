'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Conta extends Model {
        static associate(models) {
            this.belongsTo(models.Cedente, { foreignKey: 'cedente_id', as: 'cedente' });
            this.hasMany(models.Convenio, { foreignKey: 'conta_id', as: 'convenios' });
        }
    }
    Conta.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        data_criacao: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        produto: { type: DataTypes.STRING, allowNull: false },
        banco_codigo: { type: DataTypes.STRING, allowNull: false },
        cedente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: { type: DataTypes.STRING, allowNull: false },
        configuracao_notificacao: { type: DataTypes.JSONB, allowNull: true }
    }, {
        sequelize,
        modelName: 'Conta',
        tableName: 'Contas',
        timestamps: false
    });
    return Conta;
};