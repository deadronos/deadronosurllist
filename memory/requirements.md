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

## Link Authorization Hardening

- WHEN a member attempts to create, update, delete, or reorder links within a collection they do not own, THE SYSTEM SHALL reject the request with a `FORBIDDEN` error before mutating any records [Acceptance: Vitest expectations for `linkRouter` mutations assert TRPCError code `FORBIDDEN` for foreign ownership].

## Auth Callback Consistency

- WHEN the JWT callback runs without a user object but receives a token `sub`, THE SYSTEM SHALL persist the identifier on `token.id` so later callbacks see a stable user id [Acceptance: Vitest ensures `authCallbacks.jwt` copies `token.sub` into `token.id`].
- WHEN the session callback executes without a user id but the token supplies one, THE SYSTEM SHALL propagate the id to `session.user.id` to keep downstream consumers authorized [Acceptance: Vitest verifies `authCallbacks.session` populates `session.user.id` from the token payload].

## Graceful Auth Configuration

- WHEN OAuth provider credentials are missing or use placeholder values in a non-production environment, THE SYSTEM SHALL disable the affected provider and expose the status for UI messaging [Acceptance: unit test covering the provider diagnostics helper].
- WHEN no authentication providers are enabled, THE SYSTEM SHALL render the custom sign-in page with guidance instead of propagating an exception [Acceptance: manual verification or component snapshot for the `/signin` page].
- WHEN valid credentials are supplied, THE SYSTEM SHALL configure the corresponding provider so the normal sign-in flow continues to work [Acceptance: unit test ensuring provider creation succeeds with realistic credentials].

## Navigation & UX

- WHEN a visitor views any application page, THE SYSTEM SHALL present a persistent navigation control that links back to the home page [Acceptance: manual check confirming the control renders across non-root routes].
- WHEN an error or not-found page renders, THE SYSTEM SHALL provide a clear action to return to the home page [Acceptance: manual check triggering error/not-found routes].

## Public Collections Catalog

- WHEN the `collection.getPublicCatalog` tRPC procedure receives an optional query, limit, and cursor, THE SYSTEM SHALL return public collections ordered by `updatedAt` descending with a maximum of `limit` entries, ISO8601 timestamps, and the next cursor when more results remain [Acceptance: Vitest exercising pagination and cursor advancement].
- WHEN the catalog response is constructed, THE SYSTEM SHALL include at most three top links per collection ordered by link `order`, ensuring the payload is trimmed for the landing page cards [Acceptance: Vitest verifying link trimming].
- WHEN the landing page renders, THE SYSTEM SHALL display a section titled "All current public lists" showing one card per public collection from the first catalog page including name, description, and top links [Acceptance: manual or automated UI check confirming cards render for seeded collections].
- WHEN a visitor activates the "Load more" control, THE SYSTEM SHALL fetch the next catalog page via tRPC and append it to the rendered grid without duplicates [Acceptance: component-level test or manual verification demonstrating pagination].
- WHEN a visitor enters text into the catalog search input, THE SYSTEM SHALL filter the rendered cards to collections whose name or description contains the query case-insensitively [Acceptance: component story or manual check filtering seeded data].
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

## Vitest Toolchain Compatibility

- WHEN the TypeScript typecheck executes against Vitest tooling files, THE SYSTEM SHALL rely on exported types from maintained dependencies to avoid TS2305 missing member diagnostics [Acceptance: `npm run typecheck` completes without TS2305 errors from `vitest.config.ts`].
- WHEN Vitest loads the browser testing configuration, THE SYSTEM SHALL compile with a typed `browser` option while gracefully handling missing Playwright provider modules [Acceptance: `npm run test` completes without type errors or runtime exceptions if `@vitest/browser-playwright` is absent].
- WHEN the lint fixer script runs, THE SYSTEM SHALL lint the Vitest configuration without reporting unresolved type references or unsafe assignments introduced by the tooling upgrade [Acceptance: `npm run lint:fix` exits with code 0 and reports no type-based lint errors in `vitest.config.ts`].
- WHEN environment variable `VITEST_BROWSER` is unset or not `"true"`, THE SYSTEM SHALL skip enabling the Vitest browser provider so Node-based test runs succeed without Playwright browser binaries [Acceptance: `npm run test` completes without attempting to launch Playwright when `VITEST_BROWSER` is not `"true"`].
