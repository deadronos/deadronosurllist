import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  type TRPCContext,
} from "@/server/api/trpc";

type PublicLinkSummary = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

type CollectionLinkRecord = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

type PublicCollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
  links: PublicLinkSummary[];
};

const publicCatalogQuery = {
  where: { isPublic: true },
  orderBy: { updatedAt: "desc" as const },
  include: {
    links: {
      orderBy: { order: "asc" as const },
    },
  },
} as const;

async function fetchPublicCollections(
  ctx: TRPCContext,
): Promise<PublicCollectionSummary[]> {
  const collections = await ctx.db.collection.findMany(publicCatalogQuery);
  return collections.map((collection) => {
    const links = collection.links ?? [];
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      updatedAt: collection.updatedAt,
      links: links.map(
        (link: CollectionLinkRecord): PublicLinkSummary => ({
          id: link.id,
          name: link.name,
          url: link.url,
          comment: link.comment,
          order: link.order,
        }),
      ),
    };
  });
}

export const collectionRouter = createTRPCRouter({
  // Get the most recently updated public collection with links
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const collections = await fetchPublicCollections(ctx);
    return collections.at(0) ?? null;
  }),

  // Get all public collections with link summaries
  listPublic: publicProcedure.query(async ({ ctx }) => {
    return fetchPublicCollections(ctx);
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
