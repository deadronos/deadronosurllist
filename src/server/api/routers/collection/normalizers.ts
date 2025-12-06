/**
 * Normalizes a description string.
 *
 * @param {string | null | undefined} value - The description to normalize.
 * @returns {string | null} The normalized description or null if undefined.
 */
export const normalizeDescription = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined) return null;
  return value;
};

/**
 * Normalizes a description for update operations.
 * Returns undefined if the value is undefined (meaning no update).
 * Returns null if the value is null or empty string (meaning clear the description).
 *
 * @param {string | null | undefined} value - The description to normalize.
 * @returns {string | null | undefined} The normalized description.
 */
export const normalizeDescriptionForUpdate = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Normalizes a description for create operations.
 * Returns null if the value is undefined, null, or empty string.
 *
 * @param {string | null | undefined} value - The description to normalize.
 * @returns {string | null} The normalized description.
 */
export const normalizeDescriptionForCreate = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
