---
name: audit-roadmap
description: Audit the prepared Math Quest roadmap proposal in fresh context. Use only when its cross-session handoff is ready-to-audit; exit ready-to-implement without changing application code.
---

# Audit Roadmap

Audit the single prepared roadmap change in a fresh, focused session.

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-audit`, verify it as the
contract requires, then read [audit](../../../docs/agent-workflows/ship-roadmap-item/audit.md).

Track only Audit and mark it `in_progress`. Load `openspec-audit-proposal` from Pi's
discovered catalog with the prepared change name and phase-1 baseline SHA; the nested skill
comes from `.agents/skills`.

Call the `subagent` tool exactly once with `agent: "roadmap-reviewer"`, `context: "fresh"`,
`async: false`, `artifacts: false`, `mission: false`, and no model field. Pass the complete
artifact path set and only fields allowed by the handoff contract. Do not add reviewers or
split the artifacts. If launch infrastructure is unavailable, retain `ready-to-audit`,
return Audit to pending, record the exact reason, and stop; inline review is not an
independent audit.

After the audit gate passes, mark Audit complete, set Apply pending and `currentPhase` to 5,
then set the handoff status to `ready-to-implement`. End with the exact change name, selected
increment, state directory, and audit result. Do not write application code.
