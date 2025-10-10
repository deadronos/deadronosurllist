# Requirements – LinkList

## Public Welcome Experience

- WHEN the mock database initializes, THE SYSTEM SHALL ensure a public collection named "Discover Links" exists with at least the default link `https://github.com` [Acceptance: unit test or direct call to the mock DB confirms collection with `isPublic=true` and the link entry present].
- WHEN an unauthenticated caller requests the public collection via tRPC, THE SYSTEM SHALL return the collection metadata and ordered links without requiring a session [Acceptance: unit test for the `collection.getPublic` procedure].
- WHEN a visitor loads the root `/` page, THE SYSTEM SHALL present the welcome layout that highlights the public collection links and authentication call-to-action using the Radix UI theme [Acceptance: manual UI check verifying hero content and Radix Theme wrapper].

## Authentication & Access Control

- WHEN an unauthenticated visitor opens `/dashboard` or `/collections/[id]`, THE SYSTEM SHALL redirect them toward sign-in messaging instead of exposing member data [Acceptance: server component renders call-to-action verified via integration test or manual check].
- WHEN an authenticated user calls a protected tRPC procedure, THE SYSTEM SHALL scope all queries and mutations to `ctx.session.user.id` [Acceptance: router unit tests expect FORBIDDEN when accessing data owned by another user].

## Collection Management

- WHEN a signed-in member submits the collection creation form with a non-empty name, THE SYSTEM SHALL persist the collection, associate it with the member, and refresh the dashboard listing [Acceptance: UI smoke test or mutation unit test confirming reuse of `collection.create`].
- WHEN a member requests their collections, THE SYSTEM SHALL return them ordered by `updatedAt` descending including link counts [Acceptance: unit test for `collection.getAll`].
- WHEN a member fetches a collection they own by ID, THE SYSTEM SHALL return ordered links or `null` if absent [Acceptance: unit test for `collection.getById` covering ownership].

## Link Management

- WHEN a member submits a valid link (URL + name) for one of their collections, THE SYSTEM SHALL assign the next available `order` and persist the record [Acceptance: unit or integration test for `link.create`].
- WHEN a member updates, deletes, or reorders a link, THE SYSTEM SHALL verify the owning collection belongs to the member before applying changes [Acceptance: link router tests expect FORBIDDEN on foreign collections].

## Graceful Auth Configuration

- WHEN OAuth provider credentials are missing or use placeholder values in a non-production environment, THE SYSTEM SHALL disable the affected provider and expose the status for UI messaging [Acceptance: unit test covering the provider diagnostics helper].
- WHEN no authentication providers are enabled, THE SYSTEM SHALL render the custom sign-in page with guidance instead of propagating an exception [Acceptance: manual verification or component snapshot for the `/signin` page].
- WHEN valid credentials are supplied, THE SYSTEM SHALL configure the corresponding provider so the normal sign-in flow continues to work [Acceptance: unit test ensuring provider creation succeeds with realistic credentials].

## Navigation & UX

- WHEN a visitor views any application page, THE SYSTEM SHALL present a persistent navigation control that links back to the home page [Acceptance: manual check confirming the control renders across non-root routes].
- WHEN an error or not-found page renders, THE SYSTEM SHALL provide a clear action to return to the home page [Acceptance: manual check triggering error/not-found routes].

## Type Safety Hardening

- WHEN TypeScript static analysis runs, THE SYSTEM SHALL compile without reporting implicit `any` parameters in application components or tests [Acceptance: `npm run typecheck` shows zero TS7006 diagnostics].
- WHEN the authentication configuration constructs provider instances, THE SYSTEM SHALL produce objects compatible with NextAuth `Provider` definitions without manual casts [Acceptance: `npm run typecheck` completes without TS2322/TS2345 errors in auth config files].
- WHEN the mock database adapters resolve optional records, THE SYSTEM SHALL guard against `undefined` values before dereferencing to satisfy strict null checks [Acceptance: `npm run typecheck` reports no TS18048/TS2488 diagnostics in `src/server/db.mock.ts`].

## Post Router Type Safety

- WHEN the Next.js production build runs, THE SYSTEM SHALL complete without reporting `@typescript-eslint/no-unsafe-*` violations in `src/server/api/routers/post.ts` [Acceptance: `npm run build` succeeds without lint failures].
- WHEN tRPC procedures access `ctx.db.post`, THE SYSTEM SHALL provide strongly typed Prisma delegate methods instead of `any` [Acceptance: `npm run typecheck` reports no unsafe call/member access warnings for `ctx.db.post` usages].
- WHEN Vitest executes against the mock database, THE SYSTEM SHALL expose `post` delegate behaviour matching the typed database contract without relying on `any` [Acceptance: `npm run test -- --run postRouter.spec.ts` completes without type or lint violations].

## Lint Compliance

- WHEN `npm run lint` executes, THE SYSTEM SHALL complete without any `@typescript-eslint/no-unsafe-*` or `@typescript-eslint/no-explicit-any` diagnostics across routers, database utilities, or tests [Acceptance: `npm run lint` exits with code 0 and reports zero such violations].
- WHEN tRPC procedures access `ctx.db`, THE SYSTEM SHALL expose a typed database client so property access (e.g., `collection`, `link`, `post`) carries Prisma-aligned signatures instead of `any` [Acceptance: TypeScript inference in routers eliminates `@typescript-eslint/no-unsafe-member-access` and related lint warnings].
- WHEN Vitest suites construct callers or contexts, THE SYSTEM SHALL rely on typed helpers rather than `any` coercions [Acceptance: `npm run lint` reports no `@typescript-eslint/no-unsafe-assignment` or `no-explicit-any` issues within `src/test` files].
