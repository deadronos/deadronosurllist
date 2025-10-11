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
1. **API design** – add a public catalog procedure that returns ordered collections plus trimmed link summaries.
2. **UI component updates** – model a reusable card presentation and render catalog heading, search box, and list beneath the "Why" box.
3. **Client filtering** – implement case-insensitive filtering logic that operates on name/description without extra network calls.
4. **Validation** – exercise API via unit coverage if feasible and perform manual UI verification in dev.

## Validation Strategy
- Targeted unit test for the new tRPC catalog procedure (if test harness easily composes data); otherwise, manual verification against seeded mock database.
- Manual walkthrough of landing page ensuring search filter behaviour and card rendering.

## Open Questions
- Should we paginate the catalog once the number of public collections grows? (Out of scope for current request.)

## Validation Log
- 2025-10-11: `npm run lint`
- 2025-10-11: `npm run test -- --run collectionRouter.spec.ts`
- 2025-10-11: `npm run typecheck`
