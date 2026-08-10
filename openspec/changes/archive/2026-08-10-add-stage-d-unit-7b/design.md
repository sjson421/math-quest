## Context

See `proposal.md` for motivation and scope. Unit 7 already owns structured math builders,
bounded denominator ladders, a closed `FractionData` semantic union, and independent readers
that reject visible notation disagreeing with its data. The remaining three skills can reuse
those surfaces, but two existing boundaries now become reachable: the fraction-data union has
no simplification or comparison arm, and misconception diagnosis reads `Number(raw)`, which
cannot interpret a slash-form answer.

The manifest already marks `simplify-fractions` and `compare-diff-den` as walls. Every generated
problem for each must retain two distinct predictions after the central answer-collision and
duplicate-value filter. The `not-simplified` result is intentionally separate from predicted
arithmetic mistakes and carries no misconception tag.

## Goals / Non-Goals

**Goals:**

- Keep the answer to every new problem independently derivable from closed semantic data.
- Make the existing simplest-form response reachable through the actual fraction keypad.
- Preserve two diagnosable, enterable mistakes on every wall problem.
- Scale source counts and denominators measurably without widening the notation or input
  capabilities.

**Non-Goals:**

- Evaluating arbitrary notation trees or parsing learner-facing labels.
- Representing misconception values as a new rational union or diagnosing a right value in an
  unreduced form as wrong arithmetic.
- Sharing fraction helpers outside Unit 7 before a second unit demonstrates the same shape.

## Decisions

### Extend the closed fraction semantic union for simplification and comparison

Add one arm carrying the displayed reducible numerator and denominator and one arm carrying the
integer numerator and denominator of both compared fractions. Unit 7 builds the visible
notation and accessible label from those same values. The independent verifier builds its own
expected notation, reduces a simplification source exactly, and compares two rationals before
resolving the expected relation label to its stable choice id.

This keeps the established operation-specific verifier rather than adding a general notation
evaluator. Encoding comparisons as an inline string was rejected because it would bypass the
structured notation surface. Taking the generator's answer or parsing its accessible label was
rejected because either makes authored output verify itself.

### Build lowest-terms problems from a reduced base and a composite scale

Draw a proper coprime base fraction, then multiply both parts by a seeded composite factor whose
range increases with difficulty. The visible fraction is therefore reducible, the exact answer
is the base fraction with `requireSimplified: true`, and a partial reduction remains possible
on every problem. Source denominator and scale size provide a measurable difficulty ladder.

Two predicted arithmetic mistakes divide only one displayed part by the full common factor:
`reduced-numerator-only` and `reduced-denominator-only`. Their values are wrong, distinct, and
cannot collide with the correct fraction. Entering the unchanged displayed fraction or a
partially reduced equivalent instead reaches `not-simplified`, the existing response designed
for this wall.

Using a partially reduced equivalent as a numeric misconception was rejected: it has the
correct rational value, so the central filter must remove it and the answer checker must route
it through the form-specific response. Choice input was rejected because 7.7 is the first
deliberate consumer of fraction entry and simplest-form checking.

### Diagnose a numeric entry by parsing it before matching

Change diagnosis to use the same exact numeric parser as answer checking, convert a valid
rational to its finite numeric value, and compare that with the existing finite-number
predictions. Invalid or unfinished input still has no diagnosis. `Misconception.value` remains
a number, so every existing whole-number generator, numeric choice id, filter, snapshot, and
stored misconception tag keeps its shape.

Adding a rational-valued misconception union was rejected as unnecessary churn across all
generators. Evaluating a slash string with JavaScript coercion was rejected because
`Number('1/2')` is not numeric and expression evaluation would accept syntax the keypad and
answer parser do not.

### Use numeric relation ids for both fraction comparisons

Both comparison skills show two structured fractions separated by a question mark and offer
`<`, `=`, and `>` with ids `-1`, `0`, and `1`. This is the established choice-diagnosis
contract: the correct relation and predicted mistakes are numbers at the generator boundary,
while only labels reach the learner.

For like denominators, draw unequal numerators and derive the relation directly. For unlike
denominators, reject draws until denominators and fractions differ and numerator-only
comparison yields the opposite of exact rational comparison. Every problem then retains
`compared-numerators-only` and `called-equal` as its two distinct wall diagnoses. Allowing
arbitrary unlike pairs was rejected because the named wall mistake would sometimes be correct
and be removed, leaving the wall below its required coverage.

### Extend the existing Unit 7 module and independent gates

Append the three generators in manifest order to the current module and widen its tests and
recorded snapshots. Focused tests independently reconstruct displayed fractions, simplest
form, comparison relations, choice ids, wrong-value formulas, wall prediction survival, input
modes, difficulty growth, and the `not-simplified` response. The global verifier gains
synthetic pass, mismatch, and missing/duplicate-data cases for the new semantic arms; diagnosis
gets integer, decimal, fraction, choice-id, and invalid-entry regression cases.

A second Unit 7 file was rejected because one manifest unit should have one ordered generator
export and one wording gate. Moving helpers into the engine was rejected until Unit 8 proves
which shapes are genuinely shared.

## Risks / Trade-offs

- **Rejection sampling could find too few unlike-denominator wall cases** → Use denominator
  bands with known opposing-order pairs at every difficulty and sweep 500 seeded cases per
  skill.
- **Numeric prediction matching loses rational structure after parsing** → Keep exact parsing
  through validation, convert only at the existing numeric misconception boundary, and derive
  predictions from the same integer ratios the learner can enter.
- **A decimal equivalent could satisfy a simplest-form answer** → The fraction-only keypad does
  not offer a decimal point; retain the established checker rule that only authored fraction
  forms are tested for reduction.
- **Completing Unit 7 changes unlock visibility for future planned skills** → Preserve the
  manifest graph and pin course order, implemented ids, planned Unit 8 state, and the 70-skill
  total in coverage.
- **Three more math displays could overflow a phone lesson** → Run representative lowest-terms
  and comparison lessons at 375 pixels and capture the required screenshot.

## Migration Plan

1. Extend semantic verification and slash-form diagnosis with synthetic tests.
2. Add and independently test the three generators, then update snapshots and coverage.
3. Update curriculum, roadmap, and README status text and validate the reachable lessons in the
   real app.

Rollback removes the three generator entries and their semantic-data arms, restores scalar
diagnosis, and returns the documentation count to 67. No stored progress or sync payload needs
migration.
