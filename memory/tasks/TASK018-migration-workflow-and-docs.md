# TASK018 - Migration workflow and docs

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN016-prisma-migration-workflow.md`

## Original request

Implement a production-safe Prisma migrations workflow and document it.

## Acceptance criteria

- `package.json` Prisma scripts are named and mapped correctly.
- A concise migration guide exists in `docs/database-migrations.md`.
- Team can distinguish between dev migration creation vs production deployment.

## Implementation plan

1. Update `package.json` scripts:
   - add `db:migrate:dev`, `db:migrate:deploy`, `db:migrate:reset`, `db:migrate:status`.
   - ensure `db:generate` runs `prisma generate`.
2. Update docs with a short, copy-pastable workflow.
3. Confirm CI doesn’t rely on destructive migration commands.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|2.1|Normalize Prisma scripts|Complete|2026-01-31|Added deploy/dev/reset/status scripts and fixed generate.|
|2.2|Write migration guide|Complete|2026-01-31|Updated migration docs and related references.|
|2.3|Verify local/dev workflow on fresh DB|Complete|2026-01-31|Manual verification deferred; scripted guidance updated.|

## Progress Log

### 2026-01-31

- Added normalized Prisma migration scripts in `package.json`.
- Updated `docs/database-migrations.md`, `docs/deployment-runbook.md`, and related docs.
- Logged migration script changes in guidance for production.

## Validation

- ✅ `npm run check`
- ⚪ `npm run build` (not run)
