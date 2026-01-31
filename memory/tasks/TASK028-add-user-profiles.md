# TASK028 - Add user profiles

**Status:** Pending  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN026-user-profiles.md`

## Original request

Add public user profile pages showing public collections.

## Acceptance criteria

- Route `/u/[userId]` renders for existing users and 404s otherwise.
- Only public collections are shown.
- No private user fields (email) are exposed.

## Implementation plan

1. Add `userRouter.getById` selecting safe public fields.
2. Add `collectionRouter.getByUser` returning public collections.
3. Add page `src/app/u/[userId]/page.tsx` and UI.
4. Add Playwright test for profile page.

## Progress tracking

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|12.1|Add user router public query|Not Started|2026-01-31||
|12.2|Add public collections-by-user query|Not Started|2026-01-31||
|12.3|Add `/u/[userId]` page and tests|Not Started|2026-01-31||

## Validation

- `npm run typecheck`
- `npm run build`
- `npx playwright test`
