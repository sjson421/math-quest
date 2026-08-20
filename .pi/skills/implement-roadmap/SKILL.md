---
name: implement-roadmap
description: Implement the audited Math Quest roadmap change prepared by prepare-roadmap. Use only when its cross-session handoff is ready-to-implement; complete every OpenSpec implementation task but do not review, commit, push, or archive.
---

# Implement Roadmap

Apply the single prepared roadmap change in a focused implementation session.

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-implement`, verify it as the
contract requires, then read [apply](../../../docs/agent-workflows/ship-roadmap-item/apply.md).

Mark only Apply `in_progress` in the shared state. Load `openspec-apply-change` from Pi's
discovered catalog with the audited change name; nested OpenSpec skills continue to come from
`.agents/skills`. Follow every task and test instruction. Do not simplify, perform final
review, stage, commit, push, or archive.

When every task is checked, complete Apply and set the handoff status to `ready-to-review`.
End with the exact changed paths, tests run, task status, and state directory. Retain the
handoff and all intended worktree changes for `review-roadmap`.
