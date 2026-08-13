## 1. Power verification data and exponent meaning

- [x] 1.1 Add `PowerData` to `src/lib/types.ts` and add `power` as a third mutually
  exclusive payload alongside `fraction`/`ratio` on the `math` Display kind (under two
  hours).
- [x] 1.2 Add `formatPowerData` to `src/curriculum/recorded-output.ts` and wire it into
  `formatDisplay`'s `math` case (under two hours).
- [x] 1.3 Implement `exponent-meaning`, displaying a repeated-multiplication row next to the
  same base in superscript with its exponent blanked out, and requiring the missing
  exponent (the factor count) via the numeric keypad, with concise guidance (under two
  hours).
- [x] 1.4 Add independent `exponent-meaning` tests, including an `expectedPowerDisplay`
  helper in `generators.test.ts` covering every `PowerData` operation this change adds, plus
  exact-count, notation shape, bounds, variety, and difficulty growth for this skill (under
  two hours).

## 2. Evaluating powers

- [x] 2.1 Implement `evaluate-powers` as a wall: base/exponent superscript display, exact
  evaluated answer, and two misconceptions (base × exponent, and base/exponent swapped)
  that stay distinct from the answer and each other by excluding base == exponent from
  operand selection (under two hours).
- [x] 2.2 Add independent `evaluate-powers` tests for exact evaluation, both misconceptions
  surviving `generateProblem`'s collision/dedup filtering, bounds, variety, and difficulty
  growth (under two hours).

## 3. Perfect squares

- [x] 3.1 Implement `perfect-squares` covering both directions (square a whole number 1–12,
  or take the root of a perfect square up to 144 using root notation), with concise
  guidance (under two hours).
- [x] 3.2 Add independent `perfect-squares` tests for exact answers in both directions,
  notation shape, bounds, variety, and difficulty growth (under two hours).

## 4. Estimating roots

- [x] 4.1 Implement `estimate-roots`, displaying a non-perfect-square positive integer in
  root notation and requiring the lesser of the two bounding consecutive whole numbers, with
  concise guidance (under two hours).
- [x] 4.2 Add independent `estimate-roots` tests for the correct bounding integer,
  non-perfect-square selection, bounds, variety, and difficulty growth (under two hours).

## 5. Multiplying and dividing powers

- [x] 5.1 Implement `exponent-multiply` and `exponent-divide`, displaying two same-base
  powers in superscript notation with the shared base fixed and visible, requiring the
  resulting exponent as a number (add for multiply, subtract for divide), keeping the
  result's exponent positive, with concise guidance (under two hours).
- [x] 5.2 Add independent tests for both skills covering exact exponent results, positive-
  exponent bounds, shared-base display, variety, and difficulty growth (under two hours).

## 6. Registry, authorities, and recorded output

- [x] 6.1 Register the six Unit 12a generators in manifest order, add per-skill recorded
  snapshots, and update coverage for the six implemented skills, unlock order, and the
  117-skill playable total.
- [x] 6.2 Mark curriculum rows 12.1–12.6 playable, update README and roadmap status text,
  and leave roadmap item 21 unchecked for the remaining six increments (12b, 13a, 13b, 14a,
  14b, 15).

## 7. Verification

- [x] 7.1 Run strict OpenSpec validation, focused Unit 12/coverage/content tests, the full
  test suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 7.2 Run the real app at 375 pixels using `docs/environment.md`; complete representative
  problems from all six skills, exercise a diagnosed wrong answer on `evaluate-powers`,
  capture and inspect a screenshot of superscript/root notation rendering, stop temporary
  services, and confirm their ports are free.
