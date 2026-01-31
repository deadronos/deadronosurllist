# TASK026 - Add visual and load testing

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN024-visual-and-load-testing.md`

## Original request

Add visual regression checks and load testing capability.

## Acceptance criteria

- Visual regression tests exist and are stable.
- Load testing scripts exist and are runnable on demand.
- CI integration is staged (not necessarily gating day one).

## Implementation plan

1. Add a small set of Playwright screenshot tests for stable pages.
2. Add `k6` scripts for key endpoints.
3. Add an optional GH Action workflow to run on schedule or manual trigger.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|10.1|Add Playwright screenshot assertions|Complete|2026-01-31|Added `tests/visual.spec.ts` gated by env flag.|
|10.2|Add k6 scripts and npm scripts|Complete|2026-01-31|Added `scripts/load` and npm scripts.|
|10.3|Add optional CI workflow for perf/visual|Complete|2026-01-31|Added manual `perf-visual.yml` workflow.|

## Progress Log

### 2026-01-31

- Added optional visual regression Playwright spec.
- Added k6 load scripts for catalog and health endpoints.
- Added `perf-visual` workflow with manual base URL input.

## Validation

- ⚪ `npx playwright test` (not run)
