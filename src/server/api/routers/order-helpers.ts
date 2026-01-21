import type { TRPCContext } from "@/server/api/trpc";

type ProtectedContext = {
  db: TRPCContext["db"];
  session: {
    user: {
      id: string;
    };
  };
};

export async function getNextCollectionOrderIndex(ctx: ProtectedContext) {
  const maxOrder = await ctx.db.collection.findFirst({
    where: { createdById: ctx.session.user.id },
    orderBy: { order: "desc" },
  });

  return (maxOrder?.order ?? -1) + 1;
}

export async function getNextLinkOrderIndex(
  ctx: ProtectedContext,
  collectionId: string,
) {
  const maxOrder = await ctx.db.link.findFirst({
    where: { collectionId },
    orderBy: { order: "desc" },
  });

  return (maxOrder?.order ?? 0) + 1;
}
