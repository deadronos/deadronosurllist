# TASK006 - Lint Compliance

**Status:** Completed  
**Added:** 2025-10-10  
**Updated:** 2025-10-10

## Original Request

Fix lint errors.

## Thought Process

- ESLint currently flags extensive `@typescript-eslint/no-unsafe-*` diagnostics stemming from an untyped tRPC database context and downstream consumers (routers, tests, and React hooks).
- The database abstraction must project a consistent, Prisma-aligned type whether the real Prisma client or the in-memory mock is active, otherwise every property access devolves to `any`.
- Tests lean on `as any` casts and dynamic `import()` type annotations, compounding the lint failures; typed helper factories will provide reusable context construction.
- We can address the errors without loosening lint rules by tightening types, introducing minimal DTO parsing where appropriate, and codifying helper utilities.

## Implementation Plan

1. **Database Typing** – Define a shared `LinkListDatabase` contract in `src/server/db.ts`, export a typed `db`, and expose an `isMockDb` flag for consumers that require Prisma-only behaviour.
2. **Mock Alignment** – Update `src/server/db.mock.ts` to satisfy `LinkListDatabase` by exporting `MockDbClient`, ensuring delegate methods return typed DTOs matching Prisma expectations.
3. **tRPC Context & Routers** – Refactor `createTRPCContext` consumers (`collection`, `link`, `post` routers) to rely on the typed database, removing manual `any`-backed mapping and introducing lightweight DTO helpers where necessary.
4. **React Hook Cleanup** – Adjust `src/app/_components/post.tsx` to consume typed hook responses without unsafe tuple destructuring.
5. **Auth Adapter Guard** – Narrow the Prisma adapter instantiation in `src/server/auth/config.ts` to accept the typed database safely, handling mock-mode without triggering lint violations.
6. **Test Helpers** – Replace `import()` type annotations and `as any` casts in `src/test/collectionRouter.spec.ts` and `src/test/postRouter.spec.ts` with typed caller factories and session builders leveraging the shared database contract.
7. **Validation** – Run `npm run lint`, followed by `npm run test -- --run collectionRouter.spec.ts postRouter.spec.ts`, ensuring both lint and focused tests succeed.

## Progress Tracking

**Overall Status:** Completed – 100%

### Subtasks

| ID  | Description                               | Status        | Updated     | Notes |
| --- | ----------------------------------------- | ------------- | ----------- | ----- |
| 1.1 | Type the shared database client export    | Complete      | 2025-10-10  | Wrapped Prisma and mock clients in `LinkListDatabase`. |
| 1.2 | Align mock database delegates with types  | Complete      | 2025-10-10  | Mock helpers now emit typed DTOs. |
| 1.3 | Refine tRPC routers to use typed context  | Complete      | 2025-10-10  | Context annotated; routers operate without unsafe casts. |
| 1.4 | Update React hooks for safe consumption   | Complete      | 2025-10-10  | `LatestPost` now uses suspense-enabled `useQuery`. |
| 1.5 | Harden auth adapter usage of database     | Complete      | 2025-10-10  | Adapter only instantiated with real Prisma client. |
| 1.6 | Replace test casts with typed factories   | Complete      | 2025-10-10  | Test callers built via typed session/context helpers. |
| 1.7 | Re-run lint and targeted Vitest suites    | Complete      | 2025-10-10  | `npm run lint`; `npx vitest --run collectionRouter.spec.ts postRouter.spec.ts`. |

## Progress Log

### 2025-10-10

- Captured lint compliance requirements, recorded DESIGN006, and drafted implementation plan to type the database surface, routers, and tests.
- Implemented `LinkListDatabase` backed by Prisma/mocked wrappers, updated tRPC context and routers, cleaned React hook usage, adjusted NextAuth adapter guard, and refactored Vitest suites to use typed caller factories. Verified fixes via `npm run lint` and `npx vitest --run collectionRouter.spec.ts postRouter.spec.ts`.
