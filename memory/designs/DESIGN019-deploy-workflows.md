# DESIGN019 - Deployment workflows

## Context

`vercel.json` exists, and CI runs lint/typecheck/unit/e2e. There are no GitHub Actions workflows for Vercel preview or production deployment.

## Requirements (EARS)

- WHEN a PR targets `main`, THE SYSTEM SHALL deploy a Vercel Preview environment.
- WHEN code is merged to `main`, THE SYSTEM SHALL deploy to Vercel Production.
- WHEN deployments run, THE SYSTEM SHALL only proceed if lint/typecheck/tests pass.

## Proposed approach

- Add two workflows:
  - `.github/workflows/deploy-preview.yml` (on PRs)
  - `.github/workflows/deploy-production.yml` (on push to main)
- Use `amondnet/vercel-action` (or `vercel` CLI) with `--prebuilt`.
- Document required secrets:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Validation

- Dry-run on a branch using dummy secrets is not possible; validate via workflow syntax + documentation.
- Confirm Preview deploy posts a URL comment on PR.
