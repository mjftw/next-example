import { describe, test, expect, vi, beforeEach, Mocked } from 'vitest';
import { createRecipeService, type RecipeService } from './recipe';
import { type RecipeRepository } from '../repositories/recipe';
import { type RecipeEventPublisher } from '../events/recipeEventPublisher';
import { type Recipe, type RecipeIngredient } from '@prisma/client';

describe('RecipeService', () => {
  const mockRecipe: Recipe = {
    id: '1',
    name: 'Test Recipe',
    description: 'A test recipe',
    authorId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockIngredient: RecipeIngredient = {
    id: '1',
    recipeId: '1',
    ingredientId: 'ing1',
    amount: '100g',
  };


  const createMockRecipeService = () => {
    const mockRecipeRepository: Mocked<RecipeRepository> = {
      findById: vi.fn().mockResolvedValue(mockRecipe),
      create: vi.fn().mockResolvedValue(mockRecipe),
      update: vi.fn().mockResolvedValue(mockRecipe),
      addIngredient: vi.fn().mockResolvedValue(mockIngredient),
      removeIngredient: vi.fn().mockResolvedValue(void 0),
      findByUser: vi.fn().mockResolvedValue([mockRecipe]),
      findAll: vi.fn().mockResolvedValue([mockRecipe]),
    };

    const mockEventPublisher: Mocked<RecipeEventPublisher> = {
      publishRecipeCreated: vi.fn().mockResolvedValue(void 0),
      publishRecipeUpdated: vi.fn().mockResolvedValue(void 0),
      publishIngredientAdded: vi.fn().mockResolvedValue(void 0),
      publishIngredientRemoved: vi.fn().mockResolvedValue(void 0),
    };

    const recipeService = createRecipeService(mockRecipeRepository, mockEventPublisher);
    return { recipeService, mockRecipeRepository, mockEventPublisher };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecipeById', () => {
    test('should return a recipe when found', async () => {
      const { recipeService, mockRecipeRepository } = createMockRecipeService();
      const result = await recipeService.getRecipeById('1');
      expect(result).toEqual(mockRecipe);
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith('1');
    });

    test('should return null when recipe is not found', async () => {
      const { recipeService, mockRecipeRepository } = createMockRecipeService();
      mockRecipeRepository.findById.mockResolvedValueOnce(null);
      const result = await recipeService.getRecipeById('2');
      expect(result).toBeNull();
      expect(mockRecipeRepository.findById).toHaveBeenCalledWith('2');
    });
  });

  describe('createRecipe', () => {
    test('should create a new recipe and publish event', async () => {
      const newRecipeData = {
        name: 'New Recipe',
        description: 'A new recipe',
        authorId: 'user1',
        ingredients: [{ amount: '200g', ingredient: { name: 'Flour' } }],
      };
      const { recipeService, mockRecipeRepository, mockEventPublisher } = createMockRecipeService();
      await recipeService.createRecipe(newRecipeData);
      expect(mockRecipeRepository.create).toHaveBeenCalledWith(newRecipeData);
      expect(mockEventPublisher.publishRecipeCreated).toHaveBeenCalledWith(mockRecipe.id);
    });
  });

  describe('updateRecipe', () => {
    test('should update a recipe and publish event', async () => {
      const { recipeService, mockRecipeRepository, mockEventPublisher } = createMockRecipeService();
      const updateData = { name: 'Updated Recipe' };
      await recipeService.updateRecipe('1', updateData);
      expect(mockRecipeRepository.update).toHaveBeenCalledWith('1', updateData);
      expect(mockEventPublisher.publishRecipeUpdated).toHaveBeenCalledWith('1');
    });
  });

  describe('addIngredientToRecipe', () => {
    test('should add an ingredient to a recipe and publish event', async () => {
      const ingredientData = { amount: '50g', ingredient: { name: 'Sugar' } };
      const { recipeService, mockRecipeRepository, mockEventPublisher } = createMockRecipeService();
      await recipeService.addIngredientToRecipe('1', ingredientData);
      expect(mockRecipeRepository.addIngredient).toHaveBeenCalledWith('1', ingredientData);
      expect(mockEventPublisher.publishIngredientAdded).toHaveBeenCalledWith('1', mockIngredient.id);
    });
  });

  describe('removeIngredientFromRecipe', () => {
    test('should remove an ingredient from a recipe and publish event', async () => {
      const { recipeService, mockRecipeRepository, mockEventPublisher } = createMockRecipeService();
      await recipeService.removeIngredientFromRecipe('1', 'ing1');
      expect(mockRecipeRepository.removeIngredient).toHaveBeenCalledWith('1', 'ing1');
      expect(mockEventPublisher.publishIngredientRemoved).toHaveBeenCalledWith('1', 'ing1');
    });
  });

  describe('getUserRecipes', () => {
    test('should return recipes for a user', async () => {
      const { recipeService, mockRecipeRepository } = createMockRecipeService();
      const result = await recipeService.getUserRecipes('user1');
      expect(result).toEqual([mockRecipe]);
      expect(mockRecipeRepository.findByUser).toHaveBeenCalledWith('user1');
    });
  });

  describe('getAllRecipes', () => {
    test('should return all recipes', async () => {
      const { recipeService, mockRecipeRepository } = createMockRecipeService();
      const result = await recipeService.getAllRecipes();
      expect(result).toEqual([mockRecipe]);
      expect(mockRecipeRepository.findAll).toHaveBeenCalled();
    });
  });
});
