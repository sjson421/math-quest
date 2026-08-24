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

## Execution environment

Treat permission errors as environment failures before treating them as product failures.

- The source tree may be writable while `.git` is read-only in the sandbox. If staging,
  committing, or another index operation reports `EROFS`, `EPERM`, or `index.lock`, retry
  the same scoped command with the sandbox escalation this harness provides, and a concise
  justification. Do not broaden the command or its approval prefix.
- If `git fetch` or `git push` is denied by the sandbox, retry the same exact command with
  escalation after checking the branch and remote. Stop for authentication, protection, or
  non-fast-forward failures; escalation is not a reason to bypass those gates.
- Local port binding and Chromium may also require escalation. If the dev server reports
  `listen EPERM`, or browser tooling reports `SIGTRAP`, crashpad, or GUI permission errors,
  retry the same command with escalation. Stop only the exact run-owned processes and prove
  the validation port is free afterward.
- If browser validation needs `playwright-core`, install it in a fresh exact `/tmp` scratch
  directory, never in the repository. On a sandbox DNS or network error such as `EAI_AGAIN`,
  retry that same scoped install with escalation. Keep the scratch path in run bookkeeping
  and remove it only after the archive push.
- Use Node to parse JSON state instead of assuming `jq` is installed. Prefer tracked tool
  session ids for process cleanup; otherwise use an anchored or bracketed `ps`/`rg` pattern
  so a process check cannot match its own shell command.

## Durable state transitions

When changing phase, update `currentPhase`, the phase statuses, workflow status, and gate
fields in the same controlled state transition. Keep exactly one phase `in_progress` and
verify the parsed state on disk before updating the plan described below. If
either a state edit or the corresponding plan update fails, re-read the state and reconcile
it before continuing; never infer the current phase from chat history.

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
