// In-memory Prisma-like client used for local development and tests when the
// real database is not available. The goal is to provide the minimal surface
// area that our routers interact with while keeping behaviour predictable.

type SortOrder = "asc" | "desc";

type UserRecord = {
  id: string;
  name?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PostRecord = {
  id: number;
  name: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
};

type CollectionRecord = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  linkIds: string[];
};

type LinkRecord = {
  id: string;
  collectionId: string;
  url: string;
  name: string;
  comment: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type CollectionInclude = {
  _count?: { select?: { links?: boolean } } | boolean;
  links?: boolean | { orderBy?: { order?: SortOrder } };
};

type LinkInclude =
  | boolean
  | {
      collection?: boolean | { include?: CollectionInclude };
    };

type LinkSelect = {
  id?: boolean;
  url?: boolean;
  name?: boolean;
  comment?: boolean;
  order?: boolean;
  collectionId?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
};

type Store = {
  users: Map<string, UserRecord>;
  posts: Map<number, PostRecord>;
  collections: Map<string, CollectionRecord>;
  links: Map<string, LinkRecord>;
  postSequence: number;
};

const randomId = (prefix: string) => {
  // Prefer crypto.randomUUID when available to avoid predictable IDs.
  const unique =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${unique}`;
};

const cloneDate = (value: Date) => new Date(value.getTime());

const createStore = (): Store => ({
  users: new Map(),
  posts: new Map(),
  collections: new Map(),
  links: new Map(),
  postSequence: 1,
});

let store: Store = createStore();

const ensureUser = (userId: string) => {
  if (!store.users.has(userId)) {
    const now = new Date();
    store.users.set(userId, {
      id: userId,
      name: "Mock User",
      email: `${userId}@example.com`,
      createdAt: now,
      updatedAt: now,
    });
  }
};

const resetStore = () => {
  store = createStore();
  // Seed with a predictable user/collection/link so the UI has data.
  const now = new Date();
  const userId = "user1";
  ensureUser(userId);

  const collectionId = "col_public_discover";
  const defaultLinks = [
    {
      id: "link_github",
      url: "https://github.com",
      name: "GitHub",
      comment: "Collaborate on code and explore repositories.",
    },
    {
      id: "link_radix",
      url: "https://www.radix-ui.com",
      name: "Radix UI",
      comment: "Accessible primitives and themes for modern web apps.",
    },
    {
      id: "link_nextjs",
      url: "https://nextjs.org",
      name: "Next.js",
      comment: "Full-stack React framework for the web.",
    },
  ];

  store.collections.set(collectionId, {
    id: collectionId,
    name: "Discover Links",
    description: "Curated starters to explore the Deadronos URL List.",
    isPublic: true,
    createdById: userId,
    createdAt: now,
    updatedAt: now,
    linkIds: defaultLinks.map((link) => link.id),
  });

  defaultLinks.forEach((link, index) => {
    store.links.set(link.id, {
      id: link.id,
      collectionId,
      url: link.url,
      name: link.name,
      comment: link.comment ?? null,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  });
};

resetStore();

const matchesCollectionWhere = (
  record: CollectionRecord,
  where?: Record<string, unknown>,
) => {
  if (!where) return true;
  if (where.id && record.id !== where.id) return false;
  if (where.createdById && record.createdById !== where.createdById) return false;
  if (where.isPublic !== undefined && record.isPublic !== Boolean(where.isPublic)) {
    return false;
  }
  if (
    typeof where.createdBy === "object" &&
    where.createdBy &&
    "id" in where.createdBy &&
    record.createdById !== (where.createdBy as { id: string }).id
  ) {
    return false;
  }
  return true;
};

const matchesLinkWhere = (
  record: LinkRecord,
  where?: Record<string, unknown>,
) => {
  if (!where) return true;
  if (where.id && record.id !== where.id) return false;
  if (where.collectionId && record.collectionId !== where.collectionId) return false;
  return true;
};

const matchesPostWhere = (record: PostRecord, where?: Record<string, unknown>) => {
  if (!where) return true;
  if (where.id && record.id !== where.id) return false;
  if (where.createdById && record.createdById !== where.createdById) return false;
  if (
    typeof where.createdBy === "object" &&
    where.createdBy &&
    "id" in where.createdBy &&
    record.createdById !== (where.createdBy as { id: string }).id
  ) {
    return false;
  }
  return true;
};

const sortByDate = <T extends { createdAt: Date; updatedAt: Date }>(
  items: T[],
  orderBy?: { createdAt?: SortOrder; updatedAt?: SortOrder },
) => {
  if (!orderBy) return items;
  const entries = Object.entries(orderBy) as Array<
    [keyof typeof orderBy, SortOrder]
  >;
  if (entries.length === 0) return items;
  const [field, direction] = entries[0];
  const multiplier = direction === "desc" ? -1 : 1;
  return items.sort((a, b) => {
    const dateA = (a[field as "createdAt" | "updatedAt"] as Date).getTime();
    const dateB = (b[field as "createdAt" | "updatedAt"] as Date).getTime();
    return (dateA - dateB) * multiplier;
  });
};

const toCollectionResult = (
  record: CollectionRecord,
  include?: CollectionInclude,
) => {
  const base: Record<string, unknown> = {
    id: record.id,
    name: record.name,
    description: record.description,
    isPublic: record.isPublic,
    createdById: record.createdById,
    createdAt: cloneDate(record.createdAt),
    updatedAt: cloneDate(record.updatedAt),
  };

  const includeCount =
    include?._count === true ||
    (typeof include?._count === "object" && include?._count?.select?.links);

  if (includeCount) {
    base._count = { links: record.linkIds.length };
  }

  if (include?.links) {
    const options = include.links === true ? {} : include.links;
    const linkRecords = record.linkIds
      .map((id) => store.links.get(id))
      .filter((l): l is LinkRecord => !!l);

    if (options?.orderBy?.order) {
      const direction = options.orderBy.order;
      linkRecords.sort((a, b) =>
        direction === "desc" ? b.order - a.order : a.order - b.order,
      );
    } else {
      linkRecords.sort((a, b) => a.order - b.order);
    }

    base.links = linkRecords.map((link) => toLinkResult(link));
  }

  return base;
};

const pickSelectedFields = (source: Record<string, unknown>, select: LinkSelect) => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(select)) {
    if (value && key in source) {
      result[key] = source[key];
    }
  }
  return result;
};

const toLinkResult = (
  record: LinkRecord,
  opts?: { include?: LinkInclude; select?: LinkSelect },
) => {
  const base: Record<string, unknown> = {
    id: record.id,
    collectionId: record.collectionId,
    url: record.url,
    name: record.name,
    comment: record.comment,
    order: record.order,
    createdAt: cloneDate(record.createdAt),
    updatedAt: cloneDate(record.updatedAt),
  };

  let result: Record<string, unknown>;
  if (opts?.select) {
    result = pickSelectedFields(base, opts.select);
  } else {
    result = { ...base };
  }

  if (opts?.include) {
    const includeOptions = opts.include === true ? {} : opts.include;
    if (includeOptions?.collection) {
      const collectionInclude =
        includeOptions.collection === true
          ? undefined
          : includeOptions.collection.include;
      const collectionRecord = store.collections.get(record.collectionId);
      if (collectionRecord) {
        result.collection = toCollectionResult(collectionRecord, collectionInclude);
      }
    }
  }

  return result;
};

const touchCollection = (collectionId: string) => {
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

export const db = {
  $transaction: async <T>(operations: Array<(() => Promise<T>) | Promise<T>>) => {
    const results: T[] = [];
    for (const op of operations) {
      const value = typeof op === "function" ? await op() : await op;
      results.push(value);
    }
    return results;
  },

  collection: {
    findMany: async (args?: {
      where?: Record<string, unknown>;
      include?: CollectionInclude;
      orderBy?: { createdAt?: SortOrder; updatedAt?: SortOrder };
    }) => {
      const where = args?.where;
      const include = args?.include;
      const orderBy = args?.orderBy;

      const items = Array.from(store.collections.values()).filter((record) =>
        matchesCollectionWhere(record, where),
      );

      const sorted = orderBy ? sortByDate(items, orderBy) : items;

      return sorted.map((record) => toCollectionResult(record, include));
    },

    findFirst: async (args?: {
      where?: Record<string, unknown>;
      include?: { links?: boolean | { orderBy?: { order?: SortOrder } } };
    }) => {
      const where = args?.where;
      const include = args?.include;
      const found = Array.from(store.collections.values()).find((record) =>
        matchesCollectionWhere(record, where),
      );
      if (!found) return null;
      return toCollectionResult(found, include);
    },

    create: async (args: { data: Record<string, unknown> }) => {
      const data = args.data;
      const createdById = resolveCreatedById(data);
      ensureUser(createdById);
      const now = new Date();
      const record: CollectionRecord = {
        id: (data.id as string) ?? randomId("col"),
        name: data.name as string,
        description:
          data.description === undefined ? null : (data.description as string | null),
        isPublic: data.isPublic === undefined ? false : Boolean(data.isPublic),
        createdById,
        createdAt: now,
        updatedAt: now,
        linkIds: [],
      };
      store.collections.set(record.id, record);
      return toCollectionResult(record);
    },

    updateMany: async (args: {
      where?: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => {
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
        record.updatedAt = new Date();
      });
      return { count: matched.length };
    },

    deleteMany: async (args: { where?: Record<string, unknown> }) => {
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
  },

  link: {
    findFirst: async (args?: {
      where?: Record<string, unknown>;
      orderBy?: { order?: SortOrder };
      select?: LinkSelect;
      include?: LinkInclude;
    }) => {
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
      return toLinkResult(record, { select: args?.select, include: args?.include });
    },

    findMany: async (args?: {
      where?: Record<string, unknown>;
      orderBy?: { order?: SortOrder };
      include?: LinkInclude;
    }) => {
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

    update: async (args: {
      where: { id: string };
      data: Record<string, unknown>;
      include?: LinkInclude;
    }) => {
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
      touchCollection(record.collectionId);

      return toLinkResult(record, { include: args.include });
    },

    updateMany: async (args: {
      where?: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => {
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
        touchCollection(record.collectionId);
      });

      return { count: matches.length };
    },

    delete: async (args: { where: { id: string } }) => {
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
  },

  post: {
    findFirst: async (args?: {
      where?: Record<string, unknown>;
      orderBy?: { createdAt?: SortOrder; updatedAt?: SortOrder };
    }) => {
      const where = args?.where;
      const orderBy = args?.orderBy;

      const items = Array.from(store.posts.values()).filter((record) =>
        matchesPostWhere(record, where),
      );

      if (items.length === 0) return null;
      const sorted = orderBy ? sortByDate(items, orderBy) : items;
      const record = sorted[0];
      return {
        id: record.id,
        name: record.name,
        createdAt: cloneDate(record.createdAt),
        updatedAt: cloneDate(record.updatedAt),
        createdById: record.createdById,
      };
    },

    create: async (args: { data: Record<string, unknown> }) => {
      const data = args.data;
      const createdById = resolveCreatedById(data);
      ensureUser(createdById);
      const now = new Date();
      const record: PostRecord = {
        id: store.postSequence++,
        name: data.name as string,
        createdById,
        createdAt: now,
        updatedAt: now,
      };
      store.posts.set(record.id, record);
      return {
        id: record.id,
        name: record.name,
        createdById: record.createdById,
        createdAt: cloneDate(record.createdAt),
        updatedAt: cloneDate(record.updatedAt),
      };
    },
  },
};

export const __memoryDb = {
  reset: resetStore,
  ensureUser,
};
