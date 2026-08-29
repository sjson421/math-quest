---
name: implement-roadmap
description: Implement the audited Math Quest roadmap change. Use only when its cross-session handoff is ready-to-implement; complete every OpenSpec implementation task but do not review, commit, push, or archive.
---

# Implement Roadmap

Apply the single prepared roadmap change in a focused implementation session.

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-implement`, verify it as the
contract requires, then read [apply](../../../docs/agent-workflows/ship-roadmap-item/apply.md).

Create one task named Apply and mark it `in_progress`. Invoke `openspec-apply-change`
through Claude Code's skill mechanism with the audited change name. Follow every task and
test instruction, and verify the edits and task updates in the current worktree. Do not
simplify, perform final review, stage, commit, push, or archive.

When every implementation task is checked, complete Apply and set the handoff status to
`ready-to-review`. End with the exact changed paths, tests run, task status, and state
directory. Retain the handoff and all intended worktree changes for `review-roadmap`.
