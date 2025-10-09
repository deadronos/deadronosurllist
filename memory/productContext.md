# Product Context – LinkList

## Problem Statement

People collect links across multiple devices and chat threads, making it hard to retrieve and share curated resources. LinkList centralizes these URLs into organized collections that can be showcased publicly or kept private for personal workflows.

## Value Proposition

- **Visitors** receive a polished landing page highlighting an evergreen public collection so they immediately understand the product.
- **Members** manage focused link collections for teams, study groups, or personal knowledge bases without heavyweight tooling.
- **Maintainers** iterate quickly using an in-memory database while longer-term infrastructure decisions settle.

## Personas

- **Curator Casey (member):** Authenticated user who creates topical collections, toggles public visibility, and shares them with friends or collaborators.
- **Explorer Erin (visitor):** Anonymous visitor evaluating the product through the public welcome collection before signing in.
- **Maintainer Morgan (internal):** Developer or contributor verifying new features locally with the mock database and automated tests.

## Key Use Cases

1. Visitor lands on `/` and browses the seeded "Discover Links" collection without signing in.
2. Member signs in, opens `/dashboard`, creates a new collection, and optionally marks it public.
3. Member drills into `/collections/[id]`, reviews ordered links, and adds another resource via the link form.
4. Maintainer runs the Vitest suite while working offline to confirm tRPC routers behave correctly against the mock database.

## Experience Goals

- Communicate product value instantly through a curated hero layout.
- Keep flows low friction: single form submissions for collection and link creation.
- Provide deterministic starter data so demos and tests are stable.
- Mirror production auth and API patterns so progress transfers cleanly to a real database later.
