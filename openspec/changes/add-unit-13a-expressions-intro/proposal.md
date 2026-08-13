## Why

Unit 12 is complete and roadmap item 21's next ordered increment is 13a: the first six of
Unit 13's eight skills, opening Stage E's algebra content. `expression-input` (roadmap item
20) shipped both increments — non-scalar diagnosis and the variable-key pad with its
canonical-form comparison — so this is unblocked content work, and the first content ever
to consume `inputMode: 'expression'`.

## What Changes

- Add Unit 13 generators for `variable-meaning`, `evaluate-expression`,
  `words-to-expression`, `identify-like-terms`, `combine-like-terms`, and `distributive`.
- `variable-meaning` and `evaluate-expression` answer through the existing numeric keypad:
  the first substitutes a given value into a one-term expression, the second into a
  multi-term one, so the two are distinguishable by degree of substitution rather than by
  input shape.
- `identify-like-terms` answers through choice input: given a target term, pick which of
  several offered terms is a like term (same variable part).
- `words-to-expression`, `combine-like-terms`, and `distributive` answer through
  `inputMode: 'expression'` — the first content to use it. Each uses `answer: { kind:
  'expression', form: 'expanded' }`, since a distributed and undistributed form (or a
  reordered sum) count as the same answer at this content; the `'exact'` form that
  distinguishes them belongs to `factor-gcf` (13.8, increment 13b, out of scope here).
- Predict two distinct misconceptions for each of the three walls: `words-to-expression`
  reversing subtraction order ("5 less than x" read as `5 - x`), `combine-like-terms`
  collapsing unlike terms into one, and `distributive` distributing to only the first term.
- Register and record the six generators, mark curriculum rows 13.1–13.6 playable, and
  advance the documented playable total while leaving roadmap item 21 open for the
  remaining increments (13b, 14a, 14b, 15).
- Add `AlgebraData` — a source-operand payload for the six new operations — to the `inline`
  Display kind, alongside its existing `wholeNumber`/`decimal` fields, following the
  `PowerData` precedent from Unit 12: every built skill's independent verification (both
  the generic per-skill sweep and each skill's own recomputed-from-what's-displayed test)
  reads a structured payload rather than re-parsing learner-facing text, and this unit's
  `inline` displays are the first to carry a variable letter, which the existing numeric
  expression evaluator used for plain `inline` recomputation cannot parse.

## Non-goals

- Do not implement `distribute-negative` or `factor-gcf`; those are increment 13b, and
  `factor-gcf` specifically needs the `'exact'` expression form this change does not use.
- Do not implement any Unit 14 or Unit 15 skill.
- Do not add any new rendering, input, or answer-shape capability. `inputMode: 'expression'`
  and `canonicalForm`'s `'expanded'`/`'exact'` comparison already exist (item 20); this
  change only consumes them, as their first content-generator caller.
- Do not change the manifest graph, stage capability flags, progress model, or sync format.

## Capabilities

### New Capabilities

- `unit-13-expressions`: Playable Unit 13a variable-meaning, expression-evaluation,
  words-to-expression translation, like-term identification, and term-combining/
  distributing content under six manifest ids.

### Modified Capabilities

- `problem-generation`: an `inline` display already carries an optional `WholeNumberData` or
  `DecimalData` for independent verification of place-value/decimal content; add
  `AlgebraData` as a third optional field, populated whenever a problem's text contains the
  declared variable, so single-variable expression and substitution content is equally
  verifiable without a new Display kind.

## Impact

- New Unit 13 generator and focused test modules under `src/curriculum/`.
- Registry, coverage snapshots/assertions, curriculum status markers, README summary, and
  roadmap progress text updated to reflect 127 playable skills.
- First real-app exercise of the `expression-input` capability's `ExpressionKeypad` outside
  its own component tests — verify live per docs/environment.md.
- No new package, network dependency, runtime service, migration, or public API.
