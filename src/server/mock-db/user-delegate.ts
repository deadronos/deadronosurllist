import { getStore } from "./store";
import type { UserRecord } from "./types";

const applySelect = (
  record: UserRecord,
  select?: Record<string, boolean>,
): Partial<UserRecord> | UserRecord => {
  if (!select) return record;

  const result: Partial<UserRecord> = {};
  if (select.id) result.id = record.id;
  if (select.name) result.name = record.name ?? null;
  if (select.email) result.email = record.email ?? null;
  if (select.image) result.image = record.image ?? null;
  if (select.createdAt) result.createdAt = record.createdAt;
  if (select.updatedAt) result.updatedAt = record.updatedAt;

  return result;
};

export const userDelegate = {
  findFirst: async (args?: {
    where?: Record<string, unknown>;
    select?: Record<string, boolean>;
  }) => {
    const store = getStore();
    const where = args?.where;

    let record: UserRecord | undefined;
    if (!where || Object.keys(where).length === 0) {
      record = Array.from(store.users.values())[0];
    } else if (where.id && typeof where.id === "string") {
      record = store.users.get(where.id);
    } else if (where.email && typeof where.email === "string") {
      record = Array.from(store.users.values()).find(
        (user) => user.email === where.email,
      );
    }

    if (!record) return null;
    return applySelect(record, args?.select);
  },
} as const;