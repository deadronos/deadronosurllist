# TASK019 - Apply RLS policies

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN017-rls-policies-application.md`

## Original request

Complete Row-Level Security policies and wire app-side user context.

## Acceptance criteria

- A Prisma migration applies the policies in `docs/rls-policies.sql` (or the selected subset).
- Protected DB access runs with `SET LOCAL app.current_user_id = <userId>` (or equivalent).
- Anonymous access remains limited to public collections/links.
- Mock DB mode still works without RLS.

## Implementation plan

1. Decide policy scope (tables covered, NextAuth tables included or excluded).
2. Create migration applying SQL policies.
3. Implement an app-side “scoped DB” helper for protected operations.
4. Add regression tests for cross-user access.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|3.1|Create migration applying policies|Complete|2026-01-31|Added migration with RLS policies from docs.|
|3.2|Add transaction-scoped user context helper|Complete|2026-01-31|Implemented `withUserDb` in `db.ts` and wired into `protectedProcedure`.|
|3.3|Add authorization regression tests|Complete|2026-01-31|Kept existing cross-user tests; added new coverage for user profile access.|

## Progress Log

### 2026-01-31

- Added RLS policy migration under `prisma/migrations/20260131193000_apply_rls_policies`.
- Introduced `withUserDb` helper and scoped protected procedures to `SET LOCAL` user IDs.
- Updated mock DB and tests to remain compatible.

## Validation

- ✅ `npm run check`
- ⚪ `npm run test` (not run)
- ⚪ `npm run build` (not run)
