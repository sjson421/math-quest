## 1. Percent display contract

- [x] 1.1 Add the mutually exclusive percent semantic branch to the existing story display,
  with exhaustive text reconstruction, exact answer recomputation, difficulty-source
  extraction, and recorded-output formatting (under two hours).
- [x] 1.2 Add focused synthetic tests proving percent prose/data disagreement and incorrect
  answers are named by independent verification while existing arithmetic stories remain
  unchanged (under two hours).

## 2. Finding the percent

- [x] 2.1 Implement `find-the-percent` with constructively exact part/whole draws, whole-number
  answers, decimal-capable diagnosis, concise guidance, and two guaranteed wall
  misconceptions (under two hours).
- [x] 2.2 Add independent `find-the-percent` tests for exact agreement, bounds, variety,
  difficulty growth, and both misconception values surviving distinctly on every sampled
  problem and resolving through keypad-reachable `diagnose()` entries (under two hours).

## 3. Finding the whole

- [x] 3.1 Implement `find-the-whole` with constructively exact percent/part draws,
  whole-number answers, decimal-capable diagnosis, concise guidance, and two guaranteed wall
  misconceptions (under two hours).
- [x] 3.2 Add independent `find-the-whole` tests for exact agreement, bounds, variety,
  difficulty growth, and both misconception values surviving distinctly on every sampled
  problem and resolving through keypad-reachable `diagnose()` entries (under two hours).

## 4. Percent change

- [x] 4.1 Implement `percent-change` with exact increase/decrease draws, the original value as
  the base, a whole-number answer, and a new-value-base diagnosis (under two hours).
- [x] 4.2 Add independent `percent-change` tests for exact agreement, both directions, bounds,
  variety, difficulty growth, misconception arithmetic, and diagnosis through a
  keypad-reachable decimal entry (under two hours).

## 5. Discount, tax, and tip

- [x] 5.1 Implement `discount-tax-tip` with all three contexts, integer-cent arithmetic,
  exact final totals, decimal entry, concise guidance, and adjustment/opposite-direction
  diagnoses (under two hours).
- [x] 5.2 Add independent `discount-tax-tip` tests for all contexts, exact cent agreement,
  final-total direction, bounds, variety, difficulty growth, and misconception arithmetic
  (under two hours).

## 6. Simple interest

- [x] 6.1 Implement `simple-interest` with the displayed `I = Prt` formula, exact
  principal/rate/time draws, decimal entry, concise guidance, and rate-scale/final-balance
  diagnoses (under two hours).
- [x] 6.2 Add independent `simple-interest` tests for formula and source-data agreement, exact
  cents, bounds, variety, difficulty growth, and misconception arithmetic (under two hours).

## 7. Registry, authorities, and recorded output

- [x] 7.1 Register all five generators in manifest order, record every problem field in the
  Unit 10 snapshots, and update coverage for the complete ten-skill unit and 104-skill total.
- [x] 7.2 Mark curriculum rows 10.6–10.10 playable, update README, repair the roadmap's stale
  94-skill status while advancing the true 99-skill baseline to 104, and leave roadmap item
  19 unchecked for Unit 11.

## 8. Verification

- [x] 8.1 Run strict OpenSpec validation, focused Unit 10/coverage tests, the full test suite,
  production build, and lint; retain only documented pre-existing warnings.
- [x] 8.2 Run the real app at 375 pixels using `docs/environment.md`; complete representative
  problems from all five new skills, exercise a diagnosed wall answer and an applied decimal
  answer, capture and inspect a screenshot, stop temporary services, and confirm their ports
  are free.
