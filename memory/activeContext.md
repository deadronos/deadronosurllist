# Active Context

- Focus: NextAuth session resilience; JWT/session callbacks now persist `session.user.id` without the Prisma adapter and have dedicated Vitest coverage.
- Focus: TASK010 is in progress to expose a public collections catalog on the landing page with search filtering.
- Next Actions: Monitor authentication flows for regressions, collect feedback on the new public catalog search UX, and consider pagination if the list grows substantially.
- Dependencies: Prisma client runtime availability on Windows environments (build emits expected engine warnings).
