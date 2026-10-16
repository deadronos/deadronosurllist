# TASK032 - Dependency refresh

**Status:** Completed
**Added:** 2026-10-16
**Updated:** 2026-10-16

## Related design

None (direct maintenance)

## Original request

update this to latest packages and dependencies and open a new branch for that, fix errors and until ok and tests ok etc, then open a pr

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
|32.1|Inspect repo and outdated packages|Complete|2026-10-16|Ran `git status`, `npm outdated`; recorded green baseline on `main` (check exit 0, 213 tests).|
|32.2|Create branch and task doc|Complete|2026-10-16|Branch `chore/dependency-refresh-2026-10` from `main`.|
|32.3|Upgrade dependencies|Complete|2026-10-16|Refreshed all deps with `npx npm-check-updates -u`; lockfile regenerated from scratch.|
|32.4|Resolve major-version blockers|Complete|2026-10-16|Held TypeScript at 6.0.3 (latest 6.x); `typescript-eslint` 8.71.2 hard-errors on TS 7.0. Prisma held at 7.10.1 (8.0.0 is prerelease).|
|32.5|Validate and open PR|Complete|2026-10-16|`npm ci`, `npm run check`, `npm test` (213), `npm run build`, and Playwright chromium/webkit all pass. PR #117 opened; stale PR #116 superseded and closed.|

## Progress Log

### 2026-10-16

- Recorded a green baseline on `main` before touching anything: `npm run check` exit 0 and `npm test` 26 files / 213 tests passing.
- Created branch `chore/dependency-refresh-2026-10` from `main`; discovered that PR #116 (`chore/dependency-refresh-2026-07`, TASK031) was still open and stale, and superseded it.
- Upgraded all dependencies to the latest stable releases with `npx npm-check-updates -u`. Notable major upgrades: `@sentry/nextjs` 10 → 11.8.0, `vitest` and `@vitest/*` 4 → 5.0.5, `happy-dom` 20 → 21.0.3, `@testing-library/jest-dom` 6 → 7.0.1, `@dotenvx/dotenvx` 1 → 2.37.0. Notable minor upgrades: Next 16.2.9 → 16.4.2, React 19.2.7 → 19.3.1, tRPC 11.18 → 11.19, Prisma 7.8 → 7.10.1, ESLint 10.5 → 10.12.0.
- Hit the `typescript-eslint` / TypeScript 7.0 blocker. `@typescript-eslint/parser@8.71.2` caps its peer range at `>=4.8.4 <6.1.0`, and forcing the install past the peer check makes ESLint abort at runtime with `typescript-eslint does not support TS 7.0` (upstream issue #10940). TypeScript 7 itself compiles the project cleanly (`tsc --noEmit` exit 0), so only the lint integration is blocked. Held TypeScript at 6.0.3 — the latest 6.x release and the same resolution used by TASK031 — rather than shipping an unsupported toolchain.
- Held Prisma at 7.10.1 and did not adopt 8.0.0-rc.23 because it is a prerelease.
- Kept `packageManager` at `npm@11.17.0` to match the local and CI npm rather than bumping it to npm 12.
- Deleted the stale lockfile and regenerated `package-lock.json` from scratch. Unlike TASK031 this needed no `--legacy-peer-deps`, so CI's plain `npm ci` resolves the tree; verified with an actual `npm ci` run.
- No application code changes were required: the major upgrades were absorbed by the existing configuration (`npm run check`, `npm test`, and `npm run build` all pass unmodified).
- Verified end to end on the frozen state: `npm ci` exit 0, `npm run check` exit 0 (4 pre-existing unused-import warnings), `npm test` 26 files / 213 tests passing, `npm run build` exit 0. Playwright E2E: chromium 11 passed / 2 skipped, webkit 7 passed / 6 skipped.
- Firefox E2E is blocked by a machine-level issue unrelated to this change: the bundled Firefox binary cannot create its profile folder (`Could not find profile folder`), reproduced by launching the binary directly with no Playwright or npm involvement. CI installs browsers fresh on ubuntu-latest, so this does not affect CI.
- Confirmed the E2E auth diagnostic spec requires the placeholder credential env vars that `ci.yml` sets (`AUTH_DISCORD_ID=placeholder`, `AUTH_GOOGLE_ID=placeholder`); it passes with them and its earlier failure was an environment mismatch, not a regression.
- Dependency audit improved from 37 vulnerabilities (1 low / 9 moderate / 19 high / 8 critical) on `main` to 8 (1 low / 5 high / 2 critical) on this branch. The remaining findings are transitive in `eslint-config-next` and `next-auth` 4.x and are only "fixable" by breaking downgrades, so they were left alone.
- Committed, pushed, and opened PR #117 against `main`; closed stale PR #116 as superseded.
