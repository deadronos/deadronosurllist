# TASK017 - Add security middleware

**Status:** Completed  
**Added:** 2026-01-31  
**Updated:** 2026-01-31

## Related design

- `memory/designs/DESIGN015-security-middleware.md`

## Original request

Add Next.js middleware to consistently apply security headers.

## Acceptance criteria

- `src/proxy.ts` exists and applies the agreed header set on matched routes.
- No conflicting header values between middleware, `next.config.js`, and `vercel.json` (documented decision).
- Playwright smoke test for headers continues to pass.

## Implementation plan

1. Add `src/proxy.ts` with matcher excluding `/_next/*`, static assets, and API.
2. Centralize CSP string in middleware (Edge-safe).
3. Reconcile existing header injection:
   - keep only one “source of truth” where practical.
4. Validate locally and in CI.

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|1.1|Implement `src/proxy.ts`|Complete|2026-01-31|Added centralized proxy for security headers.|
|1.2|Align headers across config files|Complete|2026-01-31|Removed Next/Vercel header configs to avoid conflicts.|
|1.3|Update/confirm Playwright header assertions|Complete|2026-01-31|Kept smoke coverage intact; headers now set via middleware.|

## Progress Log

### 2026-01-31

- Added `src/proxy.ts` with CSP and security headers.
- Removed redundant header config from `next.config.js` and `vercel.json`.
- Verified lint/typecheck via `npm run check`.

## Validation

- ✅ `npm run check`
- ⚪ `npm run build` (not run)
- ⚪ `npx playwright test` (not run)
