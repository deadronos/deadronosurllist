import type { LinkInclude, LinkRecord, SortOrder } from "./types";
import { randomId } from "./ids";
import { getStore } from "./store";
import { matchesLinkWhere } from "./filters";
import { toLinkResult } from "./mappers";
import { touchCollectionUpdatedAt } from "./collection-delegate";

export const linkDelegate = {
  findFirst: async (args?: {
    where?: Record<string, unknown>;
    orderBy?: { order?: SortOrder };
    include?: LinkInclude;
  }) => {
    const store = getStore();
    const where = args?.where;
    const orderBy = args?.orderBy;
    const linkRecords = Array.from(store.links.values()).filter((record) =>
      matchesLinkWhere(record, where),
    );

    if (orderBy?.order) {
      const direction = orderBy.order === "desc" ? -1 : 1;
      linkRecords.sort((a, b) => (a.order - b.order) * direction);
    }

    const record = linkRecords[0];
    if (!record) return null;
    return toLinkResult(record, { include: args?.include });
  },

  findMany: async (args?: {
    where?: Record<string, unknown>;
    orderBy?: { order?: SortOrder };
    include?: LinkInclude;
  }) => {
    const store = getStore();
    const where = args?.where;
    const include = args?.include;
    const orderBy = args?.orderBy;

    const items = Array.from(store.links.values()).filter((record) =>
      matchesLinkWhere(record, where),
    );

    if (orderBy?.order) {
      const direction = orderBy.order === "desc" ? -1 : 1;
      items.sort((a, b) => (a.order - b.order) * direction);
    }

    return items.map((record) => toLinkResult(record, { include }));
  },

  create: async (args: { data: Record<string, unknown> }) => {
    const store = getStore();
    const data = args.data;
    const collectionId = data.collectionId as string;
    const collection = store.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    const now = new Date();
    const record: LinkRecord = {
      id: (data.id as string) ?? randomId("link"),
      collectionId,
      url: data.url as string,
      name: data.name as string,
      comment: data.comment === undefined ? null : (data.comment as string | null),
      order: (data.order as number) ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    store.links.set(record.id, record);
    if (!collection.linkIds.includes(record.id)) {
      collection.linkIds.push(record.id);
    }
    collection.updatedAt = now;

    return toLinkResult(record);
  },

  createMany: async (args: { data: Record<string, unknown>[] | Record<string, unknown> }) => {
    const store = getStore();
    const dataArray = Array.isArray(args.data) ? args.data : [args.data];
    const now = new Date();
    let count = 0;

    for (const data of dataArray) {
      const collectionId = data.collectionId as string;
      const collection = store.collections.get(collectionId);
      if (!collection) {
        throw new Error(`Collection ${collectionId} not found`);
      }

      const record: LinkRecord = {
        id: (data.id as string) ?? randomId("link"),
        collectionId,
        url: data.url as string,
        name: data.name as string,
        comment: data.comment === undefined ? null : (data.comment as string | null),
        order: (data.order as number) ?? 0,
        createdAt: now,
        updatedAt: now,
      };

      store.links.set(record.id, record);
      if (!collection.linkIds.includes(record.id)) {
        collection.linkIds.push(record.id);
      }
      collection.updatedAt = now;
      count++;
    }

    return { count };
  },

  update: async (args: {
    where: { id: string };
    data: Record<string, unknown>;
    include?: LinkInclude;
  }) => {
    const store = getStore();
    const { id } = args.where;
    const record = store.links.get(id);
    if (!record) {
      throw new Error(`Link ${id} not found`);
    }

    if (args.data.url !== undefined) record.url = args.data.url as string;
    if (args.data.name !== undefined) record.name = args.data.name as string;
    if (args.data.comment !== undefined) {
      record.comment = args.data.comment as string | null;
    }
    record.updatedAt = new Date();
    touchCollectionUpdatedAt(record.collectionId);

    return toLinkResult(record, { include: args.include });
  },

  updateMany: async (args: { where?: Record<string, unknown>; data: Record<string, unknown> }) => {
    const store = getStore();
    const where = args.where;
    const data = args.data;
    const matches = Array.from(store.links.values()).filter((record) =>
      matchesLinkWhere(record, where),
    );

    matches.forEach((record) => {
      if (data.order !== undefined) record.order = data.order as number;
      if (data.name !== undefined) record.name = data.name as string;
      if (data.comment !== undefined) {
        record.comment = data.comment as string | null;
      }
      if (data.url !== undefined) record.url = data.url as string;
      record.updatedAt = new Date();
      touchCollectionUpdatedAt(record.collectionId);
    });

    return { count: matches.length };
  },

  delete: async (args: { where: { id: string } }) => {
    const store = getStore();
    const { id } = args.where;
    const record = store.links.get(id);
    if (!record) {
      throw new Error(`Link ${id} not found`);
    }
    store.links.delete(id);
    const collection = store.collections.get(record.collectionId);
    if (collection) {
      collection.linkIds = collection.linkIds.filter((linkId) => linkId !== id);
      collection.updatedAt = new Date();
    }
    return toLinkResult(record);
  },
} as const;
