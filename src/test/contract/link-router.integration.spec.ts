import { createTestCaller, createSession, type AppCaller } from "../setup-trpc";
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

// Helper to create a test collection
async function createTestCollection() {
  return caller.collection.create({
    name: "Test Collection for Links",
    description: "Collection for link tests",
    isPublic: true,
  });
}

describe("Link Router Integration Tests", () => {
  describe("create", () => {
    it("should create a link with valid input", async () => {
      const collection = await createTestCollection();

      const input = {
        collectionId: collection.id,
        url: "https://example.com",
        name: "Example Link",
        comment: "A test link",
      };

      const result = await caller.link.create(input);

      expect(result).toMatchObject({
        url: input.url,
        name: input.name,
        comment: input.comment,
        collectionId: collection.id,
      });
      expect(result.id).toBeDefined();
      expect(result.order).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should reject invalid URLs", async () => {
      const collection = await createTestCollection();

      await expect(
        caller.link.create({
          collectionId: collection.id,
          url: "not-a-url",
          name: "Test",
        }),
      ).rejects.toThrow();
    });

    it("should require authentication for create", async () => {
      const collection = await createTestCollection();
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.create({
          collectionId: collection.id,
          url: "https://example.com",
          name: "Test",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should require collection ownership for create", async () => {
      const collection = await createTestCollection();

      // Try to create a link as user2
      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.link.create({
          collectionId: collection.id,
          url: "https://example.com",
          name: "Test",
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("should handle optional comment", async () => {
      const collection = await createTestCollection();

      const result = await caller.link.create({
        collectionId: collection.id,
        url: "https://example.com",
        name: "No Comment",
      });

      expect(result.comment).toBeNull();
    });

    it("should auto-assign order index", async () => {
      const collection = await createTestCollection();

      const link1 = await caller.link.create({
        collectionId: collection.id,
        url: "https://example1.com",
        name: "First Link",
      });

      const link2 = await caller.link.create({
        collectionId: collection.id,
        url: "https://example2.com",
        name: "Second Link",
      });

      expect(link1.order).toBeLessThan(link2.order);
    });
  });

  describe("createBatch", () => {
    it("should create multiple links", async () => {
      const collection = await createTestCollection();

      const input = {
        collectionId: collection.id,
        links: [
          { url: "https://example1.com", name: "Link 1" },
          { url: "https://example2.com", name: "Link 2", comment: "Comment 2" },
          { url: "https://example3.com", name: "Link 3" },
        ],
      };

      const result = await caller.link.createBatch(input);

      // Verify the batch creation
      expect(result).toBeDefined();

      // Verify links were created
      const collectionDetails = await caller.collection.getById({
        id: collection.id,
      });
      expect(collectionDetails?.links?.length).toBeGreaterThanOrEqual(3);
    });

    it("should reject batch with invalid URLs", async () => {
      const collection = await createTestCollection();

      await expect(
        caller.link.createBatch({
          collectionId: collection.id,
          links: [
            { url: "https://valid.com", name: "Valid" },
            { url: "invalid-url", name: "Invalid" },
          ],
        }),
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update link with valid input", async () => {
      const collection = await createTestCollection();

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://original.com",
        name: "Original Name",
        comment: "Original comment",
      });

      const result = await caller.link.update({
        id: created.id,
        url: "https://updated.com",
        name: "Updated Name",
        comment: "Updated comment",
      });

      expect(result.url).toBe("https://updated.com");
      expect(result.name).toBe("Updated Name");
      expect(result.comment).toBe("Updated comment");
    });

    it("should reject update with invalid URL", async () => {
      const collection = await createTestCollection();

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://original.com",
        name: "Test",
      });

      await expect(
        caller.link.update({
          id: created.id,
          url: "invalid-url",
        }),
      ).rejects.toThrow();
    });

    it("should require authentication for update", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.update({
          id: "some-id",
          name: "Test",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should only allow owners to update their links", async () => {
      const collection = await createTestCollection();

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://example.com",
        name: "User1 Link",
      });

      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.link.update({
          id: created.id,
          name: "Hijacked",
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("should handle partial updates", async () => {
      const collection = await createTestCollection();

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://original.com",
        name: "Original",
        comment: "Original comment",
      });

      // Update only the name
      const result = await caller.link.update({
        id: created.id,
        name: "Updated Name",
      });

      expect(result.name).toBe("Updated Name");
      expect(result.url).toBe("https://original.com"); // Unchanged
      expect(result.comment).toBe("Original comment"); // Unchanged
    });
  });

  describe("delete", () => {
    it("should delete link", async () => {
      const collection = await createTestCollection();

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://to-delete.com",
        name: "To Delete",
      });

      await caller.link.delete({ id: created.id });

      // Verify it's deleted
      const collectionDetails = await caller.collection.getById({
        id: collection.id,
      });
      const deletedLink = collectionDetails?.links?.find(
        (l) => l.id === created.id,
      );
      expect(deletedLink).toBeUndefined();
    });

    it("should require authentication for delete", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.delete({ id: "some-id" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should only allow owners to delete their links", async () => {
      const collection = await createTestCollection();

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://example.com",
        name: "User1 Link",
      });

      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.link.delete({ id: created.id }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  describe("reorder", () => {
    it("should reorder links within a collection", async () => {
      const collection = await createTestCollection();

      const link1 = await caller.link.create({
        collectionId: collection.id,
        url: "https://link1.com",
        name: "First Link",
      });

      const link2 = await caller.link.create({
        collectionId: collection.id,
        url: "https://link2.com",
        name: "Second Link",
      });

      const link3 = await caller.link.create({
        collectionId: collection.id,
        url: "https://link3.com",
        name: "Third Link",
      });

      // Reorder them
      await caller.link.reorder({
        collectionId: collection.id,
        linkIds: [link3.id, link1.id, link2.id],
      });

      // Verify the order
      const collectionDetails = await caller.collection.getById({
        id: collection.id,
      });

      const linkNames = collectionDetails?.links?.map((l) => l.name);
      expect(linkNames).toEqual(["Third Link", "First Link", "Second Link"]);
    });

    it("should require authentication for reorder", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.reorder({
          collectionId: "some-id",
          linkIds: ["link1", "link2"],
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should require collection ownership for reorder", async () => {
      const collection = await createTestCollection();

      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.link.reorder({
          collectionId: collection.id,
          linkIds: ["link1"],
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  describe("preview", () => {
    it("should fetch link metadata", async () => {
      // Note: This test requires network access to fetch metadata
      // Using a smaller URL that won't exceed body size limits
      const result = await caller.link.preview({
        url: "https://httpbin.org/html",
      });

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
    });

    it("should require authentication for preview", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.preview({
          url: "https://example.com",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });
});
