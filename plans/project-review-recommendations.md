# Project Review Recommendations

**Project:** deadronosurllist  \
**Review Date:** January 29, 2026  \
**Overall Grade:** B+ (85/100)  \
**Reviewer:** GitHub Copilot (GPT-5.2)

> Note
>
> This plan is rewritten to match the current repository state. Several items
> previously flagged as “missing” are already implemented (notably security
> headers, App Router error pages, and RLS policy references).

---

## Executive summary

This is a well-architected T3 Stack app (Next.js App Router, tRPC, NextAuth,
Prisma) with solid type safety and a strong security baseline. The remaining
high-impact work is primarily operational: deployment conventions/runbooks,
runtime health checks, a caching strategy for public traffic, and end-to-end
test coverage.

---

## Current repo snapshot (facts, not guesses)

- Next.js is `^16.1.6`.
- Security headers are configured in `src/proxy.ts` via the Proxy file convention.
- App Router error UX exists:
  - `src/app/error.tsx`
  - `src/app/not-found.tsx`
- RLS policy reference exists in `docs/rls-policies.sql` and is designed for a
  Prisma-style connection (transaction-scoped `SET LOCAL app.current_user_id`).
- CI security checks exist in `.github/workflows/security.yml`.

---

## Priority matrix

| Priority | Category | Effort | Impact | Items |
| --- | --- | --- | --- | --- |
| High | Operational | Medium | Critical | Deployment config + runbook, health endpoint |
| High | Testing | Medium | High | Playwright config + smoke tests |
| High | Security | Low | High | Align docs/scripts with header implementation |
| Medium | Performance | Medium | High | Caching strategy for public pages/data |
| Medium | Observability | Medium | Medium | Error reporting + basic signals |
| Low | Features | High | Medium | Profiles, advanced search, etc. |

---

## High priority recommendations

### 1. Align “security headers” docs and scripts with `next.config.js`

**Status:** Partially implemented (headers exist; some references are stale)  \
**Effort:** 1–2 hours  \
**Impact:** High (prevents confusion and security drift)

- Update any documentation that claims headers are set by middleware (now proxy).
- Update `scripts/test-security-headers.mjs`:
  - today it expects `src/proxy.ts`
  - it should validate `next.config.js` (or validate live HTTP responses)
- Optional (later): tighten CSP by reducing `'unsafe-inline'`/`'unsafe-eval'`.
  This is usually non-trivial; plan it as a deliberate hardening task.

Validation:

- Confirm the expected headers appear on `GET /`.
- Confirm HSTS is enabled only in production.

---

### 2. Add deployment configuration and a production runbook

**Status:** Not captured in-repo  \
**Effort:** 4–8 hours  \
**Impact:** Critical

Pick one primary deployment target and document it.

- Vercel (recommended for simplicity with Next)
- Docker (useful if you need portability/self-hosting)

Important nuance for this repo:

Build/dev scripts run Next via `dotenvx run -- next ...`. That’s great locally,
but hosted builds should be validated.

- On Vercel, you may want the build command to run `next build` directly, or
  confirm `dotenvx run` works without a checked-in `.env`.

Runbook (minimum):

- Required env vars (auth + DB)
- Migration procedure (what runs, when, and how to roll back)
- How to verify a deployment (health endpoint + basic smoke)

---

### 3. Add a health endpoint for monitoring

**Status:** Missing  \
**Effort:** 2–3 hours  \
**Impact:** High

Add `GET /api/health` that:

- checks DB connectivity (`SELECT 1`)
- returns `200` on pass, `503` on fail
- sets `Cache-Control: no-store`

This endpoint is the foundation for uptime monitoring and load balancer
readiness.

---

### 4. Establish a Playwright E2E baseline

**Status:** Playwright dependency exists; config/tests are missing  \
**Effort:** 6–10 hours  \
**Impact:** High

Add:

- `playwright.config.ts`
- A `tests/` folder with 2–3 smoke tests:
  - home page renders
  - public catalog renders
  - sign-in page renders

Avoid real Discord OAuth in CI initially; keep tests focused on public flows
until you decide on an auth test strategy.

---

### 5. Normalize and document database migration workflows

**Status:** Migrations exist; script naming can be clarified  \
**Effort:** 1–3 hours  \
**Impact:** Medium

- Ensure there are explicit scripts for:
  - development migrations (`prisma migrate dev`)
  - production deploy (`prisma migrate deploy`)
- Keep `prisma db push` documented as “dev-only / prototyping”.
- Add a short `docs/database-migrations.md` with:
  - how to create migrations
  - how to deploy migrations
  - what to do when a migration fails

---

## Medium priority recommendations

### 6. Add a caching strategy for public traffic

**Effort:** 6–12 hours  \
**Impact:** High

Pick one strategy and document it:

- Next.js revalidation (`export const revalidate = ...`) on public pages
- Route caching / tagged caching where applicable
- Redis caching (adds operational cost; best for high traffic)

---

### 7. Observability: pick one error reporting tool

**Effort:** 2–6 hours  \
**Impact:** Medium

Add an error reporting tool (Sentry or equivalent) and capture:

- client runtime errors
- server route/API errors

---

## Low priority recommendations

### 8. Bundle analysis and lightweight perf budgets

Add bundle analysis and set a simple budget to prevent accidental regressions.

### 9. Load testing and visual regression

Useful after the app’s core flows are stable. Keep as a post-MVP hardening
task.

### 10. Feature roadmap

Examples:

- user profiles
- advanced search and filters
- collaboration/sharing features

---

## Success metrics

### Before a production launch

- Deployment pipeline proven at least once.
- `GET /api/health` monitored.
- Playwright smoke tests run reliably.

### After launch

- Uptime $> 99.9\%$.
- Track p95 page/API latency (targets depend on hosting + DB).

---

## Appendix: proxy guidance

Next.js Proxy replaces the middleware file convention for per-request logic.
Proxy is appropriate when you need per-request logic (rewrites, geo-based
routing, auth gating, etc.).
