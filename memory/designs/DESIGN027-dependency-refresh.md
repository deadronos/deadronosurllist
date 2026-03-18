# DESIGN027 - Dependency refresh

## Context

The repository is on `main` with several outdated runtime and development packages. The goal is to refresh dependencies while preserving the current CI contract: lint, typecheck, unit tests, and Playwright coverage.

## Requirements (EARS)

- WHEN dependency updates are applied, THE SYSTEM SHALL keep the repository installable with `npm install` and a consistent `package-lock.json`.
- WHEN upgraded packages introduce API or tooling changes, THE SYSTEM SHALL update application or config code to restore green validation checks.
- WHEN maintenance is complete, THE SYSTEM SHALL expose the changes on a dedicated branch and a pull request targeting `main`.

## Proposed approach

- Upgrade dependencies in a single manifest refresh, then install once to regenerate the lockfile.
- Prioritize compatibility-sensitive packages during validation:
  - `next`, `eslint-config-next`, `eslint`
  - `@trpc/*`
  - Prisma packages
  - Sentry, Vercel analytics, and test tooling
- Run validation in increasing cost order: lint → typecheck → unit tests → build.
- Fix code or configuration issues with the smallest compatible changes needed.

## Error handling matrix

| Area | Expected failure mode | Response |
| --- | --- | --- |
| Install | Peer dependency conflict | Adjust version selection or related package group together. |
| Lint/TypeScript | Renamed exports, stricter types | Update imports, configs, and call sites with minimal code changes. |
| Prisma | Generated client/runtime mismatch | Reinstall or generate the client and align Prisma package versions. |
| Build/Test | Runtime API change | Patch the affected feature or config, then rerun targeted validation before the full suite. |

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `gh pr create`
