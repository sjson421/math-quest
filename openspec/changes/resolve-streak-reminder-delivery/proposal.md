## Why

Roadmap item 31 remains open although its in-app streak reminder already ships. The user selected the roadmap's permitted in-app-only fallback for increment 31b, so the remaining work is to record that outcome and verify the existing reminder.

## What Changes

- Resolve 31b through the existing Home streak card and close item 31 after verification during implementation.
- Update the roadmap and README to describe the in-app-only v1.0 outcome, without claiming system notifications shipped or failed real-device testing.
- Retain the existing streak-progression requirements and runtime behavior. This is tooling-only repository documentation and verification work; no curriculum stage, unit, or skill ids are in scope.

## Capabilities

### New Capabilities

None. No notification, rendering, input, or manifest capability is introduced.

### Modified Capabilities

None. `streak-progression` already specifies the shipped Home warning. This documentation-only change sets `skip_specs: true`; no delta or baseline spec edit is needed.

## Impact

Implementation edits are limited to `docs/roadmap.md` and `README.md`, with verification results recorded in this change's task list. Existing behavior is owned by `Home`, `StreakCard`, `lib/streak.ts`, and store load reconciliation. No API, dependency, progress schema, service worker, or application code changes are planned.

## Non-goals

- System notifications, permission prompts, push subscriptions, server scheduling, or notification settings.
- New reminder surfaces, return-to-app triggers, or changes to streak and freeze policy.
- Curriculum or generator changes.
- Deployment, real-device notification validation, or the remaining launch work listed in the roadmap.
