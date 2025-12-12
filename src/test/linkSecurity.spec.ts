import { beforeEach, describe, it, expect } from "vitest";

import { createCaller } from "@/server/api/root";
import { db } from "@/server/db";
import type { Session } from "next-auth";

type AppCaller = ReturnType<typeof createCaller>;

let caller: AppCaller;
let collectionId: string;

const createSession = (userId: string): Session => ({
  user: {
    id: userId,
    name: `Test ${userId}`,
    email: null,
    image: null,
  },
  expires: new Date(Date.now() + 60_000).toISOString(),
});

beforeEach(async () => {
  // Create context with mock session
  const context = {
    db,
    session: createSession("security-test-user"),
    headers: new Headers(),
  };
  caller = createCaller(context);

  // Create a fresh collection for this test suite
  const collection = await caller.collection.create({
    name: "Security Test Collection",
  });
  collectionId = collection.id;
});

describe("linkRouter security", () => {
  it("should reject javascript: URLs to prevent XSS", async () => {
    // This should throw a validation error
    await expect(
      caller.link.create({
        collectionId,
        url: "javascript:alert(1)",
        name: "Malicious Link",
        comment: "This should fail",
      })
    ).rejects.toThrow();
  });

  it("should reject vbscript: URLs", async () => {
    await expect(
      caller.link.create({
        collectionId,
        url: "vbscript:alert(1)",
        name: "Malicious VBS Link",
      })
    ).rejects.toThrow();
  });

  it("should reject data: URLs", async () => {
    await expect(
      caller.link.create({
        collectionId,
        url: "data:text/html,<script>alert(1)</script>",
        name: "Malicious Data Link",
      })
    ).rejects.toThrow();
  });

  it("should allow http and https URLs", async () => {
    const result = await caller.link.create({
      collectionId,
      url: "https://example.com/safe",
      name: "Safe Link",
    });

    expect(result).toHaveProperty("id");
  });
});
