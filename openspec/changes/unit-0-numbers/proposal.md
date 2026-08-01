## Why

Stage A has the infrastructure it needs but none of its eight skills are playable, so a
learner who needs the true beginning of the course currently starts in addition instead of
with whole-number meaning. Roadmap item 6 completes Unit 0 now that authored choice input is
available.

## What Changes

**Scope: Stage A · Unit 0 · Numbers & Place Value.** Skill ids, verbatim from
`docs/curriculum.md`: `read-numbers` (0.1, `quick`), `place-value-tens` (0.2),
`place-value-hundreds` (0.3), `expanded-form` (0.4), `compare-numbers` (0.5),
`order-numbers` (0.6), `round-to-10` (0.7), and `round-to-100` (0.8, wall).

- Add one generator for each Unit 0 skill, in curriculum order, with difficulty-scaled
  whole-number ranges and answers derived from the generated values.
- Use the shipped choice-input path for comparing and ordering, the two Unit 0 consumers named
  by roadmap item 5. Reading, place-value, expanded-form, and rounding use the custom numeric
  keypad.
- Extend the machine-readable display contract so representation tasks that are not binary
  arithmetic can still have their answers independently recomputed from what is shown.
- Predict the characteristic errors for every generator. In particular, `round-to-100`
  predicts both rounding to the wrong neighbouring hundred and mishandling an exact midpoint,
  with at least two distinct values surviving central filtering on every generated problem.
- Add seeded generator coverage and recorded learner-facing output for all eight skills,
  including synthetic cases proving the new independent-recomputation checks can fail.
- Mark all eight curriculum rows built, update the playable count and unlock snapshot, and
  check roadmap item 6 because the selected unit ships as one increment.

### Non-goals

- New input or rendering capability. Choice input is already built and declared for Stage A;
  this change does not add KaTeX, fraction input, diagrams, number-line, coordinate-plane, or
  chart rendering.
- Skill-tree navigation, stage checkpoints, skipping ahead, or review. The current flat Home
  surface will gain the Unit 0 cards in curriculum order; roadmap items 8, 9, 26, and 27 own
  those broader flows.
- Unit 2 content or any later stage. This change is exactly one content unit, following the
  repository sizing rule.
- Changes to progress storage or sync. Generator availability changes the derived unlock
  graph, but no stored schema or endpoint payload changes.
- A general free-text answer mode. Number names and expanded forms are displayed and answered
  as whole digits; comparison signs and ordered lists use declared choices, so the app
  continues to use only custom controls.

## Capabilities

### New Capabilities

None. Stage A's only declared requirement is the already-available `choice-input` capability.

### Modified Capabilities

- `problem-generation`: **ADDED** — non-arithmetic whole-number representation problems carry
  enough structured data to recompute keypad and choice answers independently from the
  learner-visible display, just as arithmetic expressions already do.

## Impact

**Code and tests:** a new Unit 0 generator module and snapshots; the curriculum registry;
inline-display metadata and the independent answer-recomputation test support needed by all
eight tasks; coverage and progress tests whose implemented set and unlock edges change.

**Documents:** `docs/curriculum.md` gains eight ✅ markers; `docs/roadmap.md` gains the new
playable count and shipped marker for item 6; `AGENTS.md` records the active change until its
archive commit restores an empty queue.

**Systems:** no dependency, API, progress-record, sync, or manifest-schema change. The Stage A
manifest already contains the exact ids, pacing flags, wall marker, prerequisites, and
`choice-input` requirement.
