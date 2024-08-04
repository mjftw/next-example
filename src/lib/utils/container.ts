import { type UserRepository, createUserRepository } from "~/lib/repositories/user";
import { type UserService, createUserService } from "~/lib/services/user";
import { type RecipeRepository, createRecipeRepository } from "~/lib/repositories/recipe";
import { type RecipeService, createRecipeService } from "~/lib/services/recipe";
import { ConfigurationService, createConfigurationService } from "../services/configuration";
import { createEnvRepository, type EnvRepository } from "../repositories/env";
import { createRecipeEventPublisher } from "../events/recipeEventPublisher";
import { type DatabaseConnection, createDatabaseConnection } from "../connections/database";
import { type AMQPConnection, createAMQPConnection } from "../connections/amqp";
import { createLoggerService, LoggerService } from "../services/logger";

export interface ServicesContainer {
  userService: UserService;
  recipeService: RecipeService;
  configService: ConfigurationService;
  logger: LoggerService;
}

export interface ConnectionsContainer {
  databaseConnection: DatabaseConnection;
  amqpConnection: AMQPConnection;
}

let servicesContainer: Readonly<ServicesContainer> | null = null;
let connectionsContainer: Readonly<ConnectionsContainer> | null = null;

export const initConnections = async (configService: ConfigurationService, logger: LoggerService): Promise<ConnectionsContainer> => {
  if (connectionsContainer) {
    return connectionsContainer;
  }


  const databaseConnection = createDatabaseConnection(configService, logger);
  const amqpConnection = createAMQPConnection(configService, logger);

  await databaseConnection.connect();
  await amqpConnection.connect();

  connectionsContainer = Object.freeze({
    databaseConnection,
    amqpConnection,
  });

  return connectionsContainer;
};

export const initServices = async (): Promise<ServicesContainer> => {
  if (servicesContainer) {
    return servicesContainer;
  }

  const envRepository = createEnvRepository();
  const configService = createConfigurationService(envRepository);

  const logger = createLoggerService(configService);

  const connections = await initConnections(configService, logger);
  const databaseClient = connections.databaseConnection.getClient();
  const amqpClient = connections.amqpConnection.getClient();

  const userRepository = createUserRepository(databaseClient);
  const userService = createUserService(userRepository);

  const recipeRepository = createRecipeRepository(databaseClient);
  const recipeEventPublisher = createRecipeEventPublisher(amqpClient);
  const recipeService = createRecipeService(recipeRepository, recipeEventPublisher);


  servicesContainer = Object.freeze({
    userService,
    recipeService,
    configService,
    logger,
  });

  return servicesContainer;
};

export const getServicesContainer = (): Readonly<ServicesContainer> => {
  if (!servicesContainer) {
    throw new Error("Services container not initialized");
  }
  
  return servicesContainer;
};

export const getConnectionsContainer = (): Readonly<ConnectionsContainer> => {
  if (!connectionsContainer) {
    throw new Error("Connections container not initialized");
  }
  
  return connectionsContainer;
};