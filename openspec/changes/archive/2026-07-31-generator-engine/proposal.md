## Why

Six generators exist and 195 remain. Every one of those 195 will re-derive the same four
things: a difficulty ladder of operand ranges, a constrained draw that rejects degenerate
operands, a per-column carry/borrow trace, and a set of predicted wrong answers computed
from that trace. `src/curriculum/unit-01-add-sub.ts` writes all four by hand, six times.
Roughly a quarter of that file says nothing about addition.

The cost is not typing, it is correctness. Each hand-rolled copy is a place to be subtly
wrong in the one file where being wrong is unsurvivable — a bad answer key teaches the
learner that they are failing at something they got right. The digit-concatenation idiom
used to predict carrying errors, `` Number(`${tensSum}${onesSum}`) ``, already broke down
at three digits and `add-3digit` quietly switched to place-value subtraction instead. The
twelve-line comment in `sub-2digit-borrow` explaining why it needs a third misconception —
the first two collide under dedup whenever the ones digits are five apart — is the clearest
statement of what authoring costs today.

Word problems are in worse shape. They close Units 1–4 and 8–11, and `docs/curriculum.md`
calls them the weakest fit for procedural generation. Nothing in the current machinery
reaches them: `Display` has no variant that can carry prose, `Misconception.value` is a
number so comprehension errors cannot be predicted at all, and there is not one sentence
frame anywhere in `src/`.

This is the highest-leverage work left, and it is cheapest now, while six generators is a
small enough surface to refactor with confidence rather than fifty.

## Curriculum scope

Stage B, Unit 1 and Unit 2. The six ids already built — `add-facts`, `sub-facts`,
`add-2digit-nocarry`, `add-2digit-carry`, `sub-2digit-borrow`, `add-3digit` — are refactored
onto the engine with their output held byte-identical. One new id ships: **`add-words`**
(1.8), the word problem closing Unit 1, which exists to prove the phrasing bank against a
real skill rather than leaving it as untested scaffolding.

No new app capability is required. Nothing here needs KaTeX, fraction input, diagrams, or a
coordinate plane; `AVAILABLE_CAPABILITIES` stays empty and no stage flips on.

## What Changes

- Add a **generator engine** under `src/curriculum/engine/`: a column trace that derives
  every digit, carry and borrow once and feeds display, hint, solution steps and
  misconceptions from a single source; named difficulty ladders replacing the six retyped
  `Record<Difficulty, Band>` literals; a constrained operand draw; misconception factories
  for the recurring error families (off-by-one, operator swap, forgotten carry, flipped
  column, digit concatenation); and a problem builder that defaults the three fields every
  generator repeats verbatim.
- Add a **templated phrasing bank** for word problems: fixed sentence frames with generated
  numbers, selected from the seeded RNG so a story is as reproducible as an operand pair.
  Frames co-emit their own comprehension misconceptions, because only the frame knows which
  distractor quantities it mentioned.
- **`Display` gains a `story` variant** carrying the prose alongside a machine-readable
  operand pair. The pair is what keeps the independent-recomputation test honest: the
  harness must still be able to re-derive the answer from what the learner sees, and it
  cannot parse English.
- **Ship `add-words`** on that bank, taking the built count from 6 to 7.
- **Refactor the six existing generators** onto the engine, gated by a golden snapshot of
  sampled output taken before any extraction begins.
- **No breaking changes.** No learner-visible behaviour changes for the six existing
  skills — that is enforced, not asserted. No stored data shape changes, so no sync or
  migration concern.

## Capabilities

### New Capabilities

- `problem-generation`: The contract every generator meets and the machinery it is built
  from — determinism from `(skill, seed, difficulty)`, answers computed from the operands
  the generator just chose, answers independently recomputable from the rendered display,
  difficulty that actually scales, non-degenerate operands, and the requirement that shared
  helpers own each derivation once. Today these rules exist only as test assertions and a
  line in `openspec/config.yaml`; none of them is written down as a requirement.
- `word-problem-phrasing`: The templated bank — fixed frames with generated numbers rather
  than free generation, seeded frame selection, frames checked statically at their source
  instead of only when sampling happens to draw them, comprehension misconceptions emitted
  by the frame, and the story display carrying a verifiable operand pair.

### Modified Capabilities

- `skill-content-contract`: One added requirement. The contract is currently enforced by
  sampling generated problems, which is sound while every string is computed per problem.
  A frame bank breaks that assumption — a rare frame can go unsampled across 1000 draws and
  reach a learner unchecked — so authored text sources must also be checked at their source.
  No existing requirement is rewritten.

## Impact

**New files**

- `src/curriculum/engine/column.ts` — per-place digits, sums, carries, borrows, one trace
- `src/curriculum/engine/bands.ts` — named difficulty ladders and `band()`
- `src/curriculum/engine/draw.ts` — constrained operand draw over a band
- `src/curriculum/engine/misconceptions.ts` — prediction factories for the error families
- `src/curriculum/engine/problem.ts` — the problem builder
- `src/curriculum/engine/phrasing.ts` — frame types and seeded selection
- `src/curriculum/engine/index.ts` — the barrel a unit file imports
- `src/curriculum/phrasing/addition.ts` — the first frame set, used by `add-words`
- `src/curriculum/engine/*.test.ts` — unit tests per module, each reporting the offender
- `src/curriculum/__snapshots__/unit-01-add-sub.test.ts.snap` — the behaviour-preservation gate

**Modified**

- `src/lib/types.ts` — `Display` gains the `story` variant
- `src/components/ProblemView.tsx` — becomes an exhaustive switch, renders a story
- `src/curriculum/unit-01-add-sub.ts` — six generators onto the engine, plus `add-words`
- `src/curriculum/generators.test.ts` — `recompute()` handles the story display
- `src/lib/content-rules.ts` — `learnerText()` reaches story prose
- `src/curriculum/coverage.test.ts` — two hardcoded counts, 6 → 7
- `docs/curriculum.md` — ✅ on row 1.8, which the cross-check enforces
- `docs/roadmap.md` — the status line, 6 → 7

**Not modified:** `src/store/progress.ts`, `src/lib/sync.ts`, `api/progress.ts`. Nothing here
touches the progress record or the sync round trip. `AVAILABLE_CAPABILITIES` in
`manifest/resolve.ts` stays empty. The manifest itself gains nothing — `add-words` is already
declared at `stage-b.ts:69` and ships by gaining a generator.

**Dependencies:** none. No new packages.

**Risk: low, with one sharp edge.** The refactor touches the only six generators a learner
can currently play, and `generators.test.ts` recomputes answers but does not pin wording, so
an extraction could silently reword a hint. Mitigated by taking the golden snapshot first,
as its own task, before a single helper is written.

## Non-goals

- **No further content.** The rest of Unit 1, Unit 2, and Stage A are roadmap A1, sized one
  unit per change. `add-words` ships here only as the bank's proof, and this change does not
  make Unit 1 complete.
- **No new input mode or renderer.** The story display is prose plus an operand pair
  answered on the existing keypad. KaTeX, fraction input, diagrams, the number line and the
  coordinate plane are each their own change, none of them blocked by this one.
- **No richer misconception values.** `Misconception.value` stays a number. Comprehension
  errors in word problems are predictable as numbers because the frame knows its own
  distractor quantities; generalising the type is what coordinate and expression input will
  need, and it belongs with them.
- **No lesson-loop changes.** `TARGET_CORRECT` stays 10 and the `quick` flag stays unread.
  That is `learner-pacing` (roadmap B1).
- **No unlock rewiring.** `isUnlocked()` keeps walking the generators' hand-written
  prerequisites; moving it onto the manifest is `manifest-driven-unlock` (roadmap B2).
- **No word problems beyond `add-words`.** `sub-words`, `mult-words`, `div-words` and the
  Stage D set land with their own units, drawing on the bank this change establishes.
