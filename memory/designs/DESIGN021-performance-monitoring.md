# DESIGN021 - Performance monitoring

## Context

The app includes `@vercel/analytics`. There is a health endpoint at `/api/health`. The review recommends operational monitoring (Speed Insights and/or lightweight custom metrics).

## Requirements (EARS)

- WHEN pages render in production, THE SYSTEM SHALL collect basic performance signals (Web Vitals).
- WHEN API routes execute, THE SYSTEM SHALL make it possible to observe latency regressions.
- WHEN health checks run, THE SYSTEM SHALL return fast, cache-disabled responses.

## Proposed approach

- Add `@vercel/speed-insights/next` to the root layout.
- Extend `/api/health` with optional extra checks (only if cheap):
  - app version/commit SHA (env)
  - DB latency measurement already present
- Add structured logging for slow DB queries in server runtime (dev/staging first).

## Validation

- `npm run build` and `npm run lint`.
- Confirm Speed Insights is present in production only (no local noise).
