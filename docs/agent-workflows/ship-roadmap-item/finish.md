# Phases 8–10: Clean up, ship, and archive

## Phase 8: Clean up

Before committing, revert only named temporary edits created by this run, then prove their
markers and diffs are absent. Account for every untracked path and confirm generated output
is ignored. Stop the dev server and browser using specific process matches and prove the
port is free. Recheck phase 1 user-owned paths: they remain modified, unstaged, and
byte-identical to their baseline state.

Delete nothing in the repository: no `git clean`, broad checkout, hard reset, or recursive
removal. Keep external scratch space until the workflow ends, then clear only run-owned
scratch and report that. Proceed only when the tree contains this change plus untouched
baseline work.

## Phase 9: Ship

Confirm `HEAD` is `main`, fetch origin, and stop if `origin/main` advanced since review.
Stage only explicit workflow paths, never a broad path. Inspect the cached diff and confirm
it equals the verified diff. Match recent commit style, commit, and push `origin main`.
Do not create a branch or pull request. Stop on stale base, credential/branch-protection
failure, unsafe non-fast-forward, or any staged-diff mismatch.

## Phase 10: Archive

Use `openspec-archive-change` only after the implementation push. Archive in a separate
commit. Confirm every artifact is done/skipped and every task checked. Always sync deltas
before moving the change; `openspec archive "<name>" --yes` performs both.

Inspect baseline-spec changes: every ADDED requirement is intact, MODIFIED requirements
retain unaffected scenarios, REMOVED requirements are absent, and unintended reflow is
corrected. Update archive bookkeeping such as `docs/workflow.md`. Run
`openspec validate --specs --strict`, confirm the active queue state, commit, and push.
Archive dates reflect the actual archive date.

## Final report

Report selected item/increment, exploration decision and re-entry, change name,
implementation, audit/review corrections, review mode and fallbacks, exact gate results,
screenshot observations, both commit SHAs and subjects, both pushes, archive path, cleanup
outcome, stopped processes, removed handoff state, and every pre-existing path still
untouched. If no user-visible surface changed, state that visual review was not applicable.
