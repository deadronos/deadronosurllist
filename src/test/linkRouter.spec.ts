import { beforeEach, describe, it, expect } from 'vitest';

import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { db } from '@/server/db';
import type { LinkListDatabase } from '@/server/db.types';
import type { Session } from 'next-auth';

type AppCaller = ReturnType<typeof createCaller>;

type LinkResult = {
  id: string;
  order: number;
  comment: string | null;
  collectionId: string;
};

type CountResult = {
  count: number;
};

let caller: AppCaller;

type TestContext = {
  db: LinkListDatabase;
  session: Session | null;
  headers: Headers;
};

const createSession = (userId: string): Session => ({
  user: {
    id: userId,
    name: `Test ${userId}`,
    email: null,
    image: null,
  },
  expires: new Date(Date.now() + 60_000).toISOString(),
});

const createTestCaller = (overrides?: Partial<TestContext>): AppCaller => {
  const context: TestContext = {
    db,
    session: createSession('user1'),
    headers: new Headers(),
    ...overrides,
  };

  return createCaller(context);
};

beforeEach(async () => {
  const context = await createTRPCContext({ headers: new Headers() });
  caller = createCaller(context);
});

describe('linkRouter with in-memory db', () => {
  it('creates, reorders, updates, and deletes links', async () => {
    const collectionId = 'col_public_discover';
    const initialCollectionRaw: unknown = await caller.collection.getById({ id: collectionId });
    const initialCollection = ensureCollectionResult(initialCollectionRaw);
    const initialCount = initialCollection.links.length;
    expect(initialCount).toBeGreaterThan(0);

    const createdRaw: unknown = await caller.link.create({
      collectionId,
      url: 'https://example.com/second',
      name: 'Second Link',
      comment: 'Another link',
    });
    const created = ensureLinkResult(createdRaw);

    expect(typeof created.id).toBe('string');
    expect(created.order).toBe(initialCount);
    expect(created.collectionId).toBe(collectionId);

    const afterCreateRaw: unknown = await caller.collection.getById({ id: collectionId });
    const afterCreate = ensureCollectionResult(afterCreateRaw);
    const afterCreateLinks = afterCreate.links;
    expect(afterCreateLinks.length).toBe(initialCount + 1);

    const reversedIds = [...afterCreateLinks].map((link) => link.id).reverse();
    const reorderResultsRaw: unknown = await caller.link.reorder({
      collectionId,
      linkIds: reversedIds,
    });

    getCountResults(reorderResultsRaw).forEach((res) => expect(res.count).toBe(1));

    const afterReorderRaw: unknown = await caller.collection.getById({ id: collectionId });
    const afterReorder = ensureCollectionResult(afterReorderRaw);
    const afterReorderLinks = afterReorder.links;
    expect(afterReorderLinks.map((link) => link.id)).toEqual(reversedIds);
    expect(afterReorderLinks.map((link) => link.order)).toEqual(
      reversedIds.map((_value, index) => index),
    );

    const updatedRaw: unknown = await caller.link.update({
      id: created.id,
      comment: 'Updated comment',
    });
    const updated = ensureLinkResult(updatedRaw);
    expect(updated.comment).toBe('Updated comment');
    await caller.link.delete({ id: created.id });
    const afterDeleteRaw: unknown = await caller.collection.getById({ id: collectionId });
    const afterDelete = ensureCollectionResult(afterDeleteRaw);
    const afterDeleteLinks = afterDelete.links;
    expect(afterDeleteLinks.some((link) => link.id === created.id)).toBe(false);
  });
});

describe('linkRouter authorization guards', () => {
  it('rejects creating links in collections owned by another user', async () => {
    const intruder = createTestCaller({ session: createSession('intruder') }).link;

    const initial = await caller.collection.getById({ id: 'col_public_discover' });
    if (!initial) {
      throw new Error('Expected seeded collection to exist');
    }
    const initialCount = initial.links.length;

    await expect(
      intruder.create({
        collectionId: 'col_public_discover',
        url: 'https://example.com/forbidden',
        name: 'Forbidden',
        comment: undefined,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const afterAttempt = await caller.collection.getById({ id: 'col_public_discover' });
    expect(afterAttempt?.links.length).toBe(initialCount);
  });

  it('prevents updates to links owned by another user', async () => {
    const ownerCaller = createTestCaller().link;
    const created = await ownerCaller.create({
      collectionId: 'col_public_discover',
      url: 'https://example.com/update-target',
      name: 'Update Target',
    });

    const intruder = createTestCaller({ session: createSession('user2') }).link;

    await expect(
      intruder.update({
        id: created.id,
        name: 'Hacked Name',
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const ownerView = await caller.collection.getById({ id: 'col_public_discover' });
    const target = ownerView?.links.find((link) => link.id === created.id);
    expect(target?.name).toBe('Update Target');
  });

  it('prevents deleting links owned by another user', async () => {
    const ownerCaller = createTestCaller().link;
    const created = await ownerCaller.create({
      collectionId: 'col_public_discover',
      url: 'https://example.com/delete-target',
      name: 'Delete Target',
    });

    const intruder = createTestCaller({ session: createSession('user3') }).link;

    await expect(intruder.delete({ id: created.id })).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const ownerView = await caller.collection.getById({ id: 'col_public_discover' });
    const stillExists = ownerView?.links.some((link) => link.id === created.id);
    expect(stillExists).toBe(true);
  });

  it('rejects reordering links for foreign collections', async () => {
    const ownerView = await caller.collection.getById({ id: 'col_public_discover' });
    if (!ownerView) {
      throw new Error('Expected seeded collection to exist');
    }

    const intruder = createTestCaller({ session: createSession('user4') }).link;

    await expect(
      intruder.reorder({
        collectionId: 'col_public_discover',
        linkIds: ownerView.links.map((link) => link.id).reverse(),
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    const afterAttempt = await caller.collection.getById({ id: 'col_public_discover' });
    expect(afterAttempt?.links.map((link) => link.id)).toEqual(ownerView.links.map((link) => link.id));
  });
});

function isLinkResult(value: unknown): value is LinkResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as {
    id?: unknown;
    order?: unknown;
    comment?: unknown;
    collectionId?: unknown;
  };
  const comment = candidate.comment;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.order === 'number' &&
    typeof candidate.collectionId === 'string' &&
    (comment === null || comment === undefined || typeof comment === 'string')
  );
}

function toLinkResults(value: unknown): LinkResult[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isLinkResult);
}

function ensureLinkResult(value: unknown): LinkResult {
  if (!isLinkResult(value)) {
    throw new Error('Link result malformed');
  }
  return value;
}

type CollectionResult = {
  id: string;
  links: LinkResult[];
};

function isCollectionResult(value: unknown): value is CollectionResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { id?: unknown; links?: unknown };
  if (typeof candidate.id !== 'string') return false;
  if (!Array.isArray(candidate.links)) return false;
  const linkList = toLinkResults(candidate.links);
  return linkList.length === candidate.links.length;
}

function ensureCollectionResult(value: unknown): CollectionResult {
  if (!isCollectionResult(value)) {
    throw new Error('Collection result malformed');
  }
  return {
    id: (value as { id: string }).id,
    links: toLinkResults((value as { links: unknown }).links),
  };
}

function isCountResult(value: unknown): value is CountResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { count?: unknown };
  return typeof candidate.count === 'number';
}

function getCountResults(value: unknown): CountResult[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isCountResult);
}
