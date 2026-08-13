## 1. Percent meaning

- [x] 1.1 Create `src/curriculum/unit-10-percents.ts` with local `exactAnswer`/`exactFraction`
  helpers (mirroring Unit 9's/Unit 7's) for decimal- and fraction-valued answers. Extend
  `WholeNumberData` with `'percent-of-hundred'`/`'parts-of-hundred'`/`'percent-rational'` and
  a new `{ operation: 'percent-of'; percent; quantity }` member, and `DecimalData` with
  `{ operation: 'to-percent'; value }`, so every percent-text `inline` display carries
  semantic data the independent verifier can recompute from (percent text is not an
  arithmetic expression) — updating every exhaustive switch over both unions in
  `generators.test.ts` (`displayedText`, `recompute`, `expectedDecimal`, `sourceValues`) and
  `recorded-output.ts`'s `formatDecimalData` (under two hours).
- [x] 1.2 Implement `percent-meaning` displaying a whole-number parts-out-of-100 statement or
  a percent and requiring the matching count/percent, `intAnswer`, concise hint, and worked
  solution (under two hours).
- [x] 1.3 Add independent `percent-meaning` tests for exact agreement, bounds, variety, and
  difficulty growth (under two hours).

## 2. Percent/decimal conversion pair

- [x] 2.1 Implement `percent-to-decimal` displaying a plain-text whole-number percent and
  requiring its decimal form via `exactAnswer(coefficient, 2)`, `keypad: { allowDecimal:
  true }`, concise hint, and worked solution (under two hours).
- [x] 2.2 Add independent `percent-to-decimal` tests for exact conversion, bounds, variety,
  and difficulty growth (under two hours).
- [x] 2.3 Implement `decimal-to-percent` displaying a decimal through hundredths and
  requiring its whole-number percent form via `intAnswer`, with both wrong-shift
  misconceptions (unmoved point, one-place shift) computed from the same draw, concise hint,
  and worked solution (under two hours).
- [x] 2.4 Add independent `decimal-to-percent` tests for exact conversion, both wall
  misconceptions surviving distinct from the answer and each other, bounds, variety, and
  difficulty growth (under two hours).

## 3. Percent-to-fraction

- [x] 3.1 Implement `percent-to-fraction` displaying a plain-text whole-number percent and
  requiring its lowest-terms fraction form via `exactFraction`/`requireSimplified`,
  `keypad: { allowFraction: true }`, concise hint, and worked solution (under two hours).
- [x] 3.2 Add independent `percent-to-fraction` tests for exact reduced-fraction agreement, an
  unreduced entry being diagnosable, bounds, variety, and difficulty growth (under two
  hours).

## 4. Percent-of

- [x] 4.1 Implement `percent-of` displaying a fixed inline sentence ("`n`% of `m`") drawing
  from a common-percent band (factors of 100) so every draw's quantity is a positive integer
  by construction, `intAnswer`, concise hint, and worked solution (under two hours).
- [x] 4.2 Add independent `percent-of` tests for exact whole-number agreement, bounds,
  variety, and difficulty growth (under two hours).

## 5. Registry, authorities, and recorded output

- [x] 5.1 Register the five Unit 10a generators in manifest order, add their recorded-output
  snapshots, and pin every intended display, answer, keypad, choice, misconception, hint,
  and solution field.
- [x] 5.2 Update coverage to pin five implemented Unit 10 skills, course/unlock order, and
  the 99-skill playable total.
- [x] 5.3 Mark curriculum rows 10.1–10.5 playable, update README and roadmap status text,
  and leave roadmap item 19 unchecked for increment 10b and Unit 11.

## 6. Verification

- [x] 6.1 Run strict OpenSpec validation, focused Unit 10/coverage tests, the full test
  suite, production build, and lint; retain only documented pre-existing warnings.
- [x] 6.2 Run the real app at 375 pixels using `docs/environment.md`; complete
  representative percent-meaning, both conversion skills, percent-to-fraction (including an
  unreduced entry showing the right-value-wrong-form response), and percent-of problems,
  capture screenshots, stop temporary services, and confirm their ports are free.
  `decimal-to-percent`'s two wrong-shift misconceptions are decimal-valued against a
  whole-number-only keypad (no `.` key, since the answer is `intAnswer`) — the same shape as
  `div-by-decimal`'s existing shipped `shifted-divisor-only`/`shifted-dividend-only`, neither
  literally typable through that skill's keypad either. Verified via the focused
  `checkAnswer`/`diagnose` unit tests instead, the same level `div-by-decimal` is verified at.
