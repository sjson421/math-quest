## Why

`docs/curriculum.md` defines 201 skills across 8 stages and 23 units, but it is prose.
Nothing enforces it. The ~23 content changes that follow will each introduce a dozen or
more skill ids and prerequisite edges, and there is currently no mechanism to stop them
drifting — a typo'd id, a prerequisite pointing at a skill that never got built, or two
units both claiming `simplify-fractions` would all pass silently today.

Encoding the curriculum as a validated manifest first means every later change is checked
against one authority instead of against a document someone has to remember to read.

## What Changes

- Add a **machine-readable curriculum manifest**: all 8 stages, 23 units, and 201 skill
  ids from `docs/curriculum.md`, with prerequisite edges, per-stage capability
  requirements, and `quick` / wall markers.
- Skills declare their **planned** id and metadata before a generator exists. The manifest
  is the roster; generators fill it in over time. A skill with no generator yet is
  `planned`, not missing.
- Add **validation tests** over the manifest: acyclic prerequisite graph, every id unique,
  every prerequisite resolvable, every skill reachable from a root, stage/unit counts
  matching the document.
- Add a **coverage test** asserting that every generator registered in `src/curriculum/`
  corresponds to a manifest entry, and flagging manifest entries with no generator as
  `planned` rather than failing. This is the drift check.
- Encode the **content style contract** as an enforceable rule set, with a test that
  checks each implemented skill's hint and solution against the limits (≤4 steps, ≤12
  words per step, 1 hint sentence).
- **No breaking changes.** All six existing generator ids (`add-facts`, `sub-facts`,
  `add-2digit-nocarry`, `add-2digit-carry`, `sub-2digit-borrow`, `add-3digit`) already
  match the curriculum document verbatim. The manifest assigns `sub-facts` and
  `sub-2digit-borrow` to Unit 2 rather than Unit 1, but unit membership is manifest data —
  no generator code changes. Physically relocating them is `split-add-sub-units`.

## Capabilities

### New Capabilities

- `curriculum-manifest`: The canonical structure of the course — stages, units, skills,
  ids, prerequisite edges, capability requirements, and the `planned` vs `implemented`
  distinction. Includes the validation rules that keep it internally consistent and in
  sync with the generators that exist.
- `skill-progression`: The rules governing movement through the manifest — mastery levels
  0–5, the unlock threshold, how mastery maps to generator difficulty, and `quick` skills
  ending at 5 correct instead of 10. Codifies behaviour that currently exists only in
  `src/store/progress.ts`.
- `skill-content-contract`: The authoring limits every skill's learner-facing text must
  satisfy, and how they are enforced.

### Modified Capabilities

None. `openspec/specs/` is empty; this change establishes the first specs.

## Impact

**New files**
- `src/curriculum/manifest.ts` — the 201-entry manifest, as data
- `src/curriculum/manifest.test.ts` — graph, uniqueness, reachability, coverage
- `src/lib/content-rules.ts` + test — the style contract as an enforceable check

**Modified**
- `src/curriculum/index.ts` — resolve generators against the manifest, expose `planned`
- `src/lib/types.ts` — `SkillGenerator` gains a manifest-id link; add `quick` flag
- `docs/curriculum.md` — reconcile any id the manifest exercise proves wrong

**Not modified:** no generator logic, no UI, no store behaviour, no data model. Existing
progress data stays valid because skill ids are additive here.

**Dependencies:** none. No new packages.

**Risk:** low. The manifest is inert data until a generator references it, and the tests
are additive. Existing generator ids already agree with the curriculum document, so there
is no reconciliation to perform — the main risk is transcription error across 201 hand-
entered ids, which the uniqueness and reachability tests exist to catch.

## Non-goals

- **No generators.** Not one problem generator is written or modified. Content arrives
  one-change-per-unit afterwards.
- **No UI.** The skill tree, stage map, and progress display are out of scope.
- **No new capabilities enabled.** KaTeX, fraction input, diagram rendering, coordinate
  input, and chart rendering are *recorded* in the manifest as per-stage requirements, but
  none are built here.
- **No pacing mechanics.** Warm-up problems, silent difficulty recovery, and max-2-unlocks
  belong to `learner-pacing`.
- **No skip-ahead.** Mark-as-mastered belongs to `skip-ahead`, though this change defines
  the mastery values it will write.
- **No spaced repetition.** The manifest carries no scheduling data.
- **No unit reorganisation.** Splitting the existing add/sub unit is `split-add-sub-units`.
