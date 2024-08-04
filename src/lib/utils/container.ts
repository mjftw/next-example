import { type UserRepository, createUserRepository } from "~/lib/repositories/user";
import { type UserService, createUserService } from "~/lib/services/user";
import { type RecipeRepository, createRecipeRepository } from "~/lib/repositories/recipe";
import { type RecipeService, createRecipeService } from "~/lib/services/recipe";
import { ConfigurationService, createConfigurationService } from "../services/configuration";
import { createEnvRepository, type EnvRepository } from "../repositories/env";
import { createRecipeEventPublisher } from "../events/recipeEventPublisher";
import { type DatabaseConnection, createDatabaseConnection } from "../connections/database";
import { type AMQPConnection, createAMQPConnection } from "../connections/amqp";

export interface ServicesContainer {
  userService: UserService;
  recipeService: RecipeService;
  configService: ConfigurationService;
}

export interface ConnectionsContainer {
  databaseConnection: DatabaseConnection;
  amqpConnection: AMQPConnection;
}

let servicesContainer: Readonly<ServicesContainer> | null = null;
let connectionsContainer: Readonly<ConnectionsContainer> | null = null;

export const initConnections = async (): Promise<ConnectionsContainer> => {
  if (connectionsContainer) {
    return connectionsContainer;
  }

  const envRepository = createEnvRepository();
  const databaseConnection = createDatabaseConnection(envRepository);
  const amqpConnection = createAMQPConnection(envRepository);

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

  const connections = await initConnections();
  const envRepository = createEnvRepository();
  const configService = createConfigurationService(envRepository);

  const userRepository = createUserRepository(connections.databaseConnection.getClient());
  const userService = createUserService(userRepository);

  const recipeRepository = createRecipeRepository(connections.databaseConnection.getClient());
  const recipeEventPublisher = createRecipeEventPublisher(connections.amqpConnection.getClient());
  const recipeService = createRecipeService(recipeRepository, recipeEventPublisher);

  servicesContainer = Object.freeze({
    userService,
    recipeService,
    configService,
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