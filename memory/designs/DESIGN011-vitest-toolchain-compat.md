# DESIGN011 – Vitest Toolchain Compatibility

## Summary

- Restore Vitest configuration typing after upgrading to Vitest 4 beta where `UserConfig` stopped exporting from `vitest/config`.
- Keep the optional browser runner support without resorting to `any` types or runtime-only guards.
- Ensure automation commands (`typecheck`, `lint:fix`, `test`) pass consistently on CI and local Windows environments.

## Context

Vitest 4 beta restructured its public type surface, removing the `UserConfig` export from `vitest/config`. Our `vitest.config.ts` still imported that type to derive the `browser` option shape. TypeScript now raises TS2305, breaking `npm run typecheck` and blocking downstream commands. The project already tolerates missing `@vitest/browser-playwright` dependencies via a dynamic `import(...)`. The design keeps that resilience while sourcing types from Vite, which Vitest augments at compile time.

## Requirements Mapping

- R1: Typecheck completes without TS2305 errors from `vitest.config.ts`.
- R2: Vitest test run succeeds with typed browser configuration even when the Playwright helper is absent.
- R3: `npm run lint:fix` finishes without unresolved type references in `vitest.config.ts`.

## Architecture Overview

- **Tooling Layer**: `vitest.config.ts` executes in Node, exports Vitest configuration consumed by CLI scripts.
- **Type Resolution**: Vitest augments Vite's `UserConfig`, so importing types from `vite` keeps TypeScript aware of the `test` block (including `browser`).
- **Optional Browser Provider**: Dynamic `import("@vitest/browser-playwright")` populates `browserConfig`; failure keeps the property `undefined` to avoid requiring the dependency.

## Data Flow

1. TypeScript compiles `vitest.config.ts` using Vite's `UserConfig` declaration augmented by Vitest for the `test` property.
2. At runtime, the configuration checks `process.env.VITEST_BROWSER`; if it equals `"true"`, Node attempts to load `@vitest/browser-playwright` and instantiates the provider, otherwise `browser` remains `undefined`.
3. When the provider loads successfully, the returned object is stored for Vitest's CLI; in the default case the configuration exports Node-only settings, keeping automated scripts Playwright-free.

## Interfaces

- `import type { UserConfig } from "vite"`: Supplies the structural typing for `defineConfig` arguments and the nested `test.browser` tuple.
- `defineConfig(config: UserConfig | ...)`: Provided by `vitest/config`, continues to wrap the configuration for IDE hints.
- `@vitest/browser-playwright`: Optional dependency exposing a `playwright()` factory returning provider options.

## Data Models

- `UserConfig['test']`: Optional object describing Vitest inline configuration; specifically we rely on `browser?: { enabled: boolean; provider: ...; instances: ... }`.
- `BrowserConfig`: Type alias `NonNullable<NonNullable<UserConfig['test']>['browser']>` ensures the runtime object matches Vitest expectations when present.

## Error Handling Matrix

| Failure Scenario | Detection | Response |
| --- | --- | --- |
| Missing type export for Vitest config | TS2305 during `npm run typecheck` | Import `UserConfig` from `vite` instead of `vitest/config` so TypeScript resolves the augmented interface |
| `@vitest/browser-playwright` absent | Dynamic import throws | Catch error and leave `browserConfig` as `undefined`, allowing tests to proceed in Node-only mode |
| Playwright browsers not installed | Provider throws on use | Gate the provider behind `VITEST_BROWSER="true"` so default runs skip browser execution |
| Browser provider misconfiguration | Type mismatch when constructing `browserConfig` | Rely on `BrowserConfig` alias to enforce property names and shapes at compile time |

## Testing Strategy

1. `npm run typecheck` – validates TS compilation with updated imports.
2. `npm run lint:fix` – ensures ESLint passes while auto-fixing style issues.
3. `npm run test` – executes Vitest CLI verifying runtime compatibility without the optional browser provider.
4. `npm run format:write` (Post-change) – keeps Prettier formatting consistent after edits.

## Implementation Plan

1. Update `vitest.config.ts` to import `UserConfig` from `vite` while retaining `defineConfig` from `vitest/config`.
2. Confirm `BrowserConfig` alias still resolves using the new type source and adjust if inference requires changes.
3. Re-run formatter to normalize the config file.
4. Execute `npm run typecheck`, `npm run lint:fix`, and `npm run test` to satisfy requirements.
5. Document outcomes in the Memory Bank (`tasks` entry, `activeContext`, `progress`).

## Risks & Mitigations

- **Future Vitest type changes**: Mitigate by referencing the canonical Vite type which Vitest augments, minimizing breakage across beta releases.
- **Optional dependency drift**: Maintain try/catch block and typed alias to keep config resilient if the provider API shifts; revisit if Vitest introduces first-party typings for browser providers.
