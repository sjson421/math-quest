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

## Claude Code adapter

For a new run, create exactly four tasks with `TaskCreate`: Select, Explore, Propose, and
Audit. For `needs-preparation`, preserve selection and create only the tasks named by the
re-entry reason, ending with Audit. Use `TaskUpdate` so exactly one task is `in_progress`;
never complete one before its gate passes.

Invoke each named OpenSpec project skill through Claude Code's skill mechanism when its
phase begins. For every independent review, invoke `Agent` with
`subagent_type: "roadmap-reviewer"` and a fresh task prompt containing only the fields
permitted by the handoff contract. Do not add a model override or conversation transcript.

After the audit gate passes, set the handoff status to `ready-to-implement`. End with the
exact change name, selected increment, state directory, and audit result. Do not write
application code.
