export interface Connection<T> {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getClient: () => T;
}