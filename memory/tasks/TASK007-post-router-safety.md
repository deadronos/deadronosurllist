# TASK007 - Post Router Type Safety

**Status:** Completed  
**Added:** 2025-10-10  
**Updated:** 2025-10-10

## Original Request

Resolve the `@typescript-eslint/no-unsafe-*` lint failures triggered in `src/server/api/routers/post.ts` during `npm run build` by ensuring the tRPC context exposes typed database delegates.

## Thought Process

- The lint errors stem from `ctx.db.post` being inferred as `any`, implying our shared database export lacks a stable typed contract.
- Aligning the Prisma client and mock database behind a common `LinkListDatabase` interface will give routers consistent typing and remove the unsafe diagnostics.
- Updating `postRouter` to lean on the typed context may surface additional lint gaps we should address while touching the file.

## Implementation Plan

1. Define or refine a shared `LinkListDatabase` contract (likely via `Pick<PrismaClient, "$transaction" \| "collection" \| "link" \| "post">`) and ensure both real and mock databases satisfy it.
2. Update `src/server/db.ts` to export the database client typed according to the shared contract, guarding mock usage as needed.
3. Adjust `src/server/db.mock.ts` to satisfy the contract without resorting to `any`, updating helper functions if required.
4. Confirm `createTRPCContext` surfaces the typed client and update `postRouter` to rely on the resulting typing, adding narrow DTO aliases only if lint still demands explicit types.
5. Run `npm run typecheck`, `npm run lint`, targeted `npm run test -- --run postRouter.spec.ts`, and finally `npm run build` to ensure the lint errors are resolved.

## Progress Tracking

**Overall Status:** Completed – 100%

### Subtasks

| ID  | Description                                       | Status        | Updated     | Notes |
| --- | ------------------------------------------------- | ------------- | ----------- | ----- |
| 1.1 | Finalize shared database contract                 | Complete      | 2025-10-10  | Confirmed existing contract covers post delegate usage; no structural change required. |
| 1.2 | Type the real Prisma-backed export                | Complete      | 2025-10-10  | Ensured export remains typed via `LinkListDatabase` while focusing on post delegate usage. |
| 1.3 | Align mock database with the shared contract      | Complete      | 2025-10-10  | Verified mock delegate continues to satisfy the contract for post operations. |
| 1.4 | Update tRPC context and `postRouter` typings      | Complete      | 2025-10-10  | Captured Prisma `Post` type in router, normalized user ID usage, and removed unsafe access. |
| 1.5 | Run lint/type/test/build validation               | Complete      | 2025-10-10  | `npm run typecheck`, `npm run lint`, `npm run test -- --run postRouter.spec.ts`, and `npm run build` (Prisma engine warnings acknowledged) all run. |

## Progress Log

### 2025-10-10

- Captured requirements and DESIGN007 outlining the shared database contract approach; created TASK007 with implementation plan.
- Updated `postRouter` to use explicit Prisma `Post` typing, rely on `createdById`, and eliminate unsafe delegate access; verified existing database contract covers the post delegate.
- Validation: `npm run typecheck`, `npm run lint`, `npm run test -- --run postRouter.spec.ts`, and `npm run build` (build notes expected Prisma engine DLL compatibility warnings on Windows mock environment).
