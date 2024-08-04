import { type Recipe, type RecipeIngredient } from "@prisma/client";
import { type RecipeRepository } from "~/lib/repositories/recipe";

export interface RecipeService {
  getRecipeById: (id: string) => Promise<Recipe | null>;
  createRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt"> & { ingredients: Array<Omit<RecipeIngredient, "id" | "recipeId">> }) => Promise<Recipe>;
  updateRecipe: (id: string, data: Partial<Omit<Recipe, "id" | "authorId">>) => Promise<Recipe>;
  addIngredientToRecipe: (recipeId: string, ingredientData: Omit<RecipeIngredient, "id" | "recipeId">) => Promise<RecipeIngredient>;
  removeIngredientFromRecipe: (recipeId: string, ingredientId: string) => Promise<void>;
  getUserRecipes: (userId: string) => Promise<Recipe[]>;
  getAllRecipes: () => Promise<Recipe[]>;
}

export const createRecipeService = (recipeRepo: RecipeRepository): RecipeService => {
  return {
    getRecipeById: async (id: string) => {
      return recipeRepo.findById(id);
    },
    createRecipe: async (recipe) => {
      return recipeRepo.create(recipe);
    },
    updateRecipe: async (id, data) => {
      return recipeRepo.update(id, data);
    },
    addIngredientToRecipe: async (recipeId, ingredientData) => {
      return recipeRepo.addIngredient(recipeId, ingredientData);
    },
    removeIngredientFromRecipe: async (recipeId, ingredientId) => {
      await recipeRepo.removeIngredient(recipeId, ingredientId);
    },
    getUserRecipes: async (userId) => {
      return recipeRepo.findByUser(userId);
    },
    getAllRecipes: async () => {
      return recipeRepo.findAll();
    },
  };
};