import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { recipeRouter } from './recipe';
import { type RecipeService } from '../../../lib/services/recipe';

// Mock the RecipeService
const mockRecipeService: Mocked<RecipeService> = {
  getRecipeById: vi.fn(),
  createRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  addIngredientToRecipe: vi.fn(),
  removeIngredientFromRecipe: vi.fn(),
  getUserRecipes: vi.fn(),
  getAllRecipes: vi.fn(),
};

// Mock the context
const mockContext = {
  services: {
    recipeService: mockRecipeService,
  },
};

describe('Recipe Router', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get all recipes', async () => {
    const mockRecipes = [{ id: '1', name: 'Test Recipe', description: 'Test description', authorId: 'user1', createdAt: new Date(), updatedAt: new Date() }];
    mockRecipeService.getAllRecipes.mockResolvedValue(mockRecipes);

    const caller = recipeRouter.createCaller(mockContext);
    const result = await caller.getAll();

    expect(result).toEqual(mockRecipes);
    expect(mockRecipeService.getAllRecipes).toHaveBeenCalled();
  });

  it('should get a recipe by id', async () => {
    const mockRecipe = { id: '1', name: 'Test Recipe', description: 'Test description', authorId: 'user1', createdAt: new Date(), updatedAt: new Date() };
    mockRecipeService.getRecipeById.mockResolvedValue(mockRecipe);

    const caller = recipeRouter.createCaller(mockContext);
    const result = await caller.getById({ id: '1' });

    expect(result).toEqual(mockRecipe);
    expect(mockRecipeService.getRecipeById).toHaveBeenCalledWith('1');
  });

  it('should create a new recipe', async () => {
    const mockRecipe = {
      id: '1',
      name: 'New Recipe',
      description: 'Test description',
      authorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const mockInput = {
      id: '1',
      name: 'New Recipe',
      description: 'Test description',
      authorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ingredients: [{ name: 'Ingredient 1', amount: '100g'}],
    };
    mockRecipeService.createRecipe.mockResolvedValue(mockRecipe);

    const caller = recipeRouter.createCaller(mockContext);
    const result = await caller.create(mockInput);

    expect(result).toEqual(mockRecipe);
    expect(mockRecipeService.createRecipe).toHaveBeenCalledWith({
      name: 'New Recipe',
      description: 'Test description',
      authorId: 'user1',
      ingredients: [{ amount: '100g', ingredient: { name: 'Ingredient 1' } }],
    });
  });

  it('should update a recipe', async () => {
    const mockRecipe = { id: '1', name: 'Updated Recipe', description: 'Updated description', authorId: 'user1', createdAt: new Date(), updatedAt: new Date() };
    const mockInput = { id: '1', name: 'Updated Recipe', description: 'Updated description' };
    mockRecipeService.updateRecipe.mockResolvedValue(mockRecipe);

    const caller = recipeRouter.createCaller(mockContext);
    const result = await caller.update(mockInput);

    expect(result).toEqual(mockRecipe);
    expect(mockRecipeService.updateRecipe).toHaveBeenCalledWith('1', { name: 'Updated Recipe', description: 'Updated description' });
  });

  it('should add an ingredient to a recipe', async () => {
    const mockIngredient = { id: '1', recipeId: '1', ingredientId: 'ing1', amount: '100g' };
    const mockInput = { recipeId: '1', ingredient: { name: 'New Ingredient', amount: '100g' } };
    mockRecipeService.addIngredientToRecipe.mockResolvedValue(mockIngredient);

    const caller = recipeRouter.createCaller(mockContext);
    const result = await caller.addIngredient(mockInput);

    expect(result).toEqual(mockIngredient);
    expect(mockRecipeService.addIngredientToRecipe).toHaveBeenCalledWith('1', {
      amount: '100g',
      ingredient: { name: 'New Ingredient' },
    });
  });

  it('should remove an ingredient from a recipe', async () => {
    const mockInput = { recipeId: '1', ingredientId: 'ing1' };
    mockRecipeService.removeIngredientFromRecipe.mockResolvedValue(undefined);

    const caller = recipeRouter.createCaller(mockContext);
    await caller.removeIngredient(mockInput);

    expect(mockRecipeService.removeIngredientFromRecipe).toHaveBeenCalledWith('1', 'ing1');
  });

  it('should get user recipes', async () => {
    const mockRecipes = [{ id: '1', name: 'User Recipe', description: 'Test description', authorId: 'user1', createdAt: new Date(), updatedAt: new Date() }];
    mockRecipeService.getUserRecipes.mockResolvedValue(mockRecipes);

    const caller = recipeRouter.createCaller(mockContext);
    const result = await caller.getUserRecipes({ userId: 'user1' });

    expect(result).toEqual(mockRecipes);
    expect(mockRecipeService.getUserRecipes).toHaveBeenCalledWith('user1');
  });
});