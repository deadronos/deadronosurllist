import { TRPCError } from "@trpc/server";

import type { TRPCContext } from "@/server/api/trpc";

type ReorderTableName = "collection" | "link";

type ReorderOptions = {
  /** tRPC context with db and session */
  ctx: {
    db: TRPCContext["db"];
    session: { user: { id: string } };
  };
  /** Ordered list of item IDs to apply */
  itemIds: string[];
  /** Prisma model name (e.g., "collection", "link") */
  tableName: ReorderTableName;
  /** Where clause for filtering items (e.g., user ownership) */
  whereClause: Record<string, unknown>;
  /** Primary key field name (usually "id") */
  selectId: string;
};

/**
 * Generic reorder function for collections, links, or any orderable entity.
 *
 * This helper eliminates duplicate reorder logic across tRPC routers by:
 * 1. Fetching current items with their orders
 * 2. Verifying ownership (by confirming all IDs are in the allowed set)
 * 3. Building updates only for items with changed orders (optimization)
 * 4. Executing all updates in a transaction for atomicity
 *
 * @param {ReorderOptions} options - Configuration for the reorder operation
 * @returns {Promise<unknown[]>} Result of the transaction (array of update results)
 *
 * @throws {TRPCError} If ownership verification fails (code: "FORBIDDEN")
 *
 * @example
 * ```typescript
 * export const reorder: protectedProcedure
 *   .input(z.object({ collectionIds: z.array(z.string()) }))
 *   .mutation(async ({ ctx, input }) => {
 *     return reorderItems({
 *       ctx,
 *       itemIds: input.collectionIds,
 *       tableName: "collection",
 *       whereClause: { createdById: ctx.session.user.id },
 *       selectId: "id",
 *     });
 *   });
 * ```
 */
export async function reorderItems({
  ctx,
  itemIds,
  tableName,
  whereClause,
  selectId,
}: ReorderOptions): Promise<unknown[]> {
  const delegate = ctx.db[tableName] as {
    findMany: (args: {
      where: Record<string, unknown>;
      select: Record<string, boolean>;
    }) => Promise<Array<Record<string, unknown>>>;
    updateMany: (args: {
      where: Record<string, unknown>;
      data: { order: number };
    }) => unknown;
  };

  const currentItems = await delegate.findMany({
    where: whereClause,
    select: { [selectId]: true, order: true },
  });

  const currentOrderMap = new Map(
    currentItems.map((item) => [String(item[selectId]), Number(item.order)]),
  );

  const ownedIds = new Set(currentItems.map((item) => String(item[selectId])));
  const hasUnauthorized = itemIds.some((id: string) => !ownedIds.has(id));
  if (hasUnauthorized) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  const updates = itemIds
    .map((itemId: string, index: number) => {
      const currentOrder = currentOrderMap.get(itemId);
      if (currentOrder === index) return null;

      return delegate.updateMany({
        where: { [selectId]: itemId, ...whereClause },
        data: { order: index },
      });
    })
    .filter((update): update is NonNullable<typeof update> => update !== null);

  if (updates.length === 0) return [];

  return (
    ctx.db as { $transaction: (ops: unknown[]) => Promise<unknown[]> }
  ).$transaction(updates);
}
