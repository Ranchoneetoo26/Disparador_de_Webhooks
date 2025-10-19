import { subDays, differenceInDays } from 'date-fns';
import InvalidRequestException from '../../domain/exceptions/InvalidRequestException.js';

export class ListarProtocolosUseCase {
  constructor({ webhookReprocessadoRepository, cacheRepository } = {}) {
    if (!webhookReprocessadoRepository) {
      throw new Error('webhookReprocessadoRepository is required');
    }
    this.webhookReprocessadoRepository = webhookReprocessadoRepository;
    this.cacheRepository = cacheRepository;
  }

  async execute({ start_date, end_date, ...filters } = {}) {
    if (!start_date) throw new InvalidRequestException('start_date is required');
    if (!end_date) throw new InvalidRequestException('end_date is required');

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new InvalidRequestException('Invalid date format');
    }

    if (start > end) {
      throw new InvalidRequestException('start_date must be before or equal to end_date');
    }

    const diffMs = end - start;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 31) {
      throw new InvalidRequestException('Date range must be at most 31 days');
    }

    const cacheKey = `listar:${start_date}:${end_date}:${JSON.stringify(filters)}`;

    if (this.cacheRepository && typeof this.cacheRepository.get === 'function') {
      try {
        const cached = await this.cacheRepository.get(cacheKey);
        if (cached) return cached;
      } catch (e) {
      }
    }

    const repo = this.webhookReprocessadoRepository;
    const candidates = [
      'findBetweenDates',
      'listByDateRange',
      'findByDateRange',
      'find',
      'list',
      'findAll',
      'getAll'
    ];

    let result = null;
    for (const name of candidates) {
      if (typeof repo[name] === 'function') {
        result = await repo[name]({ start_date, end_date, ...filters });
        break;
      }
    }

    if (result === null && typeof repo.findAll === 'function') {
      result = await repo.findAll({ start_date, end_date, ...filters });
    }

    if (this.cacheRepository && typeof this.cacheRepository.set === 'function') {
      try {
        await this.cacheRepository.set(cacheKey, result);
      } catch (e) {}
    }

    return result;
  }
}

export default ListarProtocolosUseCase;
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',

  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },

  moduleFileExtensions: ['js', 'cjs', 'json', 'node'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@database$': '<rootDir>/src/infrastructure/database/index.cjs',
    '^@database/(.*)$': '<rootDir>/src/infrastructure/database/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  moduleDirectories: ['node_modules', 'src'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  transformIgnorePatterns: ['/node_modules/'],
  clearMocks: true
};