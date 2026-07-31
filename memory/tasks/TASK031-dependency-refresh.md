# TASK031 - Dependency refresh

**Status:** In Progress
**Added:** 2026-07-31
**Updated:** 2026-07-31

## Related design

None (direct maintenance)

## Original request

please open a new branch and upgrade to latest dependencies and packages and fix errors until ok, open a pr when done

## Acceptance criteria

- A dedicated branch is created from `main` for dependency maintenance.
- Package manifests and lockfile are updated to the latest versions.
- Lint, typecheck, unit tests, and build validations pass after fixes.
- A pull request is opened against `main` with a clear summary of dependency changes and compatibility fixes.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|31.1|Inspect repo and outdated packages|Complete|2026-07-31|Ran `npm outdated`; enumerated major/minor/patch upgrades.|
|31.2|Create branch and task doc|Complete|2026-07-31|Branch `chore/dependency-refresh-2026-07` from `main` via `.worktrees/`.|
|31.3|Upgrade dependencies|Complete|2026-07-31|Refreshed deps with `npx npm-check-updates -u` + `npm install --legacy-peer-deps`.|
|31.4|Fix compatibility regressions|Complete|2026-07-31|Pinned TypeScript to 6.0.3 because typescript-eslint 8.65.0 does not yet support TS 7.0.|
|31.5|Validate and open PR|Complete|2026-07-31|`npm run check`, `npm test` (213), `npm run test:contract` (107), and `npm run build` all pass. PR #116 opened.|

## Progress Log

### 2026-07-31

- Created branch `chore/dependency-refresh-2026-07` from `main` via worktree at `.worktrees/dependency-refresh-2026-07`; added `.worktrees/` to `.gitignore`.
- Audited outdated package versions with `npm outdated` (Next 16.2.9 → 16.2.12, TypeScript 6.0.3 → 7.0.2, Prisma 7.8.0 → 7.9.1, ESLint 10.5.0 → 10.8.0, Vite 8.0.16 → 8.2.0, Vitest 4.1.9 → 4.1.10, plus many Radix/utility minor updates).
- Upgraded packages via `npx npm-check-updates -u` and `npm install --legacy-peer-deps`; lockfile regenerated.
- Hit typescript-eslint 8.65.0 incompatibility with TypeScript 7.0; pinned TypeScript to 6.0.3 (latest 6.x) to keep the lint pipeline green until upstream support lands.
- Verified `npm run check` (lint + tsc), `npm test` (213 pass), `npm run test:contract` (107 pass), and `npm run build` all succeed.
- Committed, pushed the branch, and opened PR #116 against `main`.
