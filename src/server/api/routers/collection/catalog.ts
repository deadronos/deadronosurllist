import { z } from "zod";

import type { TRPCContext } from "@/server/api/trpc";

import { normalizeDescription } from "./normalizers";

export const PUBLIC_CATALOG_DEFAULT_LIMIT = 12;
export const PUBLIC_CATALOG_DEFAULT_LINK_LIMIT = 10;

const publicLinkSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
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

export const mapCollectionRecordToCatalogItem = (
  collection: CollectionRecord,
  linkLimit: number,
): PublicCatalogItem => {
  const links = Array.isArray(collection.links) ? collection.links : [];
  const sortedLinks = [...links].sort((a, b) => a.order - b.order);
  const trimmedLinks = sortedLinks.slice(0, linkLimit).map((link) => ({
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
