## 1. Fraction semantics and diagnosis

- [x] 1.1 Add simplification and two-fraction comparison arms to the closed fraction display
  data, independent verifier, and recorded-output formatter.
- [x] 1.2 Add synthetic independent-verifier tests for valid simplification/comparison answers,
  visible-data mismatches, incorrect stated answers, and malformed semantic data.
- [x] 1.3 Parse valid numeric submissions before misconception matching while preserving invalid,
  integer, decimal, and numeric-choice behavior.
- [x] 1.4 Add focused diagnosis tests for simple fractions, decimals, integers, numeric choice ids,
  and unfinished fraction entries.

## 2. Lowest-terms generator

- [x] 2.1 Implement `simplify-fractions` with reducible seeded draws, structured notation,
  fraction keypad rules, `requireSimplified`, two non-colliding one-part-reduction predictions,
  concise hints, and worked solutions.
- [x] 2.2 Add independent `simplify-fractions` tests for displayed-data agreement, exact lowest
  terms, unreduced and partial-form responses, both misconception formulas, draw bounds,
  prediction survival, and difficulty scaling.

## 3. Comparison generators

- [x] 3.1 Implement `compare-same-den` with distinct proper fractions, structured notation,
  numeric stable-id relation choices, seeded shuffling, concise hints, and worked solutions.
- [x] 3.2 Add independent `compare-same-den` tests for notation/data agreement, exact relation,
  choice id/label agreement, non-degenerate draws, relation variety, and difficulty scaling.
- [x] 3.3 Implement `compare-diff-den` with unequal proper fractions whose exact relation opposes
  numerator-only comparison, numeric stable-id choices, two surviving wall diagnoses, concise
  hints, and worked solutions.
- [x] 3.4 Add independent `compare-diff-den` tests for exact rational comparison,
  numerator-only reversal, choice id/label agreement, both misconception formulas, denominator
  variety, prediction survival, and difficulty scaling.

## 4. Registry, authorities, and recorded output

- [x] 4.1 Append the three generators in manifest order, update Unit 7 recorded-output snapshots,
  and pin intended input modes, rendered fields, and difficulty growth for all nine skills.
- [x] 4.2 Update coverage to pin all nine Unit 7 skills implemented, Unit 8 planned, course and
  unlock order, and the 70-skill playable total.
- [x] 4.3 Mark curriculum rows 7.7–7.9 built and update README and roadmap status text while
  leaving roadmap item 19 unchecked.

## 5. Verification

- [x] 5.1 Run strict OpenSpec validation, focused answer/generator/Unit 7/coverage tests, the full
  test suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 5.2 Run the real app at 375 pixels using `docs/environment.md`, complete representative
  lowest-terms and same/different-denominator comparison problems, inspect notation and control
  layout, capture the required screenshot, stop temporary services, and confirm their ports are
  free.
