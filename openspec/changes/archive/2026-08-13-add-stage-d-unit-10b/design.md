## Context

See `proposal.md` for motivation and the two delta specs for behavior. Unit 10a already uses
structured `WholeNumberData` and `DecimalData` on inline displays because percent notation is
not accepted by the arithmetic-expression verifier. Increment 10b adds five prose-shaped
relationships, including final money totals and a three-factor interest formula, which do
not fit either existing data union or the generic story display's one-operator model.

The existing story renderer already gives prose a readable, wrapping surface at 375 pixels.
Its carried `operands` and `operator` are verification data rather than rendering inputs,
and the verifier already handles one money-specific rescaling for Unit 9. The new content
must remain exact, deterministic, measurable across difficulty, and independently verified.

## Goals / Non-Goals

**Goals:**

- Reuse the existing story rendering and keypad while giving all five percent relationships
  an exhaustive structured-data contract.
- Construct exact part, whole, percent, cents, and interest relationships directly rather
  than relying on rejection or floating-point arithmetic.
- Guarantee two surviving misconception values on every problem for `find-the-percent` and
  `find-the-whole`.

**Non-Goals:**

- Do not migrate Unit 10a's already-recorded inline data to the new percent data model.
- Do not generalize the phrasing engine or create reusable finance infrastructure before a
  second consumer exists.
- Do not add a currency answer type; money remains an exact rational entered through the
  decimal-capable keypad.

## Decisions

### Percent prose extends the existing story display with a typed semantic branch

Add a `PercentData` discriminated union covering `find-percent`, `find-whole`,
`percent-change`, `discount`, `tax`, `tip`, and `simple-interest`. A story display may carry
either the existing arithmetic `operands`/`operator` pair or `percent: PercentData`; the
renderer continues to read only its text.

The independent verifier will exhaustively reconstruct the expected text and exact rational
answer for each percent operation, compare the reconstructed text with the displayed text,
and use the source quantities for difficulty measurement. Recorded output gains a formatter
for every operation so the semantic branch is pinned alongside the learner-facing prose.

This keeps the change on an existing visual surface while making an omitted verifier arm a
compile error. It also avoids adding skill-id conditionals to the generic story arithmetic
path, which would make the same display shape mean different unit conversions depending on
who generated it.

Alternative rejected: add the operations to `WholeNumberData` and use inline displays.
That union already describes Unit 10a's short numeric statements, but finance and formula
prose can exceed the inline one-line width ladder and their answers are not all whole-number
properties. Alternative rejected: add a new display kind. The story renderer already has
the required readable markup, so a new visual capability would duplicate it.

### Inverse percent draws are constructed from the percent and a scale

Both inverse skills choose a percent from a difficulty-aware set below 100 whose reduced
denominator divides a power of ten (`5, 20, 25, 40, 50, 80`), then construct a whole as a
compatible multiple and derive the part exactly. Ten is excluded because dividing whole by
part produces 10 and would collide with the correct 10%; rates such as 15, 30, 60, and 75
are excluded because the reversed division repeats forever and cannot fit the keypad's
ten-character limit. The constructed relationship eliminates retries, guarantees
whole-number answers, and keeps both authored wall diagnoses typable as finite decimals.

`find-the-percent` predicts the unscaled ratio (`part / whole`) and reversed division
(`whole / part`). `find-the-whole` predicts applying the percent to the known part again
(`part × percent / 100`) and dividing by the percent as a whole number (`part / percent`).
The selected percent set and positive operands keep both pairs distinct from the answer and
from each other on every draw. Focused tests submit the finite decimal form of every
prediction through `diagnose()` rather than checking only that misconception objects exist.

Alternative rejected: draw arbitrary part/whole pairs and reject until the percent is whole.
That makes exactness and misconception survival probabilistic, repeating the reject-heavy
pattern the roadmap explicitly warns against.

### Percent change is generated from an original and an exact rate

Choose a rate and direction from explicit difficulty-aware pairs whose wrong-base quotient
terminates, construct a compatible original value, then add or subtract the integer change.
Both directions remain sampled and the answer is always the positive change rate. The main
prediction divides by the new value instead of the original, pinning the curriculum's
base-selection distinction while remaining typable on the decimal keypad. A focused test
submits that decimal through `diagnose()` for every sampled problem.

Alternative rejected: round arbitrary changes. An approximate answer would make difficulty,
diagnosis, and the independent arithmetic less transparent without teaching anything new.

### Applied money uses integer cents throughout

`discount-tax-tip` chooses among all three contexts, draws a whole-dollar base and a
whole-number rate, computes adjustment cents as `dollars × rate`, then subtracts or adds it
to the base cents. `simple-interest` carries principal cents, rate percent, and whole years;
interest cents are `principalCents × rate × years / 100`, with draws constructed so that
division is exact. Both use an exact rational answer and enable decimal entry.

Discount/tax/tip asks for the final amount rather than only the adjustment, requiring the
learner to apply the percent in context. Its predictions preserve the adjustment alone and
the opposite-direction total. Simple interest predicts treating the percent as a whole
number and adding principal to interest, which distinguishes interest from final balance.

Alternative rejected: convert dollars or rates to JavaScript decimals before multiplying.
Integer cents and whole-number percents make money equality exact and match the repository's
existing Unit 9 convention.

### Fixed operand-derived statements do not use the phrasing bank

Each display sentence is a fixed template derived entirely from the problem's operands and
operation. Sampling therefore exercises the authored strings directly, and the independent
verifier reconstructs them. A frame bank is reserved for skills that vary adult scenarios
and distractor quantities; this unit has neither requirement, and the roadmap explicitly
states that Unit 10 needs no frames.

## Risks / Trade-offs

- [A story display with two semantic branches could be built with neither or both] → Model
  the branches as a mutually exclusive TypeScript union and cover both exhaustively.
- [A wall prediction could collide after rational values are reduced] → Prove the selected
  percent set's constraints and keypad reachability through `diagnose()` in focused tests
  over every sampled problem, in addition to the central content contract.
- [Money prose and carried cents could drift] → Reconstruct the complete displayed statement
  from structured data before accepting the independently derived answer.
- [One context or direction could disappear behind seeded randomness] → Focused tests require
  all three applied contexts and both percent-change directions across the sample.
