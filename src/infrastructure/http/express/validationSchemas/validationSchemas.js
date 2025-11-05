'use strict';

const Joi = require('joi');

const reenviarWebhookSchema = Joi.object({
    product: Joi.string().valid('boleto', 'pagamento', 'pix').required(),
    id: Joi.array().items(Joi.string()).min(1).max(30).required(),
    kind: Joi.string().valid('webhook').required(),
    type: Joi.string().valid('disponivel', 'cancelado', 'pago').required(),
});

module.exports = {
    reenviarWebhookSchema,
};