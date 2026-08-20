---
name: prepare-roadmap
description: Select and prepare the first unchecked Math Quest roadmap item through exploration, OpenSpec proposal, and implementation-readiness audit. Use when starting the roadmap workflow or resuming a handoff marked needs-preparation; stop before implementation.
---

# Prepare Roadmap

Prepare one roadmap increment for a later implementation session.

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Read each phase reference only when that phase begins:

- Phase 1: [select](../../../docs/agent-workflows/ship-roadmap-item/select.md)
- Phase 1 state: [template](../../../docs/agent-workflows/ship-roadmap-item/state-template.json)
- Phase 2: [explore](../../../docs/agent-workflows/ship-roadmap-item/explore.md)
- Phases 3–4: [propose and audit](../../../docs/agent-workflows/ship-roadmap-item/propose-audit.md)

For a new run, track Select, Explore, Propose, and Audit. For `needs-preparation`, preserve
selection and track only the gates named by the re-entry reason, ending with Audit. Keep
exactly one phase `in_progress`. Load the named OpenSpec skills from Pi's discovered catalog
when each phase begins; nested OpenSpec skills continue to come from `.agents/skills`.

For every independent review, call the `subagent` tool with `agent: "roadmap-reviewer"`,
`context: "fresh"`, `async: false`, `artifacts: false`, `mission: false`, and no model field.
Pass only fields allowed by the handoff contract. If launch infrastructure is unavailable,
record the exact reason, review inline, and disclose degraded assurance; substantive findings
and unresolved decisions are not fallback conditions.

After audit passes, set the handoff status to `ready-to-implement`. End with the exact change
name, selected increment, state directory, and audit result. Do not write application code.
