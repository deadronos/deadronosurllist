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

beforeEach(() => {
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
    expect(res?.links.length).toBeGreaterThan(0);
    expect(res?.links[0]?.url).toBe("https://github.com");
  });

  it("listPublic returns all public collections ordered by updatedAt", async () => {
    const res = await caller.collection.listPublic();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
    const first = res[0];
    if (!first) {
      throw new Error("Expected at least one public collection");
    }
    expect(first).toHaveProperty("name");
    expect(first.links.length).toBeGreaterThan(0);
    const timestamps = res.map((collection) => new Date(collection.updatedAt).getTime());
    const isDescending = timestamps.every(
      (value, index, array) => index === 0 || value <= array[index - 1]!,
    );
    expect(isDescending).toBe(true);
  });

  it("create returns created collection", async () => {
    const created = await caller.collection.create({ name: "New", description: "desc" });
    expect(created).toHaveProperty("id");
    expect(created.name).toBe("New");
  });
});
