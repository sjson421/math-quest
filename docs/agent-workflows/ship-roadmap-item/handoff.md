# Roadmap workflow: cross-session handoff

The workflow keeps its original ten ordered phases but runs in four sessions:

| Skill | Owned phases | Required incoming status | Outgoing status |
| --- | --- | --- | --- |
| `prepare-roadmap` | 1. Select through 3. Propose | no active run | `ready-to-audit` |
| `audit-roadmap` | 4. Audit | `ready-to-audit` | `ready-to-implement` |
| `implement-roadmap` | 5. Apply | `ready-to-implement` | `ready-to-review` |
| `review-roadmap` | 6. Simplify through 10. Archive | `ready-to-review` | complete |

Never add, combine, silently skip, or retroactively complete phases. Phase 2 alone may be
skipped under `explore.md`.

The workflow runs forward only. No session returns a run to an earlier skill, and no status
sends a prepared change back to preparation. When a later phase invalidates an artifact
assumption, the session that discovers it amends the change in place under **Forward
amendment** and continues. Do not repeat selection, and do not silently fold a design
discovery into implementation or review.

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
- exploration summary or explicit skip reason, and every forward amendment
- OpenSpec change name and artifact paths
- review mode, fallback reasons, gate results, and verified-diff digest
- implementation and archive commit SHAs and subjects

The preparation session creates the one active roadmap state directory and its baseline; no
later session recreates either. Later sessions locate exactly one state with their required
incoming status and verify its repository root, change name, artifacts, baseline snapshots,
user-owned paths, and current Git state before working.
Stop on a missing, ambiguous, stale, corrupt, or mismatched handoff. Never repair state by
guessing from the worktree.

State files are run-owned bookkeeping, not workflow paths to stage. Retain them when blocked
and report the exact directory. After phase 10 and its push succeed, remove only the known
files in that run directory and then its empty directories; never use broad or recursive
cleanup.

## Forward amendment

Any phase from 4 onward may find that an artifact assumption is wrong. The session that finds
it owns the correction and stays within its own phase group.

1. Re-enter exploration inline for the one question the artifacts cannot answer. Investigate
   the repository first. Ask the user only for a product decision the repository cannot settle,
   and ask it in this session rather than deferring it to a later one.
2. Revise the affected artifacts with `openspec-update-change`, which keeps them coherent and
   writes no application code. Amend only what the discovery invalidates.
3. Record the discovery, the decision and its evidence, and the revised artifact paths in
   `exploration.amendments`. Every completed phase stays completed and the workflow status is
   unchanged.
4. Re-verify with exactly one fresh read-only reviewer over the revised artifact paths only,
   under the independent review contract. Verify every finding before accepting it.
5. Resume the current phase at the point the discovery interrupted.

An amendment that would push the increment past its `openspec/config.yaml` sizing, or that
belongs to a different capability, becomes its own roadmap change instead of a rewind: record
that decision in `exploration.amendments`, keep the current increment shippable without it, and
continue.

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
a required product decision stays unresolved after being asked, scope must
materially expand, a gate cannot be
made green in scope, user-owned work cannot be isolated, temporary work cannot be safely
reverted, origin advanced after verification, pushing requires conflict or history rewriting,
or archive sync does not match its delta. Never use a later phase to hide an incomplete
earlier phase. A blocked archive leaves the already-shipped implementation in place, the
change active, and the handoff retained.
