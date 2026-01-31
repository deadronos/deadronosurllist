# API Reference

This document describes the tRPC API surface exposed by the application.
Use it as a quick reference for the main routers and their auth requirements.

## Authentication

- **Public procedures** can be called without a session.
- **Protected procedures** require a valid session and enforce ownership checks.

The routers are registered in `src/server/api/root.ts`.

## Collection Router (`collection`)

### Public procedures (collection)

- `getPublic()`
  - Returns the most recently updated public collection with a top link
    summary (used on the landing page).
  - Auth: Public.

- `getPublicCatalog(input)`
  - Returns a paginated list of public collections with link summaries.
  - Auth: Public.
  - Input:
    - `limit` (number, required)
    - `cursor` (string, optional)
    - `q` (string, optional)
    - `linkLimit` (number, optional)
    - `sortBy` (`updatedAt` | `createdAt` | `name` | `linkCount`)
    - `sortOrder` (`asc` | `desc`)

- `getByUser({ userId })`
  - Returns public collections for a specific user.
  - Auth: Public.

### Protected procedures (collection)

- `getAll()`
  - Returns all collections owned by the current user with link counts.

- `getById({ id })`
  - Returns a single collection and its ordered links (owned by user).

- `create({ name, description?, isPublic? })`
  - Creates a new collection owned by the current user.

- `update({ id, name?, description?, isPublic? })`
  - Updates a user-owned collection.

- `delete({ id })`
  - Deletes a user-owned collection.

- `reorder({ collectionIds })`
  - Reorders collections for the current user.

## Link Router (`link`)

### Protected procedures (link)

- `preview({ url })`
  - Fetches remote metadata for a URL.

- `create({ collectionId, url, name, comment? })`
  - Creates a link inside a user-owned collection.

- `createBatch({ collectionId, links })`
  - Creates multiple links in one request.

- `update({ id, url?, name?, comment? })`
  - Updates a link owned by the current user.

- `delete({ id })`
  - Deletes a link owned by the current user.

- `reorder({ collectionId, linkIds })`
  - Reorders links inside a collection owned by the current user.

## Error behavior

- Unauthorized access returns `UNAUTHORIZED` or `FORBIDDEN` tRPC errors.
- Validation errors include structured Zod details.

## User Router (`user`)

### Public procedures (user)

- `getById({ id })`
  - Returns a safe public user profile payload (`id`, `name`, `image`).
  - Auth: Public.

## Maintenance checklist

When adding new tRPC procedures:

1. Update this document with the new procedure, inputs, and auth status.
2. Add or update tests in `src/test/` for behavior and authorization.
3. Keep router registration in `src/server/api/root.ts` in sync.
