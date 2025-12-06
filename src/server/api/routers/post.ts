import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { Post } from "@prisma/client";

export const postRouter = createTRPCRouter({
  /**
   * A simple test procedure.
   *
   * @param {object} input - The input object.
   * @param {string} input.text - Text to say hello to.
   * @returns {object} A greeting message.
   */
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  /**
   * Create a new post.
   *
   * @param {object} input - The input object.
   * @param {string} input.name - The name of the post.
   * @returns {Promise<Post>} The created post.
   */
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

  /**
   * Get the latest post created by the user.
   *
   * @returns {Promise<Post | null>} The latest post or null.
   */
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const post: Post | null = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdById: userId },
    });

    return post ?? null;
  }),

  /**
   * A protected procedure example.
   *
   * @returns {string} A secret message.
   */
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
