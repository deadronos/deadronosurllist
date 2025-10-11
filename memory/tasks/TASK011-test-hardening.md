# TASK011 - Test hardening for link authorization and auth callbacks

**Status:** Completed
**Added:** 2025-10-11
**Updated:** 2025-10-11

## Objective
Strengthen automated coverage around link mutation authorization and NextAuth callback identifier propagation per DESIGN009.

## Implementation Plan
1. Reuse the shared in-memory database via manual caller contexts so sessions can be overridden.
2. Add negative authorization tests for link mutations (create/update/delete/reorder) targeting foreign ownership scenarios.
3. Extend auth callback unit tests to cover JWT `sub` fallback and session id propagation without user payloads.
4. Run `npm run format:check`, `npm run lint`, and `npm run test` after modifications.

## Dependencies & Notes
- Depends on DESIGN009 for architectural guidance.
- Relies on mock database reset logic in `src/test/setup.ts`.

## Progress Log
- 2025-10-11: Captured requirements and created DESIGN009 describing the test expansion strategy.
- 2025-10-11: Implemented link router authorization guards and auth callback fallback tests; validated with `npm run format:check`, `npm run lint`, and `npm run test` (format check reports existing repository formatting drift).
