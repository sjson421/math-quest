## Why

Roadmap item 31a still invites additional reminder behavior even though the existing home-screen streak card already supplies its nudge. The user accepted that existing behavior as sufficient, so the roadmap should record the decision and leave only 31b outstanding.

## What Changes

- Mark increment 31a complete in the body of roadmap item 31, citing the existing home-screen warning and streak-progression baseline.
- Replace the unresolved invitation to add another reminder with the accepted scope decision.
- Keep item 31's checkbox unchecked because system notifications in 31b remain unimplemented.

## Capabilities

### New Capabilities

None. No new rendering, input, notification, or manifest capability is required.

### Modified Capabilities

None. The existing streak-progression requirements remain authoritative. This documentation-only change declares `skip_specs: true`.

## Impact

Tooling-only roadmap bookkeeping: implementation edits are confined to item 31 in `docs/roadmap.md`. No curriculum stage, unit, or skill id is in scope. Existing application code, storage, dependencies, and baseline specs need no changes.

## Non-goals

System notifications and permission prompts (31b); additional reminder surfaces or return-to-app triggers; midnight refresh behavior; changes to streaks, freezes, sync, or curriculum; real-device launch validation. This change does not claim any of those behaviors are shipped.
