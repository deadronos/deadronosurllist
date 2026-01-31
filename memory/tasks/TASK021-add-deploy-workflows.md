# TASK021 - Add deploy workflows

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN019-deploy-workflows.md`

## Original request

Add GitHub Actions workflows to deploy to Vercel for preview and production.

## Acceptance criteria

- Preview workflow exists and is triggered on PRs.
- Production workflow exists and is triggered on `main` pushes.
- Workflows document required secrets.
- Deploy jobs run after test gates.

## Implementation plan

1. Add `.github/workflows/deploy-preview.yml`.
2. Add `.github/workflows/deploy-production.yml`.
3. Document required secrets in `README.md` or `docs/deployment-runbook.md`.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|5.1|Create preview deploy workflow|Complete|2026-01-31|Added `deploy-preview.yml` with test gates.|
|5.2|Create production deploy workflow|Complete|2026-01-31|Added `deploy-production.yml` with test gates.|
|5.3|Document secrets + runbook steps|Complete|2026-01-31|Updated deployment runbook with required secrets.|

## Progress Log

### 2026-01-31

- Added preview and production Vercel workflows gated on lint/tests.
- Documented required secrets in `docs/deployment-runbook.md`.

## Validation

- ✅ `npm run check`
- ⚪ Vercel deploy validation (not run)
