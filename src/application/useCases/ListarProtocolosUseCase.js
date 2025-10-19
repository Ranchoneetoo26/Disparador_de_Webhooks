import { subDays, differenceInDays } from 'date-fns';

import InvalidRequestException from '@/domain/exceptions/InvalidRequestException';

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
            throw new InvalidRequestException('Os filtros "start_date" e "end_date" são obrigatórios.');
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new InvalidRequestException('As datas fornecidas são inválidas.');
        }

        if (startDate > endDate) {
            throw new InvalidRequestException('start_date não pode ser maior que end_date.');
        }

        if (differenceInDays(endDate, startDate) + 1 > 31) {
            throw new InvalidRequestException('O intervalo entre as datas não pode ser maior que 31 dias.');
        }


        const cacheKey = `protocolos:${JSON.stringify(filters)}`;
        try {
            const cachedData = await this.cacheRepository.get(cacheKey);
            if (cachedData) {
                 try {
                     return { success: true, data: JSON.parse(cachedData), source: 'cache' };
                 } catch (parseError) {
                    console.error('Erro ao fazer parse dos dados do cache:', parseError);
                 }
            }
        } catch (cacheError) {
             console.error('Erro ao acessar o cache:', cacheError);
        }

        const protocolos = await this.webhookReprocessadoRepository.findByFilters({
            ...filters,
            startDate,
            endDate
        });

        try {
           await this.cacheRepository.set(cacheKey, JSON.stringify(protocolos), { ttl: 86400 });
        } catch (cacheSetError) {
            console.error('Erro ao salvar dados no cache:', cacheSetError);
        }

        return { success: true, data: protocolos, source: 'database' };
    }
}