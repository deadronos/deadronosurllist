export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
}

export function getTrimmedFormString(formData: FormData, key: string) {
  const value = getFormString(formData, key);
  if (value == null) return null;
  return value.trim();
}

export function getRequiredTrimmedFormString(formData: FormData, key: string) {
  const value = getTrimmedFormString(formData, key);
  if (!value) return null;
  return value;
}
