# TASK005 - Type Safety Hardening

**Status:** Completed  
**Added:** 2025-10-10  
**Updated:** 2025-10-10

## Original Request

Fix the implicit-`any` TypeScript errors exposed by `npm run typecheck`, align NextAuth provider definitions with the expected `Provider` typing, and harden the mock database utilities so strict null checks succeed.

## Thought Process

- The failing diagnostics cluster around three themes: React callback parameters without explicit typing, provider factory return types that no longer satisfy NextAuth expectations, and mock DB helpers that dereference possibly undefined objects.
- We can anchor UI/test types to router outputs to avoid drift while satisfying strict mode, reducing duplication.
- Rather than loosening TypeScript rules, ensure every map/filter is typed and guard all optional branches in the mock DB implementation.
- Provider helpers already compute `name`/`id`; we only need to reflect those properties in the TypeScript signature and propagate them into `NextAuth` so the config compiles cleanly.

## Implementation Plan

1. **UI Components** – Import router output types (`RouterOutputs`) and annotate `collection.links` iterations in `src/app/page.tsx`, `src/app/dashboard/page.tsx`, and `src/app/collections/[id]/page.tsx`.
2. **Collection Router** – Strengthen the mapper in `src/server/api/routers/collection.ts` by leveraging Prisma and router types so mapped links inherit concrete fields.
3. **Auth Providers** – Update `src/server/auth/provider-helpers.ts` and `src/server/auth/config.ts` to return objects that satisfy `Provider` with explicit `name`, `id`, and `type` fields, ensuring compatibility with `NextAuth` factory usage.
4. **Mock DB Guards** – Refine `src/server/db.mock.ts` sort helper and link retrieval logic to guard empty results and preserve type safety when records may be undefined.
5. **Tests & Setup** – Annotate map callbacks in `src/test/linkRouter.spec.ts` and change `src/test/setup.ts` to mutate `process.env` via type-safe casting instead of writing to readonly properties.
6. **Validation** – Run `npm run typecheck` and the relevant Vitest suites (`npm run test -- collectionRouter.spec.ts linkRouter.spec.ts`) to ensure no regressions.

## Progress Tracking

**Overall Status:** Completed – 100%

### Subtasks

| ID  | Description                                   | Status        | Updated     | Notes |
| --- | --------------------------------------------- | ------------- | ----------- | ----- |
| 1.1 | Type map callbacks in UI components           | Complete      | 2025-10-10  | Added runtime guards for API data before rendering. |
| 1.2 | Align collection router link typing           | Complete      | 2025-10-10  | Introduced explicit link DTO type. |
| 1.3 | Fix NextAuth provider typings                 | Complete      | 2025-10-10  | Helper now returns NextAuth Provider objects. |
| 1.4 | Harden mock DB undefined guards               | Complete      | 2025-10-10  | Added sort and lookup safeguards. |
| 1.5 | Update tests/setup for strict typings         | Complete      | 2025-10-10  | Added type guards and env mutation helper. |
| 1.6 | Re-run typecheck and targeted Vitest suites   | Complete      | 2025-10-10  | `npm run typecheck`; `npm run test -- --run collectionRouter.spec.ts linkRouter.spec.ts`. |

## Progress Log

### 2025-10-10

- Captured requirements, design blueprint, and implementation plan for addressing strict TypeScript diagnostics.
- Typed UI pages and router outputs via runtime guards, replaced custom NextAuth provider alias with official `Provider`, hardened mock DB sorting/lookups, and updated Vitest suites plus test setup to satisfy strict typing. Verified with `npm run typecheck` and targeted Vitest run (`npm run test -- --run collectionRouter.spec.ts linkRouter.spec.ts`).
