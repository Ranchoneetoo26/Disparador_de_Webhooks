// src/infrastructure/http/express/controllers/ReenvioController.js

// Importa o UseCase
import CriarReprocessamentoUseCase from '../../../../application/useCases/CriarReprocessamentoUseCase.js';

// Importa as exceções que o UseCase pode lançar para tratamento específico
import UnprocessableEntityException from '../../../../domain/exceptions/UnprocessableEntityException.js';
import DuplicateRequestException from '../../../../domain/exceptions/DuplicateRequestException.js';
import InvalidRequestException from '../../../../domain/exceptions/InvalidRequestException.js';

// Importa os repositórios necessários para instanciar o UseCase
import {
    webhookReprocessadoRepository,
    redisCacheRepository, // Presume que a implementação real será feita aqui
    servicoRepository      // Presume que foi criado e exportado
} from '../../../database/sequelize/repositories/index.js'; // Ajuste o caminho se necessário

// Instancia o UseCase com suas dependências
// TODO: Adicionar notificationService quando for criado
const criarReprocessamentoUseCase = new CriarReprocessamentoUseCase({
    webhookReprocessadoRepository,
    cacheRepository: redisCacheRepository, // Usando a instância mock/base por enquanto
    servicoRepository
    // notificationService: // injetar aqui
});

export const criarReprocessamento = async (req, res) => {
    // Pega os dados validados do body da requisição
    const { product, id, kind, type } = req.body;

    // Pega o ID do cedente que foi anexado pelo AuthMiddleware
    // Garanta que o AuthMiddleware está sendo usado na rota!
    const cedenteId = req.auth?.cedenteId;

    // Validação extra (caso o middleware falhe ou não seja usado)
    if (!cedenteId) {
        console.error("Erro Crítico: cedenteId não encontrado em req.auth. O AuthMiddleware foi executado?");
        return res.status(401).json({ error: 'Autenticação falhou ou não realizada.' });
    }

    console.log(`Controller: Iniciando reprocessamento para cedente ${cedenteId}`, req.body);

    try {
        // Chama o UseCase passando os dados necessários
        const resultado = await criarReprocessamentoUseCase.execute({
            product,
            id,
            kind,
            type,
            cedenteId
        });

        console.log(`Controller: Reprocessamento criado com sucesso. Protocolo: ${resultado.protocolo}`);

        // Retorna 201 Created com o protocolo, conforme a Regra 3.1
        return res.status(201).json(resultado); // Retorna { protocolo: 'uuid...' }

    } catch (error) {
        console.error("Erro no ReenvioController ao chamar UseCase:", error.message);

        // Trata erros específicos lançados pelo UseCase
        if (error instanceof UnprocessableEntityException) { // 422
             // A mensagem já vem formatada do UseCase
            return res.status(422).json({ error: error.message });
        }
        if (error instanceof DuplicateRequestException) { // 429
            return res.status(429).json({ error: error.message }); // 429 Too Many Requests
        }
         if (error instanceof InvalidRequestException) { // 400 (para erros de lógica interna pegos pelo UseCase)
             return res.status(400).json({ error: error.message });
         }

        // Erro genérico de processamento (Regra 3.1) ou erro inesperado do UseCase/DB
        // O UseCase já lança a mensagem padrão nesse caso
        return res.status(400).json({ error: error.message || "Não foi possível gerar a notificação. Tente novamente mais tarde." });
    }
};