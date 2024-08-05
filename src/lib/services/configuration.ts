import { createEnvRepository, EnvRepository } from "../repositories/env";

export interface ConfigurationService<T extends Record<string, unknown> = EnvRepository> {
  getEnv: <K extends keyof T>(key: K) => T[K];
}

export const createConfigurationService = <T extends Record<string, unknown>>(envRepository: T): ConfigurationService<T> => {

  return {
    getEnv: <K extends keyof T>(key: K): T[K] => {
      const value = envRepository[key];
      if (!value) {
        throw new Error(`Environment variable ${String(key)} not found`);
      }
      return value;
    },
  };
};

