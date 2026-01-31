# DESIGN018 - Reusable ErrorBoundary component

## Context

The app uses App Router error pages (`src/app/error.tsx`), but there is no reusable client `ErrorBoundary` component for component-level isolation.

## Requirements (EARS)

- WHEN a client component subtree throws during render/effects, THE SYSTEM SHALL show a friendly fallback UI instead of a blank screen.
- WHEN possible, THE SYSTEM SHALL provide recovery actions (retry, go home).
- WHEN error tracking is enabled, THE SYSTEM SHALL record client errors.

## Proposed approach

- Add `src/components/error-boundary.tsx` implemented as a React class boundary.
- Keep `src/app/error.tsx` as the global route segment fallback, but allow it to reuse shared UI.
- Integrate with Sentry only via `@sentry/nextjs` safe calls (guarded by env), so the boundary doesn’t crash if Sentry is disabled.

## Validation

- Add a tiny dev-only page/component that intentionally throws (behind a flag) to validate UX.
- Run `npm run lint`, `npm run typecheck`, `npm run build`.
