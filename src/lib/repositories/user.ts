import { type PrismaClient, type User } from "@prisma/client";

export interface UserRepository {
  findById: (id: string) => Promise<User | null>;
  create: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<User>;
  // Add other methods as needed
}

export const createUserRepository = (prisma: PrismaClient): UserRepository => {
  return {
    findById: async (id: string) => {
      return prisma.user.findUnique({ where: { id } });
    },
    create: async (user: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      return prisma.user.create({ data: user });
    },
    // Implement other methods
  };
};