# DESIGN017 - Apply RLS policies + app user context

## Context

RLS is enabled via migration (`enable_rls`) and reference policies are documented in `docs/rls-policies.sql`, including per-user policies requiring `SET LOCAL app.current_user_id`.

## Requirements (EARS)

- WHEN a signed-in user performs a database query, THE SYSTEM SHALL ensure database authorization cannot leak another user’s private data.
- WHEN no user is authenticated, THE SYSTEM SHALL allow access only to explicitly public data (e.g., `Collection.isPublic = true`).
- WHEN running against the mock DB, THE SYSTEM SHALL not require RLS context.

## Proposed approach

### Phase A (DB)

- Add a Prisma migration which applies policies from `docs/rls-policies.sql`.
- Ensure policies exist for `Collection`, `Link`, and NextAuth tables where needed.

### Phase B (App)

- Introduce a single helper used by all protected operations to run DB work in a transaction which sets:
  - `SET LOCAL app.current_user_id = <session.user.id>`
- Prefer “one place” integration:
  - either a `ctx.dbWithUser(session.user.id)` wrapper
  - or a tRPC middleware for `protectedProcedure` which provides a scoped DB client

## Interfaces / files

- `docs/rls-policies.sql` (reference)
- `prisma/migrations/<new>/migration.sql` (applied policies)
- `src/server/db.ts` (add helper for scoped transactions)
- `src/server/api/trpc.ts` (optional tRPC middleware integration)

## Validation

- Add targeted tests (Vitest) verifying:
  - user A cannot read user B’s private collection
  - anonymous can read public collections only
- Manual verification in DB:
  - attempt SELECTs with/without `app.current_user_id`.

## Risks / notes

- Prisma + RLS context is easy to get wrong if queries occur outside a transaction. The design requires centralizing DB access for protected queries.
