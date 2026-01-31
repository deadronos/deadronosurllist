import { beforeEach, describe, expect, it } from "vitest";

import {
  getCachedPublicCatalog,
  getPublicCatalogCacheKey,
  invalidatePublicCatalogCache,
  setCachedPublicCatalog,
} from "@/server/cache/public-catalog";
import type {
  PublicCatalogInput,
  PublicCatalogResponse,
} from "@/server/api/routers/collection/catalog";

const baseInput: PublicCatalogInput = {
  limit: 1,
  linkLimit: 10,
  sortBy: "updatedAt",
  sortOrder: "desc",
};

const sampleResponse: PublicCatalogResponse = {
  items: [],
  nextCursor: null,
  totalCount: 0,
};

describe("public catalog cache", () => {
  beforeEach(() => {
    invalidatePublicCatalogCache();
  });

  it("returns cached responses for identical inputs", () => {
    setCachedPublicCatalog(baseInput, sampleResponse);
    expect(getCachedPublicCatalog(baseInput)).toEqual(sampleResponse);
  });

  it("generates distinct cache keys for different queries", () => {
    const keyA = getPublicCatalogCacheKey({
      ...baseInput,
      q: "design",
    });
    const keyB = getPublicCatalogCacheKey({
      ...baseInput,
      q: "testing",
    });

    expect(keyA).not.toBe(keyB);
  });

  it("clears cached entries on invalidation", () => {
    setCachedPublicCatalog(baseInput, sampleResponse);
    invalidatePublicCatalogCache();
    expect(getCachedPublicCatalog(baseInput)).toBeNull();
  });
});