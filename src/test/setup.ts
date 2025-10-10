// Test setup: mock env, db, and auth

// Set NODE_ENV and required env vars expected by src/env.js
const env = process.env as Record<string, string | undefined>;
env.NODE_ENV = env.NODE_ENV ?? 'test';
env.DATABASE_URL = env.DATABASE_URL ?? 'file:memory.db';
env.AUTH_DISCORD_ID = env.AUTH_DISCORD_ID ?? 'discord-id';
env.AUTH_DISCORD_SECRET = env.AUTH_DISCORD_SECRET ?? 'discord-secret';
env.AUTH_GOOGLE_ID = env.AUTH_GOOGLE_ID ?? 'google-id';
env.AUTH_GOOGLE_SECRET = env.AUTH_GOOGLE_SECRET ?? 'google-secret';
env.AUTH_SECRET = env.AUTH_SECRET ?? 'test-secret';
env.USE_MOCK_DB = '1';

// Mock the Prisma client by re-using the in-memory db implementation.
import { beforeEach, vi } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn(),
    redirect: vi.fn(),
  },
  headers: () => new Headers(),
}));

vi.mock('@/server/db', async () => {
  const mod = await import('@/server/db.mock');
  return {
    ...mod,
    isMockDb: true,
    prisma: null,
  };
});

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
