import { EnvRepository } from "../repositories/env";

export interface ConfigurationService<
  T extends Record<string, unknown> = EnvRepository,
> {
  getEnv: <K extends keyof T>(key: K, defaultValue?: T[K]) => T[K];
}

export const createConfigurationService = <T extends Record<string, unknown>>(
  envRepository: T,
): ConfigurationService<T> => {
  return {
    getEnv: <K extends keyof T>(key: K, defaultValue?: T[K]): T[K] => {
      const value = envRepository[key] ?? defaultValue;
      if (!value) {
        throw new Error(
          `Environment variable ${String(key)} not found, and no default value provided`,
        );
      }
      return value;
    },
  };
};
