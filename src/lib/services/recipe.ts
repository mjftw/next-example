import { type Recipe, type RecipeIngredient } from "@prisma/client";
import { type RecipeRepository } from "~/lib/repositories/recipe";
import { type RecipeEventPublisher } from "~/lib/events/recipeEventPublisher";

export interface RecipeService {
  getRecipeById: (id: string) => Promise<Recipe | null>;
  getLatestRecipe: () => Promise<Recipe | null>;
  createRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt"> & { ingredients: Array<Omit<RecipeIngredient, "id" | "recipeId" | "ingredientId"> & { ingredient: { name: string } }> }) => Promise<Recipe>;
  updateRecipe: (id: string, data: Partial<Omit<Recipe, "id" | "authorId">>) => Promise<Recipe>;
  addIngredientToRecipe: (recipeId: string, ingredientData: Omit<RecipeIngredient, "id" | "recipeId" | "ingredientId"> & { ingredient: { name: string } }) => Promise<RecipeIngredient>;
  removeIngredientFromRecipe: (recipeId: string, ingredientId: string) => Promise<void>;
  getUserRecipes: (userId: string) => Promise<Recipe[]>;
  getAllRecipes: () => Promise<Recipe[]>;
}

export const createRecipeService = (recipeRepo: RecipeRepository, eventPublisher: RecipeEventPublisher): RecipeService => {
  return {
    getRecipeById: async (id: string) => {
      return recipeRepo.findById(id);
    },
    getLatestRecipe: async () => {
      return recipeRepo.findLatest();
    },
    createRecipe: async (recipe) => {
      const createdRecipe = await recipeRepo.create(recipe);
      eventPublisher.publishRecipeCreated(createdRecipe.id);
      return createdRecipe;
    },
    updateRecipe: async (id, data) => {
      const updatedRecipe = await recipeRepo.update(id, data);
      eventPublisher.publishRecipeUpdated(updatedRecipe.id);
      return updatedRecipe;
    },
    addIngredientToRecipe: async (recipeId, ingredientData) => {
      const addedIngredient = await recipeRepo.addIngredient(recipeId, ingredientData);
      eventPublisher.publishIngredientAdded(recipeId, addedIngredient.id);
      return addedIngredient;
    },
    removeIngredientFromRecipe: async (recipeId, ingredientId) => {
      await recipeRepo.removeIngredient(recipeId, ingredientId);
      eventPublisher.publishIngredientRemoved(recipeId, ingredientId);
    },
    getUserRecipes: async (userId) => {
      return recipeRepo.findByUser(userId);
    },
    getAllRecipes: async () => {
      return recipeRepo.findAll();
    },
  };
};