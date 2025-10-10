import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { Post } from "@prisma/client";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const post: Post = await ctx.db.post.create({
        data: {
          name: input.name,
          createdById: userId,
        },
      });

      return post;
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const post: Post | null = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdById: userId },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
