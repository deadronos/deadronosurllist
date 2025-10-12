# DESIGN012 – Typecheck Maintenance

**Status:** Draft  
**Date:** 2025-10-12  
**Owner:** Codex (agent)

## Summary

- Prevent TypeScript from traversing generated Istanbul coverage assets that ship plain JavaScript without typings.
- Keep linting and formatting automation intact after tightening compiler includes.
- Ensure developer tooling commands (`npm run typecheck`, `npm run lint`, `npm run format:write`) remain green without manual cleanup of coverage outputs.

## Context

The project enables `allowJs` and `checkJs`, inviting TypeScript to analyse every `*.js` file included by the project globs. The existing `tsconfig.json` `include` list (`**/*.js`) sweeps in Istanbul-generated artifacts under `coverage/`. These files intentionally lean on dynamic patterns and DOM globals that violate our strict settings, causing TS7034/TS7006/TS2339 errors during `npm run typecheck`. The coverage assets are build products, not source inputs, so the compiler should ignore them entirely. Excluding `coverage/` (and other report folders, if needed) keeps strict checking focused on first-party code.

## Requirements Mapping

- **TM-1** (`Tooling Maintenance`): Excluding coverage assets from `tsconfig.json` paths allows `npm run typecheck` to complete without newly generated diagnostics.
- **TM-2** (`Tooling Maintenance`): Lint configuration remains untouched; confirm `npm run lint` exits cleanly after the compiler scope change.
- **TM-3** (`Tooling Maintenance`): Formatter workflow is unchanged; run `npm run format:write` to document the scripts stay operational.

## Architecture Overview

- **TypeScript Compiler Configuration:** `tsconfig.json` orchestrates glob inclusion/exclusion, strictness flags, and module resolution behaviour for the monorepo.
- **Generated Artifacts:** Istanbul writes `coverage/**/*.js` assets alongside HTML reports; these do not require static analysis.
- **Automation Scripts:** `npm run typecheck`, `npm run lint`, and `npm run format:write` all rely on consistent config; only the compiler inclusion set changes.

## Data Flow

1. TypeScript evaluates `tsconfig.json` to build the Program file list by combining `include` globs and subtracting any `exclude` entries.
2. Previously, `coverage/**/*.js` satisfied the `**/*.js` include and was fed into the Program, surfacing strict errors.
3. After adding an explicit exclusion for coverage directories (and related report folders, if necessary), the compiler no longer ingests those files, so the typecheck completes over first-party code only.

## Interfaces

- `tsconfig.json`:
  - `include`: Glob array listing project sources (`**/*.ts`, `**/*.tsx`, `**/*.js`, etc.).
  - `exclude`: Glob array for directories ignored by the compiler; currently contains `node_modules`, will expand to include tooling output like `coverage`.
- NPM scripts: `typecheck`, `lint`, and `format:write` remain unchanged but act as validation interfaces for this change.

## Data Models

- **Compiler Program File Set:** Derived from `include` minus `exclude`. We adjust this set to exclude `coverage/**/*`.
- **Automation Results:** Exit codes for the three scripts serve as observable outputs verifying compliance with requirements.

## Error Handling Matrix

| Scenario | Detection | Response |
| --- | --- | --- |
| Coverage directory regenerated with additional nested folders | `npm run typecheck` still fails due to missed exclusions | Generalise exclusion pattern (`coverage/**/*`) to ignore all descendants. |
| Other tooling outputs (e.g., `playwright-report/`) surface similar issues | Future failures during typecheck | Expand exclusion list cautiously to capture other generated directories while avoiding source paths. |
| Accidental exclusion of real source files | Missing typechecking on legitimate code, potential regression | Limit exclusions to known generated folders; review `tsc --listFilesOnly` if needed to confirm coverage of source files. |

## Testing Strategy

1. Run `npm run typecheck` – confirms compiler no longer analyses coverage artifacts (satisfies **TM-1**).
2. Run `npm run lint` – ensures ESLint remains green post-change (**TM-2**).
3. Run `npm run format:write` – validates formatter completes successfully (**TM-3**).

## Implementation Plan

1. Update `tsconfig.json` `exclude` array to add `coverage`, `coverage/**/*`, and other report directories if observed (e.g., `playwright-report`).
2. Re-run `npm run typecheck` to verify the exclusion resolves strict errors.
3. Execute `npm run lint` and `npm run format:write` to document toolchain health.
4. Update Memory Bank (`TASK014`, `activeContext`, `progress`) with outcomes before handoff.

## Risks & Mitigations

- **Overlooking additional generated folders:** Re-test after coverage regeneration; if failures reappear, augment the exclusion list with the new directory.
- **Developers relying on coverage assets for manual inspection:** Exclusion only affects TypeScript analysis; HTML/JS remain accessible in the filesystem, so no impact on reporting.
- **Drift between `tsconfig.json` and other configs (e.g., ESLint):** ESLint already ignores coverage via `.eslintignore`; verify alignment and update other ignore lists if necessary.
