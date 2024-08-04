import { type PrismaClient } from "@prisma/client";
import { type UserRepository, createUserRepository } from "~/repositories/user";
import { type UserService, createUserService } from "~/services/user";

export interface ServicesContainer {
  userRepository: UserRepository;
  userService: UserService;
  // Add other services and repositories
}

let container: ServicesContainer | null = null;

export const initializeContainer = (prisma: PrismaClient): ServicesContainer => {
  if (container) {
    return container;
  }

  const userRepository = createUserRepository(prisma);
  const userService = createUserService(userRepository);

  container = {
    userRepository,
    userService,
    // Initialize other services and repositories
  };

  return container;
};

export const getContainer = (): ServicesContainer => {
  if (!container) {
    throw new Error("Container not initialized");
  }
  return container;
};
