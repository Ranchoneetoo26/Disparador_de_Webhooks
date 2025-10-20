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
            throw new Error('start_date e end_date são obrigatórios.');
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Datas inválidas');
        }

        if (startDate > endDate) {
            throw new Error('start_date não pode ser maior que end_date.');
        }

        const daysDiff = differenceInDays(endDate, startDate);
        if (daysDiff > 31) {
            throw new Error('O intervalo entre as datas não pode ser maior que 31 dias.');
        }

        const restFilters = Object.fromEntries(
            Object.entries(filters).filter(([key]) => !['start_date', 'end_date'].includes(key))
        );
        const cacheKey = `protocolos:${start_date}:${end_date}:${JSON.stringify(restFilters)}`;
        const cachedData = await this.cacheRepository.get(cacheKey);

        if (cachedData) {
            if (typeof cachedData === 'string') {
                return JSON.parse(cachedData);
            }
            return cachedData;
        }

        const protocolos = await this.webhookReprocessadoRepository.listByDateRangeAndFilters({
            startDate,
            endDate,
            filters: restFilters
        });

        await this.cacheRepository.set(cacheKey, protocolos, { ttl: 86400 });

        return protocolos;
    }
}