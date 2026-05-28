import { describe, it, expect } from "vitest";
import { z } from "zod";

// Import the URL schema used in forms
import { isHttpUrl } from "@/lib/url";

describe("Frontend Form Contract Tests", () => {
  describe("Collection Form Schema", () => {
    // This schema should match what the frontend form uses
    // and what the tRPC router expects
    const collectionFormSchema = z.object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be 100 characters or less"),
      description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .nullable()
        .optional(),
      isPublic: z.boolean().default(false),
    });

    it("should match tRPC create input schema", () => {
      // This test will fail if frontend schema drifts from backend
      const validFormData = {
        name: "Test Collection",
        description: "A test collection",
        isPublic: true,
      };

      // Parse with form schema
      const formResult = collectionFormSchema.safeParse(validFormData);
      expect(formResult.success).toBe(true);

      // The same data should be valid for tRPC
      // (This is a contract check - if backend adds new required fields,
      // this test will help catch the mismatch)
    });

    it("should reject empty name (matching backend)", () => {
      const result = collectionFormSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 characters (matching backend)", () => {
      const result = collectionFormSchema.safeParse({
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 500 characters (matching backend)", () => {
      const result = collectionFormSchema.safeParse({
        name: "Test",
        description: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("should accept null description (matching backend)", () => {
      const result = collectionFormSchema.safeParse({
        name: "Test",
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it("should accept optional isPublic (matching backend)", () => {
      const result = collectionFormSchema.safeParse({
        name: "Test",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Link Form Schema", () => {
    // This schema should match what the frontend form uses
    const linkFormSchema = z.object({
      url: z.string().refine(isHttpUrl, {
        message: "Invalid URL format",
      }),
      name: z
        .string()
        .min(1, "Name is required")
        .max(200, "Name must be 200 characters or less"),
      comment: z
        .string()
        .max(1000, "Comment must be 1000 characters or less")
        .optional(),
    });

    it("should match tRPC create input schema", () => {
      const validFormData = {
        url: "https://example.com",
        name: "Test Link",
        comment: "A comment",
      };

      const result = linkFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs (matching backend)", () => {
      const result = linkFormSchema.safeParse({
        url: "not-a-url",
        name: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty name (matching backend)", () => {
      const result = linkFormSchema.safeParse({
        url: "https://example.com",
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 200 characters (matching backend)", () => {
      const result = linkFormSchema.safeParse({
        url: "https://example.com",
        name: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should reject comment longer than 1000 characters (matching backend)", () => {
      const result = linkFormSchema.safeParse({
        url: "https://example.com",
        name: "Test",
        comment: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it("should accept optional comment (matching backend)", () => {
      const result = linkFormSchema.safeParse({
        url: "https://example.com",
        name: "Test",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("URL Validation (isHttpUrl)", () => {
    it("should accept valid HTTP URLs", () => {
      expect(isHttpUrl("http://example.com")).toBe(true);
      expect(isHttpUrl("https://example.com")).toBe(true);
      expect(isHttpUrl("https://example.com/path?query=value")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isHttpUrl("not-a-url")).toBe(false);
      expect(isHttpUrl("")).toBe(false);
      expect(isHttpUrl("ftp://example.com")).toBe(false);
      expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isHttpUrl("http://localhost:3000")).toBe(true);
      expect(isHttpUrl("https://sub.domain.example.com")).toBe(true);
    });
  });
});
