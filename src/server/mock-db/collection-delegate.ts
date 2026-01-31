import type { CollectionInclude, CollectionRecord, SortOrder } from "./types";
import { randomId } from "./ids";
import { getStore } from "./store";
import { ensureUser } from "./users";
import { matchesCollectionWhere } from "./filters";
import { sortByDate } from "./sort";
import { toCollectionResult } from "./mappers";

const touchCollection = (collectionId: string) => {
  const store = getStore();
  const collection = store.collections.get(collectionId);
  if (collection) {
    collection.updatedAt = new Date();
  }
};

const resolveCreatedById = (data: Record<string, unknown>): string => {
  if (data.createdById) {
    return data.createdById as string;
  }
  const nested = data.createdBy as
    | undefined
    | { connect?: { id?: string } | null }
    | null;
  const connectedId = nested?.connect?.id;
  if (connectedId) return connectedId;
  // Provide a deterministic fallback so tests always have an owner.
  return "user1";
};

export const collectionDelegate = {
  findMany: async (args?: {
    where?: Record<string, unknown>;
    include?: CollectionInclude;
    orderBy?:
      | {
          createdAt?: SortOrder;
          updatedAt?: SortOrder;
          name?: SortOrder;
          links?: { _count?: SortOrder };
          order?: SortOrder;
        }
      | Array<{
          createdAt?: SortOrder;
          updatedAt?: SortOrder;
          name?: SortOrder;
          links?: { _count?: SortOrder };
          id?: SortOrder;
        }>;
    take?: number;
    skip?: number;
    cursor?: { id: string };
  }) => {
    const store = getStore();
    const { where, include, orderBy, take, skip, cursor } = args ?? {};

    let items = Array.from(store.collections.values()).filter((record) =>
      matchesCollectionWhere(record, where),
    );

    // Sort
    if (Array.isArray(orderBy)) {
      items.sort((a, b) => {
        for (const sort of orderBy) {
          if (sort.updatedAt) {
            const dateA = a.updatedAt.getTime();
            const dateB = b.updatedAt.getTime();
            const diff =
              (dateA - dateB) * (sort.updatedAt === "desc" ? -1 : 1);
            if (diff !== 0) return diff;
          }
          if (sort.createdAt) {
            const dateA = a.createdAt.getTime();
            const dateB = b.createdAt.getTime();
            const diff =
              (dateA - dateB) * (sort.createdAt === "desc" ? -1 : 1);
            if (diff !== 0) return diff;
          }
          if (sort.name) {
            const diff =
              a.name.localeCompare(b.name) * (sort.name === "desc" ? -1 : 1);
            if (diff !== 0) return diff;
          }
          if (sort.links && sort.links._count) {
            const diff =
              (a.linkIds.length - b.linkIds.length) *
              (sort.links._count === "desc" ? -1 : 1);
            if (diff !== 0) return diff;
          }
          if (sort.id) {
            const diff =
              a.id.localeCompare(b.id) * (sort.id === "desc" ? -1 : 1);
            if (diff !== 0) return diff;
          }
        }
        return 0;
      });
    } else if (orderBy && "order" in orderBy && orderBy.order) {
      const direction = orderBy.order === "desc" ? -1 : 1;
      items.sort((a, b) => (a.order - b.order) * direction);
    } else if (orderBy && !Array.isArray(orderBy)) {
      items = sortByDate(items, orderBy);
    }

    // Cursor & Pagination
    let startIndex = 0;
    if (cursor?.id) {
      const idx = items.findIndex((i) => i.id === cursor.id);
      if (idx !== -1) {
        startIndex = idx;
      }
    }

    if (skip) {
      startIndex += skip;
    }

    let result = items.slice(startIndex);

    if (take !== undefined) {
      result = result.slice(0, take);
    }

    return result.map((record) => toCollectionResult(record, include));
  },

  findFirst: async (args?: {
    where?: Record<string, unknown>;
    include?: { links?: boolean | { orderBy?: { order?: SortOrder } } };
  }) => {
    const store = getStore();
    const where = args?.where;
    const include = args?.include;
    const found = Array.from(store.collections.values()).find((record) =>
      matchesCollectionWhere(record, where),
    );
    if (!found) return null;
    return toCollectionResult(found, include);
  },

  create: async (args: { data: Record<string, unknown> }) => {
    const store = getStore();
    const data = args.data;
    const createdById = resolveCreatedById(data);
    ensureUser(createdById);
    const now = new Date();
    const record: CollectionRecord = {
      id: (data.id as string) ?? randomId("col"),
      name: data.name as string,
      description:
        data.description === undefined
          ? null
          : (data.description as string | null),
      isPublic: data.isPublic === undefined ? false : Boolean(data.isPublic),
      createdById,
      createdAt: now,
      updatedAt: now,
      order: typeof data.order === "number" ? data.order : store.collections.size,
      linkIds: [],
    };
    store.collections.set(record.id, record);
    return toCollectionResult(record);
  },

  update: async (args: {
    where: { id: string };
    data: Record<string, unknown>;
    include?: CollectionInclude;
  }) => {
    const store = getStore();
    const { id } = args.where;
    const record = store.collections.get(id);
    if (!record) {
      throw new Error(`Collection ${id} not found`);
    }

    const data = args.data ?? {};
    if (data.name !== undefined) record.name = data.name as string;
    if (data.description !== undefined) {
      record.description = data.description as string | null;
    }
    if (data.isPublic !== undefined) {
      record.isPublic = Boolean(data.isPublic);
    }
    if (data.order !== undefined) {
      record.order = data.order as number;
    }
    record.updatedAt = new Date();

    return toCollectionResult(record, args.include);
  },

  updateMany: async (args: {
    where?: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => {
    const store = getStore();
    const where = args.where;
    const data = args.data ?? {};
    const matched = Array.from(store.collections.values()).filter((record) =>
      matchesCollectionWhere(record, where),
    );
    matched.forEach((record) => {
      if (data.name !== undefined) record.name = data.name as string;
      if (data.description !== undefined) {
        record.description = data.description as string | null;
      }
      if (data.isPublic !== undefined) record.isPublic = Boolean(data.isPublic);
      if (data.order !== undefined) {
        record.order = data.order as number;
      }
      record.updatedAt = new Date();
    });
    return { count: matched.length };
  },

  count: async (args?: { where?: Record<string, unknown> }) => {
    const store = getStore();
    const where = args?.where;
    const count = Array.from(store.collections.values()).filter((record) =>
      matchesCollectionWhere(record, where),
    ).length;
    return count;
  },

  delete: async (args: { where: { id: string }; include?: CollectionInclude }) => {
    const store = getStore();
    const { id } = args.where;
    const record = store.collections.get(id);
    if (!record) {
      throw new Error(`Collection ${id} not found`);
    }

    store.collections.delete(id);
    record.linkIds.forEach((linkId) => {
      store.links.delete(linkId);
    });

    return toCollectionResult(record, args.include);
  },

  deleteMany: async (args: { where?: Record<string, unknown> }) => {
    const store = getStore();
    const where = args.where;
    const idsToRemove = Array.from(store.collections.values())
      .filter((record) => matchesCollectionWhere(record, where))
      .map((record) => record.id);

    idsToRemove.forEach((id) => {
      const record = store.collections.get(id);
      if (!record) return;
      record.linkIds.forEach((linkId) => {
        store.links.delete(linkId);
      });
      store.collections.delete(id);
    });

    return { count: idsToRemove.length };
  },
} as const;

export function touchCollectionUpdatedAt(collectionId: string) {
  touchCollection(collectionId);
}
