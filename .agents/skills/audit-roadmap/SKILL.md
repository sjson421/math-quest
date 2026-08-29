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

## Codex adapter

Create an `update_plan` plan with one `in_progress` entry named Audit. Use the currently
selected model throughout this workflow.

Invoke `openspec-audit-proposal` through Codex's skill mechanism with the prepared change
name and phase-1 baseline SHA. Launch exactly one fresh read-only reviewer over the complete
artifact set as the audit contract requires. Do not add reviewers, split the artifacts, or
spawn an orchestrator or replacement subagent. Verify every reviewer finding in the current
session.

After the audit gate passes, mark Audit complete, set Apply pending and `currentPhase` to 5,
then set the handoff status to `ready-to-implement`. End with the exact change name, selected
increment, state directory, and audit result. Do not write application code.
