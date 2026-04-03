import { createTestCaller, createSession, type AppCaller } from "./setup-trpc";
import { beforeEach, describe, it, expect } from "vitest";



let caller: AppCaller;
let collectionId: string;


beforeEach(async () => {
  // Create context with mock session
  caller = createTestCaller({ session: createSession("security-test-user") });

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
