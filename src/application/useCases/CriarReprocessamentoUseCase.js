// src/application/useCases/CriarReprocessamentoUseCase.js
import { v4 as uuidv4 } from 'uuid'; // Para gerar o protocolo

// --- Importe as exceções personalizadas ---
import InvalidRequestException from '@/domain/exceptions/InvalidRequestException.js'; // Já existe
import UnprocessableEntityException from '@/domain/exceptions/UnprocessableEntityException.js'; // Você já tem
import DuplicateRequestException from '@/domain/exceptions/DuplicateRequestException.js'; // Acabamos de criar

// --- Tabela de Mapeamento de Status (Regra 3.1) ---
const statusMap = {
    boleto: { disponivel: 'REGISTRADO', cancelado: 'BAIXADO', pago: 'LIQUIDADO' },
    pagamento: { disponivel: 'SCHEDULED', cancelado: 'CANCELLED', pago: 'PAID' },
    pix: { disponivel: 'ACTIVE', cancelado: 'REJECTED', pago: 'LIQUIDATED' } // Ajustado 'ACTIVE' duplicado
};

class CriarReprocessamentoUseCase {
    constructor({
        webhookReprocessadoRepository,
        cacheRepository,
        servicoRepository // Repositório para buscar os serviços
        // notificationService // Dependência para o serviço que envia o webhook (adicionaremos depois)
    } = {}) {
        if (!webhookReprocessadoRepository) throw new Error('webhookReprocessadoRepository is required');
        if (!cacheRepository) throw new Error('cacheRepository is required');
        if (!servicoRepository) throw new Error('servicoRepository is required');
        // if (!notificationService) throw new Error('notificationService is required');

        this.webhookReprocessadoRepository = webhookReprocessadoRepository;
        this.cacheRepository = cacheRepository;
        this.servicoRepository = servicoRepository;
        // this.notificationService = notificationService;
    }

    /**
     * Executa a criação do registro de reprocessamento.
     * @param {object} input - Dados da requisição.
     * @param {string} input.product - 'boleto', 'pagamento' ou 'pix'.
     * @param {string[]} input.id - Array de IDs dos serviços (até 30).
     * @param {string} input.kind - 'webhook'.
     * @param {string} input.type - 'disponivel', 'cancelado' ou 'pago'.
     * @param {number} input.cedenteId - ID do cedente autenticado.
     * @returns {Promise<{protocolo: string}>} Objeto com o protocolo gerado.
     */
    async execute({ product, id, kind, type, cedenteId } = {}) {
        // --- Validações Iniciais ---
        if (!product || !id || !kind || !type || !cedenteId) {
            throw new InvalidRequestException('Parâmetros inválidos para criar reprocessamento.');
        }
        if (id.length > 30) {
            throw new InvalidRequestException('O número máximo de IDs por requisição é 30.');
        }

        // --- 1. Cache de Requisição (Regra 3.1) ---
        const sortedIds = [...id].sort();
        const cacheKeyData = { product, id: sortedIds, kind, type, cedenteId };
        const cacheKey = `req:${JSON.stringify(cacheKeyData)}`;
        const CACHE_TTL_DUPLICATE_REQUEST = 3600; // 1 hora

        const existingRequest = await this.cacheRepository.get(cacheKey);
        if (existingRequest) {
            console.warn(`Requisição duplicada bloqueada para cedente ${cedenteId} com dados:`, cacheKeyData);
            throw new DuplicateRequestException('Requisição idêntica já processada recentemente. Aguarde 1 hora.');
        }

        // --- 2. Validação da Situação (Regra 3.1) ---
        const expectedStatus = statusMap[product]?.[type];
        if (!expectedStatus) {
            throw new InvalidRequestException(`Tipo de notificação inválido '${type}' para o produto '${product}'.`);
        }

        console.log(`Validando ${id.length} serviço(s) para produto '${product}', tipo '${type}'. Status esperado: '${expectedStatus}'`);

        const servicosEncontrados = await this.servicoRepository.findByIds(id);
        const mapaServicosEncontrados = new Map(servicosEncontrados.map(s => [s.id.toString(), s]));
        const idsIncorretos = [];

        for (const servicoId of id) {
            const servico = mapaServicosEncontrados.get(servicoId);
            if (!servico || servico.status !== expectedStatus) {
                idsIncorretos.push(servicoId);
            }
        }

        if (idsIncorretos.length > 0) {
            const errorMessage = `Não foi possível gerar a notificação. A situação do ${product} diverge do tipo de notificação solicitado.`; // Mensagem exata da Regra 3.1
            console.warn(`Validação de status falhou para cedente ${cedenteId}. IDs incorretos: ${idsIncorretos.join(', ')}`);
            // A Regra 3.1 especifica que a API deve retornar 422 *exibindo ao usuário quais IDs estão incorretos*.
            // Ajustamos a exceção para incluir os IDs, mas a mensagem principal é a do guia.
            // Poderíamos adicionar os IDs a um campo 'details' na exceção se quiséssemos.
            throw new UnprocessableEntityException(errorMessage);
        }
        console.log(`Validação de status OK para cedente ${cedenteId}.`);


        // --- 3. Geração de Protocolo e Persistência (Regra 3.1) ---
        const protocolo = uuidv4();
        console.log(`Protocolo gerado para cedente ${cedenteId}: ${protocolo}`);

        const reprocessamentoData = {
            id: protocolo,
            data: { product, id, kind, type }, // Guarda a requisição original
            data_criacao: new Date(),
            cedente_id: cedenteId,
            kind: kind,
            type: type,
            servico_id: JSON.stringify(id), // Salva como string JSON
            protocolo: protocolo,
            status: 'PENDING' // Status inicial
        };

        try {
            // Salva no banco de dados
            const reprocessadoSalvo = await this.webhookReprocessadoRepository.create(reprocessamentoData);
            console.log(`Registro de reprocessamento salvo no banco para protocolo ${protocolo}`);

            // --- 4. Salvar no Cache de Requisição APÓS sucesso no DB ---
            await this.cacheRepository.set(cacheKey, JSON.stringify({ protocol: protocolo, createdAt: new Date() }), { ttl: CACHE_TTL_DUPLICATE_REQUEST });
            console.log(`Chave de cache salva para bloqueio de duplicatas: ${cacheKey}`);

            // --- 5. Disparar o Webhook (Chamar Serviço de Notificação) ---
            // TODO: Chamar o serviço de notificação aqui, passando `reprocessadoSalvo`
            // Idealmente de forma assíncrona (não esperar a conclusão para responder)
            // Ex: this.notificationService.enviarNotificacao(reprocessadoSalvo).catch(err => console.error('Erro ao iniciar envio de notificação', err));
            console.log("### TODO: Chamar o Serviço de Notificação ###");


            // --- 6. Retornar o Protocolo ---
            return { protocolo: protocolo };

        } catch (dbError) {
            console.error(`Falha ao salvar reprocessamento no banco para cedente ${cedenteId} (Protocolo ${protocolo}):`, dbError);
            // TODO: Implementar log detalhado aqui (Regra 3.1 - Falha no Processamento)
            // logger.error('Falha ao criar registro WebhookReprocessado', { error: dbError, requestData: cacheKeyData });

            // Lança o erro genérico que será pego pelo Controller e retornado como 400 Bad Request
            throw new Error("Não foi possível gerar a notificação. Tente novamente mais tarde.");
        }
    }
}

export default CriarReprocessamentoUseCase;