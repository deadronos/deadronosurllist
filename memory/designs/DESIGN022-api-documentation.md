# DESIGN022 - API documentation

## Context

The project uses tRPC. There is no API documentation artifact exposed to developers or operators.

## Requirements (EARS)

- WHEN maintainers need to understand API behavior, THE SYSTEM SHALL provide a stable, versioned description of key procedures.
- WHEN new procedures are added, THE SYSTEM SHALL have a low-friction update workflow for docs.

## Proposed approach

### Option A (low risk, no new deps)

- Add `docs/api.md` documenting:
  - main routers and procedures
  - auth requirements
  - example requests/responses
- Add a short section in `README.md` linking to the doc.

### Option B (higher value, adds deps)

- Add `@trpc/openapi` and expose an OpenAPI JSON endpoint.
- Optionally add a Swagger UI page (client-only) to browse docs.

## Validation

- Option A: docs review + keep examples aligned with types.
- Option B: add a small test verifying the OpenAPI route returns JSON.
