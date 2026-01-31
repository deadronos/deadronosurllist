export function dedupeById<T extends { id: string }>(items: T[]) {
  const deduped = new Map<string, T>();
  items.forEach((item) => {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item);
    }
  });
  return Array.from(deduped.values());
}
