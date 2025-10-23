// src/services/webhookService.js
import axios from 'axios';
import { resolveNotificationConfig } from './notificationConfigResolver.js'; // Importa o resolver

// Importa todos os repositórios necessários
import {
    servicoRepository,
    convenioRepository,      // <<< Garanta que foi criado e exportado
    contaRepository,         // <<< Garanta que foi criado e exportado
    cedenteRepository,
    softwareHouseRepository,
    webhookReprocessadoRepository // Para atualizar o status
} from '../infrastructure/database/sequelize/repositories/index.js'; // Ajuste o caminho se necessário

// Verifica se todos os repositórios foram importados corretamente
if (!servicoRepository || !convenioRepository || !contaRepository || !cedenteRepository || !softwareHouseRepository || !webhookReprocessadoRepository) {
    console.error("ERRO CRÍTICO: Um ou mais repositórios não foram importados corretamente no webhookService.js. Verifique as exportações em repositories/index.js.");
    // Em um cenário real, poderia lançar um erro aqui para impedir a inicialização.
}


class NotificationService {
    constructor() {
        // As dependências (repositórios) são importadas diretamente no módulo
    }

    /**
     * Envia a notificação de webhook com base nos dados salvos.
     * Atualiza o status do registro WebhookReprocessado.
     * Roda de forma assíncrona ("fire and forget") quando chamado pelo UseCase.
     * @param {object} webhookReprocessado - O objeto salvo no banco de dados.
     */
    async enviarNotificacao(webhookReprocessado) {
        const { id: protocolo, cedente_id, servico_id: servicoIdJson, data: payloadOriginal } = webhookReprocessado;

        console.log(`[NotificationService] Iniciando envio para protocolo: ${protocolo}`);

        try {
            // --- 1. Buscar Entidades Relacionadas ---
            let servicoIds;
            try {
                servicoIds = JSON.parse(servicoIdJson);
            } catch (e) {
                throw new Error(`Falha ao parsear servico_id JSON: ${servicoIdJson}`);
            }

            if (!Array.isArray(servicoIds) || servicoIds.length === 0) {
                throw new Error('Lista de IDs de serviço está vazia ou inválida.');
            }
            const primeiroServicoId = servicoIds[0];

            // Busca Sequencial (pode otimizar com includes do Sequelize se performance for crítica)
            const servico = await servicoRepository.findById(primeiroServicoId);
            if (!servico) throw new Error(`Serviço com ID ${primeiroServicoId} não encontrado.`);

            const convenio = await convenioRepository.findById(servico.convenio_id);
            if (!convenio) throw new Error(`Convênio com ID ${servico.convenio_id} (do Serviço ${servico.id}) não encontrado.`);

            const conta = await contaRepository.findById(convenio.conta_id);
            if (!conta) throw new Error(`Conta com ID ${convenio.conta_id} (do Convênio ${convenio.id}) não encontrada.`);

            // Confirma se o cedente_id da conta bate com o do webhookReprocessado (sanidade)
            if (conta.cedente_id !== cedente_id) {
                 console.warn(`[NotificationService] Alerta: Cedente ID da Conta (${conta.cedente_id}) difere do Cedente ID do Reprocessamento (${cedente_id}) para protocolo ${protocolo}`);
                 // Continuar ou lançar erro? Por segurança, vamos lançar erro.
                 throw new Error(`Inconsistência de dados: Cedente ID da Conta (${conta.cedente_id}) não corresponde ao ID (${cedente_id}) do registro de reprocessamento.`);
            }

            const cedente = await cedenteRepository.findById(cedente_id);
            if (!cedente) throw new Error(`Cedente com ID ${cedente_id} não encontrado.`);

            const softwareHouse = await softwareHouseRepository.findById(cedente.softwarehouse_id);
            if (!softwareHouse) throw new Error(`SoftwareHouse com ID ${cedente.softwarehouse_id} (do Cedente ${cedente.id}) não encontrada.`);

            // --- 2. Resolver Configuração de Notificação (Regra 3.4) ---
            const config = resolveNotificationConfig({ conta, cedente }); // Usa a função importada
            const targetUrl = config?.url;

            if (!targetUrl) {
                console.warn(`[NotificationService] URL de notificação não configurada para Cedente ${cedente_id} / Conta ${conta.id}. Protocolo: ${protocolo}`);
                await this.atualizarStatus(protocolo, 'FAILED', 'URL não configurada');
                return; // Interrompe o envio
            }

            // --- 3. Montar Headers (Regra 3.5 e Config Adicional) ---
            const headers = {
                'cnpj-sh': softwareHouse.cnpj,
                'token-sh': softwareHouse.token,
                'cnpj-cedente': cedente.cnpj,
                'token-cedente': cedente.token,
                // Trata headers_adicionais (espera um array de objetos [{chave: valor}])
                ...(config.headers_adicionais && Array.isArray(config.headers_adicionais) && config.headers_adicionais.length > 0
                    ? config.headers_adicionais.reduce((acc, headerObj) => ({ ...acc, ...headerObj }), {})
                    : {}),
            };

            // Garante que Content-Type exista, priorizando o dos headers adicionais se houver
            const contentTypeKey = Object.keys(headers).find(key => key.toLowerCase() === 'content-type');
            if (!contentTypeKey) {
                headers['Content-Type'] = 'application/json';
            } else if (contentTypeKey !== 'Content-Type') {
                // Padroniza para 'Content-Type' se a chave original for diferente (ex: 'content-type')
                headers['Content-Type'] = headers[contentTypeKey];
                if(contentTypeKey.toLowerCase() === 'content-type' && contentTypeKey !== 'Content-Type') {
                   delete headers[contentTypeKey];
                }
            }


            // --- 4. Enviar Requisição com Axios ---
            const requestData = payloadOriginal.data || payloadOriginal; // Usa payloadOriginal.data se existir, senão o objeto todo
            console.log(`[NotificationService] Enviando POST para ${targetUrl} - Protocolo: ${protocolo}`);
            // console.log('[NotificationService] Headers:', JSON.stringify(headers, null, 2)); // Log detalhado (opcional)
            // console.log('[NotificationService] Payload:', JSON.stringify(requestData, null, 2)); // Log detalhado (opcional)

            const response = await axios.post(targetUrl, requestData, {
                headers: headers,
                timeout: config.timeout || 5000, // Usa timeout da config ou default
                validateStatus: (status) => status >= 200 && status < 300, // Sucesso apenas para 2xx
            });

            console.log(`[NotificationService] Sucesso no envio. Status: ${response.status} - Protocolo: ${protocolo}`);
            await this.atualizarStatus(protocolo, 'SENT', `Status: ${response.status}`);

        } catch (error) {
            let status = 'FAILED';
            let errorMessage = error.message || 'Erro desconhecido';

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error(`[NotificationService] Erro na resposta do webhook: Status ${error.response.status} - Protocolo: ${protocolo}`, error.response.data);
                    errorMessage = `Erro HTTP: ${error.response.status}`;
                } else if (error.request) {
                    console.error(`[NotificationService] Sem resposta (Timeout/Rede) - Protocolo: ${protocolo}`, error.code || error.message);
                    errorMessage = (error.code === 'ECONNABORTED' || error.message.includes('timeout')) ? 'Timeout' : 'Erro de rede';
                } else {
                    console.error(`[NotificationService] Erro ao configurar Axios - Protocolo: ${protocolo}`, error.message);
                    errorMessage = 'Erro config Axios';
                }
            } else {
                // Erro interno (busca no banco, parse JSON, etc.)
                console.error(`[NotificationService] Erro interno - Protocolo: ${protocolo}:`, error);
                // Mantém a mensagem original do erro interno
            }
            await this.atualizarStatus(protocolo, status, errorMessage);
        }
    }

    /**
     * Atualiza o status e opcionalmente detalhes/log no banco.
     */
    async atualizarStatus(protocolo, novoStatus, detalhes = '') {
        try {
            // TODO: Se quiser guardar 'detalhes', adicione um campo na tabela/model/migration
            // e passe-o aqui: { status: novoStatus, detalhes: detalhes }
            const [affectedRows] = await webhookReprocessadoRepository.updateStatus(protocolo, novoStatus);
            if (affectedRows > 0) {
                 console.log(`[NotificationService] Status do protocolo ${protocolo} atualizado para ${novoStatus}. Detalhes: ${detalhes}`);
            } else {
                 console.warn(`[NotificationService] Protocolo ${protocolo} não encontrado para atualizar status para ${novoStatus}.`);
            }
        } catch (updateError) {
            console.error(`[NotificationService] FALHA AO ATUALIZAR status para ${novoStatus} do protocolo ${protocolo}:`, updateError);
        }
    }
}

// Exporta uma instância única
export default new NotificationService();