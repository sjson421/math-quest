# Roadmap workflow: cross-session handoff

The workflow keeps its original ten ordered phases but runs in four sessions:

| Skill | Owned phases | Required incoming status | Outgoing status |
| --- | --- | --- | --- |
| `prepare-roadmap` | 1. Select through 3. Propose | no active run or `needs-preparation` | `ready-to-audit` |
| `audit-roadmap` | 4. Audit | `ready-to-audit` | `ready-to-implement` |
| `implement-roadmap` | 5. Apply | `ready-to-implement` | `ready-to-review` |
| `review-roadmap` | 6. Simplify through 10. Archive | `ready-to-review` | complete |

Never add, combine, silently skip, or retroactively complete phases. Phase 2 alone may be
skipped under `explore.md`. When implementation or review invalidates an artifact assumption,
set the workflow status to `needs-preparation`, record the reason in
`exploration.reentries`, and stop that session. A new `prepare-roadmap` session re-enters only
the necessary exploration and proposal gates. A fresh `audit-roadmap` session then repeats
the audit before implementation resumes in a new `implement-roadmap` session. Do not repeat
selection or silently fold the correction into a later phase.

When setting `needs-preparation`, keep Select completed, reopen each affected Explore or
Propose gate as pending, reopen Audit as pending, and set `currentPhase` to the earliest
reopened phase. No phase remains `in_progress` after the returning session stops.

## Durable state

After phase 1 chooses the change name, create
`.agent-state/roadmap/<change-name>/state.json`. Keep baseline status and diff snapshots in
that directory and record their SHA-256 digests. The directory is ignored by Git and is the
authority between sessions; chat summaries are not. Keep exactly one phase `in_progress`
while a skill is running and update the state immediately after each gate.

Create `state.json` from the directly linked `state-template.json`; preserve its keys and
value types. Store snapshot paths relative to the run directory. Each `userOwnedPaths` entry
contains `path`, phase-1 `status`, and a deterministic `contentSha256` or `null` for a
phase-1 deletion.

The state records:

- repository root, schema version, workflow status, and all ten phase statuses
- selected roadmap text, exact increment, and skill ids
- initial branch, HEAD, origin SHA, status, diff paths and digests
- every pre-existing user-owned path, its status, and a deterministic content digest
- exploration summary or explicit skip reason
- OpenSpec change name and artifact paths
- review mode, fallback reasons, gate results, and verified-diff digest
- implementation and archive commit SHAs and subjects

The preparation session may create only one active roadmap state directory. On
`needs-preparation`, reuse that directory and preserve its baseline. Later sessions locate
exactly one state with their required incoming status and verify its repository root, change
name, artifacts, baseline snapshots, user-owned paths, and current Git state before working.
Stop on a missing, ambiguous, stale, corrupt, or mismatched handoff. Never repair state by
guessing from the worktree.

State files are run-owned bookkeeping, not workflow paths to stage. Retain them when blocked
and report the exact directory. After phase 10 and its push succeed, remove only the known
files in that run directory and then its empty directories; never use broad or recursive
cleanup.

## Independent review

Work inline unless a phase calls for independent review. Audit always uses exactly one
read-only reviewer over the complete artifact set. Do not split audit by path or perspective:
the parent must verify every finding, so extra reviewers add context without removing that
work. Other phases default to one reviewer and may use two or three only when changed paths
form disjoint domains with no overlapping file; each reviewer applies reuse, quality, and
efficiency checks to its own domain. Never split by perspective over the same paths.

Start each reviewer with fresh context. Pass only the repository root, baseline SHA,
explicit assigned paths, focused questions, and concise output format. Never paste the full
diff, artifacts, parent conclusions, user history, or unrelated paths. Require concise
`file:line` findings and no edits. Treat results as claims: the parent verifies every finding
before accepting or fixing it. Harness adapters own reviewer model and launch details.

## Stop conditions

Stop in the current phase with a coherent tree when a finding cannot be fixed or rejected,
a required product decision is unresolved, scope must materially expand, a gate cannot be
made green in scope, user-owned work cannot be isolated, temporary work cannot be safely
reverted, origin advanced after verification, pushing requires conflict or history rewriting,
or archive sync does not match its delta. Never use a later phase to hide an incomplete
earlier phase. A blocked archive leaves the already-shipped implementation in place, the
change active, and the handoff retained.
