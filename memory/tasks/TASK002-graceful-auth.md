# TASK002 - Graceful Auth Configuration

**Status:** Completed  
**Added:** 2025-10-09  
**Updated:** 2025-10-09

## Original Request

> looks good, can we gracefully handle wrong/mock values in env so the login page doesnt crash?

## Thought Process

- The current NextAuth configuration assumes valid OAuth credentials and crashes when placeholders are supplied, which is common in local mock setups.
- We need to detect placeholder credentials, skip misconfigured providers in non-production, and surface diagnostics so the UI can explain why sign-in is unavailable.
- Providing a custom sign-in page lets us guide developers while still enabling proper OAuth flows when credentials exist.
- Tests should confirm provider detection logic and ensure valid credentials still enable OAuth.

## Implementation Plan

1. **Provider Helper**
   - Implement a helper (`buildAuthProviders`) that inspects env values, flags placeholders, and returns providers plus diagnostics.
2. **Auth Config Integration**
   - Update `authConfig` to use the helper, export diagnostics, and configure `/signin` as the custom sign-in page.
3. **Sign-In Page UX**
   - Add a Radix-themed `/signin` page that lists available providers and explains when authentication is disabled.
4. **Landing Page CTA**
   - Adjust the home page CTA text/behavior to reflect provider availability while linking to `/signin`.
5. **Testing**
   - Write unit tests for the provider helper covering valid and mock credentials.
   - Run the existing Vitest suite to ensure no regressions.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description                     | Status      | Updated    | Notes |
| --- | -------------------------------- | ----------- | ---------- | ----- |
| 2.1 | Implement provider helper        | Complete    | 2025-10-09 |       |
| 2.2 | Integrate helper into auth config| Complete    | 2025-10-09 |       |
| 2.3 | Build `/signin` page             | Complete    | 2025-10-09 |       |
| 2.4 | Update landing page CTA          | Complete    | 2025-10-09 |       |
| 2.5 | Add tests & run suite            | Complete    | 2025-10-09 | `npm run test`

## Progress Log

### 2025-10-09

- Captured requirements and design for graceful auth configuration handling.
- Added provider helper with placeholder detection, exported diagnostics, and wired into NextAuth config.
- Created Radix-styled `/signin` page, updated landing CTA messaging, and verified diagnostics messaging.
- Added unit tests for the provider helper and ran `npm run test` successfully.
