'use strict';

import Joi from 'joi';

export default class ReenviarWebhookInput {
  constructor({ product, id, kind, type } = {}) {
    this.product = product;
    this.id = id;
    this.kind = kind;
    this.type = type;
  }

  static validate(input) {
    const schema = Joi.object({
      product: Joi.string()
        .valid('boleto', 'pagamento', 'pix')
        .required()
        .messages({
          'any.required': 'O campo "product" é obrigatório.',
          'any.only': 'O campo "product" deve ser boleto, pagamento ou pix.',
        }),

      id: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .max(30)
        .required()
        .messages({
          'array.base': 'O campo "id" deve ser um array de strings.',
          'array.max': 'O campo "id" não pode conter mais de 30 elementos.',
          'any.required': 'O campo "id" é obrigatório.',
        }),

      kind: Joi.string()
        .valid('webhook')
        .required()
        .messages({
          'any.required': 'O campo "kind" é obrigatório.',
          'any.only': 'O campo "kind" deve ser "webhook".',
        }),

      type: Joi.string()
        .valid('disponivel', 'cancelado', 'pago')
        .required()
        .messages({
          'any.required': 'O campo "type" é obrigatório.',
          'any.only': 'O campo "type" deve ser disponivel, cancelado ou pago.',
        }),
    });

    const { error, value } = schema.validate(input, { abortEarly: false });

    if (error) {
      const message = error.details.map((err) => err.message).join(' | ');
      const validationError = new Error(message);
      validationError.status = 400;
      throw validationError;
    }

    return new ReenviarWebhookInput(value);
  }
}
