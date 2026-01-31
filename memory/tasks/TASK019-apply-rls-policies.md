# TASK019 - Apply RLS policies

**Status:** Pending  
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

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|3.1|Create migration applying policies|Not Started|2026-01-31||
|3.2|Add transaction-scoped user context helper|Not Started|2026-01-31||
|3.3|Add authorization regression tests|Not Started|2026-01-31||

## Validation

- `npm run test`
- `npm run build`
