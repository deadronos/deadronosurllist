# Active Context

- Focus: TASK031 dependency refresh - Upgraded package.json dependencies and devDependencies to their latest versions (Next 16.2.12, Prisma 7.9.1, ESLint 10.8.0, Vite 8.2.0, Vitest 4.1.10, Sentry 10.69.0, Playwright 1.62.1, etc.).
- Focus: Pinned TypeScript to 6.0.3 because typescript-eslint 8.65.0 does not yet support TS 7.0; latest 6.x release kept to unblock the lint pipeline.
- Focus: All codebase checks (lint/typecheck), unit tests, contract tests, and production build pass successfully.
- Focus: TASK017–TASK030 completed, covering security middleware, RLS-scoped DB access, error boundaries, Vercel deploy workflows, expanded Playwright coverage, performance monitoring, API docs, caching, advanced catalog search, public user profiles, and previous dependency updates.
- Focus: Public catalog now supports server-side search + sorting with cache invalidation and mock DB seed expansion for paging.
- Focus: Optional visual/load testing workflows are staged with manual triggers and environment gating.
- Next Actions: Wait for PR #116 review and merge.
- Dependencies: Prisma client runtime availability on Windows environments (build emits expected engine warnings).
