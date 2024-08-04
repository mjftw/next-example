import { type Recipe } from "@prisma/client";
import { type AMQPClient, type AMQPChannel } from "@cloudamqp/amqp-client";

export enum RecipeEventType {
  RecipeCreated = 'recipeCreated',
  RecipeUpdated = 'recipeUpdated',
  IngredientAdded = 'ingredientAdded',
  IngredientRemoved = 'ingredientRemoved',
}

export interface RecipeEventPublisher {
  publishRecipeCreated: (recipeId: string) => Promise<void>;
  publishRecipeUpdated: (recipeId: string) => Promise<void>;
  publishIngredientAdded: (recipeId: string, ingredientId: string) => Promise<void>;
  publishIngredientRemoved: (recipeId: string, ingredientId: string) => Promise<void>;
}

export const createRecipeEventPublisher = (amqp: AMQPClient): RecipeEventPublisher => {
  const exchangeName = 'recipe_events';
  const channels: { [key: string]: AMQPChannel } = {};

  const getChannel = async (eventType: RecipeEventType): Promise<AMQPChannel> => {
    if (!channels[eventType]) {
      channels[eventType] = await amqp.channel();
      await channels[eventType].exchangeDeclare(exchangeName, 'topic', { durable: false });
    }
    return channels[eventType];
  };

  const publishEvent = async (eventType: RecipeEventType, routingKey: string, message: string) => {
    const channel = await getChannel(eventType);
    await channel.basicPublish(exchangeName, routingKey, message);
  };

  return {
    publishRecipeCreated: async (recipeId: string) => {
      await publishEvent(RecipeEventType.RecipeCreated, 'recipe.created', JSON.stringify({ recipeId }));
    },

    publishRecipeUpdated: async (recipeId: string) => {
      await publishEvent(RecipeEventType.RecipeUpdated, 'recipe.updated', JSON.stringify({ recipeId }));
    },

    publishIngredientAdded: async (recipeId: string, ingredientId: string) => {
      await publishEvent(RecipeEventType.IngredientAdded, 'recipe.ingredient_added', JSON.stringify({ recipeId, ingredientId }));
    },

    publishIngredientRemoved: async (recipeId: string, ingredientId: string) => {
      await publishEvent(RecipeEventType.IngredientRemoved, 'recipe.ingredient_removed', JSON.stringify({ recipeId, ingredientId }));
    },
  };
};