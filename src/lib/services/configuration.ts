import { createEnvRepository } from "../repositories/env";

export interface ConfigurationService<T> {
  getEnv: <K extends keyof T>(key: K) => T[K];
}

export const createConfigurationService = (): ConfigurationService<typeof envRepository> => {
  const envRepository = createEnvRepository();

  return {
    getEnv: <K extends keyof typeof envRepository>(key: K): (typeof envRepository)[K] => {
      return envRepository[key];
    },
  };
};

