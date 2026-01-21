export function dedupeById<T extends { id: string }>(items: T[]) {
  const deduped = new Map<string, T>();
  items.forEach((item) => {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item);
    }
  });
  return Array.from(deduped.values());
}

export function sortCollectionsByTab<T extends { updatedAt: string }>(
  collections: T[],
  tab: "new" | "updated",
) {
  const list = [...collections];
  list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return tab === "new" ? [...list].reverse() : list;
}

export function filterCollectionsByQuery<
  T extends { name: string; description?: string | null },
>(
  collections: T[],
  query: string,
) {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return collections;

  return collections.filter((collection) => {
    const haystack = [collection.name, collection.description ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(trimmedQuery);
  });
}
