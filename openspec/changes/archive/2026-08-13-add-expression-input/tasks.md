## 1. Expression parsing and canonicalization

- [x] 1.1 Add `src/lib/expression.ts`: a recursive-descent parser for the grammar in
  `specs/expression-input/spec.md` (integer coefficients, one declared variable letter,
  infix `+`/`−`, unary `−`, parentheses, implicit multiplication), producing a small AST.
- [x] 1.2 Add `expanded` and `exact` normalizers over that AST and a canonical-string
  serializer, with unit tests covering: re-ordered sums, undistributed-vs-distributed pairs
  under both forms, unary minus, nested parens, and malformed input (unbalanced parens,
  dangling operator, wrong variable letter, exponent, second variable) reported as
  unparseable.

## 2. Answer type and checking

- [x] 2.1 Add the `'expression'` `Answer` kind (`canonical`, `variable`, `form`) to
  `src/lib/types.ts`.
- [x] 2.2 Extend `checkAnswer` in `src/lib/answer.ts` to parse and normalize a raw entry
  against an expression answer's declared `form`, with tests for: correct-expanded,
  correct-exact, wrong-value, wrong-structure-under-exact, and unparseable-entry cases,
  plus a regression check that existing `exact`/`approx`/`choice` behavior is unchanged.

## 3. Keypad

- [x] 3.1 Add an expression-mode key set to `src/lib/keypad.ts` (`applyExpressionKey`: digits,
  the problem's variable letter, `+`, infix `−`, `(`, `)`, `back`, `clear`), refusing an
  unmatched `)`  and two consecutive operators, with unit tests per rule.
- [x] 3.2 Add the expression layout to `src/components/ExpressionKeypad.tsx`, a sibling
  component selected by input mode, rendering the declared variable key and operator/paren
  keys, with first-paint component coverage.

## 4. Lesson wiring

- [x] 4.1 Extend `Problem['inputMode']` with `'expression'` in `src/lib/types.ts`, and update
  every exhaustive consumer this breaks (`ProblemView`'s `SLOT` record, `Lesson.tsx`'s
  `answerControl` switch, `src/lib/entry.ts`'s `SHOW` record, `recorded-output.ts`'s
  `formatAnswer` switch and `RENDERED_KEYS`, and `generator.ts`'s misconception-exclusion
  ternary) so a missed case is a compile error, not a silent fallback.
- [x] 4.2 Confirm an expression problem's prompt renders through existing `MathNotation`
  text/row nodes with no new `Display` kind, with a rendering test.

## 5. Capability manifest

- [x] 5.1 Add `expression-input` to `AVAILABLE_CAPABILITIES` in
  `src/curriculum/manifest/resolve.ts`, and extend the coverage test to pin: Stage E lists
  `expression-input` as required and available, every generator-less Stage E skill stays
  `planned`, and the playable-skill count is unchanged.

## 6. Verification

- [x] 6.1 Run `openspec validate --strict`, the new focused test files, the full `npm test`
  suite, `npm run build`, and `npm run lint`; retain only the documented pre-existing
  Settings.tsx warnings.
- [x] 6.2 Temporarily mount a synthetic expression problem (variable `x`, canonical
  `2x + 2`, form `expanded`) in the real app, run the scripted Chromium workflow from
  `docs/environment.md` at 375px: enter `2(x + 1)` and confirm it is accepted, enter `2x + 3`
  and confirm it is rejected; visually inspect the two screenshots; remove the fixture and
  its wiring; rerun the build; stop the temporary server and confirm its port is free.
