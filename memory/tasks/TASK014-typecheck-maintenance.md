# TASK014 - Typecheck maintenance

**Status:** Completed  
**Added:** 2025-10-12  
**Updated:** 2025-10-12

## Original Request

Fix `npm run typecheck`, then run the lint and formatter scripts.

## Thought Process

- `npm run typecheck` currently fails because `tsconfig.json` includes every `*.js` file and `checkJs` is enabled, so Istanbul's generated coverage assets appear in the TypeScript program.
- The coverage files rely on dynamic DOM usage and untyped globals, so strict mode emits dozens of TS7006/TS2339 diagnostics that do not reflect source issues.
- Excluding the `coverage/` directory (and similar tooling outputs if present) from the compiler scope resolves the noise while preserving strict checking on first-party code (see DESIGN012).

## Implementation Plan

1. **Adjust TypeScript excludes** – Update `tsconfig.json` to ignore the `coverage` directory and any sibling report outputs we discover. _(Depends on DESIGN012)_
2. **Verify typecheck** – Run `npm run typecheck` to confirm the compiler passes with coverage present. _(Depends on step 1)_
3. **Run lint and formatter** – Execute `npm run lint` and `npm run format:write` to ensure automation remains healthy. _(Depends on step 2)_
4. **Update Memory Bank** – Record outcomes in `activeContext.md`, `progress.md`, and mark this task complete. _(Depends on step 3)_

## Progress Tracking

**Overall Status:** Completed – 100%

### Subtasks

| ID  | Description | Status | Updated | Notes |
| --- | ----------- | ------ | ------- | ----- |
| 1.1 | Update `tsconfig.json` excludes for coverage artifacts | Complete | 2025-10-12 | Added coverage/report directories to the `exclude` array. |
| 2.1 | Run `npm run typecheck` after config change | Complete | 2025-10-12 | Command exited 0 with coverage outputs present. |
| 3.1 | Run `npm run lint` | Complete | 2025-10-12 | `next lint` reports no warnings or errors. |
| 3.2 | Run `npm run format:write` | Complete | 2025-10-12 | Prettier touched no files (all unchanged). |
| 4.1 | Update Memory Bank and mark task complete | Complete | 2025-10-12 | Logged progress, updated active context, and closed TASK014. |

## Progress Log

### 2025-10-12

- Captured new Tooling Maintenance requirements and DESIGN012 describing the tsconfig exclusion approach.
- Created TASK014 implementation plan to document steps for restoring `npm run typecheck` and rerunning lint/formatter scripts.
- Updated `tsconfig.json` to exclude coverage/report artifacts, then confirmed `npm run typecheck`, `npm run lint`, and `npm run format:write` all exit successfully with no file changes.
- Recorded outcomes across Memory Bank files and marked TASK014 complete.
