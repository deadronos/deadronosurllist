# TASK017 - Add security middleware

**Status:** Pending  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN015-security-middleware.md`

## Original request

Add Next.js middleware to consistently apply security headers.

## Acceptance criteria

- `src/middleware.ts` exists and applies the agreed header set on matched routes.
- No conflicting header values between middleware, `next.config.js`, and `vercel.json` (documented decision).
- Playwright smoke test for headers continues to pass.

## Implementation plan

1. Add `src/middleware.ts` with matcher excluding `/_next/*`, static assets, and API.
2. Centralize CSP string in middleware (Edge-safe).
3. Reconcile existing header injection:
   - keep only one “source of truth” where practical.
4. Validate locally and in CI.

## Progress tracking

**Overall Status:** Not Started - 0%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|1.1|Implement `src/middleware.ts`|Not Started|2026-01-31||
|1.2|Align headers across config files|Not Started|2026-01-31||
|1.3|Update/confirm Playwright header assertions|Not Started|2026-01-31||

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx playwright test`
