import { expect, test, describe } from "vitest";
import { isHttpUrl } from "@/lib/url";

describe("isHttpUrl", () => {
  test("returns true for valid http URLs", () => {
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("http://localhost:3000")).toBe(true);
    expect(isHttpUrl("http://127.0.0.1")).toBe(true);
  });

  test("returns true for valid https URLs", () => {
    expect(isHttpUrl("https://example.com")).toBe(true);
    expect(isHttpUrl("https://www.google.com/search?q=vitest")).toBe(true);
  });

  test("returns false for invalid protocols", () => {
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("mailto:user@example.com")).toBe(false);
    expect(isHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==")).toBe(false);
  });

  test("returns false for non-URL strings", () => {
    expect(isHttpUrl("not-a-url")).toBe(false);
    expect(isHttpUrl("example.com")).toBe(false); // Missing protocol
    expect(isHttpUrl("http//missing-colon")).toBe(false);
  });

  test("returns false for empty or whitespace strings", () => {
    expect(isHttpUrl("")).toBe(false);
    expect(isHttpUrl("   ")).toBe(false);
  });

  test("returns false for malformed URLs that throw in URL constructor", () => {
    // Some strings might not be valid URLs at all
    expect(isHttpUrl("http://")).toBe(false);
  });
});
