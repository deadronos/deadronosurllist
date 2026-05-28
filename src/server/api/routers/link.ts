import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { fetchLinkPreview } from "@/server/api/link-preview";
import type { LinkPreviewResult } from "@/server/api/link-preview";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { urlSchema } from "@/server/api/validation";
import { invalidatePublicCatalogCache } from "@/server/cache/public-catalog";
import { getNextLinkOrderIndex } from "./order-helpers";
import { reorderItems } from "./reorder-helpers";
import {
  verifyCollectionOwnership,
  verifyLinkOwnership,
} from "./router-helpers";

export const linkRouter = createTRPCRouter({
  /**
   * Fetch metadata (title, description) for a given URL.
   *
   * Hardened with:
   * - 5-second timeout (AbortController)
   * - 512 KB response body cap
   * - HTTP status check (non-2xx → error)
   * - Redirect limit (5 hops via native fetch)
   *
   * @param {object} input - The input object.
   * @param {string} input.url - The URL to fetch metadata for.
   * @returns {Promise<{ title: string; description: string }>} The extracted metadata.
   * @throws {TRPCError} BAD_REQUEST when the preview cannot be fetched.
   */
  preview: protectedProcedure
    .input(z.object({ url: urlSchema }))
    .mutation(async ({ input }) => {
      const result = await fetchLinkPreview(input.url);

      if ("ok" in result && result.ok === false) {
        console.warn("Link preview failed for", input.url, ":", result.reason);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unable to fetch preview: ${result.reason}`,
        });
      }

      return result as LinkPreviewResult;
    }),

  /**
   * Create a new link within a collection.
   * Automatically assigns the next available order index.
   *
   * @param {object} input - The input object.
   * @param {string} input.collectionId - The ID of the parent collection.
   * @param {string} input.url - The URL of the link.
   * @param {string} input.name - The display name of the link.
   * @param {string} [input.comment] - Optional comment or description.
   * @returns {Promise<LinkRecord>} The created link.
   */
  create: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        url: urlSchema,
        name: z.string().min(1).max(200),
        comment: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyCollectionOwnership(ctx, input.collectionId);

      const nextOrder = await getNextLinkOrderIndex(ctx, input.collectionId);

      const created = await ctx.db.link.create({
        data: {
          ...input,
          order: nextOrder,
        },
      });

      invalidatePublicCatalogCache();
      return created;
    }),

  /**
   * Create multiple links at once.
   *
   * @param {object} input - The input object.
   * @param {string} input.collectionId - The ID of the parent collection.
   * @param {object[]} input.links - Array of links to create.
   * @returns {Promise<unknown>} The result of the creation.
   */
  createBatch: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        links: z
          .array(
            z.object({
              url: urlSchema,
              name: z.string().min(1).max(200),
              comment: z.string().max(1000).optional(),
            }),
          )
          .min(1)
          .max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyCollectionOwnership(ctx, input.collectionId);

      const startOrder = await getNextLinkOrderIndex(ctx, input.collectionId);

      const result = await ctx.db.link.createMany({
        data: input.links.map((link, index) => ({
          ...link,
          collectionId: input.collectionId,
          order: startOrder + index,
        })),
      });

      invalidatePublicCatalogCache();
      return result;
    }),

  /**
   * Update an existing link.
   *
   * @param {object} input - The input object.
   * @param {string} input.id - The ID of the link to update.
   * @param {string} [input.url] - New URL.
   * @param {string} [input.name] - New name.
   * @param {string} [input.comment] - New comment.
   * @returns {Promise<LinkRecord>} The updated link.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        url: urlSchema.optional(),
        name: z.string().min(1).max(200).optional(),
        comment: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyLinkOwnership(ctx, input.id);

      const result = await ctx.db.link.update({
        where: { id: input.id },
        data: {
          url: input.url,
          name: input.name,
          comment: input.comment,
        },
      });

      invalidatePublicCatalogCache();
      return result;
    }),

  /**
   * Delete a link.
   *
   * @param {object} input - The input object.
   * @param {string} input.id - The ID of the link to delete.
   * @returns {Promise<LinkRecord>} The deleted link.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyLinkOwnership(ctx, input.id);

      const result = await ctx.db.link.delete({
        where: { id: input.id },
      });

      invalidatePublicCatalogCache();
      return result;
    }),

  /**
   * Reorder links within a collection.
   *
   * @param {object} input - The input object.
   * @param {string} input.collectionId - The ID of the parent collection.
   * @param {string[]} input.linkIds - Ordered list of link IDs.
   * @returns {Promise<unknown[]>} Result of the transaction.
   */
  reorder: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        linkIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyCollectionOwnership(ctx, input.collectionId);

      const result = await reorderItems({
        ctx,
        itemIds: input.linkIds,
        tableName: "link",
        whereClause: { collectionId: input.collectionId },
        selectId: "id",
      });

      invalidatePublicCatalogCache();
      return result;
    }),
});
