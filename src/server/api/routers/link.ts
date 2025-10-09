import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const linkRouter = createTRPCRouter({
  // Add link to collection
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

  // Update link
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

      if (link?.collection.createdById !== ctx.session.user.id) {
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

  // Delete link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const link = await ctx.db.link.findFirst({
        where: { id: input.id },
        include: { collection: true },
      });

      if (link?.collection.createdById !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.link.delete({
        where: { id: input.id },
      });
    }),

  // Reorder links
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

