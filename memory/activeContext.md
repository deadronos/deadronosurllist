# Active Context

- Focus: TASK032 dependency refresh - Upgraded package.json dependencies and devDependencies to their latest stable versions (Next 16.4.2, React 19.3.1, Sentry 11.8.0, Vitest 5.0.5, happy-dom 21.0.3, jest-dom 7.0.1, dotenvx 2.37.0, ESLint 10.12.0, tRPC 11.19.0, Prisma 7.10.1, etc.).
- Focus: Held TypeScript at 6.0.3 because typescript-eslint 8.71.2 does not support TS 7.0 (upstream issue #10940; ESLint aborts at runtime). Prisma held at 7.10.1 because 8.0.0 is still a prerelease.
- Focus: Regenerated the lockfile so CI's plain `npm ci` resolves the tree without `--legacy-peer-deps`.
- Focus: No application code changes were required; all codebase checks (lint/typecheck), unit tests, production build, and Playwright chromium/webkit runs pass successfully.
- Focus: Dependency audit reduced from 37 vulnerable packages on `main` to 8, all transitive via `eslint-config-next` and `next-auth` 4.x.
- Focus: TASK017–TASK030 completed, covering security middleware, RLS-scoped DB access, error boundaries, Vercel deploy workflows, expanded Playwright coverage, performance monitoring, API docs, caching, advanced catalog search, public user profiles, and previous dependency updates.
- Focus: Public catalog supports server-side search + sorting with cache invalidation and mock DB seed expansion for paging.
- Focus: Optional visual/load testing workflows are staged with manual triggers and environment gating.
- Next Actions: Wait for PR #117 (TASK032 dependency refresh) to be reviewed and merged; stale PR #116 has been superseded and closed.
- Dependencies: Prisma client runtime availability on Windows environments (build emits expected engine warnings). Firefox Playwright runs fail locally on this machine with `Could not find profile folder`, reproducible by launching the bundled Firefox binary directly; CI installs browsers fresh and is unaffected.
