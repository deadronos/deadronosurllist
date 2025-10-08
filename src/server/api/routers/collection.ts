import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const collectionRouter = createTRPCRouter({
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

