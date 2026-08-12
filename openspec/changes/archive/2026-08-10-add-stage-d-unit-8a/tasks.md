## 1. Mixed-number entry (answer-entry capability piece)

- [x] 1.1 Add `allowMixed?: boolean` to `KeypadRules`; treat effective fraction allowance as
  `allowFraction || allowMixed` in `applyKey` and the pad; add the space branch to `applyKey`
  (accepted only at the whole-part stage: non-empty, no space, no slash, no sign prefix;
  space excluded from `maxLength` without changing how existing fraction and decimal
  characters consume that limit).
- [x] 1.2 Show a space key in the pad's adaptive left cell when `allowMixed` (replacing the
  sign cell) and the slash key in the right cell; keep digit positions unchanged; add an
  accessible label.
- [x] 1.3 Extend `parseInput` to report `wasMixed` and the written whole part on the rational
  parse arm, without changing any existing parse behavior.
- [x] 1.4 Add `requireMixed?: boolean` to the exact answer and the `not-mixed` status to
  `CheckResult`; implement the check in `checkAnswer` after the value match and before the
  lowest-terms check, rejecting any value-equal non-mixed entry, a written whole part that
  differs from `floor(n/d)`, or an improper fraction part.
- [x] 1.5 Add the `'not-mixed'` entry to `responseTo` in `src/lib/submit.ts` with the same
  semantics as `not-simplified`, and a `not-mixed` feedback branch in `src/components/Lesson.tsx`.
- [x] 1.6 Add focused tests: keypad space-key display and grammar refusals; `parseInput`
  mixed reporting; `checkAnswer` for mixed/improper/zero-whole/improper-fraction-part
  entries plus a value-equal decimal entry; the `not-mixed` submit response and Lesson
  feedback; and mixed-form diagnosis (a mixed entry matching a predicted value receives that
  misconception's feedback and tag).

## 2. Fraction semantics and independent verification

- [x] 2.1 Add `add`/`sub`, `common-denominator`, and `improper-to-mixed` arms to the closed
  `FractionData` union, and extend the recorded-output formatter to them.
- [x] 2.2 Extend the independent verifier (`expectedFractionDisplay` and `recompute` in
  `generators.test.ts`) for the new arms: operation rows re-derived over the LCM, the LCD
  answer, and the mixed conversion derived from the carried source values.
- [x] 2.3 Add synthetic independent-verifier tests for valid new-arm answers, visible-data
  mismatches, incorrect stated answers, and malformed semantic data.

## 3. Like-denominator generators

- [x] 3.1 Implement `add-frac-same-den` (wall): distinct numerators, proper sums, growing
  denominator band, structured notation, fraction keypad rules, `requireSimplified`, the
  `adds-denominators` and `copies-addend` predictions, concise hint, worked solution.
- [x] 3.2 Add independent `add-frac-same-den` tests: displayed-data agreement, exact sum,
  unreduced-form response, both misconception formulas, draw bounds, prediction survival
  (two distinct predictions on every sampled problem), and difficulty scaling.
- [x] 3.3 Implement `sub-frac-same-den`: `n1 > n2`, sign+fraction keypad rules (the flipped
  prediction is negative), `requireSimplified`, the `flipped-order` and `copies-subtrahend`
  predictions, concise hint, worked solution.
- [x] 3.4 Add independent `sub-frac-same-den` tests: displayed-data agreement, exact
  difference, negative flipped-subtraction diagnosis, unreduced-form response, draw bounds,
  and difficulty scaling.

## 4. Common-denominator and unlike-denominator generators

- [x] 4.1 Implement `common-denominator`: coprime and divisor pairs, whole-digit answer as
  the LCD, `product-not-lcm` and `larger-denominator` predictions, concise hint, worked
  solution.
- [x] 4.2 Add independent `common-denominator` tests: displayed-data agreement, exact LCD
  for both pair kinds, product prediction only on divisor pairs, draw bounds, and difficulty
  scaling.
- [x] 4.3 Implement `add-frac-diff-den` (major wall): coprime denominators, proper sums at
  low difficulty with improper sums allowed higher, fraction keypad rules, `requireSimplified`,
  the `adds-across` and `unscaled-numerators` predictions, concise hint, worked solution.
- [x] 4.4 Add independent `add-frac-diff-den` tests: displayed-data agreement, exact sum over
  the LCD, both misconception formulas, prediction survival on every sampled problem, draw
  bounds, and difficulty scaling.
- [x] 4.5 Implement `sub-frac-diff-den`: coprime denominators, `n1/d1 > n2/d2`, sign+fraction
  keypad rules, `requireSimplified`, the `flipped-order` and `added-instead` predictions,
  concise hint, worked solution.
- [x] 4.6 Add independent `sub-frac-diff-den` tests: displayed-data agreement, exact
  difference, negative flipped diagnosis, added-instead diagnosis, draw bounds, and
  difficulty scaling.

## 5. Improper-to-mixed generator

- [x] 5.1 Implement `improper-to-mixed`: reduced and reducible sources, mixed answer with
  `requireMixed` and `requireSimplified`, `allowMixed` keypad rules, the
  `quotient-remainder-swapped` and `whole-with-original-fraction` predictions, concise hint,
  and worked solution; introduce "mixed number" as the one new vocabulary word.
- [x] 5.2 Add independent `improper-to-mixed` tests: displayed-data agreement, derived whole
  and remainder, mixed entry completing the problem, improper entry reaching `not-mixed`,
  reducible source reaching `not-simplified`, both misconception formulas, draw bounds, and
  difficulty scaling.

## 6. Registry, authorities, and recorded output

- [x] 6.1 Append the six generators in manifest order, update Unit 8 recorded-output
  snapshots, and pin intended input modes, rendered fields, and difficulty growth for all six
  skills.
- [x] 6.2 Update coverage to pin all six Unit 8 skills implemented, the six Unit 8 skills
  still planned, course and unlock order, and the 76-skill playable total.
- [x] 6.3 Mark curriculum rows 8.1–8.6 built (keeping the wall markers on 8.1 and 8.4),
  update the capabilities table note for the fraction keypad to include mixed entry, update
  the README status line, and update the roadmap status text while leaving roadmap item 19
  unchecked.

## 7. Verification

- [x] 7.1 Run strict OpenSpec validation, focused answer/keypad/submit/Unit 8/coverage
  tests, the full test suite, production build, and lint; retain only documented pre-existing
  warnings.
- [x] 7.2 Run the real app at 375 pixels using `docs/environment.md`, complete representative
  like- and unlike-denominator, LCD, and improper-to-mixed problems including a typed mixed
  number, inspect notation and control layout, capture the required screenshot, stop
  temporary services, and confirm their ports are free.
