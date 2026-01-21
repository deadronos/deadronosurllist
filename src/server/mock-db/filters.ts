import type { CollectionRecord, LinkRecord } from "./types";

export const matchStringFilter = (
  actual: string | null,
  filter: unknown,
): boolean => {
  if (typeof filter === "string") return actual === filter;
  if (typeof filter === "object" && filter !== null) {
    const f = filter as { contains?: string; mode?: "insensitive" };
    if (f.contains) {
      const needle =
        f.mode === "insensitive" ? f.contains.toLowerCase() : f.contains;
      const haystack =
        f.mode === "insensitive" ? (actual ?? "").toLowerCase() : actual ?? "";
      return haystack.includes(needle);
    }
  }
  return true;
};

export const matchesCollectionWhere = (
  record: CollectionRecord,
  where?: Record<string, unknown>,
) => {
  if (!where) return true;

  if (where.OR && Array.isArray(where.OR)) {
    const matchesOr = where.OR.some((cond: Record<string, unknown>) =>
      matchesCollectionWhere(record, cond),
    );
    if (!matchesOr) return false;
  }

  if (where.name && !matchStringFilter(record.name, where.name)) return false;
  if (
    where.description &&
    !matchStringFilter(record.description, where.description)
  ) {
    return false;
  }

  if (where.id && record.id !== where.id) return false;
  if (where.createdById && record.createdById !== where.createdById)
    return false;
  if (
    where.isPublic !== undefined &&
    record.isPublic !== Boolean(where.isPublic)
  ) {
    return false;
  }
  if (
    typeof where.createdBy === "object" &&
    where.createdBy &&
    "id" in where.createdBy &&
    record.createdById !== (where.createdBy as { id: string }).id
  ) {
    return false;
  }
  return true;
};

export const matchesLinkWhere = (
  record: LinkRecord,
  where?: Record<string, unknown>,
) => {
  if (!where) return true;
  if (where.id && record.id !== where.id) return false;
  if (where.collectionId && record.collectionId !== where.collectionId)
    return false;
  return true;
};
