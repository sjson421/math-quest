---
name: ship-roadmap-item
description: Use when asked to implement or ship the first unchecked item in Math Quest's docs/roadmap.md, or to run the repository's complete roadmap-to-main workflow.
---

# Ship Roadmap Item

Take the first unchecked roadmap item from planning through a verified push to `main`.
Keep every phase separate: finish and verify one phase before starting the next.

## Workflow control

Create a plan with the seven phases below and keep exactly one phase `in_progress`.
Carry the selected roadmap text and OpenSpec change name through every phase. Do not
silently skip, combine, or retroactively complete phases.

This workflow has exactly seven phases. Do not add separate sync, archive, or roadmap
maintenance phases. Perform that work only when the audited OpenSpec includes it as an
apply task; otherwise finish with the verified commit and push requested here.

| Phase | Gate |
| --- | --- |
| 1. Select | Exact roadmap scope and clean baseline recorded |
| 2. Propose | Required OpenSpec artifacts exist |
| 3. Audit | Assumptions verified and OpenSpec validates |
| 4. Apply | Every implementation task is complete |
| 5. Simplify | Behavior-preserving cleanup is verified |
| 6. Review | Diff, requirements, tests, build, and lint pass |
| 7. Ship | Intended files alone are committed and pushed to `main` |

## Phase 1: Select the roadmap item

1. Read `AGENTS.md`, `docs/roadmap.md`, `openspec/config.yaml`, and any authority
   documents the roadmap item names.
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

## Phase 2: Propose the OpenSpec change

**REQUIRED SUB-SKILL:** Use `source-command-opsx-propose`.

Pass it the full roadmap item text, selected scope, relevant identifiers verbatim, and
the chosen change name. Let that skill create every artifact required for apply. When it
returns, inspect the paths reported by `openspec status --change "<name>" --json` and
confirm the artifacts exist on disk.

Do not begin the audit while proposal artifacts are still missing or blocked.

## Phase 3: Audit and correct the OpenSpec

**REQUIRED SUB-SKILL:** Use `openspec-audit-proposal`.

Pass it the selected change name and follow its complete audit, correction, validation,
and reporting workflow. Treat its implementation-readiness result as this phase's gate.
Proceed only when it declares the change implementation-ready; stop when it reports the
change blocked or not ready.

## Phase 4: Apply the audited change

**REQUIRED SUB-SKILL:** Use `source-command-opsx-apply`.

Use the audited change name. Follow that skill through every task, including its tests,
and update each task checkbox only after the work lands. If implementation disproves an
artifact assumption, return to phase 3 and invoke `openspec-audit-proposal` again for the
affected artifacts before resuming apply. Do not let the implementation and OpenSpec
describe different behavior.

Proceed only when every task is complete.

## Phase 5: Simplify the implementation

**REQUIRED SUB-SKILL:** Use `simplify`.

Scope the review to this run's changed code. Apply only high-confidence,
behavior-preserving improvements and preserve repository domain boundaries. Inspect the
resulting diff and rerun the closest affected tests after every simplification batch.

Proceed only when simplification introduces no behavior or requirement change.

## Phase 6: Review and verify

Review the complete diff from the phase 1 baseline with fresh eyes. Trace every delta
requirement and checked task to implementation and tests. Check correctness, edge cases,
failure behavior, scope, maintainability, and consistency with repository invariants.
Fix confirmed defects, then repeat the review for the affected areas.

Run and inspect all repository gates in this order:

```bash
npm test
npm run build
npm run lint
```

Run relevant targeted tests as needed. For a user-visible change, exercise it with the
browser preview; if the preview pane is unavailable, ask for it rather than starting a
dev server in the shell. Re-run all three gates after any review fix. The three documented
pre-existing `Settings.tsx` lint warnings may remain; investigate every other warning or
failure.

Finally, rerun OpenSpec validation and confirm every task remains checked. Proceed only
when the verified diff contains no unexplained or unrelated changes.

## Phase 7: Commit and push to main

Confirm `HEAD` is `main` and fetch `origin`. If `origin/main` advanced after phase 6,
stop before staging or committing because the verified base is stale. Do not merge,
rebase, or rewrite shared history inside this workflow.

Stage only the explicit paths produced by this workflow; never use a broad staging command
that could capture phase 1 baseline changes. Inspect `git diff --cached` and confirm it is
the same diff verified in phase 6. Match the repository's recent commit style, commit, and
push with:

```bash
git push origin main
```

Do not create a branch or pull request. Stop if the staged diff differs from the verified
diff, credentials are unavailable, branch protection rejects the push, or the push is not
a safe fast-forward.

## Stop conditions

Stop at the current phase, leave the tree coherent, and report the blocker when:

- an audit or review finding cannot be fixed or confidently rejected
- the work requires an unresolved product decision or a larger change than selected
- a test, build, lint, or OpenSpec validation failure cannot be resolved in scope
- pre-existing work cannot be isolated from this workflow's changes
- updating or pushing `main` would require conflict resolution or history rewriting

Never use a later phase to hide an incomplete earlier phase.

## Final report

Report the roadmap item and scope, OpenSpec change name, implementation summary,
audit/review corrections, exact verification results, commit SHA and subject, push result,
and any pre-existing files left untouched.
