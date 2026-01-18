import { TRPCError } from "@trpc/server";
import type { TRPCContext } from "@/server/api/trpc";

// Helper type for context in protected procedures
type ProtectedContext = {
  db: TRPCContext["db"];
  session: {
    user: {
      id: string;
    };
  };
};

/**
 * Verifies that a collection exists and belongs to the authenticated user.
 * @returns The collection object.
 */
export async function verifyCollectionOwnership(
  ctx: ProtectedContext,
  collectionId: string,
) {
  const collection = await ctx.db.collection.findFirst({
    where: {
      id: collectionId,
      createdById: ctx.session.user.id,
    },
  });

  if (!collection) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return collection;
}

/**
 * Verifies that a link exists and its parent collection belongs to the authenticated user.
 * @returns The link object with the collection included.
 */
export async function verifyLinkOwnership(ctx: ProtectedContext, linkId: string) {
  const link = await ctx.db.link.findFirst({
    where: { id: linkId },
    include: { collection: true },
  });

  if (
    !link ||
    !link.collection ||
    link.collection.createdById !== ctx.session.user.id
  ) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return link;
}
