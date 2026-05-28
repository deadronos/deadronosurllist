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

describe("Auth Boundary Tests", () => {
  describe("Public Procedures - Collection Router", () => {
    it("getPublic should work without authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      // Should not throw UNAUTHORIZED
      const result = await unauthenticatedCaller.collection.getPublic();
      expect(result).toBeDefined();
      // The result might be null if no public collections exist
    });

    it("getPublicCatalog should work without authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      const result = await unauthenticatedCaller.collection.getPublicCatalog({
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it("getPublicById should work without authentication", async () => {
      // First create a public collection
      const created = await caller.collection.create({
        name: "Public Collection",
        description: "A public collection",
        isPublic: true,
      });

      const unauthenticatedCaller = createTestCaller({ session: null });

      const result = await unauthenticatedCaller.collection.getPublicById({
        id: created.id,
      });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Public Collection");
    });

    it("getPublicById should return null for private collections", async () => {
      // Create a private collection
      const created = await caller.collection.create({
        name: "Private Collection",
        description: "A private collection",
        isPublic: false,
      });

      const unauthenticatedCaller = createTestCaller({ session: null });

      const result = await unauthenticatedCaller.collection.getPublicById({
        id: created.id,
      });

      expect(result).toBeNull();
    });

    it("getByUser should work without authentication", async () => {
      // Create a public collection
      await caller.collection.create({
        name: "User Public Collection",
        description: "Public",
        isPublic: true,
      });

      const unauthenticatedCaller = createTestCaller({ session: null });

      const result = await unauthenticatedCaller.collection.getByUser({
        userId: "user1",
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("getByUser should only return public collections", async () => {
      // Create both public and private collections
      await caller.collection.create({
        name: "Public Collection",
        description: "Public",
        isPublic: true,
      });

      await caller.collection.create({
        name: "Private Collection",
        description: "Private",
        isPublic: false,
      });

      const unauthenticatedCaller = createTestCaller({ session: null });

      const result = await unauthenticatedCaller.collection.getByUser({
        userId: "user1",
      });

      // Should only contain public collections
      const publicOnly = result.every((c) => c.isPublic === true);
      expect(publicOnly).toBe(true);
    });
  });

  describe("Protected Procedures - Collection Router", () => {
    it("getAll should require authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.getAll(),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("create should require authentication", async () => {
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

    it("update should require authentication", async () => {
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

    it("delete should require authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.collection.delete({ id: "some-id" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("reorder should require authentication", async () => {
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

  // Note: Link router doesn't have public procedures
  // All link operations require authentication

  describe("Protected Procedures - Link Router", () => {
    it("create should require authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.create({
          collectionId: "some-id",
          url: "https://example.com",
          name: "Test",
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("createBatch should require authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.createBatch({
          collectionId: "some-id",
          links: [{ url: "https://example.com", name: "Test" }],
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("update should require authentication", async () => {
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

    it("delete should require authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.delete({ id: "some-id" }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("reorder should require authentication", async () => {
      const unauthenticatedCaller = createTestCaller({ session: null });

      await expect(
        unauthenticatedCaller.link.reorder({
          collectionId: "some-id",
          linkIds: ["link1"],
        }),
      ).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("preview should require authentication", async () => {
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

  describe("Ownership Checks - Collection Router", () => {
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

    it("should only allow owners to reorder their collections", async () => {
      const created = await caller.collection.create({
        name: "User1 Collection",
        description: "",
        isPublic: false,
      });

      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.collection.reorder({
          collectionIds: [created.id],
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });

  describe("Ownership Checks - Link Router", () => {
    it("should only allow owners to update their links", async () => {
      // Create a collection and link as user1
      const collection = await caller.collection.create({
        name: "User1 Collection",
        description: "",
        isPublic: false,
      });

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://example.com",
        name: "User1 Link",
      });

      // Try to update as user2
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

    it("should only allow owners to delete their links", async () => {
      const collection = await caller.collection.create({
        name: "User1 Collection",
        description: "",
        isPublic: false,
      });

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

    it("should only allow collection owners to reorder links", async () => {
      const collection = await caller.collection.create({
        name: "User1 Collection",
        description: "",
        isPublic: false,
      });

      const created = await caller.link.create({
        collectionId: collection.id,
        url: "https://example.com",
        name: "User1 Link",
      });

      const user2Caller = createTestCaller({
        session: createSession("user2"),
      });

      await expect(
        user2Caller.link.reorder({
          collectionId: collection.id,
          linkIds: [created.id],
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });
});
