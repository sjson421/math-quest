## Why

`ship-roadmap-item` currently duplicates its workflow across Codex and Claude while Pi
falls through to the Codex copy. The copies have already drifted into incompatible model
and orchestration instructions, so each harness needs a native entry point backed by one
shared shipping contract.

## What Changes

- Move the ten-phase workflow and seven progressive references to one shared documentation
  source.
- Replace the Codex and Claude copies with thin native adapters and add a Pi adapter.
- Add read-only Claude and Pi reviewer definitions while keeping model selection portable.
- Give Pi a recorded inline fallback and keep its reviewer artifacts outside the worktree.
- Add deterministic validation and fresh-harness discovery checks for all three surfaces.
- Update workflow documentation for the shared contract and agent-native entry points.

### Non-goals

- Change application runtime behavior, curriculum content, or learner-facing text.
- Copy the existing OpenSpec phase skills into Pi-specific directories.
- Change global Codex, Claude, Pi, router, or provider configuration.
- Clean or adopt pre-existing `.pi-subagents/` output.

## Capabilities

### New Capabilities

None. This change is tooling-only and declares `skip_specs: true`.

### Modified Capabilities

None.

## Impact

The repository's roadmap-shipping skill catalog, workflow documentation, package scripts,
and tooling validation change. The public skill name remains `ship-roadmap-item`; Claude
and Pi gain an internal `roadmap-reviewer` agent definition.
