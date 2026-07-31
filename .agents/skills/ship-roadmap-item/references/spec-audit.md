# Brief: audit a freshly generated OpenSpec change

Pass this to a general-purpose subagent along with the change name, its directory under
`openspec/changes/`, and the roadmap item text it came from.

---

You are auditing an OpenSpec change that was generated minutes ago by another session.
Your value is that you did not write it: every assumption in these artifacts reads as
settled fact to the session that wrote it, and your job is to check them against the
repository instead.

**Report only. Do not edit any file.**

## Read first

- `AGENTS.md` — invariants and the workflow conventions this repo settled on
- `openspec/config.yaml` — project context, the non-negotiable design commitments, and
  the per-artifact `rules`
- `docs/curriculum.md` — authority for skill ids, unit membership, prerequisites, ✅ marks
- `docs/roadmap.md` — the item in scope and what the sequence says blocks what
- `openspec/specs/` — the baseline: what the system does *today*
- every artifact in the change directory
- **the actual source files any claim depends on** — this matters more than the rest.
  A proposal saying "the keypad already supports X" is a claim about
  `src/lib/`, not about itself.

## What to check

**Skill ids.** Every id in the change appears verbatim in `docs/curriculum.md` and
`src/curriculum/manifest/`. `times-7-8` is not `times-78`. Report any id that does not
resolve, and any skill claimed in scope that belongs to a different unit.

**Scope and sizing.** One unit per content change, one capability per capability change.
Tasks are one generator plus its tests, under two hours each. A change carrying two units,
or bundling capability work with the content it unblocks, is mis-scoped — the roadmap and
`config.yaml` both say so, and the failure shows up as a hundred-task list nobody finishes.

**Delta direction.** A requirement amending behaviour that already exists must be
`## MODIFIED` against one of the seven baseline capabilities (`curriculum-manifest`,
`skill-progression`, `skill-content-contract`, `problem-generation`,
`word-problem-phrasing`, `progress-sync`, `recovery-key`). `## ADDED` against behaviour
the baseline already describes is the common error here. Check each requirement against
`openspec/specs/` and say which way it should go.

**Deltas describe what will be built.** A requirement stating something the tasks do not
actually implement is an aspiration, and archiving an aspiration as fact is precisely the
mistake this repo has already made once (`curriculum-foundation` proposed lessons ending
at 5; the shipped number was 10). Cross-read the spec against `tasks.md` and flag every
requirement no task delivers.

**The non-negotiables.** From `openspec/config.yaml`: no hearts or lives; generators
compute their own answers from operands they chose, with no runtime LLM call; wrong
answers are diagnosed rather than rejected; custom keypad only, never the iOS keyboard;
progress is local and fragile, so anything touching the data model survives the sync
round trip (`reconcile()` merges per skill object, not per field); patient pacing —
splitting a hard skill beats one skill that takes three attempts. A change contradicting
one of these is wrong, and saying so plainly is more useful than proposing a workaround.

**Capability gating.** `AVAILABLE_CAPABILITIES` in `src/curriculum/manifest/resolve.ts` is
currently empty. If the stage in scope declares a `requires` that is not in that set, the
content cannot resolve as `implemented` no matter how good the generators are. Say which
capability is missing and whether the change acknowledges it.

**Content contract.** 1 teaching sentence, 1 worked example, 1-sentence hint, ≤4 solution
steps of ≤12 words, ≤1 new vocabulary word, no forward references to later units, blurbs
≤32 characters, adult tone throughout. Also: a skill marked a wall needs ≥2 predicted
misconceptions that *survive* — `generateProblem()` drops any whose value equals the
correct answer and dedups by value, so the count in the source is not the count that
counts.

**Testing plan.** Does `tasks.md` actually commit to ~1000 seeded problems per generator
with answers recomputed independently from what is displayed? Determinism per seed, no
degenerate output, difficulty that scales? If a task says "add tests" and nothing more,
that is a finding.

**Documents that must move together.** If the change touches skill rows, ids, or ✅ marks,
`docs/curriculum.md` and the manifest have to change in the same change or the
cross-check fails. Flag any edit to one that has no counterpart in the other.

## How to report

Ranked most-serious first. For each finding:

- **What** — one sentence, stated as a defect rather than a suggestion
- **Where** — file and line in the change, plus the file and line of the evidence
- **Evidence** — the line you read that contradicts it, quoted
- **Fix** — the smallest correction that resolves it

Separate confirmed defects from things you suspect but could not verify, and say which is
which. If you found nothing in a category, say so — an audit that returns "no problems"
looks identical to one that never ran, and being explicit about coverage is what
distinguishes them.
