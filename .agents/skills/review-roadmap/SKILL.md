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

## Codex adapter

Create an `update_plan` plan with exactly Simplify, Review, Clean up, Ship, and Archive in
that order. Keep exactly one entry `in_progress`, and never mark a phase complete before its
gate passes. Use the currently selected model throughout this workflow. Sandbox escalation
here is `sandbox_permissions: "require_escalated"` on the same scoped command.

In phase 6, invoke `$simplify` on this run's changed paths. Complete any required review in
the current session with the currently selected model. Do not spawn an orchestrator or
replacement subagent. In phase 10, invoke `openspec-archive-change` through Codex's skill
mechanism.

Before staging, account for untracked paths with `git status --untracked-files=all`; a plain
`git diff --stat` does not include them. In phase 10, sync and inspect OpenSpec deltas before
archiving. If `openspec archive "<name>" --yes` reports that an already-synced ADDED or
MODIFIED spec exists, first verify the baseline spec contains the intended delta and that the
failed command changed no files, then rerun the archive with `--skip-specs`. This flag is only
safe after the sync has been proven; it is not a replacement for syncing deltas.

After the archive commit is pushed, remove only the exact run-owned handoff files and their
empty directories. Deliver the complete final report required by `finish.md`.
