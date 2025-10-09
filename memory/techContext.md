# Tech Context – LinkList

## Languages & Frameworks

- TypeScript across both frontend and backend code.
- Next.js 15 App Router with React Server Components.
- tRPC 2024.x for type-safe procedure calls.
- Prisma ORM with PostgreSQL schema; in-memory mock for local workflows.

## Tooling & Dependencies

- `@radix-ui/themes` and Tailwind CSS for styling.
- NextAuth.js (Discord OAuth) for authentication.
- Vitest for unit and integration tests.
- Turbo-powered npm scripts defined in `package.json`.

## Environment Configuration

- Runtime environment variables validated in `src/env.js` using `@t3-oss/env-nextjs`.
- `USE_MOCK_DB=1` selects the in-memory database; default connects to Prisma.
- Discord OAuth credentials required for full auth flow in non-mock environments.

## Developer Workflow

- Install dependencies: `npm install`.
- Generate Prisma client (postinstall) or manually via `npm run db:generate`.
- Run database push for schema changes during development with `npm run db:push`.
- Start dev server: `npm run dev` (Turbo).
- Validate quality gates: `npm run check` (lint + typecheck) and `npm run test` (Vitest).

## Deployment Considerations

- Designed for Vercel/Edge-friendly deployment with Next.js App Router.
- Requires PostgreSQL DATABASE_URL and Discord OAuth credentials in production.
- SuperJSON transformer already configured in tRPC for Date support.
