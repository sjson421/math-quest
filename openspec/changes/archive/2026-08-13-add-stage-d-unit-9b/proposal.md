## Why

Unit 9's first six skills (9a) are playable, but the unit is unfinished: multiplication,
division, decimal/fraction conversion, and money application have no generators. Shipping
ordered increment 9b completes Unit 9, and resolves the conversion pair's long-flagged gap —
`checkAnswer` only compares exact rational value, so `3/4` and `0.75` are the same answer to
it, and `fraction-to-decimal`/`decimal-to-fraction` are each currently passable in precisely
the notation they are teaching away from.

## What Changes

- Add generators for Stage D Unit 9 skills `mult-decimals`, `div-decimal-by-whole`,
  `div-by-decimal`, `fraction-to-decimal`, `decimal-to-fraction`, and `money-problems` under
  their existing manifest ids.
- Extend the answer-entry contract with two new required-form flags on the `exact` answer,
  `requireDecimal` and `requireFraction`, checked against the same `ParsedInput.wasFraction`
  signal `requireSimplified` already uses, plus two new `CheckResult` statuses
  (`not-decimal`, `not-fraction`) so a numerically-right, wrong-form entry is diagnosed rather
  than accepted or bluntly marked wrong. `fraction-to-decimal` declares `requireDecimal`;
  `decimal-to-fraction` declares `requireFraction`.
- Exercise the named walls: `mult-decimals` on misplacing the decimal point,
  `div-by-decimal` on shifting only one of the two decimal points.
- Add a `money-problems` phrasing frame set (`src/curriculum/phrasing/money.ts`, price ×
  quantity), the last phrasing-bank consumer in Stage D alongside `fraction-words` and
  `ratio-words`.
- Add focused tests, recorded output, registry coverage, and real-app browser validation;
  mark curriculum rows 9.7–9.12 playable, update the playable count from 88 to 94, and leave
  roadmap item 19 open because Units 10–11 remain.

### Non-goals

- Any Unit 10 or Unit 11 skill.
- A general redesign of the `Answer` type (e.g. splitting `exact` into decimal/fraction
  kinds) — the two boolean flags follow the existing `requireMixed` precedent exactly and are
  scoped to this change's two skills.
- Currency notation, tax, or interest — `money-problems` is whole-and-cents arithmetic in a
  word-problem frame, not Unit 10's percent or Unit 12's simple-interest content.
- Arbitrary-precision or repeating decimals — division generators construct
  `quotient × divisor = dividend` so every result terminates exactly, mirroring Unit 4.
- Changing manifest membership, ids, prerequisites, stage requirements, progress, or sync.

## Capabilities

### New Capabilities

None. `money.ts` is a new phrasing frame file, not a new capability — `word-problem-phrasing`
already covers the phrasing-bank contract that frame sets satisfy.

### Modified Capabilities

- `unit-09-decimals`: generate and diagnose the remaining six Unit 9 skills, completing the
  unit.
- `answer-entry`: add `requireDecimal` and `requireFraction` as declarable required forms on
  an exact answer, with their own `CheckResult` statuses, feedback text, and submit response —
  extending the existing right-value-wrong-form mechanism rather than replacing it.
- `word-problem-phrasing`: add a money frame set alongside the existing addition,
  subtraction, multiplication, division, and fraction sets.

## Impact

A new Unit 9 tail (6 generators) and its tests; two new `Answer` flags, two new
`CheckResult` statuses, and their exhaustive handling in `checkAnswer` and `submit.ts`
(`feedbackText`, `responseTo`); a new money phrasing-frame module; registry and coverage
snapshots; curriculum/README/roadmap status text. No dependency, persistence, sync, manifest
graph, or rendering-capability change is required — the decimal and fraction keypads, and the
choice control, already exist.
