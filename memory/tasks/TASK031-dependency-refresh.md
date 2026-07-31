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

**Overall Status:** In Progress - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|31.1|Inspect repo and outdated packages|Pending|2026-07-31|Run `npm outdated` to enumerate upgrades.|
|31.2|Create branch and task doc|Pending|2026-07-31|Branch `chore/dependency-refresh-2026-07` created in `.worktrees/`.|
|31.3|Upgrade dependencies|Pending|2026-07-31|Bump dependencies to latest versions and install.|
|31.4|Fix compatibility regressions|Pending|2026-07-31|Address lint/typecheck/test regressions introduced by upgrades.|
|31.5|Validate and open PR|Pending|2026-07-31|Checks, tests, and build pass; PR opened.|

## Progress Log

### 2026-07-31

- Created branch `chore/dependency-refresh-2026-07` from `main` via worktree at `.worktrees/dependency-refresh-2026-07`.
- Audited outdated package versions with `npm outdated` (Next 16.2.9 → 16.2.12, TypeScript 6.0.3 → 7.0.2, Prisma 7.8.0 → 7.9.1, ESLint 10.5.0 → 10.8.0, plus many Radix/utility minor updates).
