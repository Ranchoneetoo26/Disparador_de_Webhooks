"use strict";

const { Sequelize, models } = require("../models/index.cjs");
const { Op } = Sequelize; // Importe o 'Op' para usar o 'Op.in'

class SequelizeServicoRepository {
  constructor() {
    this.servicoModel = models.Servico;
    this.convenioModel = models.Convenio;
    this.contaModel = models.Conta;

    if (!this.servicoModel || !this.convenioModel || !this.contaModel) {
      throw new Error(
        'Model "Servico", "Convenio" ou "Conta" não carregado em SequelizeServicoRepository'
      );
    }
  }

  /**
   * Busca serviços (boletos, pix, etc.) pelos seus IDs (numero_convenio)
   * e garante que eles pertençam ao cedente autenticado.
   */
  async findByIdsAndCedente(ids, cedenteId) {
    if (!ids || ids.length === 0 || !cedenteId) {
      return [];
    }

    // A consulta foi movida para o 'include' do Convenio
    return this.servicoModel.findAll({
      include: [
        {
          model: this.convenioModel,
          as: "convenio",
          required: true,

          // ===== ESTA É A CORREÇÃO =====
          // A cláusula 'where' foi movida para cá.
          // Estamos filtrando por 'numero_convenio' (assumindo que este é o nome da coluna)
          // que é uma string, em vez de 'Servico.id' (que é um integer).
          where: {
            numero_convenio: {
              [Op.in]: ids,
            },
          },
          // ==============================

          include: [
            {
              model: this.contaModel,
              as: "conta",
              required: true,
              where: {
                cedente_id: cedenteId,
              },
            },
          ],
        },
      ],
      // A cláusula 'where' principal foi removida daqui
    });
  }
}

module.exports = SequelizeServicoRepository;