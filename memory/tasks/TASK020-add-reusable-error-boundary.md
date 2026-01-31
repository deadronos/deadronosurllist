# TASK020 - Add reusable ErrorBoundary

**Status:** Pending  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN018-error-boundary.md`

## Original request

Add a reusable client error boundary to improve UX for client-side runtime errors.

## Acceptance criteria

- `src/components/error-boundary.tsx` exists and can wrap any client subtree.
- Error boundary provides recovery controls (retry/home).
- Optional error reporting hook is present (guarded; no hard dependency).

## Implementation plan

1. Implement `ErrorBoundary` class component.
2. Add a shared fallback UI (reuse existing design language).
3. Optionally refactor `src/app/error.tsx` to reuse shared pieces.

## Progress tracking

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|4.1|Add `ErrorBoundary` component|Not Started|2026-01-31||
|4.2|Add fallback UI + actions|Not Started|2026-01-31||
|4.3|Validate with intentional error case|Not Started|2026-01-31||

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
