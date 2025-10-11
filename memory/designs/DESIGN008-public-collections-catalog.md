# DESIGN008 – Public Collections Catalog

## Overview
- Extend the collections router with a `getPublicCatalog` procedure that exposes every `isPublic` collection ordered by `updatedAt` descending, trimmed to the requested page size, and paired with cursor metadata for pagination.
- Reuse Radix `Card` styling on the landing page to present a featured collection plus a catalog grid beneath the "Why Deadronos URL List?" box.
- Provide a client-side search box that filters catalog entries by collection name or description without incurring extra network cost while still supporting server pagination for large datasets.

## Architecture
- **Backend:** `collectionRouter.getPublicCatalog` executes a Prisma `findMany` with `isPublic` filter and `links` child records ordered by `order`. The handler performs in-process filtering (for mock DB compatibility), sorts by `updatedAt desc`, trims each link array to the requested limit (default 3), and slices the collection list per cursor/limit before returning `{ items, nextCursor, totalCount }`.
- **Frontend:** `src/app/page.tsx` consumes both the featured collection (via existing helper) and the first catalog page. UI layer renders:
  - Hero + featured card (unchanged)
  - "Why" informational card (unchanged)
  - New `All current public lists` section with search input, card grid, and load-more control.
- **State Management:** Landing page remains a server component. A client component (`PublicCatalog`) receives the first catalog page, hydrates a `useInfiniteQuery` hook for `collection.getPublicCatalog`, and manages filter state via `useState`.

## Data Flow
1. Request hits `Home` server component.
2. `Home` awaits both `api.collection.getPublic()` (for featured) and `api.collection.getPublicCatalog({ limit: 12, linkLimit: 3 })`.
3. `getPublicCatalog` returns the first page, trimmed links, next cursor, and total count.
4. Server component renders hero + featured card and injects catalog page data plus paging parameters into the client component.
5. Client component hydrates `useInfiniteQuery` with the initial page, renders cards, and filters locally on search.
6. When "Load more" is pressed, the client requests the next page with the stored cursor and appends the new items before reapplying the filter.

```
[Next.js Home (server)] --> call --> [tRPC collection.getPublicCatalog] --> Prisma findMany --> public collection records
                              |
                              +--> passes data --> [PublicCatalog (client)] --search--> filtered cards
```

## Interfaces
- **tRPC input:**
  ```ts
  const publicCatalogInput = z.object({
    q: z.string().trim().min(1).optional(),
    limit: z.number().int().min(1).max(50).default(12),
    cursor: z.string().optional(),
    linkLimit: z.number().int().min(1).max(10).default(3),
  });
  ```
- **tRPC output:**
  ```ts
  const publicLink = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    comment: z.string().nullable(),
    order: z.number().int(),
  });
  const publicCollection = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    isPublic: z.literal(true),
    updatedAt: z.string(),
    topLinks: z.array(publicLink),
  });
  const publicCatalogOutput = z.object({
    items: z.array(publicCollection),
    nextCursor: z.string().nullable(),
    totalCount: z.number().int(),
  });
  ```
- **Client props:** `PublicCatalogProps` receives `{ initialPage: PublicCatalogOutput; pageSize: number; linkLimit: number; }`.
- **Search handler:** `(query: string) => void` updates component state; filtering criterion: `collection.name` or `collection.description` contains `query` (case-insensitive).
- **Pagination handler:** `() => Promise<void>` triggers `fetchNextPage` when `hasNextPage`.

## Data Models
- Reuse existing Prisma `Collection` and `Link` models; no schema changes.
- DTO exposes `updatedAt` (ISO string) and `isPublic: true` for clarity.
- Link DTO trimmed to `topLinks` with stable ordering via `order` field.

## Error Handling
- If `getPublicCatalog` returns an empty array, UI displays a friendly placeholder under the heading.
- Procedure validates `limit`, `linkLimit`, and coerces timestamps to ISO strings before returning.
- Client guards duplicate IDs when appending new pages to avoid rendering collisions.

## Testing Strategy
- Extend `collectionRouter.spec.ts` to cover:
  - Pagination metadata and cursor advancement.
  - Query filtering on name/description.
  - Link trimming to the requested `linkLimit`.
- Manual or automated UI verification ensuring search filtering, load-more flow, and empty state behave as expected.

## Deployment Considerations
- Works with mock DB; no environment variable changes.
- Public catalog is read-only; no auth needed.
