## 1. Exact decimal semantics

- [x] 1.1 Add coefficient-and-scale decimal value and operation data, decimal formatting,
  inline and column display support, recorded formatting, and exhaustive difficulty source
  measurement.
- [x] 1.2 Extend independent generator verification to reconstruct every decimal display and
  re-derive place, reading, comparison, rounding, addition, and subtraction answers with
  integer/rational arithmetic.
- [x] 1.3 Add synthetic verifier and component tests for exact `0.1 + 0.2`, retained trailing
  zeros, display/data disagreement, wrapped decimal-reading prose, decimal-column alignment,
  and incorrect stated answers.

## 2. Decimal meaning and reading

- [x] 2.1 Implement `decimal-place-value` with tenths/hundredths draws, exact digit answers,
  adjacent-place predictions, concise hints, and worked solutions (under two hours).
- [x] 2.2 Add independent `decimal-place-value` tests for display/data agreement, requested
  digit derivation, prediction formulas, zero placeholders, bounds, variety, and difficulty
  growth (under two hours).
- [x] 2.3 Implement `read-decimals` with seeded words-through-hundredths displays, exact decimal
  keypad answers, zero-place predictions, concise hints, and worked solutions (under two
  hours).
- [x] 2.4 Add independent `read-decimals` tests for word/data agreement, exact answers, zero
  placeholders, prediction formulas, bounds, variety, and difficulty growth (under two
  hours).

## 3. Decimal comparison and rounding

- [x] 3.1 Implement `compare-decimals` with unequal one-place/two-place traps, seeded operand
  order, relation choices, and the `longer-means-bigger` and `called-equal` wall predictions
  (under two hours).
- [x] 3.2 Add independent `compare-decimals` tests for exact ordering, choice mapping, named
  trap construction, two-prediction survival on every draw, bounds, variety, and difficulty
  growth (under two hours).
- [x] 3.3 Implement `round-decimals` with named whole/tenth targets, exact half-up integer
  arithmetic, and unchanged/wrong-direction predictions (under two hours).
- [x] 3.4 Add independent `round-decimals` tests for target-place display agreement, midpoint
  behavior, round-up/down coverage, prediction formulas, nondegenerate draws, and difficulty
  growth (under two hours).

## 4. Decimal addition and subtraction

- [x] 4.1 Implement `add-decimals` with normalized exact coefficients, aligned decimal-column
  display, mixed precision, carry coverage, and computed alignment predictions (under two
  hours).
- [x] 4.2 Add independent `add-decimals` tests for rendered alignment, exact sums, mixed-scale
  normalization, carries, predictions, bounds, variety, and difficulty growth (under two
  hours).
- [x] 4.3 Implement `sub-decimals` with normalized ordered coefficients, aligned
  decimal-column display, mixed precision, borrowing coverage, and computed alignment
  predictions (under two hours).
- [x] 4.4 Add independent `sub-decimals` tests for rendered alignment, exact nonnegative
  differences, mixed-scale normalization, borrowing, predictions, bounds, variety, and
  difficulty growth (under two hours).

## 5. Registry, authorities, and recorded output

- [x] 5.1 Register Unit 9a in manifest order, add its recorded-output snapshots, and pin every
  intended display, answer, keypad, choice, misconception, hint, and solution field.
- [x] 5.2 Update coverage to pin six implemented and six planned Unit 9 skills, course/unlock
  order, bounded reading-prose output, and the 88-skill playable total.
- [x] 5.3 Mark curriculum rows 9.1–9.6 playable, update README and roadmap status text, and leave
  roadmap item 19 unchecked for Unit 9b and Units 10–11.

## 6. Verification

- [x] 6.1 Run strict OpenSpec validation, focused Unit 9/generator/coverage/component tests, the
  full test suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 6.2 Run the real app at 375 pixels using `docs/environment.md`; complete representative
  decimal reading, comparison, rounding, aligned addition, and borrowing-subtraction
  problems, inspect wrapping/control/column states, capture screenshots, stop temporary
  services, and confirm their ports are free.
