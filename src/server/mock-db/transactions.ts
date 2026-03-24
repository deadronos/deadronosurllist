export async function runTransaction(
  operations: Array<(() => Promise<unknown>) | Promise<unknown>>,
) {
  const results: unknown[] = [];

  for (const op of operations) {
    results.push(await (typeof op === "function" ? op() : op));
  }

  return results;
}
