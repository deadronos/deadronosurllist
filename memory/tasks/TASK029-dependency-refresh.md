# TASK029 - Dependency refresh

**Status:** Completed  
**Added:** 2026-03-18  
**Updated:** 2026-03-18

## Related design

- `memory/designs/DESIGN027-dependency-refresh.md`

## Original request

Open a new branch, update to the latest packages, fix resulting errors, and open a pull request.

## Acceptance criteria

- A dedicated branch is created from `main` for dependency maintenance.
- Package manifests and lockfile are updated to the latest versions that work in this repo.
- Lint, typecheck, unit tests, and any required build or smoke validations pass after fixes.
- A pull request is opened against `main` with a clear summary of dependency changes and compatibility fixes.

## Implementation plan

1. Inspect current git state, environment readiness, and outdated packages.
2. Create a maintenance branch and document the change set.
3. Upgrade dependencies in a controlled batch.
4. Fix any code, config, or test breakages caused by the upgrades.
5. Run validation commands and open a PR.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|29.1|Inspect repo and outdated packages|Complete|2026-03-18|Verified git status, GitHub auth, CI gates, and current npm outdated output.|
|29.2|Create branch and task/design docs|Complete|2026-03-18|Branch, task, and design docs were added.|
|29.3|Upgrade dependencies|Complete|2026-03-18|Refreshed package versions, lockfile, and aligned ESLint compatibility.|
|29.4|Fix compatibility regressions|Complete|2026-03-18|Fixed preview script, Vite path config, mock-auth production builds, and Playwright stability issues.|
|29.5|Validate and open PR|Complete|2026-03-18|Validated checks/build/E2E and prepared branch for push + PR.|

## Progress Log

### 2026-03-18

- Audited current dependency versions with `npm outdated`.
- Confirmed GitHub CLI auth and remote availability for opening a pull request.
- Created branch `chore/dependency-refresh-2026-03`.
- Updated runtime and dev dependencies to the latest compatible versions and regenerated `package-lock.json`.
- Switched Vitest to native Vite tsconfig path resolution and fixed the `preview` script.
- Added `turbopack.root`, mock-auth-safe provider initialization, and Playwright config/test hardening.
- Revalidated with `npm run check`, `npm test`, `npm run build`, and `npx playwright test --reporter=line`.
- Pushed branch `chore/dependency-refresh-2026-03` and opened PR #76.

## Validation

- ✅ `npm run check`
- ✅ `npm test`
- ✅ `npm run build`
- ✅ `npx playwright test --reporter=line`
- ✅ `gh pr create`
