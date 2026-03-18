# DESIGN019 - Deployment workflows

## Context

The repository uses package scripts plus GitHub Actions for CI/deploy automation. There are no Vercel preview or production deployment workflows yet.

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
