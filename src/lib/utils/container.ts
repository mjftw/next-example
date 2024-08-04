import { PrismaClient } from "@prisma/client";
import { type UserRepository, createUserRepository } from "~/lib/repositories/user";
import { type UserService, createUserService } from "~/lib/services/user";
import {ConfigurationService, createConfigurationService } from "../services/configuration";
import { createEnvRepository } from "../repositories/env";

export interface ServicesContainer<T> {
  userService: UserService;
  configService: ConfigurationService<T>;
}

let container: Readonly<ServicesContainer<ReturnType<typeof createEnvRepository>>> | null = null;

export const initServices = (): ServicesContainer<ReturnType<typeof createEnvRepository>> => {
  if (container) {
    return container;
  }

  const configService = createConfigurationService();

  const prisma = new PrismaClient({
    log:
      configService.getEnv("NODE_ENV") === "development" ? ["query", "error", "warn"] : ["error"],
  });

  prisma.$connect();

  const userRepository = createUserRepository(prisma);
  const userService = createUserService(userRepository);

  container = {
    userService,
    configService,
  };

  return Object.freeze(container);
};

export const getServicesContainer = <T = ReturnType<typeof createEnvRepository>>(): Readonly<ServicesContainer<T>> => {
  if (!container) {
    throw new Error("Container not initialized");
  }
  
  return container as Readonly<ServicesContainer<T>>;
};
