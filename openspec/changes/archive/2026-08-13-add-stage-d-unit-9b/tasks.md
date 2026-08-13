## 1. Required-form answer checking

- [x] 1.1 Add `requireDecimal` and `requireFraction` to the `exact` `Answer` arm, add
  `not-decimal`/`not-fraction` to `CheckResult`, and check them in `checkAnswer` against
  `parsed.wasFraction` alongside the existing `requireMixed`/`requireSimplified` checks
  (under two hours).
- [x] 1.2 Extend `submit.ts`'s `feedbackText` switch and `responseTo` record with the two new
  statuses (right-value-wrong-form copy and response, no misconception, requeues, no
  solution), and extend `recorded-output.ts`'s `formatAnswer` to annotate both flags (under
  two hours).
- [x] 1.3 Add focused `answer.test.ts`/`submit.test.ts` cases: decimal answer entered as an
  equivalent fraction and vice versa, both flags independent of `requireSimplified`/
  `requireMixed`, and the exhaustive-switch compile guard (under two hours).

## 2. Decimal multiplication

- [x] 2.1 Add the `mult` `DecimalData` arm, widen `DecimalArithmeticData` to
  `'add' | 'sub' | 'mult'` so `decimal-column` accepts it, and extend `recorded-output.ts`'s
  `formatAnswer` exhaustive switch for it (under two hours).
- [x] 2.2 Implement `mult-decimals` with two hundredths-or-fewer operands, an exact product via
  integer coefficients, the misplaced-decimal-point wall prediction, concise hint, and worked
  solution (under two hours).
- [x] 2.3 Add independent `mult-decimals` tests for display/data agreement, exact products,
  misplaced-point prediction formula, bounds, variety, and difficulty growth (under two
  hours).

## 3. Decimal division

- [x] 3.1 Add the `div-whole` and `div-decimal` `DecimalData` arms (a whole-number divisor is
  a plain `number`, not a `DecimalValue`) and extend `recorded-output.ts`'s `formatDecimalData`
  exhaustive switch for both (under two hours).
- [x] 3.2 Implement `div-decimal-by-whole` constructing dividend = quotient × whole divisor for
  an exact result, with a concise hint and worked solution (under two hours).
- [x] 3.3 Add independent `div-decimal-by-whole` tests for display/data agreement, exact
  quotients, bounds, variety, and difficulty growth (under two hours).
- [x] 3.4 Implement `div-by-decimal` constructing dividend = quotient × decimal divisor for an
  exact result, with the shift-only-one-point wall prediction, concise hint, and worked
  solution (under two hours).
- [x] 3.5 Add independent `div-by-decimal` tests for display/data agreement, exact quotients,
  shift-only-one-point prediction formula, bounds, variety, and difficulty growth (under two
  hours).

## 4. Decimal-fraction conversion

- [x] 4.1 Implement `fraction-to-decimal` drawing fractions with a terminating decimal
  equivalent, `requireDecimal: true`, a keypad allowing both decimal and fraction entry (so
  the taught-away-from form stays typable and rejectable), concise hint, and worked solution
  (under two hours).
- [x] 4.2 Add independent `fraction-to-decimal` tests for exact conversion, `requireDecimal`
  rejecting a fraction-form entry, bounds, variety, and difficulty growth (under two hours).
- [x] 4.3 Add the `display` `DecimalData` arm (a plain decimal has no other fitting operation
  tag), extend `recorded-output.ts`'s `formatDecimalData` for it, and implement
  `decimal-to-fraction` drawing decimals through hundredths, `requireFraction: true`, concise
  hint, and worked solution (under two hours).
- [x] 4.4 Add independent `decimal-to-fraction` tests for exact conversion, `requireFraction`
  rejecting a decimal-form entry, bounds, variety, and difficulty growth (under two hours).

## 5. Money word problems

- [x] 5.1 Add `src/curriculum/phrasing/money.ts` with at least eight authored multiplication
  frames (price × quantity) whose price is integer cents, each with its own comprehension-
  error prediction, and register it as a single-operator bank in the source-level frame check
  (under two hours).
- [x] 5.2 Implement `money-problems` drawing a frame, formatting its integer-cent operands as
  dollar text in the prose, and wrapping the story result as an `exact` answer of
  `rational(resultCents, 100)` with `keypad: { allowDecimal: true }` instead of `intAnswer`
  (under two hours).
- [x] 5.3 Add independent `money-problems` and money-frame-bank tests for carried-quantity
  agreement, nonnegative results, prediction survival, bounds, variety, and difficulty growth
  (under two hours).

## 6. Registry, authorities, and recorded output

- [x] 6.1 Register the six Unit 9b generators in manifest order, add their recorded-output
  snapshots, and pin every intended display, answer, keypad, choice, misconception, hint, and
  solution field.
- [x] 6.2 Update coverage to pin twelve implemented Unit 9 skills, course/unlock order, and the
  94-skill playable total.
- [x] 6.3 Mark curriculum rows 9.7–9.12 playable, update README and roadmap status text, and
  leave roadmap item 19 unchecked for Units 10–11.

## 7. Verification

- [x] 7.1 Run strict OpenSpec validation, focused Unit 9/answer/submit/coverage/frame-bank
  tests, the full test suite, production build, and lint; retain only documented
  pre-existing warnings.
- [x] 7.2 Run the real app at 375 pixels using `docs/environment.md`; complete representative
  multiplication, both division skills, both conversion skills (including a wrong-form entry
  showing the new right-value-wrong-form response), and a money word problem, capture
  screenshots, stop temporary services, and confirm their ports are free.
