---
name: prepare-roadmap
description: Select and prepare the first unchecked Math Quest roadmap item through exploration and OpenSpec proposal. Use when starting the roadmap workflow with no active run; exit ready-to-audit before audit or implementation.
---

# Prepare Roadmap

Prepare one roadmap increment for a later implementation session.

## Shared resources

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Read each phase reference only when that phase begins:

- Phase 1: [select](../../../docs/agent-workflows/ship-roadmap-item/select.md)
- Phase 1 state: [template](../../../docs/agent-workflows/ship-roadmap-item/state-template.json)
- Phase 2: [explore](../../../docs/agent-workflows/ship-roadmap-item/explore.md)
- Phase 3: [propose](../../../docs/agent-workflows/ship-roadmap-item/propose.md)

## Claude Code adapter

Create exactly three tasks with `TaskCreate`: Select, Explore, and Propose. Use `TaskUpdate`
so exactly one task is `in_progress`; never complete one before its gate passes.

Invoke each named OpenSpec project skill through Claude Code's skill mechanism when its
phase begins. Do not load or invoke audit instructions in this session. When exploration
needs independent review, invoke `Agent` with
`subagent_type: "roadmap-reviewer"` and a fresh task prompt containing only the fields
permitted by the handoff contract. Do not add a model override or conversation transcript.

After the proposal gate passes, mark Propose complete, set Audit pending and `currentPhase`
to 4, then set the handoff status to `ready-to-audit`. End with the exact change name,
selected increment, state directory, and proposal result. Do not audit or write application
code.
