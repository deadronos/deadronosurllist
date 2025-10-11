# LinkList Development Status (2025-10-09)

This document captures the current implementation state of the LinkList project and the decisions made while building an in-memory substitute for the Prisma client.

## Highlights

- Implemented a comprehensive in-memory database (`src/server/db.mock.ts`) that mirrors the Prisma client surface area used across the app.
- Seeded the mock store with deterministic data (user `user1`, collection `col_seed`, and one example link) to provide predictable initial state for local development and tests.
- Added helpers to reset and reuse store state across Vitest runs, enabling isolated, repeatable specs.
- Ensured Next.js uses the mock automatically when `USE_MOCK_DB=1` thanks to module aliasing in `next.config.js`.

## Key Decisions

- **API parity first:** The mock exposes Prisma-like methods for `collection`, `link`, and `post`, including `$transaction`, `findMany`, `findFirst`, `create`, `update`, and `delete` variants. This keeps tRPC routers unchanged while we iterate without a live database.
- **Ownership handling:** The helper `resolveCreatedById` interprets both `createdById` fields and nested `createdBy.connect` structures so the mock works with the same mutation payloads as the real client.
- **State isolation:** Test setup (`src/test/setup.ts`) forces `USE_MOCK_DB=1`, resets the mock before each spec, and fakes authentication to guarantee protected procedures always receive `user1`.
- **tRPC caller construction:** Specs now create callers through `createTRPCContext` to exercise the real middleware pipeline, catching authentication and context issues early.

## Coverage & Testing

- Vitest suite extended with `src/test/linkRouter.spec.ts`, exercising link create, reorder, update, and delete flows against the in-memory store.
- Existing collection router spec updated to assert link counts provided by the mock.
- Added `src/test/postRouter.spec.ts` covering post creation, per-user latest retrieval, and unauthorized access handling.
- `npm run test` currently passes, confirming the mock DB integrates with tRPC queries/mutations end-to-end.

## Next Steps

1. Port additional routers (e.g., posts) or new features to leverage the mock while backend infrastructure is finalized.
2. Expand tests to cover failure cases (authorization violations, invalid data) using the same in-memory context.
3. When ready for a database, replace `USE_MOCK_DB` guard with real Prisma client instantiation—no API changes required for dependent code.
4. Explore optimistic UI feedback (or lightweight toasts) for link edits/deletions so changes feel instant while mutations settle.
5. Extend the collection manager with quality-of-life tools such as a public/private toggle per link and quick filtering for large collections.

_Last updated: 2025-10-09_
