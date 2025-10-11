# The URL List

A lightweight, shareable link-collection application for curating and publishing lists of useful URLs.

Key points:

- Public catalog of collections that anyone can browse on the landing page
- Authenticated members can create collections, add links, and reorder entries
- Built with Next.js (App Router), tRPC, Prisma, NextAuth, Radix UI Themes and Tailwind CSS
- Unit tests with Vitest and a small in-repo mock database for isolated testing

This repository is intended for maintainers and contributors. The `memory/` folder contains task and design artifacts used by the development workflow.

Quick links

- Code: `src/` (application and server)
- API: `src/server/api/routers/` (tRPC procedures)
- Database schema: `prisma/schema.prisma`
- Tests: `src/test/`
- Development notes & tasks: `memory/`
- License: `LICENSE.MD`

Getting started

Follow these steps to run the project locally.

1. Install dependencies

```bash
npm install
```

1. Configure environment variables

Create a `.env.local` (or use your preferred env management) and provide the variables declared in `src/env.js`. Example minimal entries for local development:

```text
HELLO=hello
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/url_list_dev
AUTH_SECRET=local-dev-secret
NODE_ENV=development
```

If you rely on OAuth providers add `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` as needed. In development `AUTH_SECRET` may be optional; see `src/env.js` for the validation rules. To skip env validation for containerized builds set `SKIP_ENV_VALIDATION=1`.

1. Prepare the database (Postgres)

```bash
npm run db:push
npm run db:studio
```

1. Run the development server

```bash
npm run dev
```

Quality and checks

- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm run test` (Vitest)
- Format: `npm run format:write`

Application overview

- The landing page (`/`) shows the public collections catalog, search, and sign-in call-to-action.
- Authenticated users get a dashboard at `/dashboard` and can manage collections under `/collections/[id]`.
- tRPC routers live in `src/server/api/routers/` and are registered in `src/server/api/root.ts`.
- The mock database used for fast unit tests is at `src/server/db.mock.ts`.

Architecture diagram

![Architecture diagram](docs/architecture.svg)

If you prefer plain text or are working in a terminal, here's a compact ASCII overview:

```text
Browser -> Next.js App (App Router)
         |\
         | \__ Radix UI Themes (client components)
         |__/ NextAuth (authentication)
         |
         v
       tRPC API -> Prisma Client -> Postgres
         |
         v
     Mock DB (tests) -- Vitest
```

Screenshots & Storybook

Example placeholder screenshots are included in `docs/screenshots/` as SVG mockups. These are lightweight vector examples you can replace with real images later.

![Landing page example](docs/screenshots/landing.svg)

![Dashboard example](docs/screenshots/dashboard.svg)

Storybook

If you run Storybook locally (when configured) it will be hosted at `http://localhost:6006`. See `docs/storybook.md` for a quick setup guide and an example story for `PublicCatalog`.

Development notes

- Follow the spec-driven workflow documented in `.github/instructions/spec-driven-workflow-v1.instructions.md` and update the `memory/tasks/` files for new work.
- UI primitives use `@radix-ui/themes` with Tailwind utility classes for layout.
- For end-to-end testing or visual validation, add Playwright tests under `tests/` (the repository includes Playwright guidance in `.github/instructions/playwright-typescript.instructions.md`).

Contributing

- Create small, focused branches and open a pull request with a short executive summary.
- Include unit tests for new tRPC procedures and update `memory/tasks/_index.md` when starting larger tasks.
- Run `npm run check` (lint + typecheck) before opening a PR.

License

This project is licensed under the MIT License — see `LICENSE.MD` for details.
