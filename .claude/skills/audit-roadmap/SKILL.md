---
name: audit-roadmap
description: Audit the prepared Math Quest roadmap proposal in fresh context. Use only when its cross-session handoff is ready-to-audit; exit ready-to-implement without changing application code.
---

# Audit Roadmap

Audit the single prepared roadmap change in a fresh, focused session.

## Shared resources

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-audit`, verify it as the
contract requires, then read [audit](../../../docs/agent-workflows/ship-roadmap-item/audit.md).

## Claude Code adapter

Create one task named Audit with `TaskCreate`, then set it `in_progress` with `TaskUpdate`.
Invoke `openspec-audit-proposal` through Claude Code's skill mechanism with the prepared
change name and phase-1 baseline SHA.

Invoke `Agent` exactly once with `subagent_type: "roadmap-reviewer"` and a fresh task prompt
containing the complete artifact path set and only the fields permitted by the handoff
contract. Do not add a model override, conversation transcript, extra reviewer, or path
split. Verify every reviewer finding in the current session.

After the audit gate passes, mark Audit complete, set Apply pending and `currentPhase` to 5,
then set the handoff status to `ready-to-implement`. End with the exact change name, selected
increment, state directory, and audit result. Do not write application code.
