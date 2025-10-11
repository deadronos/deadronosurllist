# TASK010 – Public Collections Catalog

## Summary
- Expose all public collections via tRPC and surface them on the landing page beneath the "Why Deadronos URL List?" callout.
- Provide a searchable catalog that reuses the featured card styling so visitors can browse every shared list.

## Requirements
- Reference: `memory/requirements.md#public-collections-catalog`
- Scope: backend tRPC router updates, landing page UI, client-side filtering.

## Confidence
- Score: 0.82 — medium-high; data fetching patterns are known, but landing page layout changes introduce design considerations that benefit from a lightweight proof via manual testing.

## Task Plan
1. **API contract** – introduce `collection.getPublicCatalog` with Zod input/output schemas supporting optional query, cursor pagination, page size, and link trimming.
2. **Backend implementation** – reuse a shared mapper so both `getPublic` and `getPublicCatalog` return ISO timestamps, trimmed top links, and cursor metadata.
3. **Frontend wiring** – hydrate the landing page with the first catalog page, update the client component to use `useInfiniteQuery`, render "Load more", and preserve the existing search behaviour.
4. **Testing & validation** – extend Vitest coverage for catalog pagination/filtering/link trimming, run Prettier, lint, typecheck, and unit tests, and manually verify the UI.

## Validation Strategy
- Targeted unit test for the new tRPC catalog procedure (if test harness easily composes data); otherwise, manual verification against seeded mock database.
- Manual walkthrough of landing page ensuring search filter behaviour and card rendering.

## Open Questions
- Should we paginate the catalog once the number of public collections grows? (Out of scope for current request.)

## Validation Log
- 2025-10-11: `npm run format:write`
- 2025-10-11: `npm run lint`
- 2025-10-11: `npm run typecheck`
- 2025-10-11: `npm run test`
