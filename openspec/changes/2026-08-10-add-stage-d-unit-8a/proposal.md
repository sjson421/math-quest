## Why

Unit 8 begins fraction arithmetic, but the first six skills — like-denominator addition and
subtraction, finding a common denominator, unlike-denominator addition (a major wall) and
subtraction, and converting an improper fraction to a mixed number — have no generators, so
the stage's first operation skills are not playable. Before `improper-to-mixed` can ship, the
learner needs a way to *enter* a mixed-number answer: `parseInput` already accepts `1 1/2`,
but the pad has no space key — its bottom row's two adaptive cells already carry the sign and
the slash-or-point, so a mixed answer cannot be produced today.

## What Changes

- Add generators for Stage D Unit 8 skills `add-frac-same-den`, `sub-frac-same-den`,
  `common-denominator`, `add-frac-diff-den`, `sub-frac-diff-den`, and `improper-to-mixed`
  under their existing manifest ids.
- Extend the answer-entry surface with mixed-number entry: a new `allowMixed` keypad rule
  that places a space key in the pad's adaptive left cell (the cell the sign otherwise
  occupies), a matching grammar rule in `applyKey`, and a `wasMixed` flag on parsed fraction
  input so the checker can tell a mixed entry from an improper one.
- Add a `requireMixed` answer flag with a new `not-mixed` check result, mirroring the
  existing `requireSimplified`/`not-simplified` pair: a numerically right answer typed in
  improper form is acknowledged as the right amount but asked for in mixed form, keeps the
  worked solution hidden, records as incorrect, and re-queues. The `submit.ts` response table
  is keyed on the status union, so the new status is a compile-guided addition.
- Use structured fraction notation and independent semantic data for every new problem, so
  answers are recomputable from what the learner sees; diagnose predicted arithmetic
  mistakes by parsing the submission exactly before matching.
- Wall skills `add-frac-same-den` and `add-frac-diff-den` carry at least two distinct
  surviving predictions each after the central answer-collision and duplicate-value filter.
- Add independent Unit 8 tests, recorded-output updates, coverage updates, and real-app
  browser validation; mark curriculum rows 8.1–8.6 playable, update the playable count from
  70 to 76, and leave roadmap item 19 open until the remaining increments land.

### Non-goals

- Implementing any Unit 8.7–11 generator: `mixed-to-improper`, `add-mixed`, `sub-mixed`,
  `mult-fractions`, `div-fractions`, `fraction-words`. The mixed-entry decision made here
  binds 8b's `add-mixed`/`sub-mixed`; those skills still ship later.
- Required decimal/fraction output forms for Unit 9 (`fraction-to-decimal`,
  `decimal-to-fraction`) — that is increment 9b's decision, called out in the roadmap.
- Changing manifest membership, prerequisites, stage requirements, stored progress, sync
  data, or the math-notation/diagram rendering capabilities.
- Adding a negative-mixed-number entry path; Unit 8 answers are positive, and the adaptive
  cell that hosts the space key is the same cell the sign uses, so a problem may declare
  `allowMixed` or `allowNegative`, never both (see design).

## Capabilities

### New Capabilities

- `unit-08-fraction-operations`: Unit 8's first six fraction-operation skills, their
  structured semantics, and the wall diagnoses they must retain.

### Modified Capabilities

- `answer-entry`: Mixed-number entry (space key, grammar, `wasMixed` parsing) and the
  `requireMixed`/`not-mixed` right-value-wrong-form response join the existing keypad-rule
  and form-response contract.
- `problem-generation`: The recomputable-display requirement extends to mixed-number answers
  and improper-to-mixed conversions: the display carries the source improper fraction's
  integer values, and the whole part and remainder fraction are re-derived from them rather
  than trusted.

## Impact

The Unit 8 generator module (new), the keypad rules and `applyKey` grammar
(`src/lib/keypad.ts`), input parsing and answer checking (`src/lib/answer.ts`), the
submission response table (`src/lib/submit.ts`), the lesson feedback branch
(`src/components/Lesson.tsx`), the answer slot echo, the recorded-output formatter and its
snapshots, the coverage assertions and snapshot, the curriculum authority
(`docs/curriculum.md` rows 8.1–8.6 and the capabilities table), the README status line, and
the roadmap status text. No dependency, persistence, sync, manifest graph, or rendering
capability changes are required.
