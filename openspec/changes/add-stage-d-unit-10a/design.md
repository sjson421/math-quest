## Context

See `proposal.md` — Why, and `specs/unit-10-percents/spec.md` for requirements. Unit 9
established `DecimalValue`/`DecimalData` (`src/lib/types.ts:135-159`) for decimal display,
`requireDecimal`/`requireFraction` on the `exact` `Answer` (`src/lib/answer.ts`) for
notation-form gating, and `WholeNumberData` (used since Unit 0) for inline displays whose
text is not itself an evaluable arithmetic expression. This increment does not touch the
`Answer`/`CheckResult` surface, but does extend both display-data unions — see Decisions.

## Goals / Non-Goals

**Goals:**

- Add five generators in a new `src/curriculum/unit-10-percents.ts`, reusing 9a/9b's
  `exactAnswer`/`rational`/`decimalText` helpers where a generator's answer is a decimal or
  fraction.
- Keep `decimal-to-percent`'s two wall misconceptions distinct and non-colliding with the
  correct answer, per the content contract.

**Non-Goals:**

- No new `Answer` flag or `CheckResult` status. Every scoped answer is a plain whole
  number, an existing decimal `exact` answer, or an existing fraction `exact` answer with
  `requireSimplified` — all already expressible.
- No phrasing-bank frame set. `percent-of` uses a fixed inline sentence template
  ("`n`% of `m`"), not the `word-problem-phrasing` frame-bank mechanism `money-problems`
  (9b) or `fraction-words`/`ratio-words` use — there is no variety-of-scenario requirement
  for this skill, only the numeric relationship, so a frame bank would add machinery this
  skill does not need.

## Decisions

### Percent text needs new `WholeNumberData`/`DecimalData` operations for the independent verifier

`generators.test.ts` recomputes every answer from what is displayed without trusting the
generator; for a plain `inline` display with neither `wholeNumber` nor `decimal` set, it
falls back to evaluating `display.text` as an arithmetic expression. `"45%"` and `"15% of
80"` are not arithmetic expressions (`%` is not a token the evaluator's grammar accepts), so
this increment's percent-text displays need attached semantic data — the same mechanism
`absolute-value` (`|−7|`) and Unit 9's `display` operation (`decimal-to-fraction`) use for the
same reason.

Rather than reuse an existing operation with mismatched semantics (`read`'s answer equals its
displayed value, but `percent-to-decimal` and `decimal-to-percent` both display one number
and expect a *different* one back), this increment adds:

- `WholeNumberData` gains `'percent-of-hundred'`/`'parts-of-hundred'`/`'percent-rational'` to
  the existing single-`value` operation list (`percent-meaning`'s two framings and
  `percent-to-decimal`/`percent-to-fraction`'s shared "N%, answer is N/100" shape), and a new
  two-field member `{ operation: 'percent-of'; percent: number; quantity: number }`
  (`percent-of`, whose answer is neither operand alone).
- `DecimalData` gains `{ operation: 'to-percent'; value: DecimalValue }` for
  `decimal-to-percent`, whose display is a genuine decimal (so it belongs with Unit 9's
  `DecimalValue`-based operations, not `WholeNumberData`) but whose answer (×100) is not the
  same value `'display'`'s existing case already reports.

Both unions are used only by the independent verifier and `recorded-output.ts`'s snapshot
formatter — nothing renders `wholeNumber`/`decimal` visually beyond the plain `text` already
in `inline`, so this is verification plumbing, not a new display or input capability. Every
exhaustive switch over the two unions (`generators.test.ts`'s `displayedText`/`recompute`/
`expectedDecimal`/`sourceValues`, `recorded-output.ts`'s `formatDecimalData`) gains the new
cases; TypeScript's `never` check is what makes a missed arm a compile error, the same
mechanism Unit 9 relied on for its own additions.

`percent-meaning` and `percent-of` still answer with plain whole numbers via `intAnswer`.
`percent-to-fraction` displays the same plain-text percent; its fraction answer is typed on
the keypad, not rendered as `MathNotation`, so — unlike `fraction-to-decimal`, which displays
the *given* as a fraction — no `fractionDisplay`/`fractionNotation` reuse from Unit 9's file
is needed here. A small local `exactFraction(numerator, denominator)` helper (mirroring Unit
7's) builds the answer.

Alternative rejected: give every percent-text display a `DecimalData` operation instead of
splitting between `WholeNumberData` (percent-shaped text) and `DecimalData` (decimal-shaped
text). Rejected because `DecimalData`'s `DecimalValue` (coefficient + 1-or-2 scale) models a
number *written with a decimal point*; a percent numeral like `45` has none, so forcing it
through `DecimalValue` would mean fabricating a scale that does not describe what is on
screen. `decimal-to-percent` is the one skill whose display genuinely is a `DecimalValue`
(`"0.45"`), which is exactly why only it gets the new `DecimalData` arm.

### `decimal-to-percent`'s two misconceptions are both wrong shifts, not wrong operations

Per the spec, the wall is direction confusion with `percent-to-decimal` (its mirror image),
not a different operation entirely. The two predicted values are the unmoved decimal
(`value.coefficient / power(scale)`, i.e. submitting `0.45` for `45`) and the one-place shift
(`value.coefficient / power(scale - 1)` when `scale === 2`, i.e. submitting `4.5`). Both are
computed from the same draw so they can never collide with the correct answer or each other
by construction — no post-hoc dedup is needed beyond the existing central collision filter.

### `percent-of` constrains its draw to a whole-number result by construction

`percent / 100 * quantity` is guaranteed exact by picking the percent first from a fixed band
of values that divide 100 with a small denominator (`5, 10, ..., 90`), then drawing an
integer multiplier `k` from the difficulty band and setting `quantity = (100 / gcd(100,
percent)) * k`. Since `percent / gcd(100, percent)` is then necessarily an integer, the part
`(percent / gcd(100, percent)) * k` is exact by construction rather than by rejecting draws
that do not divide evenly — the same "construct for exactness" precedent 9b's division
generators used for terminating decimals (`unit-09-decimals.ts`'s dividend-from-quotient
pattern), adapted here to avoid a fractional-part answer this skill does not scope.

## Risks / Trade-offs

- [`percent-of`'s construct-then-check draw could retry indefinitely at extreme percent
  values] → Restrict the percent band to common values (`5, 10, 15, 20, 25, ..., 90`, all of
  which divide 100 by a small factor) so a valid quantity always exists on the first
  candidate at every difficulty; no retry loop needed.
- [A plain-number percent display could be confused with `percent-meaning`'s plain-number
  answer in recorded-output or tests] → Neither reads the other's fixture; each generator's
  test independently reconstructs its expected value from the draw, following 9a/9b's
  per-generator verification precedent.
- [`decimal-to-percent`'s independent-verifier answer, computed as `decimalNumber(value) *
  100`, reintroduces float error — `0.07 * 100 === 7.000000000000001`, failing the exact
  recompute check] → Compute the percent from the integer coefficient directly
  (`coefficient * 10 ** (2 - scale)`), which stays an exact integer at every step, the same
  way `unit-09-decimals.ts`'s own helpers avoid `valueOf()`-then-multiply for exactness.
