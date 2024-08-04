import { type PrismaClient, type Recipe, type Ingredient, type RecipeIngredient } from "@prisma/client";

export interface RecipeRepository {
  findById: (id: string) => Promise<Recipe | null>;
  create: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt"> & { ingredients: Array<Omit<RecipeIngredient, "id" | "recipeId" | "ingredientId"> & { ingredient: { name: string } }> }) => Promise<Recipe>;
  update: (id: string, data: Partial<Omit<Recipe, "id" | "authorId">>) => Promise<Recipe>;
  addIngredient: (recipeId: string, ingredientData: Omit<RecipeIngredient, "id" | "recipeId" | "ingredientId"> & { ingredient: { name: string } }) => Promise<RecipeIngredient>;
  removeIngredient: (recipeId: string, ingredientId: string) => Promise<void>;
  findByUser: (userId: string) => Promise<Recipe[]>;
  findAll: () => Promise<Recipe[]>;
}

export const createRecipeRepository = (prisma: PrismaClient): RecipeRepository => {
  return {
    findById: async (id: string) => {
      return prisma.recipe.findUnique({
        where: { id },
        include: { ingredients: { include: { ingredient: true } }, author: true }
      });
    },
    create: async (recipe) => {
      return prisma.recipe.create({
        data: {
          ...recipe,
          ingredients: {
            create: recipe.ingredients.map(ing => ({
              amount: ing.amount,
              ingredient: {
                connectOrCreate: {
                  where: { name: ing.ingredient.name },
                  create: { name: ing.ingredient.name }
                }
              }
            }))
          }
        },
        include: { ingredients: { include: { ingredient: true } } }
      });
    },
    update: async (id, data) => {
      return prisma.recipe.update({
        where: { id },
        data,
        include: { ingredients: { include: { ingredient: true } } }
      });
    },
    addIngredient: async (recipeId, ingredientData) => {
      return prisma.recipeIngredient.create({
        data: {
          recipeId,
          amount: ingredientData.amount,
          ingredient: {
            connectOrCreate: {
              where: { name: ingredientData.ingredient.name },
              create: { name: ingredientData.ingredient.name }
            }
          }
        },
        include: { ingredient: true }
      });
    },
    removeIngredient: async (recipeId, ingredientId) => {
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId, ingredientId }
      });
    },
    findByUser: async (userId) => {
      return prisma.recipe.findMany({
        where: { authorId: userId },
        include: { ingredients: { include: { ingredient: true } } }
      });
    },
    findAll: async () => {
      return prisma.recipe.findMany({
        include: { ingredients: { include: { ingredient: true } }, author: true }
      });
    },
  };
};