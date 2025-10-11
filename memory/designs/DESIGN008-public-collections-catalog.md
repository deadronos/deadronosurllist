# DESIGN008 – Public Collections Catalog

## Overview
- Extend the collections router with a `listPublic` procedure that exposes every `isPublic` collection ordered by `updatedAt` descending, including their link summaries.
- Reuse Radix `Card` styling on the landing page to present a featured collection plus a catalog grid beneath the "Why Deadronos URL List?" box.
- Provide a client-side search box that filters catalog entries by collection name or description without incurring extra network cost.

## Architecture
- **Backend:** `collectionRouter.listPublic` (new) executes a Prisma `findMany` with `isPublic` filter and `links` child records ordered by `order`. Returns a trimmed DTO (id, name, description, updatedAt, links).
- **Frontend:** `src/app/page.tsx` consumes both the existing featured collection (new helper) and the catalog payload. UI layer renders:
  - Hero + featured card (unchanged)
  - "Why" informational card (unchanged)
  - New `All current public lists` section with search input and mapped cards.
- **State Management:** Landing page is a server component; catalog search requires a client boundary. Introduce a small client component (e.g., `PublicCatalog`) that receives serialized catalog data and manages filter state via `useState`.

## Data Flow
1. Request hits `Home` server component.
2. `Home` awaits both `api.collection.getFeaturedPublic()` (renamed helper around existing query) and `api.collection.listPublic()`.
3. `listPublic` returns an array of collections with links.
4. Server component renders hero + featured card and injects catalog data into the new client component via props.
5. Client component renders search input; on change, filters local array (case-insensitive) and maps cards.

```
[Next.js Home (server)] --> call --> [tRPC collection.listPublic] --> Prisma findMany --> public collection records
                              |
                              +--> passes data --> [PublicCatalog (client)] --search--> filtered cards
```

## Interfaces
- **tRPC output:** `PublicCollectionSummary` with shape `{ id: string; name: string; description: string | null; links: PublicLinkSummary[]; updatedAt: string; }`.
- **Client props:** `PublicCatalogProps` receiving `collections: PublicCollectionSummary[]`.
- **Search handler:** `(query: string) => void` updates component state; filtering criterion: `collection.name` or `collection.description` contains `query` (case-insensitive).

## Data Models
- Reuse existing Prisma `Collection` and `Link` models; no schema changes.
- DTO adds `updatedAt` for potential sorting indicator (optional to display).

## Error Handling
- If `listPublic` returns empty array, UI displays a friendly placeholder under the heading.
- Guard against unvalidated payloads with runtime type checks similar to existing `isPublicCollection`.

## Testing Strategy
- Add/extend collection router spec to cover `listPublic` returning all seeded public collections ordered correctly.
- Manual UI verification ensuring search filtering works and cards render responsively.

## Deployment Considerations
- Works with mock DB; no environment variable changes.
- Public catalog is read-only; no auth needed.
