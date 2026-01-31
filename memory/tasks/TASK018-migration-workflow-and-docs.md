# TASK018 - Migration workflow and docs

**Status:** Pending  
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

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|2.1|Normalize Prisma scripts|Not Started|2026-01-31||
|2.2|Write migration guide|Not Started|2026-01-31||
|2.3|Verify local/dev workflow on fresh DB|Not Started|2026-01-31||

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
