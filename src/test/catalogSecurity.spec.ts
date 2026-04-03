import { createTestCaller, type AppCaller } from "./setup-trpc";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";





let caller: AppCaller;

const maybeReset = (db as unknown as { reset?: () => void }).reset;

beforeEach(() => {
  if (typeof maybeReset === "function") {
    maybeReset();
  }
  caller = createTestCaller();
});

describe("security reproduction", () => {
  it("reproduces stored XSS by returning unsafe URLs from public catalog", async () => {
    // 1. Create a public collection directly in the DB
    const collection = await caller.collection.create({
      name: "Malicious Collection",
      description: "Contains unsafe links",
      isPublic: true,
    });

    // 2. Inject a malicious link directly into the DB
    await db.link.create({
      data: {
        collectionId: collection.id,
        name: "Click me for XSS",
        url: "javascript:alert('XSS')",
        comment: "This should be filtered",
        order: 1,
      },
    });

    // Inject a safe link to ensure legitimate data remains
    await db.link.create({
        data: {
          collectionId: collection.id,
          name: "Safe Link",
          url: "https://example.com",
          comment: "This should be present",
          order: 2,
        },
      });

    // 3. Fetch the public catalog
    const response = await caller.collection.getPublicCatalog({
      limit: 10,
    });

    // 4. Find our collection
    const item = response.items.find((i) => i.id === collection.id);
    expect(item).toBeDefined();

    // 5. Assert that the malicious link IS filtered out (fixing the vulnerability)
    const badLink = item?.topLinks.find((l) => l.url === "javascript:alert('XSS')");
    expect(badLink).toBeUndefined();

    // 6. Assert that safe link is present
    const safeLink = item?.topLinks.find((l) => l.url === "https://example.com");
    expect(safeLink).toBeDefined();
  });
});
