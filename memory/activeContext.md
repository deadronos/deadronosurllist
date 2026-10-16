# Active Context

- Focus: TASK033 toolchain migration (merged as #119) - Replaced ESLint/typescript-eslint and Prettier with Oxlint (type-aware, via tsgolint/typescript-go) and oxfmt, and adopted TypeScript 7.0.2.
- Focus: Lint parity is exact - `.oxlintrc.json` carries 50 rules (the 49 mapped from the previous ESLint set plus `no-useless-default-assignment`), with all rule categories set to "off"; it reports the same 4 warnings on `src` that ESLint did, with 0 errors.
- Focus: `scripts/**` is now linted for the first time (ESLint skipped `.js`/`.mjs` via `--ext .ts,.tsx`); its 3 real findings were fixed, with `no-unsafe-*` disabled for untyped JS via a file-scoped override.
- Focus: oxfmt mirrors Prettier (printWidth 80, sortPackageJson false, sortTailwindcss {}), the formatter scope is pinned to `{ts,tsx,js,jsx,mdx}`, and `.gitattributes` pins LF across the repo.
- Focus: npm audit is 0 (down from 8); `npm ci` resolves without `--legacy-peer-deps`.
- Focus: All four workflows are green on `main` - `CI`, `Security Checks`, `Deploy Production` and `CodeQL`. The `Deploy Preview` and `Deploy Production` E2E jobs were both missing the build step that `playwright.config.ts` requires before `next start`; the redundant `amondnet/vercel-action` jobs were removed from both, since Vercel's GitHub integration performs preview and production deploys.
- Focus: `Security Checks` had been silently disabled by GitHub (`disabled_inactivity`) after failing nightly from 2026-06-27 to 2026-09-30 — the same out-of-sync lockfile repaired in #117. It is re-enabled and now has a `workflow_dispatch` trigger so it can be run on demand.
- Focus: TASK017–TASK033 completed, covering security middleware, RLS-scoped DB access, error boundaries, Vercel deploy workflows, expanded Playwright coverage, performance monitoring, API docs, caching, advanced catalog search, public user profiles, dependency updates, and the Oxlint/TypeScript 7 migration.
- Focus: Public catalog supports server-side search + sorting with cache invalidation and mock DB seed expansion for paging.
- Focus: Optional visual/load testing workflows are staged with manual triggers and environment gating.
- Next Actions: None outstanding. `main` is green across all workflows.
- Dependencies: Oxlint type-aware mode requires `oxlint-tsgolint` to be installed alongside `oxlint`, or type-aware rules silently do nothing. Playwright's bundled Firefox cannot create a profile in this local session (`Could not find profile folder`), reproduced by launching the bundled binary directly and surviving a clean re-download; it is separate from the system Firefox install, and CI runs Firefox successfully (29 tests passed on `main`), so Firefox coverage is verified there.
