# Active Context

- Focus: TASK033 toolchain migration - Replaced ESLint/typescript-eslint and Prettier with Oxlint (type-aware) and oxfmt, and adopted TypeScript 7.0.2.
- Focus: Lint parity is exact - `.oxlintrc.json` carries the 49 mapped rules plus `no-useless-default-assignment`, with all rule categories set to "off", and reports the same 4 warnings on `src` that ESLint did, with 0 errors.
- Focus: `scripts/**` is now linted for the first time (ESLint skipped .js/.mjs via `--ext .ts,.tsx`); its 3 real findings were fixed, with `no-unsafe-*` disabled for untyped JS via a file-scoped override.
- Focus: oxfmt mirrors Prettier (printWidth 80, sortPackageJson false, sortTailwindcss {}), the formatter scope is pinned to `{ts,tsx,js,jsx,mdx}`, and `.gitattributes` now pins LF across the repo.
- Focus: npm audit dropped from 8 findings to 0; `npm ci` resolves without `--legacy-peer-deps`.
- Focus: All gates pass under TypeScript 7.0.2 - `npm run check`, `npm test` (213), `npm run format:check`, and `npm run build`.
- Focus: TASK017–TASK032 completed, covering security middleware, RLS-scoped DB access, error boundaries, Vercel deploy workflows, expanded Playwright coverage, performance monitoring, API docs, caching, advanced catalog search, public user profiles, and dependency updates.
- Focus: Public catalog supports server-side search + sorting with cache invalidation and mock DB seed expansion for paging.
- Focus: Optional visual/load testing workflows are staged with manual triggers and environment gating.
- Next Actions: Review and merge the TASK033 toolchain migration PR.
- Dependencies: Oxlint type-aware mode requires `oxlint-tsgolint` to be installed alongside `oxlint`, or type-aware rules silently do nothing. Firefox Playwright runs fail locally on this machine with `Could not find profile folder`, reproducible by launching the bundled Firefox binary directly; CI installs browsers fresh and is unaffected.
