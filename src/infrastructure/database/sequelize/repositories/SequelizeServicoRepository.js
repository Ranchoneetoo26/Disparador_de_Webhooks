'use strict';

import * as dbCjs from '../models/index.cjs';
const db = dbCjs.default;
const { models, Sequelize } = db;
const { Op } = Sequelize;

export default class SequelizeServicoRepository {
    constructor() {
        this.servicoModel = models.Servico;
        this.convenioModel = models.Convenio;
        this.contaModel = models.Conta;

        if (!this.servicoModel || !this.convenioModel || !this.contaModel) {
            throw new Error('Model "Servico", "Convenio" ou "Conta" não carregado em SequelizeServicoRepository');
        }
    }

    /**
     * Busca serviços (boletos, pix, etc.) pelos seus IDs
     * e garante que eles pertençam ao cedente autenticado.
     */
    async findByIdsAndCedente(ids, cedenteId) {
        if (!ids || ids.length === 0 || !cedenteId) {
            return [];
        }

        return this.servicoModel.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            include: [
                {
                    model: this.convenioModel,
                    as: 'convenio',
                    required: true,
                    include: [
                        {
                            model: this.contaModel,
                            as: 'conta',
                            required: true,
                            where: {
                                // Filtro final para garantir que o serviço pertence ao cedente
                                cedente_id: cedenteId
                            }
                        }
                    ]
                }
            ]
        });
    }
}
