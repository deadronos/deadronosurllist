# TASK025 - Add caching layer

**Status:** Pending  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN023-caching-layer.md`

## Original request

Introduce a caching strategy to reduce DB load for public catalog queries.

## Acceptance criteria

- Cache layer exists for catalog data (LRU or Redis).
- Cache invalidation occurs on mutations affecting public views.
- Cache can be disabled safely.

## Implementation plan

1. Add a minimal in-memory cache abstraction (no new infra).
2. Use it for public catalog and featured public collection.
3. Add invalidation hooks in mutations.
4. Add tests for cache keys + invalidation.

## Progress tracking

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|9.1|Implement cache abstraction (LRU)|Not Started|2026-01-31||
|9.2|Wire cache into public catalog procedures|Not Started|2026-01-31||
|9.3|Add invalidation on mutations|Not Started|2026-01-31||

## Validation

- `npm run test`
- `npm run build`
