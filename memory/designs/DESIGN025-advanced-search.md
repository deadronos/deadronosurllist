# DESIGN025 - Advanced search

## Context

Public catalog supports basic search/pagination. The review suggests adding richer filters and sorting.

## Requirements (EARS)

- WHEN a user searches, THE SYSTEM SHALL support sorting (updated, created, name, link count).
- WHEN a user filters, THE SYSTEM SHALL apply filters consistently between UI and API.
- WHEN datasets grow, THE SYSTEM SHALL allow future offloading to database full-text search.

## Proposed approach

- Extend `collection.getPublicCatalog` input schema:
  - `q`, `sortBy`, `sortOrder`, optional tag filters (future)
- Add indexes in Prisma schema for commonly filtered fields (`isPublic`, `updatedAt`).
- UI: add a filter panel component on `/catalog`.

## Validation

- Vitest: filtering/sorting correctness.
- Playwright: search + sort integration.
