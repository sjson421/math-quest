---
name: review-roadmap
description: Review, verify, ship, and archive the Math Quest roadmap change completed by implement-roadmap. Use only when its cross-session handoff is ready-to-review; owns simplification, full review, cleanup, implementation push, OpenSpec archive, and archive push.
---

# Review Roadmap

Take the completed implementation through verified pushes and archive.

Read [the cross-session handoff contract](../../../docs/agent-workflows/ship-roadmap-item/handoff.md)
immediately. Require exactly one handoff with status `ready-to-review` and verify it before
working. Read each phase reference only when its phase group begins:

- Phase 6: [simplify](../../../docs/agent-workflows/ship-roadmap-item/simplify.md)
- Phase 7: [review](../../../docs/agent-workflows/ship-roadmap-item/review.md)
- Phases 8–10: [finish](../../../docs/agent-workflows/ship-roadmap-item/finish.md)

Track Simplify, Review, Clean up, Ship, and Archive in the shared state with exactly one
phase `in_progress`. Load named OpenSpec skills from Pi's discovered catalog; nested skills
continue to come from `.agents/skills`. Invoke `openspec-archive-change` in phase 10.

For every independent review, call the `subagent` tool with `agent: "roadmap-reviewer"`,
`context: "fresh"`, `async: false`, `artifacts: false`, `mission: false`, and no model field.
Pass only fields allowed by the handoff contract. In phase 6, use this reviewer for reuse,
quality, and efficiency findings; the parent verifies and applies accepted cleanup.

If launch infrastructure is unavailable, record the exact reason, review inline, and disclose
degraded assurance. Do not use fallback for substantive findings, task failures, or unresolved
decisions. After the archive push, remove only the exact run-owned handoff files and their
empty directories, then deliver the complete final report required by `finish.md`.
