# DESIGN023 - Caching layer for public catalog

## Context

ISR is already used (`revalidate = 60`) for `/` and `/catalog`. The review suggests a caching strategy to reduce database load.

## Requirements (EARS)

- WHEN anonymous users browse public catalog data, THE SYSTEM SHALL avoid unnecessary repeated DB queries.
- WHEN a collection or link is mutated, THE SYSTEM SHALL invalidate relevant cached views.

## Proposed approach

- Keep ISR as the primary cache for page-level HTML.
- Add server-side caching for API-level catalog calls:
  - Phase 1: in-memory LRU (best-effort, works on long-lived nodes)
  - Phase 2: Redis (if traffic demands it)
- Introduce explicit invalidation hooks in tRPC mutations (invalidate catalog keys).

## Validation

- Unit tests for cache key construction and invalidation.
- Confirm correctness under cache disabled mode.
