import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Recipe, type RecipeIngredient } from "@prisma/client";

const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().min(1),
});

export const recipeRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.services.recipeService.getAllRecipes();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.recipeService.getRecipeById(input.id);
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      authorId: z.string(),
      ingredients: z.array(ingredientSchema),
    }))
    .mutation(async ({ ctx: {services: {recipeService}}, input }) => {
      const { ingredients, description,...recipeData } = input;
      return recipeService.createRecipe({
        ...recipeData,
        description: description ?? null,
        ingredients: ingredients.map(ing => ({
          amount: ing.amount,
          ingredient: { name: ing.name }
        }))
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.services.recipeService.updateRecipe(id, data);
    }),

  addIngredient: publicProcedure
    .input(z.object({
      recipeId: z.string(),
      ingredient: ingredientSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.services.recipeService.addIngredientToRecipe(input.recipeId, {
        amount: input.ingredient.amount,
        ingredient: { name: input.ingredient.name }
      });
    }),

  removeIngredient: publicProcedure
    .input(z.object({ recipeId: z.string(), ingredientId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.services.recipeService.removeIngredientFromRecipe(input.recipeId, input.ingredientId);
    }),

  getUserRecipes: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.recipeService.getUserRecipes(input.userId);
    }),
});