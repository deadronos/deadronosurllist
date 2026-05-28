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

describe("Collection Router Integration Tests", () => {
  describe("create", () => {
    it("should create a collection with valid input", async () => {
      const input = {
        name: "Test Collection",
        description: "A test collection",
        isPublic: true,
      };

      const result = await caller.collection.create(input);

      expect(result).toMatchObject({
        name: input.name,
        description: input.description,
        isPublic: input.isPublic,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should reject empty collection name", async () => {
      await expect(
        caller.collection.create({
          name: "",
          description: "",
          isPublic: false,
        }),
      ).rejects.toThrow();
    });

    it("should accept whitespace-only collection name (normalized by backend)", async () => {
      // Note: The backend may normalize whitespace, but doesn't reject it
      const result = await caller.collection.create({
        name: "   ",
        description: "",
        isPublic: false,
      });
      expect(result).toBeDefined();
    });

    it("should require authentication for create", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.create({
          name: "Test",
          description: "",
          isPublic: false,
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should handle optional description", async () => {
      const result = await caller.collection.create({
        name: "No Description",
        isPublic: false,
      });

      expect(result.name).toBe("No Description");
      expect(result.description).toBeNull();
    });

    it("should handle optional isPublic (default false)", async () => {
      const result = await caller.collection.create({
        name: "Default Public",
        description: "Test",
      });

      expect(result.isPublic).toBe(false);
    });
  });

  describe("update", () => {
    it("should update collection with valid input", async () => {
      // First create a collection
      const created = await caller.collection.create({
        name: "Original Name",
        description: "Original description",
        isPublic: false,
      });

      // Then update it (returns count of updated records)
      const result = await caller.collection.update({
        id: created.id,
        name: "Updated Name",
        description: "Updated description",
        isPublic: true,
      });

      // Verify the update was successful
      expect(result).toBeDefined();

      // Verify the changes by fetching the collection
      const updated = await caller.collection.getById({ id: created.id });
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.description).toBe("Updated description");
      expect(updated?.isPublic).toBe(true);
    });

    it("should reject update with non-existent id", async () => {
      await expect(
        caller.collection.update({
          id: "non-existent-id",
          name: "Test",
          description: "",
          isPublic: false,
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("should require authentication for update", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.update({
          id: "some-id",
          name: "Test",
          description: "",
          isPublic: false,
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should only allow owners to update their collections", async () => {
      // Create a collection as user1
      const created = await caller.collection.create({
        name: "User1 Collection",
        description: "",
        isPublic: false,
      });

      // Try to update as user2
      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.collection.update({
          id: created.id,
          name: "Hijacked",
          description: "",
          isPublic: false,
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  describe("delete", () => {
    it("should delete collection", async () => {
      const created = await caller.collection.create({
        name: "To Delete",
        description: "",
        isPublic: false,
      });

      await caller.collection.delete({ id: created.id });

      // Verify it's deleted (getById should return null or throw)
      const result = await caller.collection.getById({ id: created.id });
      expect(result).toBeNull();
    });

    it("should require authentication for delete", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.delete({ id: "some-id" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("should only allow owners to delete their collections", async () => {
      const created = await caller.collection.create({
        name: "User1 Collection",
        description: "",
        isPublic: false,
      });

      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.collection.delete({ id: created.id }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  describe("reorder", () => {
    it("should reorder collections", async () => {
      // Create multiple collections
      const col1 = await caller.collection.create({
        name: "Reorder First",
        description: "",
        isPublic: false,
      });
      const col2 = await caller.collection.create({
        name: "Reorder Second",
        description: "",
        isPublic: false,
      });
      const col3 = await caller.collection.create({
        name: "Reorder Third",
        description: "",
        isPublic: false,
      });

      // Reorder them (uses collectionIds array)
      await caller.collection.reorder({
        collectionIds: [col3.id, col1.id, col2.id],
      });

      // Verify the order by fetching only the collections we created
      const all = await caller.collection.getAll();
      const createdIds = new Set([col1.id, col2.id, col3.id]);
      const reordered = all.filter((c) => createdIds.has(c.id));
      const orderedNames = reordered.map((c) => c.name);
      expect(orderedNames).toEqual([
        "Reorder Third",
        "Reorder First",
        "Reorder Second",
      ]);
    });

    it("should require authentication for reorder", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.reorder({
          collectionIds: ["some-id"],
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("getById", () => {
    it("should return collection by id", async () => {
      const created = await caller.collection.create({
        name: "Test Collection",
        description: "Test description",
        isPublic: true,
      });

      const result = await caller.collection.getById({ id: created.id });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Test Collection");
      expect(result?.description).toBe("Test description");
      expect(result?.isPublic).toBe(true);
    });

    it("should return null for non-existent id", async () => {
      const result = await caller.collection.getById({
        id: "non-existent-id",
      });

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all collections for authenticated user", async () => {
      await caller.collection.create({
        name: "Collection 1",
        description: "",
        isPublic: false,
      });
      await caller.collection.create({
        name: "Collection 2",
        description: "",
        isPublic: false,
      });

      const result = await caller.collection.getAll();

      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("should require authentication for getAll", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.getAll(),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });
});
