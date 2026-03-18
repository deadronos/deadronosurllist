import { expect, test, describe } from "vitest";
import { createTypeGuard } from "@/lib/type-guards";

describe("createTypeGuard", () => {
  test("validates basic primitive types", () => {
    type Basic = { s: string; n: number; b: boolean };
    const isBasic = createTypeGuard<Basic>([
      { name: "s", type: "string" },
      { name: "n", type: "number" },
      { name: "b", type: "boolean" },
    ]);

    expect(isBasic({ s: "hello", n: 42, b: true })).toBe(true);
    expect(isBasic({ s: "hello", n: 42, b: "true" })).toBe(false);
    expect(isBasic({ s: 123, n: 42, b: true })).toBe(false);
    expect(isBasic({ s: "hello", n: "42", b: true })).toBe(false);
  });

  test("handles optional fields", () => {
    type Optional = { required: string; opt?: string };
    const isOptional = createTypeGuard<Optional>([
      { name: "required", type: "string" },
      { name: "opt", type: "string", optional: true },
    ]);

    expect(isOptional({ required: "here", opt: "there" })).toBe(true);
    expect(isOptional({ required: "here" })).toBe(true);
    expect(isOptional({ opt: "there" })).toBe(false);
  });

  test("handles nullable fields", () => {
    type Nullable = { val: string | null };
    const isNullable = createTypeGuard<Nullable>([
      { name: "val", type: "string", nullable: true },
    ]);

    expect(isNullable({ val: "hello" })).toBe(true);
    expect(isNullable({ val: null })).toBe(true);
    expect(isNullable({ val: undefined })).toBe(false);
  });

  test("validates arrays and objects", () => {
    type Complex = { arr: string[]; obj: object };
    const isComplex = createTypeGuard<Complex>([
      { name: "arr", type: "array" },
      { name: "obj", type: "object" },
    ]);

    expect(isComplex({ arr: [], obj: {} })).toBe(true);
    expect(isComplex({ arr: [1, 2], obj: { a: 1 } })).toBe(true);
    expect(isComplex({ arr: {}, obj: [] })).toBe(false);
    expect(isComplex({ arr: [], obj: null })).toBe(false);
  });

  test("validates nested objects", () => {
    type Nested = { user: { id: string; name: string } };
    const isNested = createTypeGuard<Nested>([
      {
        name: "user",
        type: "object",
        nestedFields: [
          { name: "id", type: "string" },
          { name: "name", type: "string" },
        ],
      },
    ]);

    expect(isNested({ user: { id: "1", name: "Alice" } })).toBe(true);
    expect(isNested({ user: { id: "1" } })).toBe(false);
    expect(isNested({ user: { id: "1", name: 123 } })).toBe(false);
    expect(isNested({ user: "not an object" })).toBe(false);
  });

  test("validates arrays of objects", () => {
    type Item = { id: number };
    type List = { items: Item[] };
    const isList = createTypeGuard<List>([
      {
        name: "items",
        type: "array",
        nestedFields: [{ name: "id", type: "number" }],
      },
    ]);

    expect(isList({ items: [{ id: 1 }, { id: 2 }] })).toBe(true);
    expect(isList({ items: [{ id: 1 }, { name: "wrong" }] })).toBe(false);
    expect(isList({ items: [1, 2, 3] })).toBe(false);
  });

  test("handles edge cases and invalid inputs", () => {
    const isAny = createTypeGuard([{ name: "any", type: "string" }]);

    expect(isAny(null)).toBe(false);
    expect(isAny(undefined)).toBe(false);
    expect(isAny("string")).toBe(false);
    expect(isAny(42)).toBe(false);
    expect(isAny({})).toBe(false);
  });
});
