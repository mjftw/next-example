import { AMQPClient, type AMQPChannel } from "@cloudamqp/amqp-client";
import { type ConfigurationService } from "../services/configuration";
import { type LoggerService } from "../services/logger";

export interface AMQPConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getClient: () => AMQPClient;
  getChannel: () => Promise<AMQPChannel>;
}

export const createAMQPConnection = (
  configService: ConfigurationService,
  logger: LoggerService
): AMQPConnection => {
  let client: AMQPClient | null = null;
  let channel: AMQPChannel | null = null;

  return {
    connect: async () => {
      if (!client) {
        logger.info("Initializing AMQP connection");
        const url = `amqp://${configService.getEnv("RABBITMQ_USERNAME")}:${configService.getEnv("RABBITMQ_PASSWORD")}@${configService.getEnv("RABBITMQ_HOST")}:${configService.getEnv("RABBITMQ_PORT")}`;
        client = new AMQPClient(url);
        try {
          await client.connect();
          logger.info("AMQP connection established");
        } catch (error) {
          logger.error("Failed to establish AMQP connection", { url }, error as Error);
          throw error;
        }
      } else {
        logger.debug("AMQP connection already initialized");
      }
    },
    disconnect: async () => {
      logger.info("Disconnecting from AMQP");
      if (channel) {
        try {
          await channel.close();
          channel = null;
          logger.debug("AMQP channel closed");
        } catch (error) {
          logger.error("Error closing AMQP channel", {}, error as Error);
        }
      }
      if (client) {
        try {
          await client.close();
          client = null;
          logger.info("AMQP connection closed");
        } catch (error) {
          logger.error("Error closing AMQP connection", {}, error as Error);
        }
      }
    },
    getClient: () => {
      if (!client) {
        logger.error("Attempted to access AMQP client before initialization");
        throw new Error("AMQP connection not initialized");
      }
      return client;
    },
    getChannel: async () => {
      if (!channel) {
        if (!client) {
          logger.error("Attempted to create AMQP channel before client initialization");
          throw new Error("AMQP connection not initialized");
        }
        try {
          channel = await client.channel();
          logger.debug("New AMQP channel created");
        } catch (error) {
          logger.error("Failed to create AMQP channel", {}, error as Error);
          throw error;
        }
      }
      return channel;
    },
  };
};