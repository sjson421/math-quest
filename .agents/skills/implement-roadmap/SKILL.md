---
name: implement-roadmap
description: Implement the audited Math Quest roadmap change prepared by prepare-roadmap. Use only when its cross-session handoff is ready-to-implement; complete every OpenSpec implementation task but do not review, commit, push, or archive.
---

# Implement Roadmap

Apply the single prepared roadmap change in a focused implementation session.

## Shared resources

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-implement`, verify it as the
contract requires, then read [apply](../../../docs/agent-workflows/ship-roadmap-item/apply.md).

## Codex adapter

Create an `update_plan` plan with one `in_progress` entry named Apply. Use the currently
selected model and implement in the current session. Do not spawn an orchestrator or
replacement subagent.

Invoke `openspec-apply-change` through Codex's skill mechanism with the audited change name.
Follow every task and test instruction, and verify the resulting edits and task updates in
the current worktree. Do not simplify, perform final review, stage, commit, push, or archive.

When every implementation task is checked, mark Apply complete and set the handoff status to
`ready-to-review`. End with the exact changed paths, tests run, task status, and state
directory. Retain the handoff and all intended worktree changes for `review-roadmap`.
