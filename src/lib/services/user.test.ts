import { describe, test, expect, vi, beforeEach, Mocked } from 'vitest';
import { createUserService, type UserService } from './user';
import { type UserRepository } from '../repositories/user';
import { type User } from '@prisma/client';

describe('UserService', () => {
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

const createMockUserService = () => {
  const mockUserRepository: Mocked<UserRepository> = {
    findById: vi.fn().mockResolvedValue(mockUser),
    create: vi.fn().mockResolvedValue(mockUser),
  };
  const userService = createUserService(mockUserRepository);
  return { userService, mockUserRepository };
};

  describe('getUserById', () => {
    test('should return a user when found', async () => {
      const { userService, mockUserRepository } = createMockUserService();
      const result = await userService.getUserById('1');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    test('should return null when user is not found', async () => {
      const { userService, mockUserRepository } = createMockUserService();
      mockUserRepository.findById.mockResolvedValueOnce(null);
      const result = await userService.getUserById('2');
      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith('2');
    });
  });

  describe('createUser', () => {
    test('should create a new user', async () => {
      const newUserData = { name: 'New User', email: 'new@example.com' };
      const { userService, mockUserRepository } = createMockUserService();
      const result = await userService.createUser(newUserData);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUserData);
    });
  });
});
