import type { SortOrder } from "./types";

export const sortByDate = <T extends { createdAt: Date; updatedAt: Date }>(
  items: T[],
  orderBy?: { createdAt?: SortOrder; updatedAt?: SortOrder },
) => {
  if (!orderBy) return items;
  const entries = Object.entries(orderBy) as Array<
    [keyof typeof orderBy, SortOrder]
  >;
  if (entries.length === 0) return items;
  const firstEntry = entries[0];
  if (!firstEntry) return items;
  const [field, direction] = firstEntry;
  if (field !== "createdAt" && field !== "updatedAt") return items;
  const multiplier = direction === "desc" ? -1 : 1;
  return items.sort((a, b) => {
    const dateA = a[field]?.getTime?.() ?? 0;
    const dateB = b[field]?.getTime?.() ?? 0;
    return (dateA - dateB) * multiplier;
  });
};
