import type { Prisma } from "@prisma/client";
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
  const query = input.q?.trim();
  const linkLimit = input.linkLimit ?? PUBLIC_CATALOG_DEFAULT_LINK_LIMIT;
  const limit = input.limit ?? PUBLIC_CATALOG_DEFAULT_LIMIT;
  const cursorId = input.cursor;

  const whereClause: Prisma.CollectionWhereInput = {
    isPublic: true,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalCount, collections] = await Promise.all([
    ctx.db.collection.count({ where: whereClause }),
    ctx.db.collection.findMany({
      where: whereClause,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      cursor: cursorId ? { id: cursorId } : undefined,
      skip: cursorId ? 1 : 0,
      include: {
        links: {
          orderBy: { order: "asc" },
          // Fetch a bit more than requested to account for potential filtering of unsafe links
          take: linkLimit + 10,
        },
      },
    }),
  ]);

  const hasMore = collections.length > limit;
  const pageItems = hasMore ? collections.slice(0, limit) : collections;
  const lastItem = pageItems.at(-1);
  const nextCursor = hasMore && lastItem ? lastItem.id : null;

  const items = pageItems.map((collection) =>
    mapCollectionRecordToCatalogItem(collection, linkLimit),
  );

  return {
    items,
    nextCursor,
    totalCount,
  } satisfies PublicCatalogResponse;
}
