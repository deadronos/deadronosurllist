import { beforeEach, describe, expect, it } from "vitest";

import { createCaller } from "@/server/api/root";
import { db } from "@/server/db";
import type { LinkListDatabase } from "@/server/db.types";
import type { Session } from "next-auth";

type AppCaller = ReturnType<typeof createCaller>;

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
    session: createSession("user1"),
    headers: new Headers(),
    ...overrides,
  };

  return createCaller(context);
};

let caller: AppCaller;

const maybeReset = (db as unknown as { reset?: () => void }).reset;

beforeEach(() => {
  if (typeof maybeReset === "function") {
    maybeReset();
  }
  caller = createTestCaller();
});

describe("collectionRouter (mocked)", () => {
  it("getAll returns mocked collections", async () => {
    const res = await caller.collection.getAll();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0]).toHaveProperty("id");
    expect(res[0]?._count?.links).toBeDefined();
  });

  it("getPublic returns the seeded public collection", async () => {
    const res = await caller.collection.getPublic();
    expect(res).not.toBeNull();
    expect(res?.name).toBe("Discover Links");
    expect(res?.topLinks.length).toBeGreaterThan(0);
    expect(res?.topLinks[0]?.url).toBe("https://github.com");
  });

  it("getPublicCatalog returns ordered results with pagination metadata", async () => {
    const pageSize = 2;

    const createdA = await caller.collection.create({
      name: "A First",
      description: "First public collection",
      isPublic: true,
    });
    const createdB = await caller.collection.create({
      name: "B Second",
      description: "Second public collection",
      isPublic: true,
    });

    await caller.link.create({
      collectionId: createdA.id,
      name: "First Link",
      url: "https://example.com/a1",
      comment: "Link A1",
    });

    await caller.link.create({
      collectionId: createdB.id,
      name: "Second Link",
      url: "https://example.com/b1",
      comment: "Link B1",
    });

    const firstPage = await caller.collection.getPublicCatalog({
      limit: pageSize,
    });

    expect(firstPage.items).toHaveLength(pageSize);
    expect(firstPage.totalCount).toBeGreaterThanOrEqual(pageSize);
    expect(firstPage.nextCursor).toBeTruthy();

    const timestamps = firstPage.items.map((item) =>
      new Date(item.updatedAt).getTime(),
    );
    const isDescending = timestamps.every(
      (value, index, array) => index === 0 || value <= array[index - 1]!,
    );
    expect(isDescending).toBe(true);

    if (!firstPage.nextCursor) {
      throw new Error("Expected nextCursor to be defined for pagination test");
    }

    const secondPage = await caller.collection.getPublicCatalog({
      limit: pageSize,
      cursor: firstPage.nextCursor,
    });

    expect(secondPage.items.length).toBeGreaterThanOrEqual(1);
    expect(secondPage.items[0]?.id).not.toBe(firstPage.items[0]?.id);
  });

  it("getPublicCatalog trims top links to the default limit", async () => {
    const created = await caller.collection.create({
      name: "Overflow Links",
      description: "Has more than the default top link count",
      isPublic: true,
    });

    const links = Array.from({ length: 12 }, (_, index) => ({
      url: `https://example.com/${index + 1}`,
      name: `Link ${index + 1}`,
      comment: `Comment ${index + 1}`,
    }));

    await caller.link.createBatch({
      collectionId: created.id,
      links,
    });

    const response = await caller.collection.getPublicCatalog({
      limit: 1,
    });

    const [first] = response.items;
    expect(first).toBeDefined();
    expect(first?.topLinks).toHaveLength(10);
    const orders = first?.topLinks.map((link) => link.order) ?? [];
    const isAscending = orders.every(
      (value, idx, arr) => idx === 0 || value >= arr[idx - 1]!,
    );
    expect(isAscending).toBe(true);
  });

  it("getPublicCatalog filters by case-insensitive query", async () => {
    await caller.collection.create({
      name: "Team Knowledge Base",
      description: "All the docs",
      isPublic: true,
    });

    await caller.collection.create({
      name: "Game Night Picks",
      description: "Board games for Fridays",
      isPublic: true,
    });

    const filtered = await caller.collection.getPublicCatalog({
      q: "game",
    });

    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0]?.name).toBe("Game Night Picks");
  });

  it("getPublicCatalog sorts by name ascending", async () => {
    await caller.collection.create({
      name: "Zoo List",
      description: "Last alphabetically",
      isPublic: true,
    });

    await caller.collection.create({
      name: "Alpha List",
      description: "First alphabetically",
      isPublic: true,
    });

    const response = await caller.collection.getPublicCatalog({
      limit: 10,
      sortBy: "name",
      sortOrder: "asc",
    });

    const names = response.items.map((item) => item.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("getPublicCatalog sorts by link count descending", async () => {
    const small = await caller.collection.create({
      name: "Small",
      description: "Few links",
      isPublic: true,
    });

    const large = await caller.collection.create({
      name: "Large",
      description: "More links",
      isPublic: true,
    });

    await caller.link.createBatch({
      collectionId: small.id,
      links: [{ name: "One", url: "https://example.com/one" }],
    });

    await caller.link.createBatch({
      collectionId: large.id,
      links: [
        { name: "One", url: "https://example.com/one" },
        { name: "Two", url: "https://example.com/two" },
        { name: "Three", url: "https://example.com/three" },
      ],
    });

    const response = await caller.collection.getPublicCatalog({
      limit: 10,
      sortBy: "linkCount",
      sortOrder: "desc",
    });

    const [first] = response.items;
    expect(first?.id).toBe(large.id);
  });

  it("getPublicCatalog trims link summaries to requested limit", async () => {
    const collection = await caller.collection.create({
      name: "Mega List",
      description: "Lots of links",
      isPublic: true,
    });

    const linkUrls = [
      "https://example.com/1",
      "https://example.com/2",
      "https://example.com/3",
      "https://example.com/4",
    ];

    await caller.link.createBatch({
      collectionId: collection.id,
      links: linkUrls.map((url, index) => ({
        name: `Link ${index + 1}`,
        url,
        comment: `Comment ${index + 1}`,
      })),
    });

    const response = await caller.collection.getPublicCatalog({
      limit: 1,
      linkLimit: 2,
    });

    const [first] = response.items;
    expect(first).toBeDefined();
    expect(first?.topLinks).toHaveLength(2);
    expect(first?.topLinks[0]?.order).toBeLessThanOrEqual(
      first?.topLinks[1]?.order ?? 0,
    );
  });

  it("getByUser returns only public collections", async () => {
    const publicCollection = await caller.collection.create({
      name: "Public One",
      description: "Visible",
      isPublic: true,
    });

    await caller.collection.create({
      name: "Private One",
      description: "Hidden",
      isPublic: false,
    });

    const result = await caller.collection.getByUser({
      userId: "user1",
    });

    const names = result.map((collection) => collection.name);
    expect(names).toContain(publicCollection.name);
    expect(names).not.toContain("Private One");
  });

  it("create returns created collection", async () => {
    const created = await caller.collection.create({
      name: "New",
      description: "desc",
    });
    expect(created).toHaveProperty("id");
    expect(created.name).toBe("New");
  });

  it("update modifies owned collection fields", async () => {
    const created = await caller.collection.create({
      name: "Original",
      description: "Original description",
      isPublic: false,
    });

    const updateResult = await caller.collection.update({
      id: created.id,
      name: "Updated",
      description: "Updated description",
      isPublic: true,
    });

    expect(updateResult.count).toBe(1);

    const fetched = await caller.collection.getById({ id: created.id });
    if (!fetched) {
      throw new Error("Expected collection to exist after update");
    }

    expect(fetched.name).toBe("Updated");
    expect(fetched.description).toBe("Updated description");
    expect(fetched.isPublic).toBe(true);
  });

  it("update refuses to modify collections owned by another user", async () => {
    const created = await caller.collection.create({
      name: "Mine",
      description: "belongs to user1",
    });

    const intruder = createTestCaller({ session: createSession("user2") });
    await expect(
      intruder.collection.update({
        id: created.id,
        name: "Hacked",
        description: "should not change",
      }),
    ).rejects.toThrow();

    const intruderView = await intruder.collection.getById({ id: created.id });
    expect(intruderView).toBeNull();

    const ownerView = await caller.collection.getById({ id: created.id });
    expect(ownerView?.name).toBe("Mine");
    expect(ownerView?.description).toBe("belongs to user1");
  });

  it("delete removes owned collection and associated access", async () => {
    const created = await caller.collection.create({
      name: "Temporary",
      description: "to remove",
    });

    const deleteResult = await caller.collection.delete({ id: created.id });
    expect(deleteResult.count).toBe(1);

    const fetched = await caller.collection.getById({ id: created.id });
    expect(fetched).toBeNull();
  });
});
