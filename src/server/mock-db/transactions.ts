export async function runTransaction(
  operations: Array<(() => Promise<unknown>) | Promise<unknown>>,
) {
  return Promise.all(
    operations.map((op) => (typeof op === "function" ? op() : op)),
  );
}
