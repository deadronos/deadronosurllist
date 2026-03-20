import type { CollectionRecord, SortOrder } from "./types";

export type CollectionSortCriterion = {
  createdAt?: SortOrder;
  updatedAt?: SortOrder;
  name?: SortOrder;
  links?: { _count?: SortOrder };
  id?: SortOrder;
};

const compareValues = <T>(a: T, b: T, order: SortOrder): number => {
  const multiplier = order === "desc" ? -1 : 1;
  if (a instanceof Date && b instanceof Date) {
    return (a.getTime() - b.getTime()) * multiplier;
  }
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b) * multiplier;
  }
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * multiplier;
  }
  return 0;
};

export const compareCollections = (
  a: CollectionRecord,
  b: CollectionRecord,
  orderBy: CollectionSortCriterion[],
): number => {
  for (const sort of orderBy) {
    if (sort.links?._count) {
      const diff = compareValues(a.linkIds.length, b.linkIds.length, sort.links._count);
      if (diff !== 0) return diff;
    }
    if (sort.updatedAt) {
      const diff = compareValues(a.updatedAt, b.updatedAt, sort.updatedAt);
      if (diff !== 0) return diff;
    }
    if (sort.createdAt) {
      const diff = compareValues(a.createdAt, b.createdAt, sort.createdAt);
      if (diff !== 0) return diff;
    }
    if (sort.name) {
      const diff = compareValues(a.name, b.name, sort.name);
      if (diff !== 0) return diff;
    }
    if (sort.id) {
      const diff = compareValues(a.id, b.id, sort.id);
      if (diff !== 0) return diff;
    }
  }
  return 0;
};

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
  return items.sort((a, b) => compareValues(a[field], b[field], direction));
};
