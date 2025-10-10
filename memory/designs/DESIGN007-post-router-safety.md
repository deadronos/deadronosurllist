# DESIGN007 – Post Router Type Safety

**Status:** Implemented  
**Confidence Score:** 0.86 (High)  
**Related Requirements:** Post Router Type Safety (memory/requirements.md)  
**Scope:** Ensure the `post` tRPC router and its backing database delegates are fully typed so Next.js builds pass without unsafe `any` lint violations.

## 1. Architecture Overview

```text
[tRPC postRouter] ──► [Typed TRPC Context]
          │                    │
          ▼                    ▼
   [Prisma Client]      [Mock DB Wrapper]
          │                    │
          └─────► [Shared DB Contract]
```

- `createTRPCContext` must surface a database client that satisfies a shared contract describing the Prisma delegates we consume.
- The real Prisma client (`PrismaClient`) and the in-memory mock (`db.mock.ts`) both conform to this contract so routers receive consistent typing.
- `postRouter` queries and mutations operate on the typed delegates and return DTOs inferred from Prisma outputs, eliminating implicit `any`.

## 2. Data Flow

1. Application requests initialize tRPC context through `createTRPCContext`, which injects a typed database client and session.
2. `postRouter` procedures call `ctx.db.post` delegate methods; TypeScript validates parameters and return types via the shared contract.
3. Responses propagate to callers (React hooks/tests) using Prisma-inferred types, ensuring no lint warnings for unsafe access.
4. Tests relying on the mock database exercise the same delegates, guaranteeing parity with production behaviour.

## 3. Interfaces & Types

| Layer | Interface / Type | Notes |
| --- | --- | --- |
| Shared | `LinkListDatabase` (`Pick<PrismaClient, "$transaction" \| "collection" \| "link" \| "post">`) | Central contract satisfied by real and mock clients. |
| Prisma | `PrismaClient` | Narrowed to the required delegates when exported. |
| Mock | `MockDbClient` | Implements delegate methods returning `PrismaPromise`-compatible results. |
| Router | `PostSummary` | Type alias for the object returned by `postRouter.create` / `getLatest`. |

## 4. Data Models

- **Post Record:** `{ id: string; name: string; createdById: string; createdAt: Date; updatedAt: Date; }` (matches Prisma `Post`).
- **Post Response DTO:** The raw Prisma record returned by `ctx.db.post.create/findFirst`; no additional mapping required once typing is enforced.

## 5. Error Handling Matrix

| Procedure | Potential Issue | Expected Handling |
| --- | --- | --- |
| `PrismaAdapter` usage | Mock client lacks Prisma internals | Guard before instantiating adapter to avoid runtime mismatch. |
| `ctx.db.post.findFirst` | No post for user | Return `null` (existing behaviour). |
| Mock delegate calls | Missing seeded data | Mock ensures default entities for tests; returns `null` otherwise. |

## 6. Implementation Tasks

1. **Shared Contract:** Move or redefine `LinkListDatabase` to `Pick<PrismaClient, ...>` ensuring delegate signatures match Prisma.
2. **Real Client Export:** Update `src/server/db.ts` to type `db` as `LinkListDatabase` (or `PrismaClient` narrowed) and expose a helper for detecting mock usage if needed.
3. **Mock Alignment:** Refine `src/server/db.mock.ts` so exported client satisfies `LinkListDatabase` (returning promises/Prisma-like objects) without introducing `any`.
4. **Context Typing:** Confirm `createTRPCContext` returns the typed client (may only require type annotations) and adjust types if necessary.
5. **Router Cleanup:** Update `src/server/api/routers/post.ts` to rely on the typed context, explicitly typing returned objects if ESLint still demands clarity.
6. **Validation:** Run `npm run typecheck`, `npm run lint`, and targeted `npm run test -- --run postRouter.spec.ts` (add/adjust test if missing). Final gate: `npm run build`.

## 7. Unit Testing Strategy

- Use existing or new Vitest suite for `postRouter` to call `create`, `getLatest`, and ensure typed contract works against the mock.
- Execute `npm run typecheck` to verify TypeScript inference, and `npm run lint`/`npm run build` to confirm lint compliance.

## 8. Risks & Mitigations

- **Prisma Type Mismatch:** `PrismaClient` delegate signatures may not align with simple promise types. *Mitigation:* Use `Pick<PrismaClient, ...>` so TypeScript enforces compatibility automatically.*
- **Mock Complexity:** Mock implementation may need adjustments to mirror Prisma delegates. *Mitigation:* Wrap return values with simple `Promise.resolve`/custom lightweight PrismaPromise-like objects and add targeted tests.*
- **Downstream Dependents:** Other routers/tests may rely on implicit `any`. *Mitigation:* Address any new lint findings encountered during validation as part of the task.*

## 9. Open Questions

- Should we expose additional helpers (e.g., `createTestCaller`) to centralize typed test context creation? (Not required for this fix but could reduce duplication later.)

## 10. Approval & Next Steps

- Upon approval, proceed with TASK007 implementation steps and update Memory Bank progress entries accordingly.
