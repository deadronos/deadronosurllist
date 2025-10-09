// Test setup: mock env, db, and auth

// Set NODE_ENV and required env vars expected by src/env.js
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:memory.db';
process.env.AUTH_DISCORD_ID = process.env.AUTH_DISCORD_ID ?? 'discord-id';
process.env.AUTH_DISCORD_SECRET = process.env.AUTH_DISCORD_SECRET ?? 'discord-secret';
process.env.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID ?? 'google-id';
process.env.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ?? 'google-secret';
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? 'test-secret';

// Mock the Prisma client by mocking the module that exports `db`.
// We'll provide a minimal in-memory stub that supports the methods used in tests.
import { vi } from 'vitest';

vi.mock('@/server/db', async () => {
  // Minimal mock implementation for Prisma model shape used in collectionRouter
  const mockCollection = {
    findMany: vi.fn(async (opts: any) => {
      // return a predictable result
      return [
        { id: 'col1', name: 'Test', createdById: opts.where?.createdById ?? 'user1', _count: { links: 0 } },
      ];
    }),
    findFirst: vi.fn(async (opts: any) => ({ id: opts.where?.id ?? 'col1', name: 'Found', links: [] })),
    create: vi.fn(async (data: any) => ({ id: 'col-new', ...data.data })),
    updateMany: vi.fn(async (opts: any) => ({ count: 1 })),
    deleteMany: vi.fn(async (opts: any) => ({ count: 1 })),
  };

  return {
    db: {
      collection: mockCollection,
    },
  };
});

// Mock the auth helper to return a fake session
vi.mock('@/server/auth', async () => {
  return {
    auth: async () => ({ user: { id: 'user1', name: 'Test User', email: 'test@example.com' } }),
  };
});
