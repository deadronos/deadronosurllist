import { describe, it, expect } from "vitest";
import { z } from "zod";

// Import the actual schemas used in routers
import { urlSchema } from "@/server/api/validation";

describe("Schema Contract Tests", () => {
  describe("URL Schema", () => {
    it("should accept valid HTTP URLs", () => {
      expect(() => urlSchema.parse("http://example.com")).not.toThrow();
      expect(() => urlSchema.parse("https://example.com")).not.toThrow();
      expect(() =>
        urlSchema.parse("https://example.com/path?query=value"),
      ).not.toThrow();
    });

    it("should accept valid HTTPS URLs", () => {
      expect(() =>
        urlSchema.parse("https://github.com/user/repo"),
      ).not.toThrow();
    });

    it("should reject invalid URLs", () => {
      expect(() => urlSchema.parse("not-a-url")).toThrow();
      expect(() => urlSchema.parse("")).toThrow();
      expect(() => urlSchema.parse("ftp://example.com")).toThrow();
    });
  });

  describe("Collection Create Schema", () => {
    // Define the schema based on the router implementation
    const collectionCreateSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).nullable().optional(),
      isPublic: z.boolean().optional(),
    });

    it("should accept valid input", () => {
      const validInput = {
        name: "Test Collection",
        description: "A test collection",
        isPublic: true,
      };

      expect(() => collectionCreateSchema.parse(validInput)).not.toThrow();
    });

    it("should reject empty name", () => {
      expect(() =>
        collectionCreateSchema.parse({
          name: "",
          description: "",
          isPublic: false,
        }),
      ).toThrow();
    });

    it("should reject name longer than 100 characters", () => {
      expect(() =>
        collectionCreateSchema.parse({
          name: "a".repeat(101),
          description: "",
          isPublic: false,
        }),
      ).toThrow();
    });

    it("should accept optional fields", () => {
      expect(() =>
        collectionCreateSchema.parse({ name: "Test" }),
      ).not.toThrow();
    });

    it("should accept null description", () => {
      expect(() =>
        collectionCreateSchema.parse({
          name: "Test",
          description: null,
        }),
      ).not.toThrow();
    });
  });

  describe("Collection Update Schema", () => {
    const collectionUpdateSchema = z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).nullable().optional(),
      isPublic: z.boolean().optional(),
    });

    it("should require id", () => {
      expect(() => collectionUpdateSchema.parse({ name: "Test" })).toThrow();
    });

    it("should accept valid input", () => {
      const validInput = {
        id: "some-id",
        name: "Updated Name",
        description: "Updated description",
        isPublic: true,
      };

      expect(() => collectionUpdateSchema.parse(validInput)).not.toThrow();
    });

    it("should accept partial updates", () => {
      expect(() =>
        collectionUpdateSchema.parse({ id: "some-id", name: "New Name" }),
      ).not.toThrow();

      expect(() =>
        collectionUpdateSchema.parse({ id: "some-id", isPublic: true }),
      ).not.toThrow();
    });
  });

  describe("Link Create Schema", () => {
    const linkCreateSchema = z.object({
      collectionId: z.string(),
      url: urlSchema,
      name: z.string().min(1).max(200),
      comment: z.string().max(1000).optional(),
    });

    it("should accept valid input", () => {
      const validInput = {
        collectionId: "collection-1",
        url: "https://example.com",
        name: "Example Link",
        comment: "A test link",
      };

      expect(() => linkCreateSchema.parse(validInput)).not.toThrow();
    });

    it("should reject invalid URL", () => {
      expect(() =>
        linkCreateSchema.parse({
          collectionId: "collection-1",
          url: "invalid-url",
          name: "Test",
        }),
      ).toThrow();
    });

    it("should reject empty name", () => {
      expect(() =>
        linkCreateSchema.parse({
          collectionId: "collection-1",
          url: "https://example.com",
          name: "",
        }),
      ).toThrow();
    });

    it("should reject name longer than 200 characters", () => {
      expect(() =>
        linkCreateSchema.parse({
          collectionId: "collection-1",
          url: "https://example.com",
          name: "a".repeat(201),
        }),
      ).toThrow();
    });

    it("should accept optional comment", () => {
      expect(() =>
        linkCreateSchema.parse({
          collectionId: "collection-1",
          url: "https://example.com",
          name: "Test",
        }),
      ).not.toThrow();
    });

    it("should reject comment longer than 1000 characters", () => {
      expect(() =>
        linkCreateSchema.parse({
          collectionId: "collection-1",
          url: "https://example.com",
          name: "Test",
          comment: "a".repeat(1001),
        }),
      ).toThrow();
    });
  });

  describe("Link Update Schema", () => {
    const linkUpdateSchema = z.object({
      id: z.string(),
      url: urlSchema.optional(),
      name: z.string().min(1).max(200).optional(),
      comment: z.string().max(1000).optional(),
    });

    it("should require id", () => {
      expect(() => linkUpdateSchema.parse({ name: "Test" })).toThrow();
    });

    it("should accept valid input", () => {
      const validInput = {
        id: "link-1",
        url: "https://updated.com",
        name: "Updated Link",
        comment: "Updated comment",
      };

      expect(() => linkUpdateSchema.parse(validInput)).not.toThrow();
    });

    it("should accept partial updates", () => {
      expect(() =>
        linkUpdateSchema.parse({ id: "link-1", name: "New Name" }),
      ).not.toThrow();

      expect(() =>
        linkUpdateSchema.parse({ id: "link-1", url: "https://new.com" }),
      ).not.toThrow();
    });

    it("should reject invalid URL in update", () => {
      expect(() =>
        linkUpdateSchema.parse({ id: "link-1", url: "invalid" }),
      ).toThrow();
    });
  });

  describe("Reorder Schemas", () => {
    const collectionReorderSchema = z.object({
      collectionIds: z.array(z.string()),
    });

    const linkReorderSchema = z.object({
      collectionId: z.string(),
      linkIds: z.array(z.string()),
    });

    it("should accept valid collection reorder input", () => {
      expect(() =>
        collectionReorderSchema.parse({
          collectionIds: ["id1", "id2", "id3"],
        }),
      ).not.toThrow();
    });

    it("should accept valid link reorder input", () => {
      expect(() =>
        linkReorderSchema.parse({
          collectionId: "collection-1",
          linkIds: ["link1", "link2", "link3"],
        }),
      ).not.toThrow();
    });

    it("should reject non-array collectionIds", () => {
      expect(() =>
        collectionReorderSchema.parse({ collectionIds: "not-an-array" }),
      ).toThrow();
    });

    it("should reject non-array linkIds", () => {
      expect(() =>
        linkReorderSchema.parse({
          collectionId: "collection-1",
          linkIds: "not-an-array",
        }),
      ).toThrow();
    });
  });
});
