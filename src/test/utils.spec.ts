import { expect, test } from "vitest";
import { cn } from "@/lib/utils";

test("cn() basic concatenation", () => {
  expect(cn("a", "b")).toBe("a b");
});

test("cn() handles conditional classes", () => {
  expect(cn("a", true && "b", false && "c")).toBe("a b");
  expect(cn("a", undefined, null, "d")).toBe("a d");
});

test("cn() handles object and array arguments", () => {
  expect(cn({ a: true, b: false }, ["c", "d"])).toBe("a c d");
});

test("cn() handles tailwind class merging (twMerge)", () => {
  // p-4 overrides px-2 and py-2
  expect(cn("px-2 py-2", "p-4")).toBe("p-4");
  // Check overlapping tailwind classes
  expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
});

test("cn() returns empty string when no arguments are passed", () => {
  expect(cn()).toBe("");
});
