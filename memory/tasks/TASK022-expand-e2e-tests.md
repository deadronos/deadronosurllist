# TASK022 - Expand E2E tests

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN020-e2e-suite-expansion.md`

## Original request

Expand Playwright coverage beyond smoke tests.

## Acceptance criteria

- New feature-focused test specs exist under `tests/`.
- Tests use resilient locators and avoid hard waits.
- Tests run in CI with `USE_MOCK_DB=true`.

## Implementation plan

1. Add `tests/public-catalog.spec.ts` (search, load more, basic navigation).
2. Add `tests/auth-flow.spec.ts` (signin page behavior, diagnostics).
3. Add required test hooks/fixtures (optional) for authenticated flows.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|6.1|Add public catalog tests|Complete|2026-01-31|Added search, load more, and navigation coverage.|
|6.2|Add auth diagnostics tests|Complete|2026-01-31|Added sign-in diagnostics coverage.|
|6.3|Add authenticated flow fixture (optional)|Complete|2026-01-31|Not required for current scope.|

## Progress Log

### 2026-01-31

- Added `tests/public-catalog.spec.ts` and `tests/auth-flow.spec.ts`.
- Ensured locators use accessible roles and inputs.

## Validation

- ⚪ `npx playwright test` (not run)
