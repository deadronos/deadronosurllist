# TASK033 - Oxlint + oxfmt toolchain migration and TypeScript 7

**Status:** Completed
**Added:** 2026-10-16
**Updated:** 2026-10-16

## Related design

- Spec: `docs/superpowers/specs/2026-10-16-oxlint-oxfmt-ts7-migration-design.md`
- Plan: `docs/superpowers/plans/2026-10-16-oxlint-oxfmt-ts7-migration.md`

## Original request

can we switch to biome or oxfmt so as ts7 typeaware linter?

## Acceptance criteria

- Lint behaviour is preserved exactly, with type-aware rules still running.
- `eslint`/`typescript-eslint` and `prettier` are replaced by Oxlint and oxfmt.
- TypeScript is upgraded to 7.x.
- Lint, typecheck, format check, unit tests and build all pass, and CI is green.
- Application behaviour is unchanged apart from the findings the new scope surfaces.

## Outcome

| Concern | Before | After |
|---|---|---|
| Linting | `eslint` 10.12.0 + `typescript-eslint` 8.71.2 (type-aware) | `oxlint` 1.88.0 `--type-aware` + `oxlint-tsgolint` 7.0.2004 |
| Formatting | `prettier` 3.9.10 + `prettier-plugin-tailwindcss` 0.8.1 | `oxfmt` 0.73.0 |
| TypeScript | 6.0.3 | **7.0.2** |
| npm audit | 8 findings | **0 findings** |
| Lint findings | 4 warnings | 4 warnings (identical), 0 errors |

## Progress tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|33.1|Normalise line endings|Complete|2026-10-16|Added `.gitattributes` (`* text=auto eol=lf`) and renormalised 79 CRLF files; content-neutral (4648/4648 insertions/deletions, no real content change).|
|33.2|Replace ESLint with Oxlint|Complete|2026-10-16|50-rule `.oxlintrc.json`; exact parity on `src` (same 4 warnings); all rule categories off so nothing new fires.|
|33.3|Replace Prettier with oxfmt|Complete|2026-10-16|`.oxfmtrc.json` mirrors Prettier (printWidth 80, sortPackageJson false, sortTailwindcss {}); reformatted 80 files.|
|33.4|Fix surfaced findings|Complete|2026-10-16|2 × no-floating-promises, 1 × prefer-promise-reject-errors in `scripts/`, 1 × no-useless-default-assignment in the auth route.|
|33.5|Upgrade TypeScript to 7.0.2|Complete|2026-10-16|No tsconfig changes needed; type-aware linting re-proven under TS 7.|
|33.6|Record in memory bank and open PR|Complete|2026-10-16|This document; PR #119 merged into `main`.|
|33.7|Resolve whole-branch review findings|Complete|2026-10-16|Fixed a test assertion that was stricter than the URL contract (`isSafeUrl` allows http and https; it rejected non-https), and refreshed contributor guidance that still named ESLint/Prettier in `.github/copilot-instructions.md`, `.github/instructions/reactjs.instructions.md`, `.github/chatmodes/claudette.chatmode.md`, `README.md` and `docs/SECURITY-IMPLEMENTATION.md`.|

## Progress Log

### 2026-10-16

- Established that `typescript-eslint` was the **only** blocker for TypeScript 7 in this repo. `@typescript-eslint/parser@8.71.2` caps its peer range at `>=4.8.4 <6.1.0` and aborts at runtime on TS 7 (upstream typescript-eslint#10940). Probed directly: under `typescript@7.0.2` both `tsc --noEmit` and `next build` already exited 0 — only ESLint failed.
- Evaluated Biome as the alternative and rejected it: Biome's type-aware rules live in its `types` domain, are almost all nursery, and are backed by its own inference engine rather than a real TS checker, so it cannot replace type-aware typescript-eslint. Biome was verified to be an equally good **formatter** (byte-identical to Prettier with matching config) but the wrong tool for the linting half.
- Chose Oxlint + oxfmt. Oxlint's type-aware mode is powered by `tsgolint`/`typescript-go` and its documentation states TypeScript 7.0+ is *required* — it targets TS 7 rather than tolerating it. It implements 60 of 62 targeted typescript-eslint type-aware rules; the two missing ones (`naming-convention`, `prefer-destructuring`) are unused here.
- Built the 50-rule `.oxlintrc.json` by extracting the effective ESLint rule set programmatically (FlatCompat over `plugin:@typescript-eslint/recommended` + `recommended-requiring-type-checking` → 47 rules) and mapping each to its Oxlint equivalent. Verified no unknown rules and **byte-for-byte parity**: the same 4 `no-unused-vars` warnings on `src` and nothing else. Rule options were preserved verbatim (`argsIgnorePattern: "^_"`, `checksVoidReturn.attributes: false`, `consistent-type-imports` prefer/fixStyle). All rule categories are set to `"off"` so only the mapped rules run.
- Discovered `scripts/**` had never been linted: `npm run lint` was `eslint . --ext .ts,.tsx`, which skipped every `.js`/`.mjs` file. Bringing it into scope surfaced 3 real findings. Those files are untyped JS, where the `no-unsafe-*` family fires ~147 times on code with no type information, so a file-scoped override disables those five rules for JS-family files only.
- Fixed the 4 findings (2 × `no-floating-promises`, 1 × `prefer-promise-reject-errors`, 1 × `no-useless-default-assignment`). The auth-route fix removes a default that could never apply; because that is a behavioural change rather than a type-only one, it was verified against a running production server (HEAD → 204, GET session → 200, PUT → 405, GET signin → 302 — no 500s).
- Configured oxfmt to mirror Prettier rather than adopt its defaults: `printWidth: 80` (the code is written at ~80; 68 files differ at 80 against 121 at oxfmt's default 100), `sortPackageJson: false` (oxfmt enables it by default and would reorder `package.json`), `sortTailwindcss: {}` to match the plugin defaults already in use, and `ignorePatterns: [".github/**"]` to leave vendored skill templates alone. The format glob stays pinned at `**/*.{ts,tsx,js,jsx,mdx}` because oxfmt formats many more languages by default and would otherwise rewrite Markdown, JSON, CSS and YAML.
- Normalised line endings first (79 files were CRLF with no `.gitattributes`), so the reformat diff was stable and platform-independent.
- The reformat touched 80 files. That churn is pre-existing drift, not new damage: Prettier's own `--check` already failed on 72 files, and `format:check` was never part of `check` or CI. `format:check` now passes and a second `format:write` is a no-op.
- Upgraded to TypeScript 7.0.2 with no tsconfig changes: the project already used `paths` with no `baseUrl` (the one option Oxlint's type-aware mode does not support). Confirmed type-aware linting still runs under TS 7 by linting a temporary probe file containing a floating promise, which it correctly reported.
- `npm audit` went from 8 findings to **0** — removing the `eslint-config-next` chain dropped 5, and re-resolving the lockfile cleared the remaining `cookie`/`@auth/core` advisories (`cookie` is now 0.7.2).
- Verified: `npm ci` exit 0 (no `--legacy-peer-deps`), `npm run check` exit 0 (0 errors, 4 pre-existing warnings), `npm test` 26 files / 213 tests passing, `npm run format:check` exit 0, `npm run build` exit 0 — all under TypeScript 7.0.2.
