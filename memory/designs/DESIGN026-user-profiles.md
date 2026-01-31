# DESIGN026 - Public user profiles

## Context

Collections exist, but there is no public profile page to browse a user’s public collections.

## Requirements (EARS)

- WHEN a visitor opens `/u/<id>`, THE SYSTEM SHALL display the user’s public collections.
- WHEN showing user data publicly, THE SYSTEM SHALL not expose private fields (email).

## Proposed approach

- Add `src/app/u/[userId]/page.tsx` showing:
  - basic user display (name, image)
  - grid of public collections
- Add `userRouter` with `getById` procedure.
- Add `collectionRouter.getByUser` for public collections.

## Validation

- Typecheck + build.
- Playwright: profile page renders; private data not present in HTML.
