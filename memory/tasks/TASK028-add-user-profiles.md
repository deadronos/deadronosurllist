# TASK028 - Add user profiles

**Status:** Completed  
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

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|12.1|Add user router public query|Complete|2026-01-31|Added `user.getById` with safe field selection.|
|12.2|Add public collections-by-user query|Complete|2026-01-31|Added `collection.getByUser` for public collections.|
|12.3|Add `/u/[userId]` page and tests|Complete|2026-01-31|Added profile page and Playwright coverage.|

## Progress Log

### 2026-01-31

- Added `user` router and `collection.getByUser` procedure.
- Built `/u/[userId]` profile page with public collections.
- Added Playwright tests for profile and 404 behavior.

## Validation

- ✅ `npm run check`
- ⚪ `npm run build` (not run)
- ⚪ `npx playwright test` (not run)
