## Context

See `proposal.md` — Why. Unit 8a already supplies structured fraction notation, exact
rational checking, fraction and mixed-number keypad entry, `requireSimplified`,
`requireMixed`, and the right-value/wrong-form responses. The remaining six manifest skills
need content, structured semantics for their new display shapes, and a fraction-aware use of
the fixed-frame phrasing bank. No capability or manifest graph change is needed.

The existing independent verifier reconstructs every math display from a closed
`FractionData` union, while stories carry numeric operands and an `Operator`. The frame bank
currently assumes whole-number answers, including a division-only constraint that both
division pairs divide evenly; a fraction story deliberately needs the opposite result.

## Goals / Non-Goals

**Goals:**

- Keep every new answer independently recomputable from the data behind what the learner
  sees, without sharing display builders with the verifier.
- Use the 8a mixed-entry contract unchanged and keep mixed-answer problems positive.
- Construct both wall skills so their two required predictions survive every draw rather
  than relying on a large sample to get lucky.
- Extend the phrasing bank without weakening the whole-number banks' exact-division checks.

**Non-Goals:**

- Negative mixed-number input, a new answer status, or a new rendering/input capability.
- A general evaluator for `MathNotation`; fraction semantics remain a closed operation union.
- Fraction stories that mix all four arithmetic operations. The curriculum blurb “Spot the
  fraction” is implemented as part over whole, keeping one clear applied concept.

## Decisions

### Mixed displays get operation-specific semantic arms

Extend `FractionData` with `mixed-to-improper`, `add-mixed`, and `sub-mixed` arms carrying
explicit whole, numerator, and denominator fields. Add `multiply` and `divide` arms carrying
both proper fractions. The verifier reconstructs mixed notation as a row of whole-number text
and a stacked fraction, then derives exact values from integer source fields.

Alternative rejected: reuse the existing `add`/`sub` arms with improper numerators. That
would recompute the value but could not prove the learner saw mixed numbers. A general
notation evaluator is broader than the fraction-operation surface and would make
operation-specific mistakes easier to hide.

### Mixed arithmetic uses existing form checking

`mixed-to-improper` displays a reduced positive mixed number and answers with its reduced
improper fraction under `allowFraction`. `add-mixed` and `sub-mixed` answer under
`allowMixed`, `requireMixed`, and `requireSimplified`. Addition draws same-denominator mixed
numbers, mixing no-carry and carry cases across its ladder; any carry answer is reduced by
construction. Its arithmetic predictions are `added-wholes-only` and
`added-fractions-only`; an unre-grouped but value-equal entry is handled by `not-mixed`, not
mislabelled as a numeric misconception.

Every subtraction draw has a shared denominator, left fractional numerator below the right,
and whole parts far enough apart that borrowing leaves a positive mixed result. It predicts:

- `reversed-fraction-without-borrowing`: subtract wholes but reverse the fractional parts.
- `borrowed-one-piece`: reduce the whole by one but add `1` to the numerator instead of one
  denominator of pieces.

Draws reject a reducible result. Written over one denominator, both predictions are
algebraically distinct from the answer and each other; keeping the whole-part gap at least
two also keeps them positive and enterable without the sign key.

Alternative rejected: unlike-denominator mixed subtraction. It combines finding a common
denominator with the wall's named borrowing concept and makes diagnoses ambiguous. Unit 8a
already teaches unlike-denominator arithmetic independently.

### Division-wall predictions are separated by proper fractions

`mult-fractions` and `div-fractions` draw positive reduced proper operands, grow denominator
bands by difficulty, use fraction entry, and require lowest terms. Division additionally
rejects equal operand values, then predicts
`flipped-first` (`b/a × c/d`) and `multiplied-without-flip` (`a/b × c/d`). With both operands
strictly proper and unequal, neither can equal the correct `a/b × d/c`, and the two wrong
values cannot equal each other. Multiplication predicts adding across and multiplying only
one numerator; it is not a wall, so only valid, diagnosable sampled mistakes are required.

Alternative rejected: filter colliding division predictions after drawing. The central
filter remains a safety net, while construction makes the wall guarantee inspectable.

### Fraction stories are a specialized use of the shared frame contract

Add at least eight adult-situation frames whose quantities are `part`, `whole`, and an
irrelevant count, represented through the existing `Quantities` fields as `a`, `b`, and
`distractor`. The story display carries `[part, whole]` with `÷`; a fraction-specific story
builder returns an exact `rational(part, whole)` answer with `requireSimplified`, while
reusing seeded frame selection and the existing three frame-owned misconception formulas.

The frame registry marks this bank as fraction-valued and supplies separate check quantities:
`0 < part < whole`, `distractor > 1`, and `distractor !== whole`. It uses the fraction story
builder for content checks and asserts all three predicted values survive. Whole-number
division banks keep their existing exact-divisibility rules.

Alternative rejected: freely assemble fraction stories in the generator or reuse the
whole-number division builder. The former violates the authored-prose contract; the latter
turns a fraction into an integer answer and applies the wrong source checks.

### Difficulty and recorded output extend existing gates

Every ladder grows integer source fields by difficulty. The generic difficulty check reads
all new `FractionData` integer fields and story operands rather than relying on a proper
fraction answer's magnitude. Unit 8 tests independently assert bounds, arithmetic, form
responses, misconception formulas and survival, source variety, and difficulty growth.
Recorded output covers all six generators and the exhaustive semantic switches.

## Risks / Trade-offs

- [A mixed answer can be numerically correct but written with an improper fraction part] →
  Keep that out of numeric diagnoses and pin the existing `not-mixed` response in Unit 8
  tests.
- [A subtraction prediction can become negative and unreachable on the mixed keypad] → Draw
  a whole-part gap of at least two and test both prediction values as positive on every draw.
- [Fraction stories could weaken whole-number division's source checks] → Give the bank an
  explicit fraction kind and retain the exact-division assertions only for whole-number
  division banks.
- [Adding union arms can leave a verifier or recorder non-exhaustive] → Preserve exhaustive
  `never` switches and add synthetic mismatch tests for every new display family.

## Migration Plan

No stored data, sync, manifest, or capability migration is required. Shipping registers six
generators, which makes their existing manifest entries playable. Rollback removes those
generators and their semantic/test support, returning the skills to `planned` without
changing learner progress records.
