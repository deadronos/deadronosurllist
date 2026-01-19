/**
 * Field specification for type guard generation.
 * Defines the structure and validation rules for each field.
 */
type FieldSpec = {
  /** Field name in the object */
  name: string;
  /** Expected TypeScript primitive type */
  type: "string" | "number" | "boolean" | "array" | "object";
  /** Whether the field is allowed to be undefined */
  optional?: boolean;
  /** Whether the field is allowed to be null */
  nullable?: boolean;
  /** Nested field specifications for array/object types */
  nestedFields?: FieldSpec[];
};

/**
 * Generates a TypeScript type guard function from field specifications.
 *
 * Eliminates manual type guard duplication in server components by providing
 * a declarative way to validate tRPC response payloads at runtime.
 *
 * @template T - The target type to guard against
 * @param {FieldSpec[]} fields - Array of field specifications to validate
 * @returns {(value: unknown) => value is T} A type guard function
 *
 * @example
 * ```typescript
 * type User = { id: string; name: string; age?: number | null };
 *
 * const isUser = createTypeGuard<User>([
 *   { name: "id", type: "string" },
 *   { name: "name", type: "string" },
 *   { name: "age", type: "number", optional: true, nullable: true }
 * ]);
 *
 * const data: unknown = await api.user.get();
 * if (isUser(data)) {
 *   console.log(data.name); // TypeScript knows data is User
 * }
 * ```
 */
export function createTypeGuard<T>(
  fields: FieldSpec[],
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Record<string, unknown>;

    for (const field of fields) {
      const val = candidate[field.name];

      if (val === undefined) {
        if (!field.optional) return false;
        continue;
      }

      if (val === null) {
        if (field.nullable) continue;
        return false;
      }

      if (field.type === "string" && typeof val !== "string") return false;
      if (field.type === "number" && typeof val !== "number") return false;
      if (field.type === "boolean" && typeof val !== "boolean") return false;
      if (field.type === "array" && !Array.isArray(val)) return false;

      if (
        field.type === "object" &&
        (typeof val !== "object" || val === null)
      ) {
        return false;
      }

      if (field.nestedFields && typeof val === "object" && val !== null) {
        if (field.type === "array") {
          const nestedGuard = createTypeGuard<unknown>(field.nestedFields);
          if (!(val as unknown[]).every(nestedGuard)) return false;
        } else {
          const nestedGuard = createTypeGuard<unknown>(field.nestedFields);
          if (!nestedGuard(val)) return false;
        }
      }
    }

    return true;
  };
}
