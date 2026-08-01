## Context

See `proposal.md` — *Why*. The existing independent content check assumes every answer is
numeric arithmetic: inline expressions, columns, and stories are recomputed over four
operators. Unit 0 is the first content whose answer comes from interpreting displayed whole
numbers — a digit's place, a number name, an expanded form, a relation, an ordering, or a
rounding target.

Choice input is already shipped, but no registered generator uses it. Roadmap item 5 names the
Unit 0 consumers precisely: `compare-numbers` and `order-numbers`. `Answer` can carry a stable
choice id and `ChoiceInput` keeps that id out of markup. Misconception diagnosis remains numeric
until roadmap item 20, so those two skills use numeric-string ids to receive the same specific
feedback as keypad answers.

The manifest already declares all eight ids, `read-numbers` as `quick`, `round-to-100` as a
wall, and Stage A's `choice-input` requirement. This change adds generators and
problem-generation evidence, not manifest data or capability infrastructure.

## Goals / Non-Goals

**Goals:**

- Make non-arithmetic whole-number displays as independently checkable as arithmetic displays.
- Keep every visible value, answer, distractor, hint, step, and diagnosis derived from one
  generated value set.
- Exercise the shipped choice-input path with phone-width options and specific wrong-answer
  feedback.
- Keep Unit 0 authoring self-contained without guessing at later diagram or expression needs.

**Non-Goals:**

- A new display renderer, input mode, stage capability, or `AVAILABLE_CAPABILITIES` entry.
- Generalising `Misconception.value` beyond numbers. Expression and point answers need that in
  roadmap items 20 and 22; numeric choice ids are sufficient here.
- Teaching number lines, negative numbers, fractions, or decimal place value.
- A localization framework for number names. The course is English-only today and this unit
  covers only 0 through 999.

## Decisions

### 1 · Add structured metadata to the existing inline display

The existing inline display gains optional `wholeNumber` metadata carrying generated values
and a closed operation union:

```ts
type WholeNumberOperation =
  | 'read'
  | 'tens-digit'
  | 'hundreds-digit'
  | 'expanded-form'
  | 'compare'
  | 'order-ascending'
  | 'round-to-10'
  | 'round-to-100'

type WholeNumberData = {
  values: number[]
  operation: WholeNumberOperation
}

type InlineDisplay = {
  kind: 'inline'
  text: string
  wholeNumber?: WholeNumberData
}
```

The generator derives `text` from those values: English number words for read, one numeral for
place and rounding, a sum of non-zero place parts for expanded form, two values with a question
mark for compare, and three separated values for order. The independent content check derives
the expected text again and fails if it disagrees, so the visible string cannot drift from the
metadata.

`ProblemView` keeps its existing inline branch. It may add a smaller responsive size for long
number-name text if phone-width rendering requires it, like the content-driven stack-size fix
that shipped with Unit 1. This is problem-generation evidence, not a new rendering capability:
no display kind, renderer, input mode, `Capability`, or availability switch is added.

**Alternative rejected: a new `whole-number` display kind.** That would require a renderer and
improperly bundle capability work with this content unit.

**Alternative rejected: infer the task from prompt prose.** The verifier intentionally does
not parse English. A prompt-dependent answer key would violate the display contract.

### 2 · Recompute visible text and answers from metadata

The generator test independently derives two things from `wholeNumber`: the inline text the
learner sees and the expected answer. Read, place-value, expanded-form, and rounding produce a
numeric expectation that is compared with the declared exact answer. Compare and order produce
an expected visible choice label; verification finds exactly one declared choice carrying that
label and compares its id with the declared choice answer.

Every declared choice id must also be unique. Without that check, a wrong-labelled button could
submit the correct id, while a label-to-id check still appeared clean.

Synthetic tests cover a wrong display string, a wrong numeric answer, a correct label mapped to
the wrong answer id, an absent or duplicated expected label, and duplicate ids. Each failure
names the display, so the checker is a reporting tool rather than a boolean that can silently
stop exercising a branch.

### 3 · Numeric choice ids reuse diagnosis and central filtering

Comparison and ordering declare numeric-string ids. Wrong ids are mirrored as numeric
`Misconception.value`s, so the existing `diagnose(problem, raw)` finds them without changing
the stored misconception model. Compare uses relation codes `-1`, `0`, `1`; order uses fixed
permutation codes. Seeded shuffling changes declaration order while the id travels with its
label.

`generateProblem()` derives a finite correct misconception value from a numeric choice id,
instead of the `NaN` it retains for opaque ids. It can then preserve its central invariant: a
prediction equal to the correct choice is removed and duplicates are deduplicated. Focused
tests prove both numeric and opaque choice ids behave deliberately.

**Alternative rejected: add string-valued misconceptions.** That larger content-contract
change belongs at roadmap item 20, where expression answers genuinely require it.

### 4 · Keep Unit 0 in its own registry unit

`unit-00-numbers.ts` exports `unit00` with exactly the eight generators in manifest order, and
`curriculum/index.ts` registers `[unit00, unit01]`. The generator names and blurbs match their
manifest entries verbatim, and coverage asserts that agreement plus the 32-character blurb
limit. This preserves Unit 1's recorded module and prevents the two authorities from drifting
silently on the Home card.

The committed unlock snapshot is reviewed as a graph. Unit 0 becomes the course prefix:
`read-numbers` is the new root, each Unit 0 skill follows the previous one, and
`add-facts-small` moves behind `round-to-100`. Practised skills remain open by the existing
read-time grandfathering rule, so no migration is added.

### 5 · Difficulty grows the source values, not every answer

Each skill declares an inline ladder because its mathematical range is its definition:

- `read-numbers`: draws 10 through 999, beginning with two-digit numbers and excluding shapes
  where its two place-error predictions collapse. The pure wording helper still covers 0–999.
- `place-value-tens`: starts with two digits and introduces three digits at higher levels; the
  answer remains one digit.
- `place-value-hundreds` and `expanded-form`: use three-digit values and widen toward 999.
- `compare-numbers`: widens from two to three digits and deliberately includes equal pairs as
  well as less/greater relations across the seeded sample.
- `order-numbers`: draws three distinct values and widens their range.
- rounding skills widen their upper bound while excluding exact multiples of the target, which
  would ask no rounding question.

Difficulty checks measure the carried source values for whole-number metadata, while existing
arithmetic keeps its answer-magnitude measurement. A synthetic flat whole-number ladder must
fail, and an arithmetic synthetic case pins the former path.

### 6 · Misconceptions are computed from the generated values

- `read-numbers`: a place swap and a dropped place, entered as the numeric keypad values those
  readings would produce.
- `place-value-tens`: the ones digit, and the whole multiple of ten instead of its digit. When
  the tens digit is zero in a three-digit value, the second prediction uses the hundreds digit
  instead, because zero tens would otherwise equal the correct answer and be filtered.
- `place-value-hundreds`: the tens digit, and the whole hundreds value instead of its digit.
- `expanded-form`: treating place digits as plain addends, and omitting a non-zero place value.
  When tens is zero, the second prediction omits hundreds so it remains distinct.
- `compare-numbers`: equality when values differ or a direction reversal; equal problems use
  one "picked a side" diagnosis for each inequality.
- `order-numbers`: descending order and a near-order with the last two values swapped.
- `round-to-10`: the lower and upper neighbours plus leaving the ones unrounded; central
  filtering removes whichever value is correct.
- `round-to-100` (wall): the lower neighbour, upper neighbour, and rounding only to tens. Draws
  keep nearest-ten distinct from both neighbouring hundreds, so filtering the correct neighbour
  leaves two diagnoses on every problem, including exact midpoints.

Comparison and ordering distractors use these same misconception values and are seeded-shuffled.
Keypad misconceptions use their values directly. No authored prediction may be always filtered;
the existing `alwaysFiltered` check covers every new skill.

### 7 · Number wording and expanded labels stay local to Unit 0

Pure helpers convert 0–999 to English words and format a three-digit value as non-zero place
parts. They live beside Unit 0 because no later planned unit is known to need English number
names, and moving them into the shared engine would advertise a general API the course has not
designed. Focused tests cover zero and zero-bearing forms (`0`, `105`, `120`) before snapshots
record the full authored surface.

The learner-facing content checker includes inline display text after this change. A synthetic
case proves an offending later-unit term in that new source is named; otherwise the number-name
surface could bypass the forward-reference rule simply because earlier inline text was only
arithmetic.

## Risks / Trade-offs

**A choice id is numeric but not semantic outside its generated problem** → Keep ids private,
verify through labels, and snapshot complete choice objects. Progress records only the
misconception tag, never the raw id.

**English number names or ordered choices crowd a phone** → Keep wording to 0–999, use three
short choices where choices apply, and exercise read, expanded, and order lessons at phone
width. A number-name fit fix stays inside the existing inline layout.

**A wall prediction is filtered and falls below two** → Constrain the rounding draw so
nearest-ten never equals a neighbouring hundred, then assert the post-filter count over the
full ~1000-problem sample.

**A flat whole-number ladder passes after the metric changes** → Pair the source-value metric
with a synthetic flat ladder it must reject, while retaining a numeric arithmetic case.

**Adding Unit 0 re-locks an existing learner behind a new prefix** → Add a focused store case
proving a practised `add-facts-small` stays open after its prerequisite changes.

**The new recomputation branch trusts generator fields** → Derive visible text and expected
answers independently from metadata and prove deliberately wrong synthetic cases fail.

## Migration Plan

No stored data migrates. Shipping the generators changes derived availability and unlock
edges at load. Rollback removes the Unit 0 registry entry and restores the previous derived
graph; existing progress objects remain valid in either version.
