# DESIGN002 – Graceful Auth Configuration

## Overview

Ensure the authentication experience remains stable when environment variables contain placeholder OAuth credentials. Detect mock or missing values, disable the offending providers during local and test runs, and surface clear messaging on the custom sign-in page. Production environments continue to fail fast on misconfiguration.

## Architecture

- **Provider Builder:** Introduce a reusable helper that inspects the environment, evaluates whether each OAuth provider has viable credentials, and returns both the NextAuth provider array and diagnostics.
- **Auth Config:** Update `authConfig` to consume the helper, export diagnostics, and register a custom sign-in page (`/signin`) for user-facing messaging.
- **Sign-In Page:** Add a Radix-styled page that reads diagnostics, renders available providers, and shows guidance when authentication is disabled.
- **Runtime Consumers:** Landing page adapts its sign-in copy based on provider availability while still linking to the custom page for more context.

## Data Flow

1. `buildAuthProviders` inspects the environment to produce `providers` and a diagnostics object each request.
2. `authConfig` uses the returned providers for NextAuth configuration and exposes diagnostics to server components.
3. The new `/signin` page fetches diagnostics to render available sign-in buttons or guidance.
4. When developers supply real credentials, providers render normally; otherwise, they are disabled without throwing.

## Interfaces

- `buildAuthProviders(envShape): { providers: NextAuthProvider[]; diagnostics: AuthDiagnostics }`
- `AuthDiagnostics`: includes `enabledProviders`, `disabledProviders`, and `hasEnabledProvider` flags.
- `SignInPage`: server component consuming diagnostics to decide between provider buttons and instructional messaging.

## Error Handling

- Non-production: placeholder or missing credentials disable providers and add diagnostics entries.
- Production: disabled required providers throw an informative error, preserving fail-fast behavior.

## Testing Strategy

- Unit tests for `buildAuthProviders` verifying diagnostics and provider inclusion across valid/invalid credentials.
- Snapshot or rendering tests for the `/signin` page (optional) verifying fallback message; manual smoke test acceptable.
- Regression tests ensuring existing router tests continue to pass.

## Implementation Tasks

1. Implement `buildAuthProviders` helper with placeholder detection and diagnostics.
2. Update `authConfig` to use the helper, export diagnostics, and register `/signin` as the sign-in page.
3. Create a custom `/signin` page that renders provider buttons or guidance using Radix UI.
4. Adjust landing page CTA logic to reference diagnostics and route to `/signin`.
5. Add unit tests for the provider builder covering enabled/disabled scenarios.
6. Update memory/task tracking and run regression tests.
