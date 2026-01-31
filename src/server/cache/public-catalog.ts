import type {
  PublicCatalogInput,
  PublicCatalogResponse,
} from "@/server/api/routers/collection/catalog";

const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 500;

type CacheEntry = {
  value: PublicCatalogResponse;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

const isCacheEnabled = () => process.env.DISABLE_PUBLIC_CATALOG_CACHE !== "true";

const normalizeInput = (input: PublicCatalogInput) => ({
  q: input.q?.trim() ?? "",
  limit: input.limit,
  cursor: input.cursor ?? "",
  linkLimit: input.linkLimit,
  sortBy: input.sortBy,
  sortOrder: input.sortOrder,
});

export const getPublicCatalogCacheKey = (input: PublicCatalogInput) =>
  JSON.stringify(normalizeInput(input));

const pruneExpired = () => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
};

export const getCachedPublicCatalog = (
  input: PublicCatalogInput,
): PublicCatalogResponse | null => {
  if (!isCacheEnabled()) return null;
  pruneExpired();
  const key = getPublicCatalogCacheKey(input);
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  cache.delete(key);
  cache.set(key, entry);

  return entry.value;
};

export const setCachedPublicCatalog = (
  input: PublicCatalogInput,
  response: PublicCatalogResponse,
) => {
  if (!isCacheEnabled()) return;
  pruneExpired();
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (typeof oldestKey === "string") {
      cache.delete(oldestKey);
    }
  }

  cache.set(getPublicCatalogCacheKey(input), {
    value: response,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
};

export const invalidatePublicCatalogCache = () => {
  cache.clear();
};

export const isPublicCatalogCacheEnabled = isCacheEnabled;