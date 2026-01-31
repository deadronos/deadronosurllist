# DESIGN020 - Expand Playwright E2E suite

## Context

Playwright runs in CI and has `tests/smoke.spec.ts`. Coverage is intentionally minimal.

## Requirements (EARS)

- WHEN a user visits `/`, THE SYSTEM SHALL render public catalog previews and core CTAs.
- WHEN a user searches the public catalog, THE SYSTEM SHALL filter results without errors.
- WHEN a user visits `/catalog`, THE SYSTEM SHALL paginate/load more reliably.
- WHEN auth is disabled (mock creds), THE SYSTEM SHALL show the diagnostics UX.

## Proposed approach

- Add feature-focused test files:
  - `tests/public-catalog.spec.ts`
  - `tests/auth-flow.spec.ts`
  - `tests/collection-management.spec.ts` (later; needs auth state fixture)
- Prefer role-based locators (`getByRole`, `getByLabel`).
- Add stable `data-testid` attributes only where role locators are insufficient.

## Validation

- `npx playwright test` locally and in CI.
- Ensure tests run against `USE_MOCK_DB=true` and do not require a real DB.
