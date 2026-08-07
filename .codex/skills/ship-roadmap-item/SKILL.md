---
name: ship-roadmap-item
description: Use when asked to implement or ship the first unchecked item in Math Quest's docs/roadmap.md, or to run the repository's complete roadmap-to-main workflow.
---

# Ship Roadmap Item

Take the first unchecked roadmap item from planning through a verified push to `main`.
Keep every phase separate: finish and verify one phase before starting the next.

## Workflow control

Create a plan with the nine phases below and keep exactly one phase `in_progress`.
Carry the selected roadmap text, the phase 2 exploration summary, and the OpenSpec change
name through every phase. Do not silently skip, combine, or retroactively complete phases.

This workflow has exactly nine phases. Do not add any others — in particular, roadmap
maintenance is not a phase of its own. Perform that work only when the audited OpenSpec
includes it as an apply task.

Phase 2 is the only phase that may be skipped, and only against its own triggers with the
reason stated. It is also the only phase a later phase may re-enter, because exploration
answers questions and a later phase can always turn up one it cannot answer in place.

| Phase | Gate |
| --- | --- |
| 1. Select | Exact roadmap scope and clean baseline recorded |
| 2. Explore (as needed) | Open questions resolved, or the skip justified |
| 3. Propose | Required OpenSpec artifacts exist |
| 4. Audit | Assumptions verified and OpenSpec validates |
| 5. Apply | Every implementation task is complete |
| 6. Simplify | Behavior-preserving cleanup is verified |
| 7. Review | Diff, requirements, tests, build, and lint pass |
| 8. Ship | Intended files alone are committed and pushed to `main` |
| 9. Archive | Deltas synced into the baseline and the change moved |

## Phase 1: Select the roadmap item

1. Read `AGENTS.md` and `openspec/config.yaml`. Read `docs/roadmap.md` in two slices:
   the header through "How to read this", then from the first unchecked checkbox to the
   end of the file — the checked items between are shipped history, read only when the
   selected item references one. Read any authority documents the item names, and
   whichever task docs `AGENTS.md` lists (docs/invariants.md, docs/testing.md,
   docs/workflow.md, docs/environment.md) the item's domain touches.
2. Record the initial branch, `git status --short`, and `git diff`. Treat every existing
   change as user-owned and exclude it from later staging.
3. Move to `main` before making changes. Fetch `origin` and fast-forward only. Stop if
   switching branches or updating `main` would overwrite work or require conflict resolution.
4. Find the first unchecked roadmap checkbox in document order. Read its complete body
   through the next roadmap checkbox, not only its heading.
5. Scope the change using `openspec/config.yaml` and the roadmap's sizing rules. If the
   item must be split, take only its first valid increment and state that the roadmap item
   will remain unchecked until all increments ship.
6. Announce the exact item, selected scope, and proposed kebab-case change name.

## Phase 2: Explore the selected item (as needed)

**CONDITIONAL SUB-SKILL:** Use `openspec-explore`, scoped to the selected item.

Run it when any of these hold:

- the roadmap text and the authority documents it names do not already fix the behavior
- more than one plausible approach exists and they would produce different specs
- the item touches code, data, or content this workflow has not yet mapped
- the roadmap text appears to conflict with what the repository currently does

Skip it when the roadmap text, its authority documents, and the existing specs already
determine the behavior and the integration points are known. Say that you are skipping
and why; never skip silently.

Exploration here is investigation, not an interview. Read and search the repository,
compare approaches against what already exists, and answer your own questions from the
code wherever the code can answer them. Ask the user only for a product decision the
repository cannot settle, and treat an unresolved one as a stop condition rather than a
guess to encode. Do not write application code, and do not create OpenSpec artifacts —
phase 3 owns those, and an artifact written here would bypass the audit.

End the phase with a short written summary: the problem as understood, the approach
chosen and the alternatives rejected, the constraints and invariants found (with file
references), and any question left open. That summary is phase 3's input.

### Fanning out exploration

Explore inline by default. A cold subagent re-derives context this workflow already
carries, so dispatch one only when the reading genuinely exceeds what one pass should
hold.

Fan out when the item spans independent domains — areas that can be read and understood
without reference to each other, such as a state store, the screens that consume it, and
the curriculum data behind them. Send one read-only agent per domain, in parallel, and
only for domains that are actually independent: questions that depend on each other's
answers belong in one agent, or inline. Two agents reading the same files is a sign the
split was wrong.

Give each agent concrete paths and specific questions, and require file-path-and-line
evidence for what it reports. Prohibit edits — exploration writes nothing, and that
holds for agents as much as for this workflow. Treat every result as a claim, not an
instruction: verify it locally before it enters the exploration summary, and discard what
does not survive that check. Phase 4's audit applies the same discipline to its own
reviewers; keep the two fan-outs distinct, because an unverified claim carried into the
proposal becomes an assumption the audit then has to catch.

### Re-entering exploration

Any later phase may return here when it raises a question it cannot answer in place — an
audit finding that needs investigation before it can be fixed or rejected, an
implementation that disproves an artifact assumption without making the replacement
obvious, or a review that exposes a design-level defect. Re-enter phase 2 for the open
question alone, then resume through the phase that owns the artifacts or code involved.
Record the re-entry and its outcome; do not fold new findings into a later phase silently.

A re-entry is one narrow question in code this workflow has already read, so answer it
inline. By this point a subagent would be the slower path, not the thorough one.

## Phase 3: Propose the OpenSpec change

**REQUIRED SUB-SKILL:** Use `source-command-opsx-propose`.

Pass it the full roadmap item text, selected scope, relevant identifiers verbatim, the
chosen change name, and the phase 2 exploration summary if one exists. Let that skill
create every artifact required for apply. When it returns, inspect the paths reported by
`openspec status --change "<name>" --json` and confirm the artifacts exist on disk.

Do not begin the audit while proposal artifacts are still missing or blocked.

## Phase 4: Audit and correct the OpenSpec

**REQUIRED SUB-SKILL:** Use `openspec-audit-proposal`.

Pass it the selected change name and follow its complete audit, correction, validation,
and reporting workflow. Treat its implementation-readiness result as this phase's gate.
Proceed only when it declares the change implementation-ready; stop when it reports the
change blocked or not ready. When a finding needs investigation before it can be fixed or
confidently rejected, re-enter phase 2 for that question and return here with the answer.

## Phase 5: Apply the audited change

**REQUIRED SUB-SKILL:** Use `source-command-opsx-apply`.

Use the audited change name. Follow that skill through every task, including its tests,
and update each task checkbox only after the work lands. If implementation disproves an
artifact assumption, return to phase 4 and invoke `openspec-audit-proposal` again for the
affected artifacts before resuming apply; re-enter phase 2 first when the assumption's
replacement is not obvious. Do not let the implementation and OpenSpec describe different
behavior.

Proceed only when every task is complete.

## Phase 6: Simplify the implementation

**REQUIRED SUB-SKILL:** Use `simplify`. (Pi hosts only: `simplify` is not a skill there —
use the `pi-simplify` extension's `/simplify` command, or apply this phase's discipline
inline if that command is unavailable. Every other host resolves `simplify` unchanged.)

Scope the review to this run's changed code. Apply only high-confidence,
behavior-preserving improvements and preserve repository domain boundaries. Inspect the
resulting diff and rerun the closest affected tests after every simplification batch.

Proceed only when simplification introduces no behavior or requirement change.

## Phase 7: Review and verify

Review the complete diff from the phase 1 baseline with fresh eyes. Trace every delta
requirement and checked task to implementation and tests. Check correctness, edge cases,
failure behavior, scope, maintainability, and consistency with repository invariants.
Fix confirmed defects, then repeat the review for the affected areas. A defect in the
design rather than the code belongs in phase 2 and then phase 4, not in a patch here.

Run and inspect all repository gates in this order:

```bash
npm test
npm run build
npm run lint
```

Run relevant targeted tests as needed. For a user-visible change, exercise it in a real
browser, the same way on every host: a Playwright script run from the shell, following
`docs/environment.md`. Reuse an installed Chromium; do not run the browser-install
command if it is already present. The script prints only a compact pass/fail summary,
and it lives with its dependencies in a scratch directory outside the repo, so it can
never leak into the phase 8 diff. Do not ask the user to open a page, start the server,
or perform the browser checks. If Chromium is missing, follow the conditional setup in
`docs/environment.md`; if the host cannot install it, stop and report that capability as
the blocker.

Re-run all three gates after any review fix. The three documented pre-existing
`Settings.tsx` lint warnings may remain; investigate every other warning or failure.

Finally, rerun OpenSpec validation and confirm every task remains checked. Proceed only
when the verified diff contains no unexplained or unrelated changes.

## Phase 8: Commit and push to main

Confirm `HEAD` is `main` and fetch `origin`. If `origin/main` advanced after phase 7,
stop before staging or committing because the verified base is stale. Do not merge,
rebase, or rewrite shared history inside this workflow.

Stage only the explicit paths produced by this workflow; never use a broad staging command
that could capture phase 1 baseline changes. Inspect `git diff --cached` and confirm it is
the same diff verified in phase 7. Match the repository's recent commit style, commit, and
push with:

```bash
git push origin main
```

Do not create a branch or pull request. Stop if the staged diff differs from the verified
diff, credentials are unavailable, branch protection rejects the push, or the push is not
a safe fast-forward.

## Phase 9: Archive the shipped change

**REQUIRED SUB-SKILL:** Use `openspec-archive-change`.

Archive only once the push has landed, and as its own commit. The archive is bookkeeping
about work that already shipped, so folding it into phase 8 would mean committing a diff
phase 7 never verified — and moving the change directory earlier would pull it out from
under phase 7's validation. That skill prompts before syncing; in this workflow the answer
is always to sync, because the next change has nothing accurate to amend otherwise.

1. Confirm the change is genuinely complete: every artifact `done` or `skipped`, every task
   checked. Stop and report rather than archiving unfinished work.
2. Sync the delta specs into `openspec/specs/` **before** the change directory moves, then
   move it. `openspec archive "<name>" --yes` does both, in that order.
3. Inspect the diff to `openspec/specs/`. Confirm each `ADDED` requirement arrived intact
   and each `MODIFIED` one carries its changes with its other scenarios still present.
   Expect no deletions: the merge can reflow surrounding lines, and that churn is yours to
   correct so the baseline stays consistent with the specs beside it.
4. Correct whatever the archive falsifies — the active-queue line in `docs/workflow.md`
   is the usual one.
5. Re-run `openspec validate --specs --strict`, confirm the active queue is empty, then
   commit and push.

The archive directory is named for the date it is archived, which is not always the date
the work shipped. Leave that difference standing rather than back-dating it.

## Stop conditions

Stop at the current phase, leave the tree coherent, and report the blocker when:

- an audit or review finding cannot be fixed or confidently rejected
- the work requires an unresolved product decision or a larger change than selected
- exploration cannot settle a question the proposal or implementation depends on, or a
  re-entry returns to the same unresolved question
- a test, build, lint, or OpenSpec validation failure cannot be resolved in scope
- pre-existing work cannot be isolated from this workflow's changes
- updating or pushing `main` would require conflict resolution or history rewriting
- the synced baseline does not match the delta the change declared

Never use a later phase to hide an incomplete earlier phase.

A blocked archive does not un-ship the change. If phase 9 stops, say so plainly and leave
the change active rather than reverting a push that was already verified.

## Final report

Report the roadmap item and scope, what exploration decided or why it was skipped
(including any re-entry and its outcome), OpenSpec change name, implementation summary,
audit/review corrections, exact verification results, both commit SHAs and subjects, push
results, the archived change's directory name, and any pre-existing files left untouched.
