## Why

`Home.tsx` renders every playable unit as a flat section in one scroll. That reads fine for
the 24 skills built today and does not survive the course: 23 units and 201 skills in one
column is a scroll with no landmarks, no sense of where the learner is, and no answer to
"how far through Unit 2 am I". The learner cannot see the shape of the course, and the
course cannot show them.

The list is also hand-maintained. `units` in `src/curriculum/index.ts` is an array a human
appends to, ordered correctly only because `coverage.test.ts` pins it — while the manifest
already knows every skill's unit and stage. Grouping by that hand-written array instead of
the manifest would build the hierarchy on the weaker of the two sources.

## What Changes

- Derive the **playable course structure** from the manifest and the generator registry:
  stages and units that hold at least one `implemented` skill, in curriculum order, each
  carrying its implemented skills. A unit or stage with no playable skill is absent, the
  same rule `planned` skills already follow.
- Replace Home's single flat scroll with **stage → unit → skill navigation**: a stage list,
  a unit list within a stage, and the existing skill cards within a unit.
- Show **per-unit progress** on the unit level and a per-stage summary on the stage level,
  both derived from stored mastery.
- Keep **planned skills, units and stages out of sight entirely**. A *locked* unit stays
  visible with its lock, because it is real course the learner is working toward; a
  *planned* one is not built and is not teased.
- Keep manifest order at every level of the hierarchy, extending the guarantee that
  currently covers skills only.
- Move back through the hierarchy without losing the level the learner came from.
- Update `docs/roadmap.md` and `AGENTS.md` to record what shipped.

This is navigation work for the whole course, not content. **No stage, unit, or skill id
from `docs/curriculum.md` changes, and no generator ships.** The skills in scope are exactly
the 24 already implemented — Unit 0 (`read-numbers`, `place-value-tens`,
`place-value-hundreds`, `expanded-form`, `compare-numbers`, `order-numbers`, `round-to-10`,
`round-to-100`), Unit 1 (`add-facts-small`, `add-facts`, `add-tens`, `add-2digit-nocarry`,
`add-2digit-carry`, `add-3digit`, `add-three-numbers`, `add-words`) and Unit 2
(`sub-facts-small`, `sub-facts`, `sub-tens`, `sub-2digit-noborrow`, `sub-2digit-borrow`,
`sub-3digit-borrow`, `sub-across-zero`, `sub-words`) — and they are in scope only as the
content the new surface must display unchanged.

**No new stage capability is required.** This needs no KaTeX, fraction input, diagram,
number-line, coordinate-plane, expression, chart, or timed mode, and
`AVAILABLE_CAPABILITIES` is untouched.

## Capabilities

### New Capabilities

- `skill-tree-navigation`: How the learner browses the course — the stage → unit → skill
  hierarchy, per-unit and per-stage progress, what stays hidden, and moving back up.

### Modified Capabilities

- `curriculum-manifest`: Add the derived playable course structure — which stages and units
  hold playable skills — alongside the existing per-skill `planned`/`implemented`
  derivation, so unit and stage visibility follows the manifest rather than a hand-written
  list.
- `skill-progression`: *Skills are presented in curriculum order* widens to the hierarchy.
  Stages and units are ordered by the manifest too, and the "no locked skill above an open
  one" invariant becomes a within-unit statement, because a learner can now open a unit
  whose skills are all still locked.

## Impact

- `src/curriculum/manifest/resolve.ts`: a derivation over stages, units and skill states
  producing the playable tree.
- `src/curriculum/index.ts`: that derivation over the live registry, replacing the
  hand-maintained `units` array as the tree's source.
- `src/components/`: Home split into stage, unit and skill levels; the existing skill card
  and its mastery bar reused unchanged.
- `src/App.tsx`: the `Screen` union gains the navigation levels it needs.
- `src/lib/types.ts`: `Unit`'s role changes now that membership and order come from the
  manifest; unit colour remains presentation.
- Tests: derivation coverage in `manifest/`, structure and ordering coverage in
  `coverage.test.ts`, and first-paint component coverage for each navigation level in the
  existing Node environment.
- Documentation: `docs/roadmap.md` item 8 and the `AGENTS.md` active-queue note.
- No progress schema, sync, API, generator, curriculum document, or dependency change.
  Stored progress is read, never written, by anything this change adds.

## Non-goals

- **No stage-boundary celebration or checkpoint screen** — roadmap item 9.
- **No answer to the branching question** — whether the course should ever open more than
  one skill at once, and the "max 2 unlocks at once" commitment in `docs/curriculum.md`,
  stay exactly as item 9 left them. This change presents the graph it is given.
- No review, spaced repetition, or per-skill strength surface — item 26.
- No skip-ahead entry points on any level — item 27.
- No cosmetics, room, or shop — items 15 and 16.
- No generator, no skill id change, and no new stage capability.
- No change to unlocking rules, mastery, difficulty, lesson length, re-queueing, or
  feedback.
