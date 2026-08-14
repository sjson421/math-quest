## Why

Unit 13a shipped the first six of Unit 13's eight skills, and roadmap item 21's next
ordered increment is 13b: `distribute-negative` (13.7) and `factor-gcf` (13.8). It closes
Unit 13 and it is where item 20b's "what counts as the same expression" decision finally
carries weight — `factor-gcf` is the first content anywhere to answer under the `exact`
comparison form, where an expanded answer is exactly wrong.

## What Changes

- Add Unit 13 generators for `distribute-negative` and `factor-gcf`, completing Unit 13.
- `distribute-negative` displays a negative coefficient applied to a parenthesized sum or
  difference (−3(x − 4)) and requires the distributed form through `inputMode:
  'expression'` under comparison form `expanded`, as `distributive` already does. As the
  unit's major wall it predicts the sign mistakes specifically: the second term's sign left
  unflipped, distribution to the first term only, and the outer negative dropped entirely.
- `factor-gcf` displays an expanded sum whose two terms share a greatest common factor above
  one and requires the factored form under comparison form `exact` — the first content to
  use it. The expanded form the learner is shown is therefore not an accepted answer, and a
  factoring by a common factor that is not the *greatest* one is a predicted misconception
  rather than a near miss.
- Disambiguate `exact` canonicalization. `serializeExact` joins a product's factors with
  `*` and a sum's terms with `+` without parenthesizing either, so `3(x + 4)` and `3(4) + x`
  currently serialize to the same string. Nothing consumes `exact` today; `factor-gcf` is
  what makes it load-bearing, so structurally different expressions must be given different
  canonical forms before it ships.
- Add two `AlgebraData` operations carrying each new skill's source operands, so both
  answers are independently derivable without parsing learner-facing text, following the
  six operations 13a established.
- Register and record the two generators, mark curriculum rows 13.7–13.8 playable, and
  advance the documented playable total to 129, leaving roadmap item 21 open for its
  remaining increments (14a, 14b, 15).

## Non-goals

- Do not implement any Unit 14 or Unit 15 skill; 14a is the next increment after this one.
- Do not extend the expression grammar. Exponents, a second variable, and division stay out,
  and `factor-gcf` stays within a single declared variable and a degree of one.
- Do not add a rendering, input, or answer-shape capability. `inputMode: 'expression'`, the
  variable keypad, and both comparison forms already exist; this change consumes them and
  corrects one defect in the `exact` one rather than introducing a new mechanism.
- Do not change the manifest graph, stage capability flags, progress model, or sync format.
- Do not revisit how a wrong-but-parseable expression is diagnosed; text-valued misconception
  matching is unchanged.

## Capabilities

### New Capabilities

<!-- None. Unit 13's spec exists; this increment completes it. -->

### Modified Capabilities

- `unit-13-expressions`: add the two remaining skills — a negative distribution answering as
  an expanded expression with predicted sign errors, and a greatest-common-factor factoring
  answering as an exact factored form — and close the unit.
- `expression-input`: strengthen the `exact` comparison form so two structurally different
  expressions never share a canonical form, which the current unparenthesized serialization
  does not guarantee.
- `answer-entry`: the answer slot converts only the *first* sign to the notation the problem
  is drawn in, so an entry with two negative terms — an ordinary `distribute-negative`
  answer — shows both notations at once. The requirement already forbids this; the code did
  not meet it, because no numeric entry carries a second sign.
- `problem-generation`: extend the `AlgebraData` payload with the negative-distribution and
  factor-out operations, so both new answers are independently verifiable from source
  operands; and correct the non-numeric misconception requirement, which claims the
  correct-answer exclusion applies to text-valued predictions when no such exclusion runs for
  them — the assumption both new generators are written against.

## Impact

- `src/lib/expression.ts` (`serializeExact`) and its focused tests.
- `src/lib/types.ts`: two new `AlgebraData` arms, and the matching arms in
  `src/curriculum/recorded-output.ts`, whose formatter is exhaustive.
- `src/curriculum/unit-13-expressions.ts` and its focused test module; registry, coverage
  assertions and snapshots.
- `docs/curriculum.md` rows 13.7–13.8, `docs/roadmap.md` status text and increment 13b note,
  README summary — 129 playable skills.
- First real-app exercise of the `exact` comparison form and of a parenthesized answer typed
  on the expression pad — verify live per docs/environment.md.
- No new package, network dependency, runtime service, migration, or public API.
