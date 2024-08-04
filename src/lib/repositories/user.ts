import { type User } from "@prisma/client";
import { type UserRepository } from "~/repositories/user";

export interface UserService {
  getUserById: (id: string) => Promise<User | null>;
  createUser: (userData: Omit<User, "id">) => Promise<User>;
  // Add other methods as needed
}

export const createUserService = (userRepo: UserRepository): UserService => {
  return {
    getUserById: async (id: string) => {
      return userRepo.findById(id);
    },
    createUser: async (userData: Omit<User, "id">) => {
      return userRepo.create(userData);
    },
    // Implement other methods
  };
};