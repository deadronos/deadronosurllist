// In-memory store mock for Prisma-like `db` export used in dev/tests.
// This store lives in the Node process memory and supports simple CRUD for `collection`.

type Collection = {
  id: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
  createdById: string;
  updatedAt?: string;
  createdAt?: string;
  links?: any[];
};

const nowIso = () => new Date().toISOString();

// Simple in-memory DB. Keep it module-scoped so it persists across imports in the same process.
const store: { collections: Collection[] } = {
  collections: [
    {
      id: 'col1',
      name: 'Seeded collection',
      description: 'A seeded collection',
      isPublic: false,
      createdById: 'user1',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      links: [],
    },
  ],
};

const generateId = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const db = {
  collection: {
    findMany: async (opts?: any) => {
      const where = opts?.where || {};
      let results = store.collections.slice();
      if (where.createdById) {
        results = results.filter((c) => c.createdById === where.createdById);
      }
      // support simple orderBy updatedAt desc
      if (opts?.orderBy?.updatedAt === 'desc') {
        results.sort((a, b) => (b.updatedAt ?? '')!.localeCompare(a.updatedAt ?? ''));
      }
      // include _count.links
      return results.map((c) => ({ ...c, _count: { links: c.links?.length ?? 0 } }));
    },

    findFirst: async (opts?: any) => {
      const where = opts?.where || {};
      return store.collections.find((c) => {
        if (where.id && c.id !== where.id) return false;
        if (where.createdById && c.createdById !== where.createdById) return false;
        return true;
      }) ?? null;
    },

    create: async (args: any) => {
      const data = args.data || {};
      const newItem: Collection = {
        id: data.id ?? generateId('col'),
        name: data.name,
        description: data.description ?? null,
        isPublic: data.isPublic ?? false,
        createdById: data.createdBy?.connect?.id ?? data.createdById ?? 'user1',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        links: [],
      };
      store.collections.push(newItem);
      return newItem;
    },

    updateMany: async (args: any) => {
      const where = args.where || {};
      const data = args.data || {};
      const matched = store.collections.filter((c) => {
        if (where.id && c.id !== where.id) return false;
        if (where.createdById && c.createdById !== where.createdById) return false;
        return true;
      });
      matched.forEach((c) => {
        if (data.name !== undefined) c.name = data.name;
        if (data.description !== undefined) c.description = data.description;
        if (data.isPublic !== undefined) c.isPublic = data.isPublic;
        c.updatedAt = nowIso();
      });
      return { count: matched.length };
    },

    deleteMany: async (args: any) => {
      const where = args.where || {};
      const before = store.collections.length;
      store.collections = store.collections.filter((c) => {
        if (where.id && c.id === where.id && (!where.createdById || c.createdById === where.createdById)) {
          return false; // remove
        }
        if (where.createdById && c.createdById === where.createdById && !where.id) {
          return false;
        }
        return true;
      });
      const after = store.collections.length;
      return { count: before - after };
    },
  },
};
