// src/infrastructure/http/express/validationSchemas/reenvioSchema.js
import Joi from 'joi';

// Schema de validação para a rota POST /reenviar
export const reenviarSchema = Joi.object({
    product: Joi.string().valid('boleto', 'pagamento', 'pix').required(),
    id: Joi.array().items(Joi.string()).min(1).max(30).required(),
    kind: Joi.string().valid('webhook').required(), // Por enquanto só aceita 'webhook'
    type: Joi.string().valid('disponivel', 'cancelado', 'pago').required()
});

// Middleware para usar o schema
export function validateReenvio(req, res, next) {
    const { error } = reenviarSchema.validate(req.body);
    if (error) {
        // Retorna erro 400 Bad Request se a validação falhar
        return res.status(400).json({ error: 'Dados de entrada inválidos.', details: error.details.map(d => d.message) });
    }
    next(); // Se válido, continua para o controller
}