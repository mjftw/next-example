import { PrismaClient } from "@prisma/client";
import { type EnvRepository } from "../repositories/env";

export interface DatabaseConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getClient: () => PrismaClient;
}

export const createDatabaseConnection = (envRepository: EnvRepository): DatabaseConnection => {
  let client: PrismaClient | null = null;

  return {
    connect: async () => {
      if (!client) {
        client = new PrismaClient({
          log: envRepository.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        });
        await client.$connect();
      }
    },
    disconnect: async () => {
      if (client) {
        await client.$disconnect();
        client = null;
      }
    },
    getClient: () => {
      if (!client) {
        throw new Error("Database connection not initialized");
      }
      return client;
    },
  };
};