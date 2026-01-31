# TASK024 - Publish API docs

**Status:** Pending  
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

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|8.1|Write `docs/api.md` for core routers|Not Started|2026-01-31||
|8.2|Link docs from README|Not Started|2026-01-31||
|8.3|Decide on OpenAPI follow-up|Not Started|2026-01-31||

## Validation

- `npm run lint`
- `npm run typecheck`
