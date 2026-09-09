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

### Forward amendment

If this phase group finds that an artifact assumption is wrong, do not return the run. Follow
the handoff contract's forward amendment steps: invoke `openspec-update-change` through Claude
Code's skill mechanism to revise only the invalidated artifacts, append the discovery and
decision to `exploration.amendments`, then invoke `Agent` once with
`subagent_type: "roadmap-reviewer"` over the revised artifact paths only. Verify every finding
before accepting it, then resume where the discovery interrupted.

When every implementation task is checked, complete Apply and set the handoff status to
`ready-to-review`. End with the exact changed paths, tests run, task status, and state
directory. Retain the handoff and all intended worktree changes for `review-roadmap`.
