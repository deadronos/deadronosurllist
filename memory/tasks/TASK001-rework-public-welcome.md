# TASK001 - Rework Public Welcome Experience

**Status:** Completed  
**Added:** 2025-10-09  
**Updated:** 2025-10-09

## Original Request

> please rework the ui, maybe use radix-ui and a welcome page with a public url collection with items like "github.com" we could populate the in memory db with the public collection on load/not created

## Thought Process

- The current home page still shows the default T3 starter content and requires authentication for any meaningful data.
- A public-facing landing page should surface curated links without forcing sign-in.
- Radix UI can provide consistent styling with minimal overhead.
- The mock database already seeds some data; extending it to ensure a public set of links will keep tests deterministic.

## Implementation Plan

1. **Dependencies & Theming**
   - Add `@radix-ui/themes` and wrap the app layout with the Radix `Theme` provider.
   - Import the Radix theme CSS in the global styles.
2. **API Enhancements**
   - Extend `collectionRouter` with a `publicProcedure` named `getPublic` that returns the latest public collection and its ordered links.
   - Export any necessary types/hooks for the new procedure.
3. **Mock DB Seeding**
   - Update `src/server/db.mock.ts` initialization to ensure a deterministic public collection ("Discover Links") with at least the `https://github.com` link.
   - Provide helper logic so repeated resets do not duplicate data.
4. **Welcome Page UI**
   - Rebuild `src/app/page.tsx` using Radix primitives (e.g., `Flex`, `Card`, `Heading`) to render hero text, authentication CTA, and the public collection links.
   - Handle absence of data with a friendly fallback.
5. **Testing**
   - Update `collectionRouter.spec.ts` to validate `getPublic` returns the seeded public collection and link data.
   - Ensure existing tests still pass.
6. **Context Updates**
   - Update memory files (`progress`, task log) as work advances and document any follow-up items.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description                        | Status        | Updated    | Notes |
| --- | ---------------------------------- | ------------- | ---------- | ----- |
| 1.1 | Add Radix dependency and theming   | Complete      | 2025-10-09 |       |
| 1.2 | Add `getPublic` tRPC procedure     | Complete      | 2025-10-09 |       |
| 1.3 | Seed mock DB with public collection| Complete      | 2025-10-09 |       |
| 1.4 | Rebuild landing page UI            | Complete      | 2025-10-09 |       |
| 1.5 | Update tests                       | Complete      | 2025-10-09 |       |

## Progress Log

### 2025-10-09

- Captured requirements and initial design for the public welcome experience.
- Installed Radix Themes and wrapped the global layout in the Radix provider.
- Added a `collection.getPublic` tRPC query and seeded the mock database with a deterministic public collection.
- Rebuilt the landing page with Radix components that surface the public collection and CTAs.
- Extended unit tests for the collection and link routers and confirmed `npm run test` passes.
- Archived task context into Memory Bank after documenting supporting materials.
