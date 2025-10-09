# TASK002 - Auth Diagnostics and Resilient Sign-in

**Status:** Completed  
**Added:** 2025-10-09  
**Updated:** 2025-10-09

## Original Request

Detect mock/placeholder OAuth credentials and provide a resilient sign-in experience that explains configuration status instead of failing.

## Thought Process

- Local/dev often runs without real OAuth secrets; crashing or exposing a broken sign-in is confusing.
- We need a provider-building helper that classifies providers as enabled/disabled with clear reasons, and a custom `/signin` page that surfaces this.
- Production should fail fast if a required provider is misconfigured; optional providers may be disabled without blocking.

## Implementation Plan

1. Create `buildAuthProviders` helper with diagnostics (enabled/disabled, reasons).
2. Integrate helper in `src/server/auth/config.ts` to compute `providers` and `authDiagnostics`.
3. Add `/signin` route that:
   - Lists enabled providers with CTA links to `/api/auth/signin/[id]`.
   - Shows a clear message when no providers are enabled, with diagnostics for disabled ones.
4. Add tests for the provider helper, including production strictness and optional providers.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description                                   | Status   | Updated     | Notes |
| --- | --------------------------------------------- | -------- | ----------- | ----- |
| 2.1 | Implement provider helper with diagnostics     | Complete | 2025-10-09  |       |
| 2.2 | Wire into NextAuth config and export diagnostics | Complete | 2025-10-09  |       |
| 2.3 | Build `/signin` page that uses diagnostics     | Complete | 2025-10-09  |       |
| 2.4 | Add unit tests for helper                      | Complete | 2025-10-09  |       |

## Progress Log

### 2025-10-09

- Added `provider-helpers.ts` with placeholder detection and diagnostics.
- Integrated with `auth/config.ts`, exporting `authDiagnostics`.
- Built Radix-styled `/signin` page showing provider list or guidance when disabled.
- Wrote `providerHelper.spec.ts` covering valid, placeholder, production/optional behaviors.
