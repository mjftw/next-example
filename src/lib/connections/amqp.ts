import { AMQPClient, type AMQPChannel } from "@cloudamqp/amqp-client";
import { type EnvRepository } from "../repositories/env";

export interface AMQPConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getClient: () => AMQPClient;
  getChannel: () => Promise<AMQPChannel>;
}

export const createAMQPConnection = (envRepository: EnvRepository): AMQPConnection => {
  let client: AMQPClient | null = null;
  let channel: AMQPChannel | null = null;

  return {
    connect: async () => {
      if (!client) {
        const url = `amqp://${envRepository.RABBITMQ_USERNAME}:${envRepository.RABBITMQ_PASSWORD}@${envRepository.RABBITMQ_HOST}:${envRepository.RABBITMQ_PORT}`;
        client = new AMQPClient(url);
        await client.connect();
      }
    },
    disconnect: async () => {
      if (channel) {
        await channel.close();
        channel = null;
      }
      if (client) {
        await client.close();
        client = null;
      }
    },
    getClient: () => {
      if (!client) {
        throw new Error("AMQP connection not initialized");
      }
      return client;
    },
    getChannel: async () => {
      if (!channel) {
        if (!client) {
          throw new Error("AMQP connection not initialized");
        }
        channel = await client.channel();
      }
      return channel;
    },
  };
};