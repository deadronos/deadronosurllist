# TASK021 - Add deploy workflows

**Status:** Pending  
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

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|5.1|Create preview deploy workflow|Not Started|2026-01-31||
|5.2|Create production deploy workflow|Not Started|2026-01-31||
|5.3|Document secrets + runbook steps|Not Started|2026-01-31||

## Validation

- YAML validation (CI)
- First successful deploy in Vercel
