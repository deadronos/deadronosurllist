import { z } from "zod";

import type { TRPCContext } from "@/server/api/trpc";

import { normalizeDescription } from "./normalizers";

/** Default number of collections to return per page in the public catalog. */
export const PUBLIC_CATALOG_DEFAULT_LIMIT = 12;
/** Default number of links to include per collection in the public catalog. */
export const PUBLIC_CATALOG_DEFAULT_LINK_LIMIT = 10;

/**
 * Validates that the URL uses a safe protocol (http or https).
 * Prevents Stored XSS via javascript: or data: URLs.
 */
const isSafeUrl = (val: string) => {
  try {
    const protocol = new URL(val).protocol;
    return ["http:", "https:"].includes(protocol);
  } catch {
    return false;
  }
};

const publicLinkSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url().refine(isSafeUrl, {
    message: "Only http and https URLs are allowed",
  }),
  comment: z.string().nullable(),
  order: z.number().int(),
});

const publicCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.literal(true),
  updatedAt: z.string(),
  topLinks: z.array(publicLinkSchema),
});

/**
 * Zod schema for public catalog query input.
 * Includes search query, pagination limit/cursor, and link limit.
 */
export const publicCatalogInputSchema = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.number().int().min(1).max(50).default(PUBLIC_CATALOG_DEFAULT_LIMIT),
  cursor: z.string().min(1).optional(),
  linkLimit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(PUBLIC_CATALOG_DEFAULT_LINK_LIMIT),
});

/**
 * Zod schema for public catalog response.
 * Includes the list of items, the next cursor for pagination, and total count.
 */
export const publicCatalogResponseSchema = z.object({
  items: z.array(publicCollectionSchema),
  nextCursor: z.string().nullable(),
  totalCount: z.number().int(),
});

export type PublicCatalogInput = z.infer<typeof publicCatalogInputSchema>;
export type PublicCatalogItem = z.infer<typeof publicCollectionSchema>;
export type PublicCatalogResponse = z.infer<typeof publicCatalogResponseSchema>;

type CollectionRecord = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  updatedAt: Date | string;
  links?: Array<{
    id: string;
    name: string;
    url: string;
    comment: string | null;
    order: number;
  }>;
};

const publicCatalogQuery = {
  where: { isPublic: true },
  include: {
    links: {
      orderBy: { order: "asc" as const },
    },
  },
} as const;

const toIsoString = (value: Date | string): string => {
  if (typeof value === "string") {
    return value;
  }
  return value.toISOString();
};

/**
 * Maps a database collection record to a public catalog item.
 * Trims the number of links to the specified limit.
 *
 * @param {CollectionRecord} collection - The database record.
 * @param {number} linkLimit - The maximum number of links to include.
 * @returns {PublicCatalogItem} The formatted catalog item.
 */
export const mapCollectionRecordToCatalogItem = (
  collection: CollectionRecord,
  linkLimit: number,
): PublicCatalogItem => {
  const links = Array.isArray(collection.links) ? collection.links : [];
  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  // Filter unsafe links (javascript:, etc.) to prevent Stored XSS
  const safeLinks = sortedLinks.filter((link) => isSafeUrl(link.url));

  const trimmedLinks = safeLinks.slice(0, linkLimit).map((link) => ({
    id: link.id,
    name: link.name,
    url: link.url,
    comment: link.comment,
    order: link.order,
  }));

  return {
    id: collection.id,
    name: collection.name,
    description: normalizeDescription(collection.description),
    isPublic: true,
    updatedAt: toIsoString(collection.updatedAt),
    topLinks: trimmedLinks,
  } satisfies PublicCatalogItem;
};

/**
 * Fetches the public catalog of collections.
 * Handles filtering by search query and pagination.
 *
 * @param {TRPCContext} ctx - The tRPC context (containing database access).
 * @param {PublicCatalogInput} input - Search and pagination parameters.
 * @returns {Promise<PublicCatalogResponse>} The paginated catalog response.
 */
export async function fetchPublicCatalog(
  ctx: TRPCContext,
  input: PublicCatalogInput,
): Promise<PublicCatalogResponse> {
  const query = input.q?.trim().toLowerCase();
  const linkLimit = input.linkLimit ?? PUBLIC_CATALOG_DEFAULT_LINK_LIMIT;
  const limit = input.limit ?? PUBLIC_CATALOG_DEFAULT_LIMIT;

  const collections = await ctx.db.collection.findMany(publicCatalogQuery);

  const filtered = collections.filter((collection) => {
    if (!query) return true;
    const haystack = [collection.name, collection.description ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const sorted = filtered.sort((a, b) => {
    const dateDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return b.id.localeCompare(a.id);
  });

  const allItems = sorted.map((collection) =>
    mapCollectionRecordToCatalogItem(collection, linkLimit),
  );

  const totalCount = allItems.length;
  const cursorId = input.cursor;
  let startIndex = 0;
  if (cursorId) {
    const cursorIndex = allItems.findIndex((item) => item.id === cursorId);
    startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  }
  const pageItems = allItems.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < allItems.length;
  const lastItem = pageItems.at(-1);
  const nextCursor = hasMore && lastItem ? lastItem.id : null;

  return {
    items: pageItems,
    nextCursor,
    totalCount,
  } satisfies PublicCatalogResponse;
}
