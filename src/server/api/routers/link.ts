import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const linkRouter = createTRPCRouter({
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
        url: z.string().url(),
        name: z.string().min(1).max(200),
        comment: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify collection belongs to user
      const collection = await ctx.db.collection.findFirst({
        where: {
          id: input.collectionId,
          createdById: ctx.session.user.id,
        },
      });

      if (!collection) throw new TRPCError({ code: "FORBIDDEN" });

      // Get max order for new link
      const maxOrder = await ctx.db.link.findFirst({
        where: { collectionId: input.collectionId },
        orderBy: { order: "desc" },
      });

      return ctx.db.link.create({
        data: {
          ...input,
          order: (maxOrder?.order ?? 0) + 1,
        },
      });
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
        url: z.string().url().optional(),
        name: z.string().min(1).max(200).optional(),
        comment: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify link belongs to user's collection
      const link = await ctx.db.link.findFirst({
        where: { id: input.id },
        include: { collection: true },
      });

      if (
        !link ||
        !link.collection ||
        link.collection.createdById !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.link.update({
        where: { id: input.id },
        data: {
          url: input.url,
          name: input.name,
          comment: input.comment,
        },
      });
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
      // Verify ownership
      const link = await ctx.db.link.findFirst({
        where: { id: input.id },
        include: { collection: true },
      });

      if (
        !link ||
        !link.collection ||
        link.collection.createdById !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.link.delete({
        where: { id: input.id },
      });
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
      // Verify collection ownership
      const collection = await ctx.db.collection.findFirst({
        where: {
          id: input.collectionId,
          createdById: ctx.session.user.id,
        },
      });

      if (!collection) throw new TRPCError({ code: "FORBIDDEN" });

      // Update order for each link
      const updates = input.linkIds.map((linkId, index) =>
        ctx.db.link.updateMany({
          where: { id: linkId, collectionId: input.collectionId },
          data: { order: index },
        }),
      );

      return ctx.db.$transaction(updates);
    }),
});
