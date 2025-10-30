export const normalizeDescription = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined) return null;
  return value;
};

export const normalizeDescriptionForUpdate = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeDescriptionForCreate = (
  value: string | null | undefined,
): string | null => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
