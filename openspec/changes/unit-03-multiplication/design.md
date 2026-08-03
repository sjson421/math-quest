## Context

See [proposal.md](proposal.md) for motivation and scope, and
[specs/problem-generation/spec.md](specs/problem-generation/spec.md) for the observable
contract.

The existing column engine models addition and subtraction honestly. `ColumnOperator` is
`'+' | '−'`; `ColumnPlace` contains paired `top`/`bottom` digits and subtraction-only
`reduced`/`borrowed` fields. Widening that type to `×` would make most of its fields invalid
and still would not represent a second partial-product row. The public `Display` already
supports `×` in inline, column, and story problems, and independent answer recomputation
already folds multiplication operands, so no UI or input capability is missing.

The authored frame machinery is operator-generic. Its static quantity registry deliberately
has no `×` entry yet and names Unit 3 as the change that must supply one. The generator
registry is similarly unit-based, so one new `SkillGenerator[]` module can make the full
manifest unit playable without duplicating unit metadata.

## Goals / Non-Goals

**Goals:**

- Derive multiplication carries and partial products once, then reuse the trace in answers,
  hints, solution details, and predicted misconceptions.
- Keep addition and subtraction types and recorded output unchanged.
- Give every generator a measurable five-band ladder and more than twenty distinct displays.
- Guarantee two surviving diagnoses on each of the unit's three walls by construction.

**Non-Goals:**

- A universal expression or long-division engine.
- Rendering intermediate rows inside the problem stack. The problem shows the two operands;
  worked partial products appear in the hint and solution after submission.
- Extending table facts past 12 or introducing later-unit vocabulary such as “factor.”

## Decisions

### Multiplication gets its own trace types

Add `engine/multiplication.ts` with two related traces:

- `multiplicationTrace(multiplicand, multiplier)` accepts a non-negative integer and a
  one-digit multiplier. Its ones-first places hold the multiplicand digit, multiplier,
  incoming carry, raw digit product, total after carry, written digit, and outgoing carry.
- `partialProductTrace(multiplicand, multiplier)` applies that row trace to every multiplier
  digit and records both the unshifted digit product and its place-aligned value. The trace's
  result is the sum of aligned rows and must equal the direct product.

The highest row place retains its outgoing carry instead of inventing a zero multiplicand
digit. A caller reads that carry as the leading digits of the row result. This keeps every
place tied to a digit the learner can see.

*Alternative considered:* add `×` to `ColumnOperator` and switch on it inside `columnTrace`.
Rejected because `top`/`bottom` can describe one row but `reduced`, `borrowed`, and a binary
carry flag cannot; partial products would still need a second structure.

### Multiplication misconception helpers consume the traces

Add focused factories beside the trace rather than hand arithmetic inside wall generators:

- `forgotMultiplicationCarry` removes the actual carry sent out of a named place.
- `carriedBeforeMultiplying` models adding the incoming carry to the next digit before
  multiplying, which makes that column too large by `incoming × (multiplier − 1)`.
- `missingPlaceholder` adds the tens digit's unshifted row instead of its aligned row.
- `firstPartialOnly` stops after the ones row.

For `mult-2by1`, the draw requires an ones carry and a multiplier above one. The first error
is below the answer and the second above it, so they cannot collide. For `mult-2by2`, both
multiplier digits are non-zero; omitting the shift and omitting the whole tens row are
different positive deficits, so both survive. The generic generator suite remains the final
check against accidental collisions.

*Alternative considered:* compute the values inline in the two generators. Rejected because
the hints and solution steps need the same carries and rows; three independent expressions
would recreate the drift the engine exists to prevent.

### Table skills share drawing and solution structure, not authored identity

A small local builder in `unit-03-multiplication.ts` defines the fixed-table skills while
each exported generator keeps its manifest id, name, blurb, teaching wording, and multiplier.
The partner range widens across difficulty and the operand order is seeded. Commuting the
display gives 21 distinct problems for a table covering partners 2–12 — the square case is
the same in either order — satisfying the repository's greater-than-20 variety gate without
teaching multiplication by zero or one.

Most table skills predict one group too few and one too many. `times-10` additionally names
a dropped zero. `times-9` teaches the curriculum's digit-sum pattern, using ten groups minus
one only as the arithmetic that verifies it; its diagnoses name forgetting that subtraction
and subtracting one group twice. The `times-7-8` wall draws either table and always predicts
one equal group low and high; those values straddle the answer and therefore remain distinct.

*Alternative considered:* a single `times-table` generator parameter stored in the manifest.
Rejected because a skill ships by gaining its own registered generator, and the manifest is
not a second content implementation.

### Each non-table skill owns a constrained ladder

- `mult-meaning` draws small group counts and group sizes, with seeded operand order. Its
  learner text describes rows of equal quantities as a text-based array, so both concepts in
  the curriculum row ship without introducing a diagram capability.
- `times-mixed` draws two values from the learned 2–12 table range.
- `mult-by-10-100` chooses 10 or 100 and widens the other operand.
- `mult-2by1` widens the two-digit multiplicand and constructs or redraws for a real ones
  carry.
- `mult-2by2` widens both two-digit operands and keeps both multiplier digits non-zero so the
  placeholder row is always meaningful.
- `mult-words` draws adult-scale group counts, group sizes, and a distinct distractor under
  the same constraints used by the static frame check.

No operand is zero or one where it would erase the idea being taught. Composition is
preferred when a structural condition would make rejection sparse; `drawPair` remains for
ordinary table-sized constraints.

The misconception map is fixed before authoring rather than improvised per generator:

| Skill | Predicted misconceptions |
|---|---|
| `mult-meaning` | one equal group too few; one equal group too many |
| `times-2` | one pair too few; one pair too many |
| `times-10` | dropped the zero; one group too many |
| `times-5` | one group too few; one group too many |
| `times-3` | one group too few; one group too many |
| `times-4` | one group too few; one group too many |
| `times-6` | one group too few; one group too many |
| `times-9` | used all ten groups; removed two groups |
| `times-7-8` | one equal group too few; one equal group too many |
| `times-mixed` | one equal group too few; one equal group too many |
| `mult-by-10-100` | shifted one place too few; shifted one place too many |
| `mult-2by1` | dropped the ones carry; added it before multiplying |
| `mult-2by2` | omitted the tens-row placeholder; omitted the tens row |
| `mult-words` | added instead; multiplied the distractor; answered one part |

### Multiplication frames join the existing source-level registry

Add at least eight adult-situation frames under `phrasing/multiplication.ts`. Each mentions
three quantities, multiplies the two asked about, and supplies nudges for addition instead of
multiplication, choosing the distractor, and answering with one part. Add valid multiplication
quantity sets to `CHECK_QUANTITIES` and register the bank with `mult-words` at `unit-3` in
`frames.test.ts`.

The existing `storyMisconceptions` “wrong operation” branch currently treats every non-plus
operator as addition, which is correct for multiplication stories. Both static and generated
quantities keep `a`, `b`, and the distractor positive, keep the distractor different from
`b`, and reject `a × b = a + b` (notably `2 × 2`). Those constraints keep all three
predictions positive, distinct from the answer, and honest under the source-level frame test.
The helper's current comment claims non-zero `b` alone prevents a collision; implementation
must narrow that claim when multiplication joins the bank.

*Alternative considered:* construct word-problem prose in the generator. Rejected because
every other word skill uses fixed frames and the baseline requires every authored sentence to
be checked even if sampling never draws it.

### Tests remain both broad and local

`generators.test.ts` picks up all 14 skills automatically and already understands `×` for
inline, column, and story displays. Add local multiplication trace/misconception tests with
synthetic failure cases, a Unit 3 test that pins structural invariants, and the standard
recorded-output snapshot over five seeds at all five difficulties. Coverage counts move from
24/177 to 38/163, and the unlock snapshot grows a sequential Unit 3 path whose first skill
follows `sub-words`.

## Risks / Trade-offs

- **A shared helper makes 11 table skills sound mechanically identical.** → Share arithmetic
  structure only; keep per-skill hints and teaching emphasis authored at each declaration.
- **A wall prediction collides on a rare operand pair.** → Constrain operands where the proof
  requires it and run the central filter/content checks across roughly 1,000 problems per
  skill.
- **Reject-and-redraw exhausts on carry or digit constraints.** → Keep the shipped
  constraints dense, stress them over many seeds, and compose instead if a future structural
  condition makes rejection sparse.
- **The two-digit product is visually shown without its intermediate rows.** → Accepted: the
  current `Display` is the question surface, while the hint and worked solution are where the
  procedure is taught. No new rendering capability is required.
- **The new unit tightens prerequisites for later built skills.** → No later Unit 3+ skill is
  currently built. Existing practiced Unit 1 and 2 records keep their never-relock behavior.

## Migration Plan

There is no stored-data or API migration. Registering the generators derives the new playable
state and unlock edges at load. Rollback is the code commit: removing the registration returns
the skills to planned without changing saved progress.
