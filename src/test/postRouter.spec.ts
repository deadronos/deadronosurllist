import { beforeEach, describe, expect, it } from 'vitest';

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

describe('postRouter with in-memory db', () => {
  it('returns null when no posts exist', async () => {
    const initial = await caller.post.getLatest();
    expect(initial).toBeNull();
  });

  it('creates posts per user and returns the latest entry', async () => {
    await caller.post.create({ name: 'First post' });
    const second = await caller.post.create({ name: 'Second post' });

    expect(second).toMatchObject({
      name: 'Second post',
      createdById: 'user1',
    });

    const [{ postRouter }, { db }] = await Promise.all([
      import('@/server/api/routers/post'),
      import('@/server/db'),
    ]);

    const otherUserCaller = postRouter.createCaller({
      db,
      session: { user: { id: 'user2' } },
      headers: new Headers(),
    } as any);

    await otherUserCaller.create({ name: 'Other user post' });

    const latestForUser1 = await caller.post.getLatest();
    expect(latestForUser1?.name).toBe('Second post');

    const latestForUser2 = await otherUserCaller.getLatest();
    expect(latestForUser2?.name).toBe('Other user post');

    const secret = await caller.post.getSecretMessage();
    expect(secret).toBe('you can now see this secret message!');
  });
});

describe('postRouter authorization', () => {
  it('rejects protected mutations without a session', async () => {
    const [{ postRouter }, { db }] = await Promise.all([
      import('@/server/api/routers/post'),
      import('@/server/db'),
    ]);

    const unauthenticatedCaller = postRouter.createCaller({
      db,
      session: null,
      headers: new Headers(),
    } as any);

    await expect(unauthenticatedCaller.create({ name: 'Nope' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});
