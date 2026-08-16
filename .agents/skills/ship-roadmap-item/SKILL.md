---
name: ship-roadmap-item
description: Use when asked to implement or ship the first unchecked item in Math Quest's docs/roadmap.md, or to run the repository's complete roadmap-to-main workflow.
---

# Ship Roadmap Item

Use the shared contract with Codex-native tracking, skills, and delegation.

## Shared resources

Read [the shared contract](../../../docs/agent-workflows/ship-roadmap-item/core.md)
immediately. Read these directly linked references only when their phase group begins:

- Phase 1: [select](../../../docs/agent-workflows/ship-roadmap-item/select.md)
- Phase 2: [explore](../../../docs/agent-workflows/ship-roadmap-item/explore.md)
- Phases 3–4: [propose and audit](../../../docs/agent-workflows/ship-roadmap-item/propose-audit.md)
- Phase 5: [apply](../../../docs/agent-workflows/ship-roadmap-item/apply.md)
- Phase 6: [simplify](../../../docs/agent-workflows/ship-roadmap-item/simplify.md)
- Phase 7: [review](../../../docs/agent-workflows/ship-roadmap-item/review.md)
- Phases 8–10: [finish](../../../docs/agent-workflows/ship-roadmap-item/finish.md)

## Codex adapter

Create an `update_plan` plan with the shared contract's exact ten phases. Keep exactly one
entry `in_progress`, and never mark a phase complete before its gate passes.

Invoke the named OpenSpec skills through Codex's skill mechanism. In phase 6, invoke
`$simplify` on this run's changed paths, but this adapter controls reviewer launch: use the
reviewer model below even if another cleanup instruction suggests a different one.

For every independent reviewer, call `spawn_agent` with `fork_turns: "none"` and
`model: "gpt-5.6-terra"` and `reasoning_effort: "medium"`. Keep the parent on the model
selected for its environment. Pass only the fields permitted by the shared contract, require
no edits, and verify every returned claim locally.
