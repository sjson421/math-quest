---
name: ship-roadmap-item
description: Use when asked to implement or ship the first unchecked item in Math Quest's docs/roadmap.md, or to run the repository's complete roadmap-to-main workflow.
---

# Ship Roadmap Item

Take the first unchecked roadmap item from planning through a verified push to `main`.
Preserve every phase and finish its gate before entering the next.

## Workflow control

Create a plan with exactly these ten phases and keep exactly one `in_progress`:

| Phase | Gate | Read on entry |
| --- | --- | --- |
| 1. Select | Exact scope and clean baseline recorded | `references/select.md` |
| 2. Explore (as needed) | Questions resolved or skip justified | `references/explore.md` |
| 3. Propose | Required OpenSpec artifacts exist | `references/propose-audit.md` |
| 4. Audit | Assumptions verified and OpenSpec validates | already loaded |
| 5. Apply | Every implementation task is complete | `references/apply.md` |
| 6. Simplify | Behavior-preserving cleanup is verified | `references/simplify.md` |
| 7. Review | Diff and every verification gate pass | `references/review.md` |
| 8. Clean up | Only intended changes remain | `references/finish.md` |
| 9. Ship | Intended files are committed and pushed | already loaded |
| 10. Archive | Deltas are synced and change is archived | already loaded |

Reference paths are relative to this file. Read a reference only when its phase group is
entered; never preload later references or follow references from references.

Carry these values between phases:

- exact selected roadmap text and selected increment
- initial branch, HEAD, status, diff, and user-owned paths
- phase 2 summary or explicit skip reason
- OpenSpec change name and artifact paths

Do not add, combine, silently skip, or retroactively complete phases. Phase 2 alone may be
skipped under its reference's rules. A later phase may re-enter phase 2 for one unresolved
question, then must resume through the phase that owns any affected artifact or code.
Roadmap maintenance is not a phase; perform it only when the audited change includes it.

## Required skills

Use the normal skill names when their phase begins:

- Phase 2: `openspec-explore`
- Phase 3: `openspec-propose`
- Phase 4: `openspec-audit-proposal`
- Phase 5: `openspec-apply-change`
- Phase 6: `simplify`
- Phase 10: `openspec-archive-change`

## Agent contract

Work inline unless an applicable phase calls for independent review. Default to one
read-only reviewer. Use two or three only when changed paths form disjoint domains with no
overlapping file; every reviewer applies reuse, quality, and efficiency checks to its own
domain. Never split by perspective over the same paths.

Every delegated reviewer MUST use no inherited turns, `gpt-5.6-terra`, and medium
reasoning. Pass only the repository root, baseline SHA, explicit assigned paths, focused
questions, and concise output format. Never paste the full diff, artifacts, parent
conclusions, user history, or unrelated paths. Require concise `file:line` findings and no
edits. Treat results as claims: the parent verifies every finding before accepting or
fixing it.

## Stop conditions

Stop in the current phase with a coherent tree when a finding cannot be fixed or rejected,
a required product decision is unresolved, scope must materially expand, a gate cannot be
made green in scope, user-owned work cannot be isolated, temporary work cannot be safely
reverted, origin advanced after verification, pushing requires conflict/history rewriting,
or archive sync does not match its delta. Never use a later phase to hide an incomplete
earlier phase. A blocked archive leaves the already-shipped implementation in place and the
change active.
