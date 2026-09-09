---
name: prepare-roadmap
description: Select and prepare the first unchecked Math Quest roadmap item through exploration and OpenSpec proposal. Use when starting the roadmap workflow with no active run; exit ready-to-audit before audit or implementation.
---

# Prepare Roadmap

Prepare one roadmap increment for a later implementation session.

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Read each phase reference only when that phase begins:

- Phase 1: [select](../../../docs/agent-workflows/ship-roadmap-item/select.md)
- Phase 1 state: [template](../../../docs/agent-workflows/ship-roadmap-item/state-template.json)
- Phase 2: [explore](../../../docs/agent-workflows/ship-roadmap-item/explore.md)
- Phase 3: [propose](../../../docs/agent-workflows/ship-roadmap-item/propose.md)

Track Select, Explore, and Propose. Keep exactly one phase `in_progress`.
Load the named OpenSpec skills from Pi's
discovered catalog when each phase begins; nested OpenSpec skills continue to come from
`.agents/skills`. Do not load or invoke audit instructions in this session.

When exploration needs independent review, call the `subagent` tool with `agent: "roadmap-reviewer"`,
`context: "fresh"`, `async: false`, `artifacts: false`, `mission: false`, and no model field.
Pass only fields allowed by the handoff contract. If launch infrastructure is unavailable,
record the exact reason, review inline, and disclose degraded assurance; substantive findings
and unresolved decisions are not fallback conditions.

After proposal passes, mark Propose complete, set Audit pending and `currentPhase` to 4, then
set the handoff status to `ready-to-audit`. End with the exact change name, selected
increment, state directory, and proposal result. Do not audit or write application code.
