import { subDays, differenceInDays } from 'date-fns';

export default class ListarProtocolosUseCase {
    constructor({ webhookReprocessadoRepository, cacheRepository }) {
        if (!webhookReprocessadoRepository) {
            throw new Error('webhookReprocessadoRepository is required');
        }
        if (!cacheRepository) {
            throw new Error('cacheRepository is required');
        }
        this.webhookReprocessadoRepository = webhookReprocessadoRepository;
        this.cacheRepository = cacheRepository;
    }

    async execute(filters) {
        const { start_date, end_date } = filters;

        if (!start_date || !end_date) {
            return { success: false, status: 400, error: 'Os filtros "start_date" e "end_date" são obrigatórios.' };
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return { success: false, status: 400, error: 'As datas fornecidas são inválidas.' };
        }
        
        if (differenceInDays(endDate, startDate) > 31) {
            return { success: false, status: 400, error: 'O intervalo entre as datas não pode ser maior que 31 dias.' };
        }

        const cacheKey = `protocolos:${JSON.stringify(filters)}`;
        const cachedData = await this.cacheRepository.get(cacheKey);

        if (cachedData) {
            return { success: true, data: JSON.parse(cachedData), source: 'cache' };
        }

        const protocolos = await this.webhookReprocessadoRepository.findByFilters(filters);

        await this.cacheRepository.set(cacheKey, JSON.stringify(protocolos), 86400);

        return { success: true, data: protocolos, source: 'database' };
    }
}