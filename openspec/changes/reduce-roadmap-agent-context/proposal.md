## Why

Roadmap shipments repeatedly load a growing workflow, duplicate OpenSpec instructions, and
the same complete diff into several full-history review agents. Recent session telemetry
shows that late three-agent review waves dominate token use, so the repository workflow
needs bounded, context-light delegation before the remaining curriculum and design roadmap
items are attempted.

## What Changes

- Keep the ten shipping phases and their existing safety gates, but load phase detail from
  one-level references only when a phase begins.
- Default exploration, audit, and simplification to one no-history read-only reviewer on
  Terra at medium reasoning; allow at most three reviewers only for disjoint path domains.
- Pass reviewers paths and questions instead of copied diffs, artifacts, or conclusions.
- Use the normal OpenSpec skills, remove migrated command-wrapper duplicates and the legacy
  Codex mirror, and keep `.agents` canonical with Claude-specific surfaces intact.
- Reuse unchanged proposal dependencies by content hash and compact duplicated OpenSpec
  project context.
- Limit a content change to six generators, leaving a roadmap unit unchecked until all of
  its ordered increments ship.

No curriculum stage, unit, or skill id is in scope. No new input, rendering, or learner
capability is required.

### Non-goals

- Changing application runtime behavior, curriculum content, or learner-facing text.
- Removing any test, build, lint, browser, visual-review, cleanup, shipping, or archive gate.
- Changing global Codex model defaults or the behavior of agents outside the affected skills.
- Reorganizing the accumulated `problem-generation` baseline; a separate change owns that.

## Capabilities

### New Capabilities

None. This change is tooling-only and declares `skip_specs: true`.

### Modified Capabilities

None.

## Impact

The repository skill catalog, the roadmap shipping skill and its Claude mirror, OpenSpec
proposal and audit instructions, OpenSpec project context, and workflow/roadmap documentation
change. The personal `$simplify` skill is updated separately after the repository lifecycle;
`~/.codex/config.toml` is untouched.
