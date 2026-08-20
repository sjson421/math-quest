---
name: review-roadmap
description: Review, verify, ship, and archive the Math Quest roadmap change completed by implement-roadmap. Use only when its cross-session handoff is ready-to-review; owns simplification, full review, cleanup, implementation push, OpenSpec archive, and archive push.
---

# Review Roadmap

Take the completed implementation through verified pushes and archive.

## Shared resources

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-review` and verify it before
working. Read each phase reference only when its phase group begins:

- Phase 6: [simplify](../../../docs/agent-workflows/ship-roadmap-item/simplify.md)
- Phase 7: [review](../../../docs/agent-workflows/ship-roadmap-item/review.md)
- Phases 8–10: [finish](../../../docs/agent-workflows/ship-roadmap-item/finish.md)

## Codex adapter

Create an `update_plan` plan with exactly Simplify, Review, Clean up, Ship, and Archive in
that order. Keep exactly one entry `in_progress`, and never mark a phase complete before its
gate passes. This skill is intended to run in a session using `gpt-5.6-luna` with max
reasoning.

In phase 6, invoke `$simplify` on this run's changed paths. This adapter controls reviewer
launch: use Luna with max reasoning even if another cleanup instruction suggests a different
model. In phase 10, invoke `openspec-archive-change` through Codex's skill mechanism.

For every independent reviewer, call `spawn_agent` with `fork_turns: "none"`,
`model: "gpt-5.6-luna"`, and `reasoning_effort: "max"`. Pass only the fields permitted by
the handoff contract, require no edits, and verify every returned claim locally. The parent
adjudicates findings, applies accepted fixes, and runs every verification gate.

After the archive commit is pushed, remove only the exact run-owned handoff files and their
empty directories. Deliver the complete final report required by `finish.md`.
