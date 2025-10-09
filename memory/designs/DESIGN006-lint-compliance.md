# DESIGN006 – Lint Compliance Reinforcement

**Status:** Draft  
**Related Requirements:** Lint Compliance (memory/requirements.md)  
**Scope:** Eliminate ESLint unsafe-`any` diagnostics by typing the database surface, tRPC interactions, and Vitest helpers while preserving runtime behaviour.

**Confidence Score:** 0.88 (High) – Proceed with comprehensive implementation without PoC detours.

## 1. Architecture Overview

```text
[tRPC Routers] ──► [Typed DB Context]
      │                    │
      ▼                    ▼
[React Hooks]       [Auth Adapter]
      │                    │
      ▼                    ▼
   [Vitest]          [Mock DB Layer]
```

- `src/server/db.ts` becomes the single entry point for a typed database client shared across routers, auth config, and tests.
- Mock database (`db.mock.ts`) implements the subset of Prisma delegates we rely on, returning fully typed DTOs to match Prisma signatures.
- tRPC routers read from the typed context, allowing ESLint to validate property access and eliminating unsafe casts.
- Vitest suites use typed test helpers for caller construction instead of ad-hoc `any` assertions.
- NextAuth configuration narrows the database client for the Prisma adapter while preserving diagnostics for disabled providers.

## 2. Data Flow

1. `createTRPCContext` injects the typed database client and session into router procedures.
2. Routers call delegates on the typed client; Prisma and mock implementations share the same TypeScript contract.
3. Router outputs hydrate React hooks (`api.*`) with strictly typed data, so UI lint passes without unsafe destructuring.
4. Tests construct callers through typed helpers that share the context contract, ensuring assertions remain type-safe.
5. Auth adapter receives a narrowed Prisma client when available; mock mode bypasses adapter instantiation in tests.

## 3. Interfaces & Types

| Layer | Interface / Type | Notes |
| --- | --- | --- |
| DB Export | `LinkListDatabase` (`Pick<PrismaClient, "collection" \| "link" \| "post" \| "$transaction">`) | Unified contract consumed by routers/tests. |
| Mock DB | `MockDbClient` satisfies `LinkListDatabase` | Implements the same delegate signatures with in-memory data. |
| Routers | `PublicCollectionDto`, `LinkOrderUpdate` | Derived DTOs to express router responses without manual casts. |
| Tests | `TestCallerFactory`, `TestSessionFactory` | Helper types to instantiate callers with typed overrides. |
| Auth | `PrismaAdapterTarget` | Narrowed Prisma client type passed into `PrismaAdapter`. |

## 4. Data Models

- **Collection DTO:** `{ id, name, description, isPublic, createdById, createdAt, updatedAt, links?: LinkDTO[], _count?: { links: number } }`.
- **Link DTO:** `{ id, collectionId, url, name, comment, order, createdAt, updatedAt, collection?: { createdById, ... } }`.
- **Post DTO:** `{ id, name, createdById, createdAt, updatedAt }`.
- Mock DB transforms records into these DTOs before returning to mirror Prisma payloads.

## 5. Error Handling Matrix

| Procedure | Potential Issue | Mitigation |
| --- | --- | --- |
| `collection.findMany` (mock) | Include argument mismatches | Validate include/select input and default to safe ordering. |
| `link.update` / `delete` | Missing link or mismatched owner | Throw `TRPCError` / `Error` early; tests assert rejection. |
| `$transaction` (mock) | Mixed promise/function inputs | Normalize operations via `await` and capture errors explicitly. |
| Auth adapter | Mock DB lacks Prisma methods | Skip adapter instantiation or provide type guard to ensure real Prisma client. |
| Tests | Session overrides missing required fields | Factory provides defaults (`expires`, `user.id`) to avoid runtime undefined access. |

## 6. Implementation Tasks

1. **Database Typing:** Define `LinkListDatabase` in `src/server/db.ts`, export `isMockDb`, and ensure runtime instances satisfy the contract.
2. **Mock Client Alignment:** Update `src/server/db.mock.ts` to surface typed delegate outputs and export `MockDbClient`.
3. **tRPC Context:** Update `createTRPCContext` and router files to leverage typed database access (remove ad-hoc `CollectionLinkRecord` aliases, rely on DTO types).
4. **Auth Config:** Narrow the Prisma adapter input with a type guard or assertion that avoids unsafe arguments when running against the mock.
5. **React Hooks:** Ensure `LatestPost` component consumes typed hook data without unsafe tuple destructuring.
6. **Vitest Helpers:** Refactor `collectionRouter.spec.ts` and `postRouter.spec.ts` to use typed caller factories without `any`.
7. **Lint & Tests:** Run `npm run lint` plus targeted `npm run test -- --run collectionRouter.spec.ts postRouter.spec.ts` to confirm compliance.

## 7. Unit Testing Strategy

- Primary gate: `npm run lint` (ensures all unsafe usage eliminated).
- Targeted Vitest suites (`collectionRouter.spec.ts`, `postRouter.spec.ts`) ensure typed helpers behave as expected.
- Optional smoke: `npm run typecheck` to verify TypeScript coherence after refactors.

## 8. Risks & Mitigations

- **Divergent Mock Types:** Mock delegates may drift from Prisma signatures — mitigate by aligning via shared DTOs and unit tests relying on typed behaviour.
- **Auth Adapter in Mock Mode:** Passing the mock client to `PrismaAdapter` may fail at runtime — mitigate via runtime guard to fall back to no-op or throw descriptive error.
- **Increased Mock Complexity:** Added typing could introduce maintenance overhead — mitigate with helper types co-located in mock file and comments documenting intent.

## 9. Open Questions

- Should we surface a dedicated factory for creating test callers in `src/test/setup.ts` to reuse across suites? (Pending future consolidation.)
- Do we need to expose typed helpers for UI components beyond this lint cleanup? (Deferred until lint results indicate further scope.)

## 10. Approval & Next Steps

- Await confirmation after implementation; update `TASK006` with progress logs.
- On completion, mark design as "Implemented" and link to lint run evidence.
