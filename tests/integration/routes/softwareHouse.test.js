import { sequelize, models } from "../../../src/infrastructure/database/sequelize/models/index.cjs";
import { describe, expect, afterAll, jest } from '@jest/globals';
const { SoftwareHouse } = models;

describe('Integration: SoftwareHouse Model Tests', () => {
    let createdSoftwareHouse;
    
    jest.setTimeout(10000);

    beforeEach(async () => {
        await sequelize.sync({ force: true });
        
        createdSoftwareHouse = await SoftwareHouse.create({
            data_criacao: new Date(),
            cnpj: '11111111000111',
            token: 'TOKEN_DE_TESTE_SH',
            status: 'ativo'
        });
        
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test('deve criar e recuperar uma SoftwareHouse com dados válidos', async () => {
        const foundSoftwareHouse = await SoftwareHouse.findByPk(createdSoftwareHouse.id);
        
        expect(foundSoftwareHouse).toBeDefined();
        expect(foundSoftwareHouse.cnpj).toBe('11111111000111');
        expect(foundSoftwareHouse.token).toBe('TOKEN_DE_TESTE_SH');
        expect(foundSoftwareHouse.status).toBe('ativo');
    });

    test('não deve permitir a criação de duas SoftwareHouses com o mesmo CNPJ', async () => {
        const invalidPayload = {
            data_criacao: new Date(),
            cnpj: '11111111000111',
            token: 'TOKEN_DUPLICADO',
            status: 'ativo'
        };

        await expect(SoftwareHouse.create(invalidPayload)).rejects.toThrow();
    });
});