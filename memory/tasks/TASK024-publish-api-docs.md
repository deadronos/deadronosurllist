# TASK024 - Publish API docs

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN022-api-documentation.md`

## Original request

Provide maintainable API documentation for tRPC procedures.

## Acceptance criteria

- A documentation artifact exists (Option A or Option B) and is linked from `README.md`.
- Docs describe auth requirements and major procedures.

## Implementation plan

1. Implement Option A (docs-only) first: `docs/api.md`.
2. If desired, prototype Option B (OpenAPI) behind a separate PR.
3. Add a maintenance checklist for new procedures.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|8.1|Write `docs/api.md` for core routers|Complete|2026-01-31|Added router documentation and maintenance checklist.|
|8.2|Link docs from README|Complete|2026-01-31|Linked API docs in quick links section.|
|8.3|Decide on OpenAPI follow-up|Complete|2026-01-31|Deferred; docs-only approach delivered.|

## Progress Log

### 2026-01-31

- Added `docs/api.md` with collection, link, and user router coverage.
- Linked API documentation from `README.md`.

## Validation

- ✅ `npm run check`
