# Active Context

- Focus: Hardened database bootstrap to tolerate Vercel preview deployments where `DATABASE_URL` lacks a postgres protocol.
- Next Actions: Monitor preview rollout; confirm real database credentials are configured before disabling the in-memory fallback.
- Dependencies: Prisma client types, NextAuth PrismaAdapter compatibility, ESLint configuration.
