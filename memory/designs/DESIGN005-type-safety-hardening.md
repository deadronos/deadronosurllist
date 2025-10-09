# DESIGN005 – Type Safety Hardening

**Status:** Draft  
**Related Requirements:** Type Safety Hardening (memory/requirements.md)  
**Scope:** Eliminate implicit `any` diagnostics and align auth + mock DB types with strict TypeScript mode.

## 1. Architecture Overview

```text
[UI Pages] ──► [tRPC Client Models]
     │                 │
     ▼                 ▼
[API Routers] ──► [Mock DB Layer]
                      │
                      ▼
              [NextAuth Config]
```

- UI components (`src/app/...`) render strongly typed collections and links supplied by server components or procedures.
- tRPC collection router shapes map Prisma models to transport-friendly DTOs used by UI and tests.
- Mock DB provides in-memory persistence mirroring Prisma API and must satisfy strict null checks.
- NextAuth configuration assembles provider list via helpers; provider typing must match `Provider` interface consumed by `NextAuth` factory.

## 2. Data Flow

1. Server component fetches a collection via tRPC; router maps links to plain objects, UI iterates over typed arrays.
2. Tests seed data through link router helpers and assert order; typed expectations ensure compile-time safety.
3. Auth helper inspects env-derived credentials and returns provider configs; `NextAuth` consumes typed array of providers.
4. Mock DB operations return typed collection/link objects; optional lookups guard against undefined before dereferencing.

## 3. Interfaces & Types

| Layer | Interface/Type | Notes |
| --- | --- | --- |
| UI | `CollectionWithLinks`, `PublicLink` | Explicit shapes for React map iterations. |
| API | `CollectionRouterOutput['getById']` | Derive types from router/trpc outputs where possible. |
| Auth | `ProviderFactoryResult` extends `Provider` | Helper should surface compatible provider objects with required fields (e.g., `name`). |
| Tests | `LinkSummary` | Narrow type used in assertions to avoid implicit anys. |
| Mock DB | `LinkRecord`, `CollectionRecord` | Update utilities to handle optional returns safely. |

## 4. Data Models

- Extend existing Prisma-aligned records in `db.mock.ts` with safe accessors returning plain objects typed via utility interfaces.
- Introduce lightweight type aliases in UI/test layers to reference router outputs (prefer `typeof`/`Awaited` of procedure calls).

## 5. Error Handling Matrix

| Procedure | Potential Error | Response |
| --- | --- | --- |
| UI map over `collection.links` | `links` undefined/null | Provide default empty array via optional chaining and typed guard. |
| Auth provider factory | Missing credential values | Filter providers before casting; skip creation when incomplete (existing behavior) while ensuring type compatibility. |
| Mock DB `findFirst`/`findMany` | Lookup misses record | Short-circuit and return `undefined` before dereferencing; update return type accordingly. |
| Mock DB sort utility | Empty orderBy entries | Guard against undefined first entry prior to destructuring. |

## 6. Implementation Tasks

1. Derive typed aliases for collection/link data used in React components; annotate map callbacks accordingly.
2. Update tRPC router mapping functions to leverage Prisma types or explicit interfaces and satisfy lint + TS.
3. Adjust NextAuth provider helper types so factory returns `Provider`-compatible objects (add `name`, `options` typing if missing).
4. Harden mock DB utilities: guard against empty arrays before destructuring, add undefined checks, and narrow types.
5. Refine Vitest suites (`src/test/linkRouter.spec.ts`, `src/test/setup.ts`) with explicit generics/types and readonly env handling.
6. Re-run `npm run typecheck` and relevant router tests to confirm compliance.

## 7. Unit Testing Strategy

- Primary validation via `npm run typecheck` (compilation gate).
- Run `npm run test -- collectionRouter.spec.ts linkRouter.spec.ts` to ensure typings did not break runtime expectations.
- Rely on existing Vitest snapshots; no new tests expected, but update typings within tests for clarity.

## 8. Risks & Mitigations

- **Risk:** Incorrect provider typing could break runtime auth registration. **Mitigation:** Reuse `Provider` interface from `next-auth/providers` and verify provider array contains required fields.
- **Risk:** Over-constraining UI types could diverge from API outputs. **Mitigation:** Infer types via `RouterOutputs` utility to maintain parity.
- **Risk:** Mock DB guard changes might alter return shapes. **Mitigation:** Add unit assertions in existing tests to confirm returned metadata.

## 9. Open Questions

- Should provider helper expose diagnostics types? (Out of scope; existing behavior retained.)
- Do we need runtime checks for missing env? (Existing logic handles via diagnostics—no change.)

## 10. Approval & Next Steps

Pending execution. Update task `TASK005` with progress logs and link final results to handoff summary.
