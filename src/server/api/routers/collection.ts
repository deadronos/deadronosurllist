import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  type TRPCContext,
} from "@/server/api/trpc";

const PUBLIC_CATALOG_DEFAULT_LIMIT = 12;
const PUBLIC_CATALOG_DEFAULT_LINK_LIMIT = 3;

const publicCatalogInputSchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.number().int().min(1).max(50).default(PUBLIC_CATALOG_DEFAULT_LIMIT),
  cursor: z.string().min(1).optional(),
  linkLimit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(PUBLIC_CATALOG_DEFAULT_LINK_LIMIT),
});

const publicLinkSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  comment: z.string().nullable(),
  order: z.number().int(),
});

const publicCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.literal(true),
  updatedAt: z.string(),
  topLinks: z.array(publicLinkSchema),
});

const publicCatalogResponseSchema = z.object({
  items: z.array(publicCollectionSchema),
  nextCursor: z.string().nullable(),
  totalCount: z.number().int(),
});

type PublicCatalogInput = z.infer<typeof publicCatalogInputSchema>;
type PublicCatalogItem = z.infer<typeof publicCollectionSchema>;
type PublicCatalogResponse = z.infer<typeof publicCatalogResponseSchema>;

const publicCatalogQuery = {
  where: { isPublic: true },
  include: {
    links: {
      orderBy: { order: "asc" as const },
    },
  },
} as const;

const normalizeDescription = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined) return null;
  return value;
};

const toIsoString = (value: Date | string): string => {
  if (typeof value === "string") {
    return value;
  }
  return value.toISOString();
};

const mapCollectionRecordToCatalogItem = (
  collection: {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    updatedAt: Date | string;
    links?: Array<{
      id: string;
      name: string;
      url: string;
      comment: string | null;
      order: number;
    }>;
  },
  linkLimit: number,
): PublicCatalogItem => {
  const links = Array.isArray(collection.links) ? collection.links : [];
  const sortedLinks = [...links].sort((a, b) => a.order - b.order);
  const trimmedLinks = sortedLinks.slice(0, linkLimit).map((link) => ({
    id: link.id,
    name: link.name,
    url: link.url,
    comment: link.comment,
    order: link.order,
  }));

  return {
    id: collection.id,
    name: collection.name,
    description: normalizeDescription(collection.description),
    isPublic: true,
    updatedAt: toIsoString(collection.updatedAt),
    topLinks: trimmedLinks,
  };
};

async function fetchPublicCatalog(
  ctx: TRPCContext,
  input: PublicCatalogInput,
): Promise<PublicCatalogResponse> {
  const query = input.q?.trim().toLowerCase();
  const linkLimit = input.linkLimit ?? PUBLIC_CATALOG_DEFAULT_LINK_LIMIT;
  const limit = input.limit ?? PUBLIC_CATALOG_DEFAULT_LIMIT;

  const collections = await ctx.db.collection.findMany(publicCatalogQuery);

  const filtered = collections.filter((collection) => {
    if (!query) return true;
    const haystack = [collection.name, collection.description ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const sorted = filtered.sort((a, b) => {
    const dateDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return b.id.localeCompare(a.id);
  });

  const allItems = sorted.map((collection) =>
    mapCollectionRecordToCatalogItem(collection, linkLimit),
  );

  const totalCount = allItems.length;
  const cursorId = input.cursor;
  let startIndex = 0;
  if (cursorId) {
    const cursorIndex = allItems.findIndex((item) => item.id === cursorId);
    startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  }
  const pageItems = allItems.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < allItems.length;
  const lastItem = pageItems.at(-1);
  const nextCursor = hasMore && lastItem ? lastItem.id : null;

  return {
    items: pageItems,
    nextCursor,
    totalCount,
  } satisfies PublicCatalogResponse;
}

export const collectionRouter = createTRPCRouter({
  // Get the most recently updated public collection with links
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const catalog = await fetchPublicCatalog(ctx, {
      limit: 1,
      linkLimit: PUBLIC_CATALOG_DEFAULT_LINK_LIMIT,
    });
    return catalog.items.at(0) ?? null;
  }),

  // Get all public collections with link summaries and pagination metadata
  getPublicCatalog: publicProcedure
    .input(publicCatalogInputSchema)
    .output(publicCatalogResponseSchema)
    .query(async ({ ctx, input }) => {
      return fetchPublicCatalog(ctx, input);
    }),

  // Get all collections for current user
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.collection.findMany({
      where: { createdById: ctx.session.user.id },
      include: { _count: { select: { links: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }),

  // Get single collection with all links
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.collection.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        include: {
          links: { orderBy: { order: "asc" } },
        },
      });
    }),

  // Create new collection
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.collection.create({
        data: {
          ...input,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  // Update collection
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.collection.updateMany({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
        },
      });
    }),

  // Delete collection
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.collection.deleteMany({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });
    }),
});
