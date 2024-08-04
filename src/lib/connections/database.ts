import { PrismaClient } from "@prisma/client";
import { type ConfigurationService } from "../services/configuration";
import { type LoggerService } from "../services/logger";

export interface DatabaseConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getClient: () => PrismaClient;
}

export const createDatabaseConnection = (
  configService: ConfigurationService,
  logger: LoggerService
): DatabaseConnection => {
  let client: PrismaClient | null = null;

  return {
    connect: async () => {
      if (!client) {
        logger.info("Initializing database connection");
        client = new PrismaClient({
          log: configService.getEnv("NODE_ENV") === "development" ? ["query", "error", "warn"] : ["error"],
        });
        await client.$connect();
        logger.info("Database connection established");
      } else {
        logger.debug("Database connection already initialized");
      }
    },
    disconnect: async () => {
      if (client) {
        logger.info("Disconnecting from database");
        await client.$disconnect();
        client = null;
        logger.info("Database disconnected");
      } else {
        logger.debug("No active database connection to disconnect");
      }
    },
    getClient: () => {
      if (!client) {
        logger.error("Attempted to access database client before initialization");
        throw new Error("Database connection not initialized");
      }
      return client;
    },
  };
};