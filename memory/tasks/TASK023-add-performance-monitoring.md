# TASK023 - Add performance monitoring

**Status:** Pending  
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

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|7.1|Add Speed Insights integration|Not Started|2026-01-31||
|7.2|Extend health response with build metadata (optional)|Not Started|2026-01-31||
|7.3|Add slow DB query logging guardrails|Not Started|2026-01-31||

## Validation

- `npm run build`
- `npx playwright test`
