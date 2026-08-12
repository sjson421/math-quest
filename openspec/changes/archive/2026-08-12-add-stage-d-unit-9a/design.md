## Context

See `proposal.md` — Why and the two delta specs for requirements. Stage D already has the
decimal keypad and choice input, but the generator verifier has no decimal-specific semantic
data. Ordinary JavaScript numbers cannot preserve written precision (`1.20`) and cannot
reliably verify exact sums such as `0.1 + 0.2`.

The existing verifier handles this same trust boundary with closed operation unions:
`WholeNumberData` for inline whole-number properties and `FractionData` for structured
fractions. Decimal content needs the corresponding exact source representation without
turning the verifier into a parser for learner-facing prose.

## Goals / Non-Goals

**Goals:**

- Preserve authored decimal precision while deriving values from integers only.
- Make every displayed decimal and answer independently reconstructable without sharing the
  generator's derivation code with its verifier.
- Use the existing keypad and choice controls unchanged.
- Construct the comparison wall so both required predictions survive every draw.

**Non-Goals:**

- Arbitrary-precision or scientific-notation input, repeating decimals, or thousandths.
- A general expression evaluator for decimal prose or a broad replacement for rational
  arithmetic.
- Currency display or story framing; `money-problems` remains the applied decimal endpoint
  in increment 9b.

## Decisions

### Decimal values are coefficient-and-scale pairs

Add a `DecimalValue` carrying a nonnegative integer `coefficient` and a written `scale` of 1
or 2. Thus `120` at scale 2 is visibly `1.20`, while its exact value is `120/100`. Add a
closed `DecimalData` union with operation-specific arms for requested digit, reading,
comparison, rounding, addition, and subtraction.

One display formatter may be shared by generators and the React view, but the generic
generator verifier reconstructs the same text and arithmetic independently. Exhaustive
switches in verification, recorded output, and difficulty measurement make a future decimal
operation a compile-time obligation.

Alternative rejected: store decimals as JavaScript numbers or decimal strings alone. Numbers
lose significant written places and introduce binary rounding; strings would require the
verifier to trust or parse presentation instead of checking structured source fields.

### Decimal arithmetic extends the existing column surface

Place value, reading, comparison, and rounding remain inline displays with attached decimal
semantics. Addition and subtraction use a decimal-specific column display carrying its
operation data, so the view can pad the shorter operand to the common scale and align decimal
points without storing duplicate visible strings. It reuses the current column typography
and answer slot; this is an internal display-data extension, not a new curriculum capability
or input mode.

Alternative rejected: render `1.2 + 0.35` as an inline expression. It is compact but teaches
the named "line up the points" skill without showing the alignment. Reusing numeric
`column.operands` was also rejected because JavaScript drops the trailing zero needed to draw
`1.20` over `0.35`.

### The reading skill follows words-to-digits precedent

`read-decimals` writes values through hundredths in words and asks for digits, matching
Unit 0's `read-numbers` direction and keeping the answer on the decimal keypad. Its wording
distinguishes a zero placeholder, such as "three and four hundredths" for `3.04`. The inline
view will give decimal-reading prose a bounded wrapping layout above its answer slot rather
than forcing it through the arithmetic size ladder. Component and real-app validation at 375
pixels pin that behavior.

Alternative rejected: show digits and offer prose choices. That avoids wrapping but reverses
the established reading exercise and makes one numeric concept depend on three authored
distractor phrases per draw.

### Place value and rounding stay within hundredths

`decimal-place-value` asks for the tenths or hundredths digit and draws values whose adjacent
digits make a wrong-place diagnosis meaningful. `round-decimals` rounds a tenths value to a
whole or a hundredths value to a tenth. Draws exclude values already at the target precision.
The two predictions are the unchanged source and the result from rounding in the wrong
direction; this keeps them distinct for both round-up and round-down cases.

Alternative rejected: introduce thousandths to make higher levels look harder. That teaches a
place the selected increment never introduces. Difficulty instead grows the whole-number
part and mixes zero placeholders, target places, and carries.

### The comparison draw guarantees the named wall

Each `compare-decimals` problem pairs a one-decimal value with a two-decimal value sharing a
whole part, with the shorter numeral constructed to be numerically larger. Operand order is
seeded. The wrong relation therefore always represents "longer means bigger", and equality is
the other wrong choice. Their numeric choice ids are necessarily distinct from each other
and from the correct relation.

Alternative rejected: arbitrary decimal pairs with a generic reversed-comparison tag. Those
would sometimes retain two diagnoses but would not consistently exercise the misconception
that makes this manifest skill a wall.

### Addition and subtraction normalize integer coefficients

Both arithmetic skills draw tenths and hundredths operands and promote coefficients to the
larger scale before operating. Addition includes crossing-place carries; subtraction orders
operands after normalization and includes borrowing across the decimal point. A
`misaligned-places` prediction applies the unpromoted coefficients at the result scale, and a
second operation-specific prediction covers omitting the smaller addend or reversing the
difference where enterable. Non-wall collision filtering remains the safety net.

The answer uses the existing exact-rational shape and enables `allowDecimal`; equivalent
entries such as `1.5` and `1.50` remain correct.

## Risks / Trade-offs

- [Decimal word displays can exceed the inline arithmetic width] → Add a bounded wrapped
  reading layout and verify representative long/zero-placeholder values at 375px.
- [Trailing-zero precision can disappear between data and rendering] → Render column and
  inline text from coefficient-and-scale data and add mismatch tests against the independent
  reconstruction.
- [Comparison predictions can collide after operand shuffling] → Derive both wrong choice
  ids after order is fixed and assert two-prediction survival on every swept problem.
- [Rounding through JavaScript numbers can change a midpoint] → Divide integer
  coefficients by powers of ten and compare integer remainders only.
- [A new semantic union arm can escape a recorder or difficulty gate] → Keep exhaustive
  `never` switches and add synthetic mismatch tests before registering the generators.

## Migration Plan

No stored data, sync, manifest, or capability migration is required. Shipping registers six
generators, which makes their existing manifest entries playable. Rollback removes those
generators and decimal semantic/test support, returning the skills to `planned` without
changing learner progress records.
