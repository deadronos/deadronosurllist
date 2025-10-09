import { describe, it, expect } from 'vitest';
import { createCallerFactory } from '@/server/api/trpc';
import { collectionRouter } from '@/server/api/routers/collection';

// create a caller with fake headers; setup.ts will mock auth() and db
const caller = createCallerFactory({ headers: new Headers() }).create();

describe('collectionRouter (mocked)', () => {
  it('getAll returns mocked collections', async () => {
    const res = await caller.collection.getAll();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toHaveProperty('id');
  });

  it('create returns created collection', async () => {
    const created = await caller.collection.create({ name: 'New', description: 'desc' });
    expect(created).toHaveProperty('id');
    expect(created.name).toBe('New');
  });
});
