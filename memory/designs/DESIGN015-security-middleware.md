# DESIGN015 - Security middleware

## Context

The repository currently sets several security headers via `next.config.js` (runtime) and `vercel.json` (edge/platform). The review recommendation calls for `src/proxy.ts` as the consistent application-level mechanism.

## Requirements (EARS)

- WHEN an HTML route is served, THE SYSTEM SHALL include a consistent baseline of security headers (CSP, frame protections, referrer policy, permissions policy).
- WHEN the environment is production, THE SYSTEM SHALL include HSTS.
- WHEN serving static assets or Next internals (`/_next/*`), THE SYSTEM SHALL avoid applying CSP/headers which may break asset loading.
- WHEN requests target API routes, THE SYSTEM SHALL avoid CSP headers that are irrelevant and may complicate debugging.

## Proposed approach

- Add `src/proxy.ts` and make it the primary “source of truth” for request-time security headers.
- Keep `next.config.js` headers as a fallback/safety net only if needed, but prefer single-source header definitions.
- Keep `vercel.json` headers minimal (or aligned) to avoid conflicting values.

### Header set

- `Content-Security-Policy`: keep aligned with current app usage (Radix, Next, Vercel live). Avoid tightening until we have CSP reports.
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: camera/microphone/geolocation disabled
- `X-DNS-Prefetch-Control: off`
- `X-Download-Options: noopen`
- `Strict-Transport-Security` (production only)

## Implementation sketch

- New file: `src/proxy.ts`
  - Create a `NextResponse.next()` response and set headers.
  - Reuse the same matcher pattern already used in `next.config.js` to avoid `_next/*` and assets.
  - Keep CSP string construction inside proxy (Edge safe).

## Validation

- Run `npm run lint` and `npm run typecheck`.
- Run Playwright (`tests/smoke.spec.ts`) and confirm header expectations.
- Verify in a browser that pages load without CSP errors.

## Risks / notes

- CSP is easy to break; treat tightening as an iterative effort.
- Avoid header duplication conflicts between `vercel.json`, `next.config.js`, and proxy.
