# DESIGN024 - Visual regression + load testing

## Context

Playwright exists, but there are no visual regression or load tests.

## Requirements (EARS)

- WHEN UI changes in PRs, THE SYSTEM SHALL be able to detect unexpected visual diffs.
- WHEN performance needs to be validated, THE SYSTEM SHALL allow repeatable load tests for critical endpoints.

## Proposed approach

- Visual:
  - Use Playwright screenshot assertions for a few stable pages.
  - Optionally integrate a hosted diff tool later (Percy/Chromatic).
- Load:
  - Add `k6` scripts targeting `/`, `/catalog`, and selected API endpoints.
  - Run on-demand (not on every PR initially).

## Validation

- Ensure visual tests are stable (avoid dynamic timestamps).
- Define baseline thresholds for k6 and store results as artifacts.
