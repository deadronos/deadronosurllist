# DESIGN001 – Public Welcome Experience

## Overview

Rework the landing experience to showcase a curated public link collection using Radix UI components while preserving tRPC-driven data loading. Introduce a public collection query and ensure the mock database auto-seeds the required dataset.

## Architecture

- **UI Layer:** `src/app/page.tsx` becomes a Radix Theme-based server component that fetches the public collection via tRPC and renders hero content plus link cards.
- **tRPC Router:** Extend `collectionRouter` with a `getPublic` `publicProcedure` returning the first `isPublic=true` collection with its ordered links.
- **Data Layer:** Update `src/server/db.mock.ts` to seed a deterministic public collection with default links on store initialization.
- **Providers:** Wrap the Next.js root layout with `@radix-ui/themes` `Theme` provider and global styles.

## Data Flow

1. Home page requests `api.collection.getPublic()` during server rendering.
2. Procedure queries Prisma (or mock) for the first public collection sorted by `updatedAt` and includes links ordered by `order`.
3. Mock DB initialization ensures the public collection is present; production DB returns whatever data exists.
4. UI renders Radix Flex layout and Link Cards; unauthenticated users see sign-in CTA, authenticated users also get dashboard link.

## Interfaces

- **tRPC Procedure:** `collection.getPublic: publicProcedure.query(() => Promise<{ collection, links } | null>)`
- **UI Props:** Server component consumes `Awaited<ReturnType<typeof api.collection.getPublic>>`.
- **Mock Seed:** `ensurePublicCollection()` helper invoked within `resetStore()` ensuring default data.

## Error Handling

- If no public collection exists, procedure returns `null`; UI renders fallback messaging.
- Mock seeding logs? (no logs) ensures data is always available for tests/dev; failure cases bubble as standard errors.

## Testing Strategy

- Extend `collectionRouter.spec.ts` to assert `getPublic` returns seeded collection.
- Add tests ensuring mock seeding includes expected link.

## Implementation Tasks

1. Add Radix UI dependency and wrap layout in `Theme`.
2. Implement `collection.getPublic` and export types.
3. Seed mock DB with deterministic public collection (id slug, default link).
4. Rework `src/app/page.tsx` to new layout using Radix components.
5. Update tests to cover new public procedure.
6. Adjust copy/documentation if needed.
