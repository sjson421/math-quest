## Context

See `proposal.md` — Why. Unit 7 already owns structured math builders, a closed `FractionData`
semantic union, an independent verifier (`expectedFractionDisplay` in
`src/curriculum/generators.test.ts`), exact rationals, the `requireSimplified`/`not-simplified`
right-value/wrong-form response, and a keypad whose bottom row holds three cells —
`[−|empty] [0] [/|.|empty]` — the sign cell and the slash-or-point cell adapting per problem.

Two existing surfaces are now reached for the first time. `parseInput` already accepts
`1 1/2`, but the pad cannot produce a space, so a mixed answer is unenterable; and the
`FractionData` union has no arithmetic arm, so an operation display cannot be independently
verified. `sub-frac-same-den` and `sub-frac-diff-den` predict *negative* mistakes (the
flipped-order subtraction), which the answer-entry spec requires to be enterable — so the
sign key must appear alongside the fraction slash on those problems (the cells coexist:
sign left, slash right).

## Goals / Non-Goals

**Goals:**

- Extend the keypad-rule surface with mixed-number entry under the existing one-owner rule,
  with the space key taking the adaptive cell the sign otherwise uses, so the layout never
  reflows and digit positions are untouched.
- Make the right-value/wrong-form response speak about mixed form, mirroring
  `not-simplified` exactly: same record/requeue/showsSolution/keepsEntry semantics, added to
  the `Record` over the status union so the next status stays a compile error if forgotten.
- Keep every new answer independently recomputable from closed semantic data, with the
  verifier rejecting notation that disagrees with its data.
- Guarantee the two wall skills (`add-frac-same-den`, `add-frac-diff-den`) retain two
  distinct surviving predictions per problem after the central filter, by construction.
- Keep every answer in lowest terms (`requireSimplified`), so reducible results reach the
  existing form response rather than a plain miss.

**Non-Goals:**

- Negative mixed numbers, or any problem declaring both `allowMixed` and `allowNegative`; the
  two share the adaptive cell. Unit 8 mixed answers and their predicted mistakes are
  positive. If 8b's `sub-mixed` later wants to predict a negative value on a mixed-entry
  problem, the cell conflict is resolved then, not smuggled in here.
- A `requireMixed`-style required form for decimal answers (Unit 9's decision, per the
  roadmap) and any `not-decimal` status.
- Mixed-number arithmetic, multiplication, division, or word problems (8.7–8.12).
- Extending the `Misconception.value` type or diagnosis beyond finite numbers.

## Decisions

### Mixed-number entry ships inside this change, scoped there by the roadmap

`docs/workflow.md` says capability work is its own change, never bundled with the content it
unblocks. This change deliberately carries the mixed-entry capability piece (space key,
`wasMixed`, `requireMixed`/`not-mixed`) beside the six generators, because the roadmap — the
authority for scope — explicitly scopes it into increment 8a: *"Whichever way it resolves — a
key, a second slot, or accepting improper answers — it changes the pad, so it is capability
work under item 3's mechanism rather than content work smuggled into a unit."* Item 19's ten
changes count includes 8a as one change; a separate capability change would make eleven. The
rule's substance is honoured: the capability work is fully spec'd as an `answer-entry` delta,
sequence-ordered before the generators, and implemented through item 3's mechanism
(compile-guided status union, one-owner pad rule) rather than ad hoc content-side handling.
The same precedent shipped `add-stage-d-unit-7b`, whose answer-entry delta rode with its three
generators.

### Mixed-number entry is a keypad rule, not a new input mode

Add `allowMixed?: boolean` to `KeypadRules`. When set, the pad shows a space key in the left
bottom-row cell (the cell the sign otherwise uses) and the slash key in the right cell —
mixed entry implies fraction entry, so the effective fraction allowance is
`allowFraction || allowMixed` in both `applyKey` and the pad. Digit keys keep their positions.

`applyKey` gains a space branch: accepted only when `allowMixed` and the entry is still at the
whole-part stage — non-empty, no space yet, no slash yet, not sign-prefixed (defensive; the
pad never offers both). The space does not count toward `maxLength`; every existing character
keeps the baseline length behavior, so adding mixed entry does not silently widen decimal or
simple-fraction input.

Alternatives rejected: a dedicated "mixed" key that inserts a whole skeleton (cryptic
grammar, one more key shape to label); a second special slot (the bottom row has no room —
column 4 is the Check button's row-span); and choice input for `improper-to-mixed` (a
conversion skill taught as recognition does not teach the conversion, and choice labels are
prose, so `1 3/4` would not render in the stacked notation the problem uses).

### `requireMixed` is a second form requirement on the exact answer

Add `requireMixed?: boolean` to the `exact` answer. `parseInput` records `wasMixed` and the
written whole part on the rational parse. `checkAnswer` order: exact value match, then the
mixed-form check, then the existing lowest-terms check:

- `requireMixed` and the entry is not mixed (`!wasMixed`), including a value-equal whole,
  decimal, or improper-fraction entry → `not-mixed`.
- `requireMixed` and the entry is mixed but not in mixed form — written whole part differs
  from `floor(n/d)`, or the fraction part is improper (`rawNum % rawDen === 0`) → `not-mixed`.
  This rejects `0 7/4` for the answer `1 3/4` even though both evaluate to `7/4`.
- Otherwise the existing `requireSimplified` check runs on the improper equivalents
  (`rawNum`/`rawDen`), so `1 6/8` for `1 3/4` reaches `not-simplified`, not `not-mixed`.

`CheckResult` gains `{ status: 'not-mixed' }`; `responseTo` in `submit.ts` gains the entry
with the same semantics as `not-simplified` (advances false, records incorrect, re-queues,
hides solution, drops entry). The `Record` over the union and the Lesson feedback conditional
make the missed branch a compile error. Lesson gains a `not-mixed` feedback branch: "Right
value — now write it as a mixed number" / "That is the correct amount. Write it as a whole
number and a fraction."

### `FractionData` gains arithmetic arms

Three arms join the closed union:

- `{ operation: 'add' | 'sub'; leftNumerator; leftDenominator; rightNumerator;
  rightDenominator }` — same union arm for like and unlike denominators; the draw's
  denominator relationship is a per-skill property, and recomputation over the LCM works for
  both.
- `{ operation: 'common-denominator'; leftNumerator; leftDenominator; rightNumerator;
  rightDenominator }` — carries both fractions; the answer is the LCM of the denominators.
- `{ operation: 'improper-to-mixed'; numerator; denominator }` — the display shows the
  source improper fraction and the verifier re-derives the answer's value from it; the
  whole-part/remainder decomposition lives in the answer checker (`requireMixed`), so a
  display cannot disagree with its data.

The verifier's `expectedFractionDisplay` switch and `recompute` extend to the new arms:
notation row `[fraction, operator, fraction]` with the spoken label, `[fraction, and,
fraction]` for the LCD, and the source improper fraction for the conversion — whose mixed
form is the answer, enforced by `requireMixed` in the answer checker rather than shown in
the question. The recorded-output formatter gains the same arms.

### Draws guarantee wall survival by construction

- **`add-frac-same-den`** (wall): draw distinct numerators (`n1 ≠ n2`). Predictions
  `adds-denominators` = `(n1+n2)/2d` and `copies-addend` = `n2/d` are then distinct from each
  other and from the correct `(n1+n2)/d` on every draw, so two predictions always survive the
  central filter. Keep sums proper at every difficulty (`n1+n2 < d`); difficulty grows the
  denominator band.
- **`add-frac-diff-den`** (major wall): draw coprime denominators, so the LCM is the product.
  Predictions `adds-across` = `(n1+n2)/(d1+d2)` and `unscaled-numerators` = `(n1+n2)/(d1·d2)`
  are then distinct from the correct `(n1·d2+n2·d1)/(d1·d2)` and from each other on every
  draw (proved in exploration; the equalities would force a negative term). Low difficulties
  keep the sum proper; higher difficulties may exceed one, answered as an improper fraction —
  mixed form is 8.6's lesson and is not required here.
- **`sub-frac-same-den` / `sub-frac-diff-den`**: predict the flipped subtraction, whose value
  is negative on every draw — which is why these problems declare `allowNegative` alongside
  `allowFraction`. `sub-frac-diff-den` also predicts adding instead of subtracting.
- **`improper-to-mixed`**: draw `n = q·d + r` with `q ≥ 1`, `1 ≤ r < d`, mixing reduced and
  reducible sources so both the mixed-form response (improper entry) and the lowest-terms
  response (reducible source) are reachable. Predictions `quotient-remainder-swapped`
  (whole `r`, fraction `q/d`) and `whole-with-original-fraction` (whole `q`, fraction `n/d`)
  may collide with the correct value on some draws; the central filter drops them, and 8.6 is
  not a wall, so no survival guarantee is required.
- **`common-denominator`**: mix coprime pairs (LCD is the product) with pairs where one
  denominator divides the other (LCD is the larger). Predictions `product-not-lcm` and
  `larger-denominator`; the product prediction equals the answer on coprime draws and is
  dropped by the filter there. Whole-digit entry, no fraction rules.

### Vocabulary is unit-8 vocabulary

`improper fraction`, `mixed number`, and `common denominator` are introduced by Unit 8 in
`content-rules.ts`. The six generators may use them; the conversion skill introduces "mixed
number" as its one new vocabulary word, and earlier units' generators never mention it.

## Risks / Trade-offs

- [The `0 7/4` loophole: a value-equal entry whose written whole part is zero or whose
  fraction part is improper passes a naive `wasMixed` check] → The `requireMixed` check
  compares the written whole part to `floor(n/d)` and rejects an improper fraction part, so
  only a genuine mixed decomposition completes the problem.
- [Mixed entry and the sign share one cell; a future skill needing both cannot declare it]
  → Specified as a hard constraint with a note that 8b's mixed-entry problems keep their
  predictions positive or the conflict gets resolved then.
- [A new `CheckResult` status is a fourth behavior some component forgets] → The `Record` in
  `submit.ts` and the `Record`-style conditional in Lesson are compile-guided; the design adds
  the Lesson branch in the same change that adds the status, and tests pin both.
- [Higher-difficulty unlike-denominator sums exceed one and must be typed as improper
  fractions before 8.6 teaches mixed form] → Deliberate: the answer is improper and
  `requireSimplified`, matching the curriculum's ordering (conversion comes after operations).

## Migration Plan

No data, persistence, or sync changes; the manifest and progress shapes are untouched. The
keypad-rule, parse, and status changes are additive — existing generators declare none of the
new rules, so their behavior is unchanged. Rollback is a revert of the change: the new
generators drop back to `planned` and the pad/checker surface returns to its prior shape.

## Open Questions

None. The mixed-entry decision (the roadmap's explicit open question) was resolved with the
user in exploration: production entry via a space key, `requireMixed`/`not-mixed` form
checking, and `improper-to-mixed` requiring mixed form.
