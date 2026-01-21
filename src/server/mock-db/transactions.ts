export async function runTransaction(
  operations: Array<(() => Promise<unknown>) | Promise<unknown>>,
) {
  const results: unknown[] = [];
  for (const op of operations) {
    const value = typeof op === "function" ? await op() : await op;
    results.push(value);
  }
  return results;
}
