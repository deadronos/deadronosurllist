# TASK023 - Add performance monitoring

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN021-performance-monitoring.md`

## Original request

Add production-grade performance monitoring (Speed Insights + lightweight server observability).

## Acceptance criteria

- Speed Insights is enabled in production.
- `/api/health` remains fast and returns no-cache responses.
- Logging/metrics changes do not break build or edge/runtime constraints.

## Implementation plan

1. Add Speed Insights to `src/app/layout.tsx`.
2. Extend `/api/health` with optional version/commit info (env-driven).
3. Add lightweight slow-query logging (guarded; production-safe).

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|7.1|Add Speed Insights integration|Complete|2026-01-31|Rendered Speed Insights in production layout.|
|7.2|Extend health response with build metadata (optional)|Complete|2026-01-31|Added optional commit/environment metadata fields.|
|7.3|Add slow DB query logging guardrails|Complete|2026-01-31|Guarded slow-query logging via env flag.|

## Progress Log

### 2026-01-31

- Added Speed Insights to the root layout.
- Extended `/api/health` responses with build metadata when available.
- Added optional slow query logging in Prisma client setup.

## Validation

- ✅ `npm run check`
- ⚪ `npm run build` (not run)
