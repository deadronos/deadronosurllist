import { beforeEach, describe, it, expect } from 'vitest';

type CreateCallerFn = typeof import('@/server/api/root')['createCaller'];
type AppCaller = ReturnType<CreateCallerFn>;

let caller: AppCaller;

beforeEach(async () => {
  const [{ createCaller }, { createTRPCContext }] = await Promise.all([
    import('@/server/api/root'),
    import('@/server/api/trpc'),
  ]);

  const context = await createTRPCContext({ headers: new Headers() });
  caller = createCaller(context);
});

describe('collectionRouter (mocked)', () => {
  it('getAll returns mocked collections', async () => {
    const res = await caller.collection.getAll();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toHaveProperty('id');
    expect(res[0]?._count?.links).toBeDefined();
  });

  it('getPublic returns the seeded public collection', async () => {
    const res = await caller.collection.getPublic();
    expect(res).not.toBeNull();
    expect(res?.name).toBe('Discover Links');
    expect(res?.links.length).toBeGreaterThan(0);
    expect(res?.links[0]?.url).toBe('https://github.com');
  });

  it('create returns created collection', async () => {
    const created = await caller.collection.create({ name: 'New', description: 'desc' });
    expect(created).toHaveProperty('id');
    expect(created.name).toBe('New');
  });
});
