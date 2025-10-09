# System Patterns – LinkList

## Architectural Overview

- **Frontend:** Next.js 15 App Router using server components for data prefetch and client components for interactive forms.
- **API Layer:** tRPC routers in `src/server/api/routers` exposing type-safe procedures for posts, collections, and links.
- **Data Access:** Prisma client in production; deterministic in-memory mock (`src/server/db.mock.ts`) when `USE_MOCK_DB=1`.
- **Authentication:** NextAuth.js with Discord provider; session surfaced through `auth()` helper and `protectedProcedure` middleware.
- **Styling:** Tailwind CSS utility classes paired with `@radix-ui/themes` provider for the public landing experience.

## Key Flows

1. **Public Landing:** Server component calls `api.collection.getPublic()` to fetch the latest public collection and renders it with Radix primitives.
2. **Dashboard:** Authenticated request uses `api.collection.getAll()` to list the member's collections and show creation controls.
3. **Collection Detail:** Hydrated client fetches `collection.getById` results and provides link creation via React Query mutations.
4. **Link Mutations:** Client components call `link.create`, `link.update`, `link.delete`, and `link.reorder` while server validates ownership before committing changes.
5. **Sign-in UX:** `/signin` page consumes `authDiagnostics` to render available OAuth providers or show guidance when authentication is disabled.
6. **Error/404 Navigation:** `error.tsx` and `not-found.tsx` provide clear actions to return home, aligning with global layout navigation.
7. **Testing:** Vitest specs construct tRPC callers with mocked auth/session and reset the in-memory DB before each test for isolation; provider helper is unit-tested for diagnostics behavior.

## Cross-Cutting Patterns

- Context factory ensures Prisma or mock client is attached to each tRPC request via `createTRPCContext`.
- Protected procedures enforce per-user access using `ctx.session.user.id` checks before mutations.
- Seed helpers in the mock database guard against duplicate entries while guaranteeing the "Discover Links" collection exists for public visitors.
- Hydration helper (`HydrateClient`) bridges server-fetched data with client components to avoid waterfalls.
- Auth provider builder centralizes credential validation, producing `authDiagnostics` for UI consumption and strictness in production.
