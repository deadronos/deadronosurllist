export const randomId = (prefix: string) => {
  // Prefer crypto.randomUUID when available to avoid predictable IDs.
  const unique =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${unique}`;
};
