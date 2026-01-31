# TASK027 - Build advanced search

**Status:** Pending  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN025-advanced-search.md`

## Original request

Add sorting and richer filtering to the public catalog.

## Acceptance criteria

- Catalog API supports sorting inputs.
- Catalog UI exposes sorting controls.
- Sorting/filtering behavior is tested.

## Implementation plan

1. Extend tRPC input schema and Prisma query `orderBy` logic.
2. Add a filter/sort UI component on `/catalog`.
3. Add Vitest and Playwright coverage for a few representative cases.

## Progress tracking

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|11.1|Extend catalog procedure schema + query|Not Started|2026-01-31||
|11.2|Add catalog sort/filter UI|Not Started|2026-01-31||
|11.3|Add unit + e2e coverage|Not Started|2026-01-31||

## Validation

- `npm run test`
- `npx playwright test`
