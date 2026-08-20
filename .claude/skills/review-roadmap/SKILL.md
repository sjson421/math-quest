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

## Claude Code adapter

Create exactly five tasks with `TaskCreate`: Simplify, Review, Clean up, Ship, and Archive.
Use `TaskUpdate` so exactly one task is `in_progress`; never complete one before its gate
passes. Invoke `openspec-archive-change` through Claude Code's skill mechanism in phase 10.

In phase 6, launch the `roadmap-reviewer` project agent over this run's changed paths,
verify every finding, and let the parent apply accepted cleanup. For every independent
review, invoke `Agent` with `subagent_type: "roadmap-reviewer"` and a fresh task prompt
containing only the fields permitted by the handoff contract. Do not add a model override or
conversation transcript.

After the archive commit is pushed, remove only the exact run-owned handoff files and their
empty directories. Deliver the complete final report required by `finish.md`.
