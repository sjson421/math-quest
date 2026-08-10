## Context

See `proposal.md` for motivation and scope. Stage D's five required capabilities are already
available, but the generic verification gate deliberately rejects every math display because
notation rendering does not claim to evaluate mathematical meaning. Diagram verification can
derive a rational directly, while choices currently carry only an id and prose label.

The six skills are conceptual and ordered deliberately. Their generated content must use the
manifest's existing graph, exact rational answer checker, node-side recorded-output tests, and
phone-sized lesson controls without adding stored state or another capability.

## Goals / Non-Goals

**Goals:**

- Make every scoped answer independently derivable from structured display data.
- Keep each skill on the control and representation its concept calls for.
- Scale denominators, part counts, tick density, and equivalence factors measurably while
  preserving readable phone layouts.
- Record every authored field and cross-check the words against the values they describe.

**Non-Goals:**

- Evaluating arbitrary `MathNotation` trees or parsing learner-facing fraction prose.
- Enforcing an authored fraction form through the exact-rational answer checker.
- Sharing fraction-generation helpers with later units before a second unit needs them.

## Decisions

### Carry a closed fraction operation beside structured notation

Add optional fraction-operation data to the math display with four shapes: read a fraction,
name a requested part, place a fraction, and fill one missing term after scaling numerator and
denominator by a stated factor. Each arm carries integer numerator and denominator values. The
name arm also carries `requestedPart: 'numerator' | 'denominator'`; the scaling arm carries its
factor, `direction: 'up' | 'down'`, and missing side. Production Unit 7 math problems always set
this data, while renderer-only fixtures may omit it and the verification gate continues to
reject a math problem that does.

Independent verification reconstructs the notation expected for each operation, compares it
with the visible tree and label, then derives the exact rational, expected vocabulary choice,
or missing integer. A general notation evaluator was rejected because later formulas may ask
for properties rather than values and the notation capability explicitly avoids becoming a
second algebra system. Parsing the authored accessible label was rejected because prose cannot
be the source of mathematical truth.

### Give value-bearing prose choices optional exact rational metadata

Extend a choice with an optional exact rational value. `equivalent-visual` draws a reducible
shaded diagram and offers prose descriptions such as counts of shaded parts among equal parts;
exactly one option's metadata equals the diagram fraction. Verification finds that option from
structured values, while focused Unit 7 tests prove each label describes its metadata.

Putting literal slash fractions in ordinary choice labels was rejected because it bypasses the
structured notation surface. Parsing number words from labels was rejected because it makes
authored prose the verification source. Adding a required-form answer rule was rejected because
this skill only needs recognition and the roadmap assigns answer-form work to a later change.

### Use one representation and input contract per skill

- `fraction-meaning` shows a structured numerator count over an equal-parts count and accepts
  the fraction those two quantities name with the slash key.
- `fraction-of-shape` shows a bar, circle, or grid and accepts the visible fraction.
- `name-parts` asks in its prompt whether the top or bottom number is being named, shows a
  structured fraction, and chooses `Numerator` or `Denominator` with stable ids.
- `fractions-numberline` shows a structured target fraction and places it on an exact line whose
  step shares that denominator. Fraction-line diagnosis remains generic, matching the existing
  number-line capability trade-off.
- `equivalent-visual` uses a reducible diagram and structured-value prose choices, keeping the
  recognition task visual without requiring a typed form.
- `equivalent-multiply` shows a structured equality in both scale-up and scale-down directions
  with one missing integer and accepts that integer. It predicts changing only the opposite term
  and adding or subtracting the scale factor.

No scoped skill is a curriculum wall, so the two-surviving-predictions invariant does not apply.
The fraction-entry skills omit numeric predictions because the existing diagnostic matcher does
not parse slash-form entries; widening answer diagnosis is not needed to teach this increment.
The whole-number scaling skill retains predictions that the current matcher can diagnose.

### Keep Unit 7 helpers local and test through independent readers

The unit module owns fraction notation builders, denominator ladders, word labels, and its
draw constraints. They do not move into `engine/` until another unit demonstrates reuse. The
unit test independently reads the closed notation shapes and value-bearing choice labels,
checks every input/display pairing, exact line membership, rational metadata, non-degenerate
draws, misconception formulas, and recorded output. The global generator gate gains only the
fraction-operation branches and source magnitudes needed for all generators to remain covered.

### Record this as a partial roadmap increment

Register the six generators, mark exactly rows 7.1–7.6 built, and update the sole playable
count from 61 to 67. Keep roadmap item 19 unchecked and do not mark 7.7–7.9 built. Coverage
pins the six implemented ids, the three planned ids, the new Unit 7 course position, and the
unchanged manifest graph authority.

## Risks / Trade-offs

- **Dense fraction lines can make targets too narrow** → Bound denominator ladders to the
  existing phone-tested tick range and validate a representative real lesson at 375 pixels.
- **Optional semantic data could be omitted from a production math problem** → Keep the global
  verifier's named failure for math displays without operation data and add a synthetic case.
- **Choice labels and rational metadata can drift** → Derive both from one local record, render
  both in snapshots, and independently read them in Unit 7 tests.
- **Equivalent distractors can collide after rational reduction** → Reject draws until all
  option values are distinct and assert uniqueness over the full sampled sweep.
- **Six new skills widen the generic scaling heuristic** → Measure difficulty from carried
  denominators, part counts, and scale factors rather than from fraction answer magnitude.

## Migration Plan

1. Add the structured fraction-operation and rational-choice records with synthetic verifier
   coverage.
2. Implement and independently test the six generators, then register them.
3. Update coverage and the curriculum/roadmap authorities, and validate the reachable lesson in
   the real app at phone width.

Rollback removes the Unit 7 registry entry, generator module and tests, then removes the new
optional authoring fields and restores the 61-skill documentation. No stored record or sync
payload needs migration.
