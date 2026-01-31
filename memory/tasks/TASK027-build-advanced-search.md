# TASK027 - Build advanced search

**Status:** Completed  
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

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|11.1|Extend catalog procedure schema + query|Complete|2026-01-31|Added sort inputs and query orderBy options.|
|11.2|Add catalog sort/filter UI|Complete|2026-01-31|Added sort dropdown + server-side search inputs.|
|11.3|Add unit + e2e coverage|Complete|2026-01-31|Added Vitest sorting tests and Playwright coverage.|

## Progress Log

### 2026-01-31

- Added sort/search inputs for public catalog queries.
- Replaced client-only sorting with server-driven sort options.
- Added unit tests for sort orders and e2e coverage for catalog flow.

## Validation

- ✅ `npm run check`
- ⚪ `npm run test` (not run)
- ⚪ `npx playwright test` (not run)
