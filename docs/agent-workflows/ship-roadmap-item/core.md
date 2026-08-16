# Ship Roadmap Item: Shared Contract

Take the first unchecked roadmap item from planning through a verified push to `main`.
Preserve every phase and finish its gate before entering the next.

## Workflow control

Use the adapter's native tracker with exactly these ten phases and exactly one phase in
progress:

| Phase | Gate | Reference |
| --- | --- | --- |
| 1. Select | Exact scope and clean baseline recorded | `select` |
| 2. Explore (as needed) | Questions resolved or skip justified | `explore` |
| 3. Propose | Required OpenSpec artifacts exist | `propose-audit` |
| 4. Audit | Assumptions verified and OpenSpec validates | `propose-audit` |
| 5. Apply | Every implementation task is complete | `apply` |
| 6. Simplify | Behavior-preserving cleanup is verified | `simplify` |
| 7. Review | Diff and every verification gate pass | `review` |
| 8. Clean up | Only intended changes remain | `finish` |
| 9. Ship | Intended files are committed and pushed | `finish` |
| 10. Archive | Deltas are synced and change is archived | `finish` |

The adapter links directly to every reference. Read a reference only when its phase group
is entered; never preload later references or follow references from references.

Carry these values between phases:

- exact selected roadmap text and selected increment
- initial branch, HEAD, status, diff, and user-owned paths
- phase 2 summary or explicit skip reason
- OpenSpec change name and artifact paths
- review mode and every fallback reason

Do not add, combine, silently skip, or retroactively complete phases. Phase 2 alone may be
skipped under its reference's rules. A later phase may re-enter phase 2 for one unresolved
question, then must resume through the phase that owns any affected artifact or code.
Roadmap maintenance is not a phase; perform it only when the audited change includes it.

## Required skills

Use the harness's normal skill mechanism when each phase begins:

- Phase 2: `openspec-explore`
- Phase 3: `openspec-propose`
- Phase 4: `openspec-audit-proposal`
- Phase 5: `openspec-apply-change`
- Phase 6: the adapter's behavior-preserving cleanup mechanism
- Phase 10: `openspec-archive-change`

## Independent review contract

Work inline unless an applicable phase calls for independent review. Default to one
read-only reviewer. Use two or three only when changed paths form disjoint domains with no
overlapping file; every reviewer applies reuse, quality, and efficiency checks to its own
domain. Never split by perspective over the same paths.

Start each reviewer with fresh context, `gpt-5.6-terra`, and medium reasoning. Keep the parent
on the environment-selected model, and do not vary the reviewer model by task. Pass only the
repository root, baseline SHA, explicit assigned paths, focused questions, and concise output
format. Never paste the full diff, artifacts, parent conclusions, user history, or unrelated
paths. Require concise `file:line` findings and no edits. Treat results as claims: the parent
verifies every finding before accepting or fixing it.

## Stop conditions

Stop in the current phase with a coherent tree when a finding cannot be fixed or rejected,
a required product decision is unresolved, scope must materially expand, a gate cannot be
made green in scope, user-owned work cannot be isolated, temporary work cannot be safely
reverted, origin advanced after verification, pushing requires conflict/history rewriting,
or archive sync does not match its delta. Never use a later phase to hide an incomplete
earlier phase. A blocked archive leaves the already-shipped implementation in place and the
change active.
