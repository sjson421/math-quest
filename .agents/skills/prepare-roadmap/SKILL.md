---
name: prepare-roadmap
description: Select and prepare the first unchecked Math Quest roadmap item through exploration, OpenSpec proposal, and implementation-readiness audit. Use when starting the roadmap workflow or resuming a handoff marked needs-preparation; stop before implementation.
---

# Prepare Roadmap

Prepare one roadmap increment for a later implementation session.

## Shared resources

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Read each phase reference only when that phase begins:

- Phase 1: [select](../../../docs/agent-workflows/ship-roadmap-item/select.md)
- Phase 1 state: [template](../../../docs/agent-workflows/ship-roadmap-item/state-template.json)
- Phase 2: [explore](../../../docs/agent-workflows/ship-roadmap-item/explore.md)
- Phases 3–4: [propose and audit](../../../docs/agent-workflows/ship-roadmap-item/propose-audit.md)

## Codex adapter

For a new run, create an `update_plan` plan with exactly Select, Explore, Propose, and Audit
in that order. For `needs-preparation`, preserve selection and plan only the gates named by
the re-entry reason, ending with Audit. Keep exactly one entry `in_progress`, and never mark
a phase complete before its gate passes. Use the user-selected planning model and do not
replace the parent with a hard-coded model.

Invoke `openspec-explore`, `openspec-propose`, and `openspec-audit-proposal` through Codex's
skill mechanism when their phases begin. For every independent reviewer, call `spawn_agent`
with `fork_turns: "none"`, `model: "gpt-5.6-luna"`, and
`reasoning_effort: "max"`. Pass only the fields permitted by the handoff contract, require
no edits, and verify every returned claim locally.

After the audit gate passes, set the handoff status to `ready-to-implement`. End the session
with the exact change name, selected increment, state directory, and audit result. Do not
write application code.
