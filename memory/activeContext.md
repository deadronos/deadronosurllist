# Active Context

- Focus: NextAuth session resilience; JWT/session callbacks now persist `session.user.id` without the Prisma adapter and have dedicated Vitest coverage.
- Next Actions: Monitor authentication flows for regressions and confirm future sign-in work relies on the persisted id in protected procedures; extend coverage if new auth flows emerge.
- Dependencies: Prisma client runtime availability on Windows environments (build emits expected engine warnings).
