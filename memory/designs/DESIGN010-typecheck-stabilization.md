# DESIGN010 – Typecheck Stabilization

**Status:** Draft  
**Date:** 2025-10-11  
**Owner:** GitHub Copilot (agent)

## Summary

TypeScript strict diagnostics exposed gaps in the test harness, global test setup, and Vitest browser configuration. This design streamlines the supporting code so `npm run typecheck` can pass again without weakening runtime guarantees.

## Requirements Alignment

- † Type Safety Hardening – Maintain zero `implicit any` and strict-null errors in tests.
- † Auth Callback Consistency – Keep coverage that validates JWT/session fallbacks without violating NextAuth typings.
- † Link Authorization Hardening – Preserve link router guard coverage while ensuring collections are narrowed before dereferencing.

## Architecture Impact

- **Test Harness:** Adjust `authSession.spec.ts` and `linkRouter.spec.ts` to rely on typed helper utilities rather than optional chaining, ensuring strict null checks pass while still exercising runtime behaviours.
- **Global Environment Shim:** Extend `src/test/setup.ts` to provide a minimal typed `process` stub so Node typings remain satisfied inside the browser-capable Vitest environment.
- **Tooling Configuration:** Update `vitest.config.ts` by removing the incorrect Playwright plugin registration, keeping the browser provider for future UI tests without breaking the type surface.

## Data Flow

1. **Auth callbacks tests** invoke `authCallbacks.jwt/session` with shaped inputs that reflect real NextAuth invocations. Inputs are cast once with inline commentary because upstream type definitions mark `user` as required even when runtime omits it.
2. **Link router tests** use `ensureCollectionResult` to coerce results from the mock DB before dereferencing `links`, eliminating the need for optional checks.
3. **Process shim** guarantees `process.env.NODE_ENV` exists before any modules import `src/env.js`.
4. **Vitest config** now exports a plugin list compatible with Vite by keeping only `tsconfigPaths()` while configuring the Playwright provider exclusively through the `browser` block.

## Interfaces & Contracts

| Location | Change |
| --- | --- |
| `authSession.spec.ts` | Introduce local type aliases to cast callback parameters while documenting why `user` can be undefined at runtime. |
| `linkRouter.spec.ts` | Add helper to coerce collection fetches to `CollectionResult` before use. |
| `src/test/setup.ts` | Provide a typed `process` shim with `NODE_ENV` defaulted to `test`. |
| `vitest.config.ts` | Export only Vite plugins that satisfy `PluginOption`; configure Playwright solely through the `browser` provider property. |

## Error Handling Matrix

| Procedure | Failure Mode | Handling |
| --- | --- | --- |
| `ensureCollectionResult` in tests | Collection missing or malformed | Throw explicit error to spotlight fixture regression. |
| Auth callback tests | NextAuth signatures diverge from runtime | Documented type assertion highlights discrepancy without muting other diagnostics. |
| Process shim | `process` absent in browser-capable Vitest runs | Stub ensures required env keys exist; subsequent code mutates `env` safely. |

## Testing Strategy

1. Run `npm run format:write` to normalize coding style before verification.
2. Execute `npm run lint` to ensure ESLint remains clean after the adjustments.
3. Re-run `npm run typecheck` to confirm the strict TypeScript pass.

No additional unit tests are required because existing suites already cover the affected behaviour; we are only restoring their compatibility with the strict compiler.

## Open Questions / Risks

- NextAuth may eventually relax the `user` typing in upstream definitions; keep the inline comment so the cast can be revisited.
- If Vitest browser support evolves, reassess whether registering the provider as a plugin regains type support.
