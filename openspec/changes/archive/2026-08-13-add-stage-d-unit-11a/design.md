## Context

See `proposal.md` for motivation and
`specs/unit-11-ratios-proportions/spec.md` for behavior. Unit 10b established a typed
semantic branch on the existing story display: the renderer reads prose, while the global
generator verifier reconstructs that prose and its answer from structured source values.
Unit 11a has the same need because ratios, best-value comparisons, scale statements, and
unit conversions are not single arithmetic expressions that the inline evaluator can
verify safely.

The existing `ShapeDiagram` is deliberately limited to shaded equal-part fraction figures.
It cannot carry labelled dimensions, and the diagram-rendering specification guarantees
that its mathematical value is shaded parts over total parts. Unit 11a therefore cannot
reuse that data shape for a scale drawing without making the figure contract false.
`src/curriculum/manifest/stage-d.ts` still attributes the stage's diagram requirement to
`scale-drawings`; that rationale predates the shipped fraction-only diagram scope and must
be corrected to name Unit 7's two actual diagram consumers without changing the requirement.

## Goals / Non-Goals

**Goals:**

- Keep all six generators exact, deterministic, independently verifiable, and measurable
  across the five difficulty bands.
- Reuse existing story, math-notation, keypad, and choice surfaces.
- Make answer form part of the lesson where ratio notation or lowest terms is the skill.

**Non-Goals:**

- Do not add a labelled-dimension diagram model or another display kind.
- Do not generalize conversion data beyond the fixed Unit 11 set.
- Do not introduce a ratio-string answer type or colon key; slash-form fraction entry is
  the existing structured ratio input available to Stage D.

## Decisions

### Ratio and proportion displays carry an exhaustive semantic data union

Add a `RatioData` discriminated union for writing and simplifying a ratio, comparing two
unit prices, solving a proportion, converting a scale drawing, and converting measurement
units. Existing story and math displays gain mutually exclusive `ratio` branches alongside
their current arithmetic, percent, and fraction branches. The renderer continues to read
only the existing prose or notation.

The independent verifier reconstructs the complete story text or math notation, derives
the exact numeric or choice answer, extracts source magnitudes for difficulty reporting,
and formats every operation into recorded-output snapshots. Exhaustive `never` switches
make a missing operation arm a type error.

Alternative rejected: carry only generic story `operands` and an operator. That can
recompute one arithmetic result but cannot prove that prose labels, offer order, conversion
units, or the displayed proportion match those operands. Alternative rejected: parse
learner-facing prose. The repository deliberately treats prose as output, not a data format.

### Ratio form reuses exact rational answers and the fraction keypad

`write-ratios` uses an exact rational answer with `requireFraction`; its primary prediction
is the reversed count order. `simplify-ratios` constructs coprime base terms, multiplies
both by a factor greater than one, and requires both `requireFraction` and
`requireSimplified`. Its predictions divide only the first term or only the second term, so
both remain distinct from the answer and each other by construction.

Alternative rejected: add colon entry. A second textual representation of the same exact
rational value would widen answer parsing and keypad capability for no behavior the
curriculum requires; the existing slash form expresses the directed comparison exactly.

### Unit rate is a best-value choice between exact constructed offers

Each `unit-rate` draw chooses two distinct whole-number per-item prices, then constructs
item counts and total prices from them. The lower per-item price determines the unique
choice regardless of total price or package size. Choice ids stay stable while declaration
order may vary, and verification derives the winning label from the two exact rates.

Alternative rejected: ask for one computed rate. That would teach division but would not
match Unit 11's “Which is the better value” curriculum description.

### Proportions and scale drawings are constructed from one integer factor

`solve-proportions` chooses a reduced base ratio and an integer scale factor, hides one of
the four terms, and derives the missing whole number. Both numerator and denominator blanks
are sampled. The solution demonstrates cross multiplication even when scaling is also
visible, matching the curriculum note.

`scale-drawings` states a one-unit drawing-to-actual relation and constructs a compatible
measurement in either direction, so division problems always have whole-number results.
Its main prediction applies the scale factor in the opposite direction.

Alternative rejected: extend `ShapeDiagram` with measurement labels. That is capability
work and would violate the shipped fraction-diagram contract; explicit scale prose still
tests the GED behavior of converting between drawing and actual measurements.

### Unit conversion uses a fixed stated within-system table

The conversion table is limited to these exact one-unit relationships:

- customary length: 12 inches per foot; 3 feet per yard
- customary capacity: 2 cups per pint; 2 pints per quart; 4 quarts per gallon
- customary weight: 16 ounces per pound
- metric length: 100 centimeters per meter; 1000 meters per kilometer
- metric capacity: 1000 milliliters per liter
- metric mass: 1000 grams per kilogram

Every prompt states the selected relationship, then asks in either direction. Amounts are
constructed as compatible multiples, and difficulty grows both source magnitude and the
available relationship band. The main prediction applies the factor in the opposite
direction.

Alternative rejected: arbitrary unit pairs. That turns the skill into lookup or guessing.
Alternative rejected: cross-system approximations. They add rounding and memorized
constants to a skill whose assessed purpose is proportional conversion within a system.

## Risks / Trade-offs

- [Choice labels or story prose could drift from their semantic values] → Reconstruct the
  complete visible output from `RatioData` before accepting the independently derived
  answer.
- [A reversed-order or opposite-factor prediction could collide with the answer] → Draw
  unequal positive ratio terms and scale factors greater than one, then verify survival in
  focused sampled tests.
- [Large metric factors could overflow the phone surface or keypad] → Keep scale multiples
  bounded, use the wrapping story surface, and validate representative difficulty-five
  metric conversions at 375 pixels.
- [Adding a semantic branch could disturb existing exhaustive switches] → Extend every
  verifier and recorder switch under TypeScript's `never` checks, then run the full suite
  and production build.
- [The Stage D comment could keep advertising an unsupported scale-drawing diagram] →
  Correct only its rationale to name the shipped Unit 7 diagram consumers; retain the
  manifest's existing stage-wide `diagram` requirement.

## Migration Plan

The change only registers new generators and adds compile-time display metadata. Existing
progress and synced skill records remain opaque and unchanged. Rollback removes the six
registry entries and their semantic branches; no stored-data migration is required.
