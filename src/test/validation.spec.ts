import { expect, test, describe } from "vitest";
import { isSafeUrl, urlSchema } from "@/server/api/validation";

describe("isSafeUrl", () => {
  test("returns true for http URLs", () => {
    expect(isSafeUrl("http://example.com")).toBe(true);
  });

  test("returns true for https URLs", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
  });

  test("returns false for ftp URLs", () => {
    expect(isSafeUrl("ftp://example.com")).toBe(false);
  });

  test("returns false for javascript: URLs", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
  });

  test("returns false for data: URLs", () => {
    expect(isSafeUrl("data:text/html,<html></html>")).toBe(false);
  });

  test("returns false for malformed URLs", () => {
    expect(isSafeUrl("not-a-url")).toBe(false);
  });
});

describe("urlSchema", () => {
  test("successfully parses http URLs", () => {
    const result = urlSchema.safeParse("http://example.com");
    expect(result.success).toBe(true);
  });

  test("successfully parses https URLs", () => {
    const result = urlSchema.safeParse("https://example.com");
    expect(result.success).toBe(true);
  });

  test("fails to parse ftp URLs with the custom error message", () => {
    const result = urlSchema.safeParse("ftp://example.com");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Only http and https URLs are allowed");
    }
  });

  test("fails to parse javascript: URLs with the custom error message", () => {
    const result = urlSchema.safeParse("javascript:alert(1)");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Only http and https URLs are allowed");
    }
  });

  test("fails to parse data: URLs with the custom error message", () => {
    const result = urlSchema.safeParse("data:text/html,<html></html>");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Only http and https URLs are allowed");
    }
  });

  test("fails to parse strings that are not URLs", () => {
    const result = urlSchema.safeParse("not-a-url");
    expect(result.success).toBe(false);
    if (!result.success) {
      // Zod's internal .url() validation should catch this.
      // The error code might vary depending on the Zod version (e.g., invalid_string or invalid_format).
      expect(result.error.issues[0]?.message).not.toBe("Only http and https URLs are allowed");
      expect(result.error.issues[0]?.code).toBeDefined();
    }
  });
});
