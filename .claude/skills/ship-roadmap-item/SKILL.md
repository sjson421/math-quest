---
name: ship-roadmap-item
description: Use when asked to implement or ship the first unchecked item in Math Quest's docs/roadmap.md, or to run the repository's complete roadmap-to-main workflow.
---

# Ship Roadmap Item

Use the shared contract with Claude Code-native task tracking, skills, and agents.

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

## Claude Code adapter

Create exactly ten tasks with `TaskCreate`, one for each shared phase in order. Use
`TaskUpdate` so exactly one task is `in_progress`; never complete one before its gate
passes. Record carried workflow values in the applicable task descriptions or metadata.

Invoke each named OpenSpec project skill through Claude Code's skill mechanism when its
phase begins. In phase 6, launch the `roadmap-reviewer` project agent over this run's
changed paths, verify every finding, and let the parent apply accepted cleanup.

For every independent review, invoke `Agent` with `subagent_type: "roadmap-reviewer"` and a
fresh task prompt containing only the fields permitted by the shared contract. Do not add a
model override or conversation transcript. The project agent owns inherited model selection,
medium effort, and read-only behavior.
