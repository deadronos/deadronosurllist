# Oxlint + oxfmt toolchain migration with TypeScript 7

**Date:** 2026-10-16
**Status:** Awaiting review
**Related:** TASK032 (dependency refresh, merged as #117), TASK033 (this work)

## Intended outcome

Replace ESLint (typescript-eslint) and Prettier with **Oxlint** (type-aware, via `tsgolint`/`typescript-go`) and **oxfmt**, so this repository can adopt **TypeScript 7**. Lint behaviour is preserved exactly; formatting is pinned to the current visual style.

The person this serves is whoever maintains this repo: they get a single fast Rust toolchain, a TS 7-compatible type-aware linter, and the few real bugs the old toolchain never saw.

## Why this is needed

`typescript-eslint` is the **only** thing blocking TypeScript 7 in this repo. `@typescript-eslint/parser@8.71.2` caps its peer range at `>=4.8.4 <6.1.0`, and forcing past the peer check makes ESLint abort at runtime:

```
Error: typescript-eslint does not support TS 7.0.
```

That is an upstream limitation ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). Everything else already works under TS 7 — verified in this repo, not assumed:

| Under `typescript@7.0.2` | Result |
|---|---|
| `tsc --noEmit` | exit 0 |
| `npm run build` (Next 16.4.2) | exit 0, "Running TypeScript … Finished TypeScript" |
| `eslint` | hard abort (`does not support TS 7.0`) |

Oxlint's type-aware mode is built on `typescript-go` and its documentation states **"TypeScript 7.0+ is required"** — it targets TS 7 rather than merely tolerating it. It implements 60 of the 62 targeted `typescript-eslint` type-aware rules (per tsgolint's README; Oxc's docs cite 59 of 61); the two missing rules are `naming-convention` and `prefer-destructuring`, and **neither is used here**.

## Non-goals

- **Not** adopting Biome. Biome's type-aware rules live in its `types` domain and are almost all `(nursery)`, backed by its own inference engine rather than a real TS checker, so it cannot replace type-aware typescript-eslint. (Verified: Biome has no `typescript` dependency at all.)
- **Not** enabling `next/core-web-vitals` or new framework plugin rules. The current config deliberately skips them (documented circular-config issue). Out of scope.
- **Not** changing application behaviour, tests, or public APIs — the sole code changes are three script fixes.
- **Not** fixing the 4 pre-existing `no-unused-vars` warnings (they are warnings today and stay warnings).

## Acceptance criteria

1. `npm run lint` runs Oxlint in type-aware mode and reports **the same findings as today** plus the four real findings, which are fixed.
2. `npm run format:check` runs oxfmt and **passes**; `npm run format:write` formats.
3. `eslint`, `eslint-config-next`, `@eslint/eslintrc`, `@typescript-eslint/*`, `typescript-eslint`, `prettier` and `prettier-plugin-tailwindcss` are removed; `npm audit` findings drop from **8 to 3**.
4. `typescript` is `7.0.2`.
5. `npm run check`, `npm test` (213 tests), `npm run build`, and Playwright E2E all pass; CI is green.
6. The only application-code changes are the three `scripts/` fixes.

## Verified evidence

| Probe | Result |
|---|---|
| Oxlint type-aware on `src` with mirrored rules | **4 findings — identical to ESLint** |
| Unknown rules in the 49-rule parity mapping | **none** (`consistent-type-imports` included) |
| Oxlint over whole repo, ignores mirrored, JS excluded | 4 findings (exact parity) |
| Oxlint over whole repo, ignores mirrored, **scripts/ included** | **7 findings** (4 pre-existing + 3 real) |
| Oxlint over whole repo, plus `no-useless-default-assignment` | **8 findings** (adds `route.ts:40`) |
| Prettier `--check` today (baseline) | **already fails on 72 files** |
| oxfmt `--check` `src` @ printWidth 80 vs 100 | 68 files vs 121 files |
| Biome formatter with Prettier-matching config | byte-identical to Prettier (0 diffs) |
| Biome lint `src` | 19 errors + 39 warnings (nursery-heavy type rules) |

Two findings worth recording because they shape the design:

- **`scripts/**` was never linted.** `npm run lint` is `eslint . --ext .ts,.tsx`, so `.js`/`.mjs` files were silently skipped. Oxlint lints them, which surfaces 2 × `no-floating-promises` and 1 × `prefer-promise-reject-errors` — real bugs.
- **`ignorePatterns` resolve relative to the config file.** Patterns must live in a config at the repo root, or they silently fail to match.

## Design

### Toolchain

| Concern | From | To |
|---|---|---|
| Linting | `eslint` + `typescript-eslint` (type-aware) | `oxlint@1.88.0` `--type-aware` + `oxlint-tsgolint@7.0.2004` |
| Formatting | `prettier` + `prettier-plugin-tailwindcss` | `oxfmt@0.73.0` |
| Config | `eslint.config.js`, `prettier.config.js` | `.oxlintrc.json`, `.oxfmtrc.json` |

`oxlint-tsgolint` ships platform binaries with no JS dependencies; versioning tracks TypeScript (`7.0.2004` = TS 7.0.2 + patch 004).

### Rule parity — 50 rules mapped

The current effective set is `@typescript-eslint/recommended` + `recommended-requiring-type-checking` (47 rules, flattened) plus the repo's own customisations. Each maps to an Oxlint `typescript/*` (or `eslint/*` for the four core rules) equivalent, with all rule categories set to `"off"` so **only** the mapped rules run and no new noise appears.

One rule is added beyond parity, at the reviewer's request: `typescript/no-useless-default-assignment`. It is not in today's set but flagged a genuine issue, so it is enabled as an `error` and the finding is fixed (see "Resolved decisions").

Options preserved exactly:

```jsonc
"typescript/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
"typescript/no-misused-promises": ["error", { "checksVoidReturn": { "attributes": false } }],
"typescript/consistent-type-imports": ["warn", { "prefer": "type-imports", "fixStyle": "inline-type-imports" }]
```

`array-type`, `consistent-type-definitions` and `require-await` stay off, as today.

### File scope and ignores

```jsonc
"ignorePatterns": ["node_modules", ".next", "coverage", ".github/**", "tests/**", "playwright.config.ts"]
```

**`scripts/**` is deliberately brought into scope** (a change from today). Those files are untyped `.js`/`.mjs`, which makes the `no-unsafe-*` family fire ~147 times on code that has no type information. A file-scoped override turns those five rules off for JS-family files only, leaving the three genuine findings to fix:

```jsonc
"overrides": [{
  "files": ["**/*.js", "**/*.mjs", "**/*.cjs"],
  "rules": { "typescript/no-unsafe-member-access": "off", "typescript/no-unsafe-call": "off",
             "typescript/no-unsafe-assignment": "off", "typescript/no-unsafe-return": "off",
             "typescript/no-unsafe-argument": "off" }
}]
```

### Formatting

`.oxfmtrc.json` mirrors Prettier rather than taking oxfmt's defaults:

```jsonc
{
  "printWidth": 80,
  "sortPackageJson": false,
  "sortTailwindcss": {}
}
```

- `printWidth: 80` — the codebase is written at ~80 (68 files differ at 80 vs 121 at oxfmt's default 100), so this minimises churn.
- `sortPackageJson: false` — oxfmt enables this **by default** and would reorder `package.json` unrelatedly.
- `sortTailwindcss: {}` — oxfmt disables this by default, but `prettier-plugin-tailwindcss` was enabled, using default `class`/`className` attribute sorting. Empty config matches those defaults (`functions: []`).

**File-type scope.** Prettier currently only runs over `**/*.{ts,tsx,js,jsx,mdx}` (`format:check` / `format:write`). Oxfmt formats many more languages by default — JSON, CSS, Markdown, YAML, TOML, HTML — so a bare `oxfmt --write` would reformat `README.md`, `package.json`, stylesheets, docs and more. To keep this change contained, the scripts mirror the current scope explicitly:

```jsonc
// package.json
"format:check": "oxfmt --check \"**/*.{ts,tsx,js,jsx,mdx}\"",
"format:write": "oxfmt --write \"**/*.{ts,tsx,js,jsx,mdx}\""
```

Widening to the remaining languages is a deliberate follow-up, not part of this migration.

**Line endings:** oxfmt's `endOfLine` defaults to `lf` and does not support `"auto"`. `src` currently contains **14 CRLF files** (154 LF) with no `.gitattributes`. Add `* text=auto eol=lf` and renormalise before reformatting, so the formatter is stable across platforms.

**One-time reformat:** ~68 files in `src` (plus `scripts/`). This is pre-existing drift — Prettier's own `--check` already fails on 72 files and `format:check` is not part of `check` or CI — so the churn is surfaced by this change, not created by it.

### TypeScript 7

`typescript` 6.0.3 → 7.0.2. Note TS 7 does not support tsconfig language-service plugins; the `plugins: [{ "name": "next" }]` entry only affects editor behaviour and `tsc`/`next build` are unaffected (verified).

### Dependency and audit impact

Removing the ESLint chain drops 5 of the 8 current audit findings (`eslint-config-next`, `@next/eslint-plugin-next`, `braces`, `fast-glob`, `micromatch`), leaving 3 (`next-auth`, `@auth/core`, `cookie`) — 8 → 3. The `overrides` entries scoped to ESLint (`ajv`, `minimatch`, `eslint`, `@eslint/eslintrc`) become obsolete and are removed; the rest are re-verified as still required.

## Sequencing

One PR, ordered commits so each is independently reviewable and revertable:

1. `chore: add .gitattributes and normalize line endings`
2. `chore: replace ESLint with Oxlint (type-aware)` — config and scripts only, **exact parity, no code changes**
3. `chore: replace Prettier with oxfmt` — one-time reformat
4. `fix: resolve the four findings surfaced by the new scope` — 2 × `no-floating-promises` and 1 × `prefer-promise-reject-errors` in `scripts/`, plus 1 × `no-useless-default-assignment` in `src/app/api/auth/[...nextauth]/route.ts`
5. `chore: upgrade TypeScript to 7.0.2`
6. `docs: record TASK033 in the memory bank`

Commit 5 is the risky one and drops cleanly on its own if TS 7 misbehaves.

## Verification

- **Parity harness:** capture `eslint . --ext .ts,.tsx` output before the swap and assert Oxlint reports the same 4 findings rule-for-rule; include the side-by-side comparison in the PR description.
- `npm run check` (lint + `tsc --noEmit`), `npm test` (213), `npm run build`.
- Playwright E2E, chromium + webkit (Firefox is broken on this machine, independent of this change).
- CI: `CI`, `Security Checks`, and `Deploy Preview` workflows must be green.
- Exercise `npm ci` to confirm the lockfile stays valid without `--legacy-peer-deps` (the reason `main` was red between #115 and #117).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| tsgolint coverage is self-described as "incomplete (but very close)" — 60/62 rules | The 2 missing rules are unused here; parity is asserted rule-by-rule |
| oxfmt is pre-1.0 (0.73.0) | Formatting parity is mechanical and easily reviewed; keep Prettier in git history for rollback |
| oxfmt writes in place by default (`--write` is not required) | Always pass `--check` in automation; call this out in the PR |
| oxfmt `sortPackageJson` on by default | Explicitly disabled |
| TS 7 changes type-checking behaviour | Isolated in its own commit; `tsc --noEmit` and `next build` already verified clean |
| Type-aware linting memory use on large codebases | This repo is small; watch CI duration |
| CRLF files cause noisy, unstable diffs | `.gitattributes` lands first (commit 1) |

## Resolved decisions

1. **`no-useless-default-assignment` is enabled and its finding fixed.** The reviewer chose to adopt the rule rather than stay strictly at parity. Scope: the rule is added as `error`; `src/app/api/auth/[...nextauth]/route.ts:40` is corrected.
2. **The `oxc` and `unicorn` plugins stay inert.** They remain available but no rules are enabled from them in this migration; a curated subset can be adopted later as a separate change.
3. **Formatter language scope stays pinned** to today's `{ts,tsx,js,jsx,mdx}` glob. When (if ever) oxfmt should take over JSON/CSS/Markdown/YAML remains a future decision.
