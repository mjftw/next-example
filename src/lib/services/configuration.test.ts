import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createConfigurationService, type ConfigurationService } from './configuration';
import { type EnvRepository } from '../repositories/env';

describe('ConfigurationService', () => {
  const mockEnvRepository: EnvRepository = {
    NODE_ENV: 'test',
    DATABASE_URL: 'mock-db-url',
    RABBITMQ_HOST: 'localhost',
    RABBITMQ_PORT: 5672,
    RABBITMQ_USERNAME: 'guest',
    RABBITMQ_PASSWORD: 'guest',
  };

  let configService: ConfigurationService;

  beforeEach(() => {
    configService = createConfigurationService(mockEnvRepository);
  });

  it('should return the correct environment variable', () => {
    expect(configService.getEnv('NODE_ENV')).toBe('test');
    expect(configService.getEnv('DATABASE_URL')).toBe('mock-db-url');
    expect(configService.getEnv('RABBITMQ_HOST')).toBe('localhost');
    expect(configService.getEnv('RABBITMQ_PORT')).toBe(5672);
  });

  it('should throw an error for non-existent environment variables', () => {
    expect(() => configService.getEnv('NON_EXISTENT_VAR' as keyof typeof mockEnvRepository)).toThrow();
  });
});
