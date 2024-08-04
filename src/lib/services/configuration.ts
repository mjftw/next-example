import { createEnvRepository, EnvRepository } from "../repositories/env";

export interface ConfigurationService<T = EnvRepository> {
  getEnv: <K extends keyof T>(key: K) => T[K];
}

export const createConfigurationService = (envRepository: EnvRepository): ConfigurationService<typeof envRepository> => {

  return {
    getEnv: <K extends keyof typeof envRepository>(key: K): (typeof envRepository)[K] => {
      return envRepository[key];
    },
  };
};

