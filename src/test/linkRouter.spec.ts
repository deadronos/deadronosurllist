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

describe('linkRouter with in-memory db', () => {
  it('creates, reorders, updates, and deletes links', async () => {
    const initialCollection = await caller.collection.getById({ id: 'col_seed' });
    expect(initialCollection).not.toBeNull();
    expect(initialCollection?.links.length).toBe(1);

    const created = await caller.link.create({
      collectionId: 'col_seed',
      url: 'https://example.com/second',
      name: 'Second Link',
      comment: 'Another link',
    });

    expect(created).toMatchObject({
      id: expect.any(String),
      order: 1,
      collectionId: 'col_seed',
    });

    const afterCreate = await caller.collection.getById({ id: 'col_seed' });
    expect(afterCreate?.links.length).toBe(2);

    const reversed = afterCreate!.links.map((link) => link.id).reverse();
    const results = await caller.link.reorder({
      collectionId: 'col_seed',
      linkIds: reversed,
    });

    results.forEach((res) => expect(res.count).toBe(1));

    const afterReorder = await caller.collection.getById({ id: 'col_seed' });
    expect(afterReorder?.links.map((link) => link.id)).toEqual(reversed);
    expect(afterReorder?.links.map((link) => link.order)).toEqual([0, 1]);

    const updated = await caller.link.update({
      id: created.id,
      comment: 'Updated comment',
    });
    expect(updated.comment).toBe('Updated comment');

    await caller.link.delete({ id: created.id });
    const afterDelete = await caller.collection.getById({ id: 'col_seed' });
    expect(afterDelete?.links.some((link) => link.id === created.id)).toBe(false);
  });
});
