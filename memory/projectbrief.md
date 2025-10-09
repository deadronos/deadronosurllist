# Project Brief – LinkList

## Mission

Deliver a lightweight link curation app that lets people collect, organize, and share URLs with minimal setup while supporting a polished public welcome experience.

## Objectives

- Enable visitors to explore a curated public collection without signing in.
- Let authenticated members create and manage private or public collections of links.
- Maintain deterministic local development via an in-memory data layer so new features can be prototyped rapidly.

## Success Measures

- Public landing page loads with seeded content for anonymous visitors.
- Authenticated users can create, view, and manage collections end-to-end without runtime errors.
- Automated tests cover critical tRPC procedures for collections, links, and posts.

## Scope

- Web application delivered through Next.js App Router with tRPC API layer and Prisma-backed models (mocked locally).
- Authentication handled by NextAuth.js with Discord OAuth.
- Styling provided through Tailwind CSS and Radix UI Themes.

## Non-Goals

- Native mobile clients.
- Advanced collaboration features (multi-user editing, roles, comments).
- Real-time synchronization or WebSocket-based updates.

## Stakeholders

- **Anonymous visitors:** Discover curated links and decide whether to sign up.
- **Authenticated members:** Maintain personalized link collections.
- **Project maintainers:** Iterate quickly without a live database by relying on mock infrastructure.
