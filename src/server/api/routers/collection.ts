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
import { invalidatePublicCatalogCache } from "@/server/cache/public-catalog";
import {
  normalizeDescriptionForCreate,
  normalizeDescriptionForUpdate,
} from "./collection/normalizers";
import { getNextCollectionOrderIndex } from "./order-helpers";
import { reorderItems } from "./reorder-helpers";
import { verifyCollectionOwnership } from "./router-helpers";

export const collectionRouter = createTRPCRouter({
  /**
   * Get the most recently updated public collection with links.
   * Useful for the landing page hero section.
   *
   * @returns {Promise<PublicCatalogItem | null>} The most recent public collection or null.
   */
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const catalog = await fetchPublicCatalog(ctx, {
      limit: 1,
      linkLimit: PUBLIC_CATALOG_DEFAULT_LINK_LIMIT,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
    return catalog.items.at(0) ?? null;
  }),

  /**
   * Get all public collections with link summaries and pagination metadata.
   * Supports search, pagination (cursor-based), and configurable link limits.
   *
   * @param {PublicCatalogInput} input - Search and pagination parameters.
   * @returns {Promise<PublicCatalogResponse>} A page of public collections.
   */
  getPublicCatalog: publicProcedure
    .input(publicCatalogInputSchema)
    .output(publicCatalogResponseSchema)
    .query(async ({ ctx, input }) => {
      return fetchPublicCatalog(ctx, input);
    }),

  /**
   * Get public collections for a specific user.
   * Returns only collections marked public, ordered by last update.
   */
  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.collection.findMany({
        where: { createdById: input.userId, isPublic: true },
        include: { _count: { select: { links: true } } },
        orderBy: { updatedAt: "desc" },
      });
    }),

  /**
   * Get all collections for the current authenticated user.
   * Returns a list of collections with link counts, ordered by user-defined order.
   *
   * @returns {Promise<CollectionRecord[]>} The user's collections.
   */
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.collection.findMany({
      where: { createdById: ctx.session.user.id },
      include: { _count: { select: { links: true } } },
      orderBy: { order: "asc" },
    });
  }),

  /**
   * Get a single collection with all its links.
   * Ensures the collection belongs to the authenticated user.
   *
   * @param {object} input - The input object.
   * @param {string} input.id - The ID of the collection to retrieve.
   * @returns {Promise<CollectionRecord | null>} The collection with links, or null if not found.
   */
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

  /**
   * Create a new collection.
   * Automatically assigns the next available order index.
   *
   * @param {object} input - The input object.
   * @param {string} input.name - The name of the collection.
   * @param {string} [input.description] - Optional description.
   * @param {boolean} [input.isPublic=false] - Whether the collection is public.
   * @returns {Promise<CollectionRecord>} The created collection.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const nextOrder = await getNextCollectionOrderIndex(ctx);

      const created = await ctx.db.collection.create({
        data: {
          name: input.name,
          description: normalizeDescriptionForCreate(input.description),
          isPublic: input.isPublic,
          order: nextOrder,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });

      invalidatePublicCatalogCache();
      return created;
    }),

  /**
   * Update an existing collection.
   * Only allows updating fields that are provided.
   *
   * @param {object} input - The input object.
   * @param {string} input.id - The ID of the collection to update.
   * @param {string} [input.name] - New name.
   * @param {string|null} [input.description] - New description.
   * @param {boolean} [input.isPublic] - New visibility status.
   * @returns {Promise<{ count: number }>} Result of the update operation.
   */
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
      await verifyCollectionOwnership(ctx, input.id);

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

      const result = await ctx.db.collection.updateMany({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: dataToUpdate,
      });

      invalidatePublicCatalogCache();
      return result;
    }),

  /**
   * Delete a collection.
   *
   * @param {object} input - The input object.
   * @param {string} input.id - The ID of the collection to delete.
   * @returns {Promise<{ count: number }>} Result of the delete operation.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyCollectionOwnership(ctx, input.id);

      const result = await ctx.db.collection.deleteMany({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });

      invalidatePublicCatalogCache();
      return result;
    }),

  /**
   * Reorder collections based on a provided list of IDs.
   * Updates the `order` field for all collections to match the array index.
   *
   * @param {object} input - The input object.
   * @param {string[]} input.collectionIds - Ordered list of collection IDs.
   * @returns {Promise<unknown[]>} Result of the transaction.
   */
  reorder: protectedProcedure
    .input(z.object({ collectionIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const result = await reorderItems({
        ctx,
        itemIds: input.collectionIds,
        tableName: "collection",
        whereClause: { createdById: ctx.session.user.id },
        selectId: "id",
      });

      invalidatePublicCatalogCache();
      return result;
    }),
});
