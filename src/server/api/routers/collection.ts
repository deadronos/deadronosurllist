import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
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

export const collectionRouter = createTRPCRouter({
  // Get the most recently updated public collection with links
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const collections = await ctx.db.collection.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      include: {
        links: {
          orderBy: { order: "asc" },
        },
      },
    });

    const collection = collections.at(0);
    if (!collection) return null;
    const links = collection.links ?? [];

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      links: links.map((link: CollectionLinkRecord): PublicLinkSummary => ({
        id: link.id,
        name: link.name,
        url: link.url,
        comment: link.comment,
        order: link.order,
      })),
    };
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
