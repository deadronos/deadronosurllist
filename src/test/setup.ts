// Test setup: mock env, db, and auth

// Set NODE_ENV and required env vars expected by src/env.js
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:memory.db';
process.env.AUTH_DISCORD_ID = process.env.AUTH_DISCORD_ID ?? 'discord-id';
process.env.AUTH_DISCORD_SECRET = process.env.AUTH_DISCORD_SECRET ?? 'discord-secret';
process.env.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID ?? 'google-id';
process.env.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET ?? 'google-secret';
process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? 'test-secret';
process.env.USE_MOCK_DB = '1';

// Mock the Prisma client by re-using the in-memory db implementation.
import { beforeEach, vi } from 'vitest';

vi.mock('@/server/db', async () => await import('@/server/db.mock'));

const memoryDb = await import('@/server/db.mock');

beforeEach(() => {
  memoryDb.__memoryDb.reset();
});

// Mock the auth helper to return a fake session
vi.mock('@/server/auth', async () => {
  return {
    auth: async () => ({ user: { id: 'user1', name: 'Test User', email: 'test@example.com' } }),
  };
});
