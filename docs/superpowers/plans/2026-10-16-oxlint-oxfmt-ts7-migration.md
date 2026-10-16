# Oxlint + oxfmt + TypeScript 7 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ESLint (typescript-eslint) and Prettier with Oxlint (type-aware, via `tsgolint`/`typescript-go`) and oxfmt, and adopt TypeScript 7.

**Architecture:** Oxlint becomes the linter, configured in `.oxlintrc.json` to reproduce today's 49-rule type-aware set exactly (plus one newly enabled rule), with all rule categories set to `"off"` so nothing else fires. oxfmt replaces Prettier, configured in `.oxfmtrc.json` to match Prettier's output at `printWidth: 80`. Both are single-binary Rust tools with no JS dependency, which is what removes the `typescript-eslint` blocker on TypeScript 7.

**Tech Stack:** `oxlint@1.88.0`, `oxlint-tsgolint@7.0.2004` (type-aware backend, built on TypeScript 7 / `typescript-go`), `oxfmt@0.73.0`, `typescript@7.0.2`, Next.js 16.4.2, Vitest 5, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-oxlint-oxfmt-ts7-migration-design.md`

## Global Constraints

- Pin these exact versions: `oxlint@1.88.0`, `oxlint-tsgolint@7.0.2004`, `oxfmt@0.73.0`, `typescript@7.0.2`.
- Keep the npm script **names** `lint`, `lint:fix`, `format:check`, `format:write`, `check`, `test`. Four CI workflows and `check` depend on them.
- Keep `oxlint-tsgolint` as a `devDependency` alongside `oxlint`; type-aware mode silently does nothing if it is absent.
- Never install with `--legacy-peer-deps` or `--force`. `npm ci` must resolve the lockfile on its own (an out-of-sync lockfile is why `main` CI was red between #115 and #117).
- Linter file scope mirrors today's `eslint . --ext .ts,.tsx`: `{ts,tsx}` plus `{js,mjs,cjs}` under `scripts/` only.
- Formatter scope is pinned to `"**/*.{ts,tsx,js,jsx,mdx}"`. Do not let oxfmt touch Markdown, JSON, CSS or YAML in this migration.
- oxfmt writes files **in place by default** (`--write` is the default). Always use `--check` in verification steps unless the step says to format.
- Do not change application behaviour. The only permitted code changes are the four lint findings in Task 4.
- `printWidth: 80` and `sortPackageJson: false` (oxfmt enables `sortPackageJson` by default and would reorder `package.json`).
- After every dependency change, run `npm ci` and confirm exit 0 before proceeding.

**Baseline to preserve** (captured on `main` at `c925292`): `npm run lint` → **0 errors, 4 warnings**; `npm test` → **26 files / 213 tests passing**; `npm run check` → exit 0; `npm run build` → exit 0.

## Review Focus

- **Oxfmt broadening past the intended file types.** A bare `oxfmt --write` also formats Markdown, JSON, CSS, YAML and TOML, and would reorder `package.json` keys. Expected: only `{ts,tsx,js,jsx,mdx}` files change, and `package.json` changes only where we edited it. Pinned by the diff-assertion step in Task 3.
- **Type-aware linting silently not running.** With `oxlint-tsgolint` missing or unresolvable, `--type-aware` degrades quietly and the build still looks green. Expected: a `typescript/no-useless-default-assignment` finding appears at `src/app/api/auth/[...nextauth]/route.ts:40`. Pinned in Task 2 step 6.
- **Line-ending instability.** 14 committed CRLF files plus no `.gitattributes` means a formatter run can churn unrelated files and differ per platform. Expected: zero `i/crlf` entries after Task 1, and a second `format:check` run reports no changes. Pinned in Task 1 steps 3-4 and Task 3 step 6.
- **Lockfile validity for `npm ci`.** `npm install` succeeding is not enough — CI runs `npm ci`, which fails on any out-of-sync lockfile. Expected: `npm ci` exits 0 after each dependency change. Pinned in Tasks 2, 3 and 5.
- **The removed default on the auth route handler.** `context = { params: Promise.resolve(...) }` was defensive against being called with one argument. Expected: removing it does not produce a 500 from the route at runtime. Pinned by the server probe in Task 4 step 5.

---

### Task 1: Add `.gitattributes` and normalise line endings

**Files:**
- Create: `.gitattributes`
- Modify: 14 CRLF-normalised files under `src/` (content unchanged)

**Interfaces:**
- Consumes: nothing.
- Produces: a repo where every tracked text file is LF in the index, so later formatter diffs are stable.

- [ ] **Step 1: Record the CRLF baseline**

Run: `git ls-files --eol src | awk '{print $1}' | sort | uniq -c`
Expected: `154 i/lf` and `14 i/crlf`.

- [ ] **Step 2: Create `.gitattributes`**

```
* text=auto eol=lf
```

- [ ] **Step 3: Renormalise the index**

Run: `git add --renormalize .`

- [ ] **Step 4: Verify no CRLF remains in the index**

Run: `git ls-files --eol src | awk '{print $1}' | sort | uniq -c`
Expected: `168 i/lf` and **no** `i/crlf` line. Also run `git ls-files --eol | grep -c 'i/crlf'` and expect `0`.

- [ ] **Step 5: Verify content is unchanged, only line endings**

Run: `git diff --cached --stat` then `git diff --cached --ignore-all-space --stat`
Expected: the first lists ~14 files; the second lists **none** (proves no content changed).

- [ ] **Step 6: Verify the suite is still green**

Run: `npm run check && npm test`
Expected: check exits 0 with 4 warnings; Vitest reports `26 passed` files and `213 passed` tests.

- [ ] **Step 7: Commit**

```bash
git add .gitattributes
git commit -m "chore: normalise line endings and add .gitattributes"
```

---

### Task 2: Replace ESLint with Oxlint (type-aware), at exact parity

**Files:**
- Create: `.oxlintrc.json`
- Modify: `package.json` (scripts, `devDependencies`, `overrides`)
- Delete: `eslint.config.js`

**Interfaces:**
- Consumes: Task 1's LF-normalised tree.
- Produces: `npm run lint` and `npm run lint:fix` backed by Oxlint. Later tasks rely on `npm run lint` reporting exactly the baseline 4 warnings plus the `no-useless-default-assignment` error.

- [ ] **Step 1: Capture the ESLint baseline**

Run: `npm run lint 2>&1 | tail -20`
Expected: `✖ 4 problems (0 errors, 4 warnings)`. Save the output; it must be matched in step 6.

- [ ] **Step 2: Create `.oxlintrc.json`**

Copy this exactly. All categories are `"off"` so only the enumerated rules run; the `unicorn`/`oxc` plugin sets are inert as a result.

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "options": {
    "typeAware": true
  },
  "plugins": ["typescript", "unicorn", "oxc"],
  "categories": {
    "correctness": "off",
    "suspicious": "off",
    "pedantic": "off",
    "perf": "off",
    "style": "off",
    "restriction": "off",
    "nursery": "off"
  },
  "ignorePatterns": [
    "node_modules",
    ".next",
    "coverage",
    ".github/**",
    "tests/**",
    "playwright.config.ts"
  ],
  "rules": {
    "typescript/await-thenable": "error",
    "typescript/ban-ts-comment": "error",
    "typescript/no-array-constructor": "error",
    "typescript/no-array-delete": "error",
    "typescript/no-base-to-string": "error",
    "typescript/no-duplicate-enum-values": "error",
    "typescript/no-duplicate-type-constituents": "error",
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-extra-non-null-assertion": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-for-in-array": "error",
    "typescript/no-implied-eval": "error",
    "typescript/no-misused-new": "error",
    "typescript/no-misused-promises": [
      "error",
      { "checksVoidReturn": { "attributes": false } }
    ],
    "typescript/no-namespace": "error",
    "typescript/no-non-null-asserted-optional-chain": "error",
    "typescript/no-redundant-type-constituents": "error",
    "typescript/no-require-imports": "error",
    "typescript/no-this-alias": "error",
    "typescript/no-unnecessary-type-assertion": "error",
    "typescript/no-unnecessary-type-constraint": "error",
    "typescript/no-unsafe-argument": "error",
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-unsafe-call": "error",
    "typescript/no-unsafe-declaration-merging": "error",
    "typescript/no-unsafe-enum-comparison": "error",
    "typescript/no-unsafe-function-type": "error",
    "typescript/no-unsafe-member-access": "error",
    "typescript/no-unsafe-return": "error",
    "typescript/no-unsafe-unary-minus": "error",
    "typescript/no-unused-expressions": "error",
    "typescript/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "typescript/no-useless-default-assignment": "error",
    "typescript/no-wrapper-object-types": "error",
    "typescript/only-throw-error": "error",
    "typescript/prefer-as-const": "error",
    "typescript/prefer-namespace-keyword": "error",
    "typescript/prefer-promise-reject-errors": "error",
    "typescript/restrict-plus-operands": "error",
    "typescript/restrict-template-expressions": "error",
    "typescript/triple-slash-reference": "error",
    "typescript/unbound-method": "error",
    "typescript/consistent-type-imports": [
      "warn",
      { "prefer": "type-imports", "fixStyle": "inline-type-imports" }
    ],
    "eslint/no-var": "error",
    "eslint/prefer-const": "error",
    "eslint/prefer-rest-params": "error",
    "eslint/prefer-spread": "error"
  },
  "overrides": [
    {
      "files": ["**/*.js", "**/*.mjs", "**/*.cjs"],
      "rules": {
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-call": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-return": "off",
        "typescript/no-unsafe-argument": "off"
      }
    }
  ]
}
```

The `overrides` block exists because `scripts/**` is untyped JS; without it the `no-unsafe-*` family fires ~147 times on code with no type information.

- [ ] **Step 3: Point the scripts at Oxlint**

In `package.json`, replace:

```
"lint": "eslint . --ext .ts,.tsx",
"lint:fix": "eslint . --ext .ts,.tsx --fix",
```

with:

```
"lint": "oxlint --type-aware",
"lint:fix": "oxlint --type-aware --fix",
```

- [ ] **Step 4: Swap the dependencies**

Run:

```bash
npm install --save-dev oxlint@1.88.0 oxlint-tsgolint@7.0.2004
npm uninstall eslint eslint-config-next @eslint/eslintrc @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript-eslint
```

Expected: both exit 0 with no `ERESOLVE`.

- [ ] **Step 5: Verify `npm ci` still resolves**

Run: `npm ci`
Expected: exit 0.

- [ ] **Step 6: Verify parity, and that type-aware mode actually ran**

Run: `npm run lint 2>&1 | tail -20`
Expected: the same 4 `no-unused-vars` warnings as the step 1 baseline, **plus exactly one error** — `typescript/no-useless-default-assignment` at `src/app/api/auth/[...nextauth]/route.ts:40`. That error is deliberate (the rule was added by request) and is fixed in Task 4. Its presence is also the proof that `tsgolint` ran rather than degrading silently.

- [ ] **Step 7: Prune the obsolete `overrides` entries**

In `package.json`, delete the entries that only existed for ESLint: the `eslint` object, the `@eslint/eslintrc` object, and `ajv`/`minimatch` **if** they are no longer required. Verify with:

```bash
npm install
npm ci
npm run check
npm test
npm audit
```

Expected: all commands exit 0, and `npm audit` reports **3 findings** (down from 8 — the `eslint-config-next` chain is gone). If removing `ajv`/`minimatch` changes the lockfile in a way that fails `npm ci`, restore them and note it in the commit message.

- [ ] **Step 8: Delete the old config**

Run: `git rm eslint.config.js`

- [ ] **Step 9: Verify the whole gate**

Run: `npm run check`
Expected: exits 0 (eslint + tsc replaced by oxlint + tsc). Run `npm test` and expect `213 passed`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: replace ESLint with Oxlint type-aware linting"
```

---

### Task 3: Replace Prettier with oxfmt

**Files:**
- Create: `.oxfmtrc.json`
- Modify: `package.json` (scripts, `devDependencies`)
- Delete: `prettier.config.js`
- Modify: ~68 reformatted source files

**Interfaces:**
- Consumes: Task 2's toolchain.
- Produces: `npm run format:check` and `npm run format:write` backed by oxfmt.

- [ ] **Step 1: Create `.oxfmtrc.json`**

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 80,
  "endOfLine": "lf",
  "sortPackageJson": false,
  "sortTailwindcss": {},
  "ignorePatterns": [".github/**"]
}
```

`sortPackageJson` must be `false`: oxfmt enables it by default and would reorder `package.json`. `.github/**` is ignored to leave vendored skill templates untouched.

- [ ] **Step 2: Point the scripts at oxfmt**

In `package.json`, replace:

```
"format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
"format:write": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
```

with:

```
"format:check": "oxfmt --check \"**/*.{ts,tsx,js,jsx,mdx}\"",
"format:write": "oxfmt --write \"**/*.{ts,tsx,js,jsx,mdx}\"",
```

- [ ] **Step 3: Swap the dependencies**

Run:

```bash
npm install --save-dev oxfmt@0.73.0
npm uninstall prettier prettier-plugin-tailwindcss
npm ci
```

Expected: all exit 0.

- [ ] **Step 4: Confirm the expected failures, then format**

Run: `npm run format:check`
Expected: non-zero, reporting roughly 68 files under `src` (Prettier already failed on 72, so this is pre-existing drift, not new churn).

Then run: `npm run format:write`

- [ ] **Step 5: Assert the reformat stayed inside the pinned file types**

Run: `git status --porcelain | awk '{print $NF}' | grep -oE '\.[a-z]+$' | sort -u`
Expected: only `.mdx`, `.js`, `.jsx`, `.ts`, `.tsx` (reformatted sources) plus `.json` (`package.json`, `package-lock.json`, `.oxfmtrc.json`). It must **not** list `.md`, `.css`, `.yml`, `.yaml`, `.toml` or `.html` — any of those means oxfmt escaped the pinned scope. Separately run `git diff --stat package.json` and confirm the only changes are the script and dependency edits from this task, not key reordering.

- [ ] **Step 6: Verify formatting is now stable and idempotent**

Run: `npm run format:check`
Expected: exit 0 (no files reported). Then run `npm run format:write` again and confirm `git status --porcelain` is unchanged — proving a second run is a no-op.

- [ ] **Step 7: Delete the old config**

Run: `git rm prettier.config.js`

- [ ] **Step 8: Verify nothing broke**

Run: `npm run check && npm test && npm run build`
Expected: all exit 0; `213 passed`. Formatting must not change behaviour — if any test fails here, the reformat altered semantics and must be reverted and investigated rather than patched.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: replace Prettier with oxfmt"
```

---

### Task 4: Fix the four findings the new scope surfaces

**Files:**
- Modify: `scripts/test-pg-conn.js:19`
- Modify: `scripts/test-security-headers.mjs:124` and `:267`
- Modify: `src/app/api/auth/[...nextauth]/route.ts:40`

**Interfaces:**
- Consumes: Task 2's `.oxlintrc.json`.
- Produces: `npm run lint` with 0 errors and 4 warnings.

- [ ] **Step 1: Record the findings**

Run: `npm run lint 2>&1 | tail -20`
Expected: 4 `no-unused-vars` warnings plus 4 errors — `no-floating-promises` at `scripts/test-pg-conn.js:19` and `scripts/test-security-headers.mjs:267`, `prefer-promise-reject-errors` at `scripts/test-security-headers.mjs:124`, and `no-useless-default-assignment` at `src/app/api/auth/[...nextauth]/route.ts:40`.

- [ ] **Step 2: Await the floating IIFE in `scripts/test-pg-conn.js`**

At line 19 change:

```js
(async () => {
```

to:

```js
void (async () => {
```

(`void` marks the deliberately unawaited promise, the fix the rule itself recommends.)

- [ ] **Step 3: Reject with an `Error` in `scripts/test-security-headers.mjs:124`**

Change:

```js
    serverProcess.on("error", (err) => {
      reject(err);
    });
```

to:

```js
    serverProcess.on("error", (err) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });
```

- [ ] **Step 4: Await the floating `main()` in `scripts/test-security-headers.mjs:267`**

Change `main();` to `void main();`

- [ ] **Step 5: Remove the useless default in the auth route handler**

In `src/app/api/auth/[...nextauth]/route.ts:40` change:

```ts
  async (request, context = { params: Promise.resolve({ nextauth: [] }) }) => {
```

to:

```ts
  async (request, context) => {
```

The default can never apply: `RouteHandler` declares `context: RouteContext` (non-nullish), and the guard already forwards a fresh context to the wrapped handler. Next.js always invokes App Router handlers with `(request, context)`.

- [ ] **Step 6: Verify lint is clean**

Run: `npm run lint 2>&1 | tail -10`
Expected: **0 errors**, 4 warnings (the pre-existing `no-unused-vars` set, which this migration deliberately leaves as warnings).

- [ ] **Step 7: Probe the route at runtime**

The removed default is the one change here that could fail at runtime rather than at compile time. With `USE_MOCK_DB=true USE_MOCK_AUTH=true SKIP_ENV_VALIDATION=true npm run build && npx next start` running, then:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -I  http://localhost:3000/api/auth/signin   # expect 204 (HEAD guard)
curl -s -o /dev/null -w '%{http_code}\n'     http://localhost:3000/api/auth/session  # expect 200, not 500
curl -s -o /dev/null -w '%{http_code}\n' -X PUT http://localhost:3000/api/auth/signin # expect 405 (method guard)
```

Expected: `204`, `200`, `405`. A `500` means the handler was called without a context and the default must be restored (and the rule suppressed inline instead).

- [ ] **Step 8: Verify the whole gate**

Run: `npm run check && npm test`
Expected: exit 0; `213 passed`.

- [ ] **Step 9: Commit**

```bash
git add scripts/test-pg-conn.js scripts/test-security-headers.mjs "src/app/api/auth/[...nextauth]/route.ts"
git commit -m "fix: resolve findings surfaced by the new lint scope"
```

---

### Task 5: Upgrade to TypeScript 7

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: Tasks 2-4 (the toolchain no longer blocks TS 7).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Bump the dependency**

Run: `npm install --save-dev typescript@7.0.2`
Expected: exit 0 with no `ERESOLVE`. If npm reports a peer conflict with `typescript-eslint`, the ESLint packages were not fully removed in Task 2 — fix that rather than forcing the install.

- [ ] **Step 2: Verify the lockfile and compiler**

Run: `npm ci && npx tsc --version`
Expected: `npm ci` exit 0; `Version 7.0.2`.

- [ ] **Step 3: Verify the full gate**

```bash
npm run check
npm test
npm run build
```

Expected: check exit 0 with 0 errors and 4 warnings; `213 passed`; build exit 0 with `Running TypeScript … Finished TypeScript`.

- [ ] **Step 4: Confirm lint is still type-aware under TS 7**

Run: `npm run lint 2>&1 | tail -5`
Expected: 0 errors, 4 warnings. If the `no-useless-default-assignment` finding reappears, Task 4's fix regressed — do not proceed.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade TypeScript to 7.0.2"
```

---

### Task 6: Record the migration in the memory bank

**Files:**
- Create: `memory/tasks/TASK033-oxlint-ts7-migration.md`
- Modify: `memory/tasks/_index.md`, `memory/progress.md`, `memory/activeContext.md`

**Interfaces:**
- Consumes: the completed migration and its verification results.
- Produces: nothing.

- [ ] **Step 1: Add `memory/tasks/TASK033-oxlint-ts7-migration.md`**

Follow the exact structure of `memory/tasks/TASK032-dependency-refresh.md` (Status / Added / Updated, Related design, Original request, Acceptance criteria, Progress tracking with a `|ID|Description|Status|Updated|Notes|` subtask table, Progress Log). Reference the spec path, state the final rule count (50), the finding count fixed (4), the audit change (8 → 3), and record the verified command results.

- [ ] **Step 2: Update the three memory files**

- `memory/tasks/_index.md`: add TASK033 at the top of **Completed**.
- `memory/progress.md`: prepend a dated entry.
- `memory/activeContext.md`: replace the focus lines and update Next Actions.

- [ ] **Step 3: Verify nothing else references the old toolchain**

Run: `grep -rln "eslint\|prettier" memory/ docs/ README.md AGENTS.md`
Expected: only the historical task files (`TASK006`, `TASK007`, `TASK032`, DESIGN docs) and the new TASK033 entry. Historical task records must **not** be rewritten. If `AGENTS.md` or `README.md` describe the lint/format commands, update those lines.

- [ ] **Step 4: Commit**

```bash
git add memory/
git commit -m "docs: record TASK033 toolchain migration in the memory bank"
```

---

### Task 7: Full verification and PR

**Files:** none.

**Interfaces:**
- Consumes: Tasks 1-6.
- Produces: a green PR.

- [ ] **Step 1: Verify from a clean install, the way CI does**

```bash
rm -rf node_modules && npm ci
npm run check
npm test
npm run format:check
npm run build
```

Expected: `npm ci` exit 0; check exit 0 (0 errors, 4 warnings); `26 files / 213 tests` passing; format:check exit 0; build exit 0.

- [ ] **Step 2: Run the E2E suite**

```bash
CI=1 AUTH_DISCORD_ID=placeholder AUTH_GOOGLE_ID=placeholder npx playwright test --project=chromium
CI=1 AUTH_DISCORD_ID=placeholder AUTH_GOOGLE_ID=placeholder npx playwright test --project=webkit
```

Expected: 11 passed / 2 skipped, and 7 passed / 6 skipped. (Firefox fails on this machine with `Could not find profile folder` — a local browser defect reproducible by launching the binary directly; exclude it and let CI cover it.)

- [ ] **Step 3: Confirm no unintended files changed**

Run: `git diff --stat main...HEAD | tail -30`
Expected: the config files, `package.json`, `package-lock.json`, `.gitattributes`, the ~68 reformatted sources, the 4 fix sites, and the memory-bank docs. No Markdown/JSON/CSS files reformatted.

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin chore/oxlint-oxfmt-ts7-migration
gh pr create --base main --title "chore: migrate to Oxlint + oxfmt and adopt TypeScript 7" --body-file /tmp/pr-body.md
```

The PR body must include the before/after lint parity table (baseline 4 findings vs identical 4 findings), the 4 fixed findings, the audit delta (8 → 3), and the verification output. Reference the spec.

- [ ] **Step 5: Watch CI to completion**

Run: `gh pr checks --watch`
Expected: `CI`, `Security Checks` and `Deploy Preview` all green.
