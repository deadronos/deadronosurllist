import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

import {
  PUBLIC_CATALOG_DEFAULT_LINK_LIMIT,
  fetchPublicCatalog,
  publicCatalogInputSchema,
  publicCatalogResponseSchema,
} from "./collection/catalog";
import {
  normalizeDescriptionForCreate,
  normalizeDescriptionForUpdate,
} from "./collection/normalizers";

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
      orderBy: { order: "asc" },
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
    .mutation(async ({ ctx, input }) => {
      const maxOrder = await ctx.db.collection.findFirst({
        where: { createdById: ctx.session.user.id },
        orderBy: { order: "desc" },
      });

      return ctx.db.collection.create({
        data: {
          name: input.name,
          description: normalizeDescriptionForCreate(input.description),
          isPublic: input.isPublic,
          order: (maxOrder?.order ?? -1) + 1,
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
        description: z.string().max(500).nullable().optional(),
        isPublic: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });

      if (!collection) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const description = normalizeDescriptionForUpdate(input.description);
      const dataToUpdate: Record<string, unknown> = {};
      if (input.name !== undefined) {
        dataToUpdate.name = input.name;
      }
      if (description !== undefined) {
        dataToUpdate.description = description;
      }
      if (input.isPublic !== undefined) {
        dataToUpdate.isPublic = input.isPublic;
      }

      return ctx.db.collection.updateMany({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: dataToUpdate,
      });
    }),

  // Delete collection
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });

      if (!collection) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.collection.deleteMany({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });
    }),

  // Reorder collections
  reorder: protectedProcedure
    .input(z.object({ collectionIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userCollections = await ctx.db.collection.findMany({
        where: { createdById: ctx.session.user.id },
        select: { id: true },
      });

      const ownedIds = new Set(
        userCollections.map((collection) => collection.id),
      );
      const hasUnauthorized = input.collectionIds.some(
        (collectionId) => !ownedIds.has(collectionId),
      );

      if (hasUnauthorized) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updates = input.collectionIds.map((collectionId, index) =>
        ctx.db.collection.updateMany({
          where: { id: collectionId, createdById: ctx.session.user.id },
          data: { order: index },
        }),
      );

      return ctx.db.$transaction(updates);
    }),
});
