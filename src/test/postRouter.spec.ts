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

describe("postRouter with in-memory db", () => {
  it("returns null when no posts exist", async () => {
    const initial = await caller.post.getLatest();
    expect(initial).toBeNull();
  });

  it("creates posts per user and returns the latest entry", async () => {
    await caller.post.create({ name: "First post" });
    const second = await caller.post.create({ name: "Second post" });

    expect(second).toMatchObject({
      name: "Second post",
      createdById: "user1",
    });

    const otherUserCaller = createTestCaller({
      session: createSession("user2"),
    }).post;

    await otherUserCaller.create({ name: "Other user post" });

    const latestForUser1 = await caller.post.getLatest();
    expect(latestForUser1?.name).toBe("Second post");

    const latestForUser2 = await otherUserCaller.getLatest();
    expect(latestForUser2?.name).toBe("Other user post");

    const secret = await caller.post.getSecretMessage();
    expect(secret).toBe("you can now see this secret message!");
  });
});

describe("postRouter authorization", () => {
  it("rejects protected mutations without a session", async () => {
    const unauthenticatedCaller = createTestCaller({ session: null }).post;

    await expect(
      unauthenticatedCaller.create({ name: "Nope" }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
