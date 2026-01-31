# DESIGN016 - Prisma migration workflow

## Context

The repository has Prisma migrations and scripts, but the current script names are misleading (`db:generate` runs `prisma migrate dev`). The goal is a safe, explicit workflow for dev vs production.

## Requirements (EARS)

- WHEN developers change `prisma/schema.prisma`, THE SYSTEM SHALL provide a clear dev workflow to create and test migrations.
- WHEN deploying to production, THE SYSTEM SHALL apply migrations via a non-destructive deploy command.
- WHEN installing dependencies, THE SYSTEM SHALL generate Prisma Client consistently.

## Proposed approach

- Normalize scripts:
  - `db:generate`: `prisma generate`
  - `db:migrate:dev`: `prisma migrate dev`
  - `db:migrate:deploy`: `prisma migrate deploy`
  - `db:migrate:status`: `prisma migrate status`
  - `db:migrate:reset`: `prisma migrate reset`
- Keep `db:push` for local prototyping only (documented as “not for prod”).
- Add/update docs in `docs/database-migrations.md` describing:
  - create migration
  - review SQL
  - reset locally
  - deploy in CI/CD

## Validation

- `npm run typecheck`, `npm run lint`, `npm run build`.
- On a clean local DB (or CI ephemeral DB), run `db:migrate:reset` and ensure app boots.

## Risks / notes

- Preview environments often lack a writeable DB; ensure the app can still run with `USE_MOCK_DB` where appropriate.
