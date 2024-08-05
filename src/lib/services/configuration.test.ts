import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createConfigurationService, type ConfigurationService } from './configuration';
import { type EnvRepository } from '../repositories/env';

describe('ConfigurationService', () => {
  const mockEnv = {
    FOO: 'foo',
    BAR: 'bar',
    BAZ: 'baz',
  };

  const configService = createConfigurationService(mockEnv);

  it('should return the correct environment variable', () => {
    expect(configService.getEnv('FOO')).toBe('foo');
    expect(configService.getEnv('BAR')).toBe('bar');
    expect(configService.getEnv('BAZ')).toBe('baz');
  });

  it('should throw an error for non-existent environment variables', () => {
    expect(() => configService.getEnv('NON_EXISTENT_VAR' as keyof typeof mockEnv)).toThrow();
  });
});
