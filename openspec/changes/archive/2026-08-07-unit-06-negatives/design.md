## Context

See proposal.md — Why. The constraints that actually shape the approach:

- **The independent verifier is already ready for signed literals.** `generators.test.ts`
  recomputes every answer by parsing the display and evaluating it under precedence; its
  `factor()` already accepts a leading `-` or `−`, with a comment saying in as many words
  that no generator produces one today and Unit 6 will. So the arithmetic skills need
  nothing from it. Only a display that is *not* arithmetic does.
- **Two sign glyphs already coexist on purpose.** Everything a learner reads uses `−`; the
  answer checker parses `-`. `number-line.ts` names this and keeps `tickLabel` and
  `tickEntry` separate so the two meet in one place rather than wherever a value is passed
  to the wrong function. Unit 6 is the first content to route a sign through the *pad*, so
  the pad needs the same treatment.
- **A predicted mistake equal to the answer is dropped centrally and silently.** A wall can
  therefore ship diagnosing nothing while every test passes. `alwaysFiltered` catches a tag
  that collapses on *every* problem; it cannot catch one that collapses on a tenth of them.
- **The draw must not be a filter.** Unit 2 exhausted a three-property reject-and-retry in
  front of a learner; Unit 5's answer was to compose operands so the constraint holds by
  construction. Unit 6 has more constraints than either, so it composes.

## Goals / Non-Goals

**Goals:**

- Nine generators whose answers are computed from the operands they just drew, and whose
  predicted mistakes are values a learner can actually enter.
- One rule, in one place, for how a sign is drawn versus how it is submitted.
- A distance-from-zero problem that is independently verifiable without being evaluable.
- Unit 6's shapes stay in Unit 6.

**Non-Goals:**

- No generalisation toward Unit 13's signed variables or Unit 15's inequalities. The model
  here covers what Unit 6 displays.
- No change to how a sign is *entered*: `applyKey` toggles it, `parseInput` reads it, and
  both stay as they are.
- No second submission channel. A placed tick and a typed number are the same entry, as
  `number-line-input` already established.

## Decisions

### 1. Capability work and content work, separated

Three pieces of this change are capability work on shipped surfaces, and they are listed
first because the content depends on all three. None of them is a *new* capability —
`AVAILABLE_CAPABILITIES` is untouched.

| Capability work | Where | Why it is not content |
| --- | --- | --- |
| A distance-from-zero display variant | `src/lib/types.ts`, `generators.test.ts` | Widens what a problem may carry and what verification can read |
| One sign-glyph rule for the pad | `src/lib/keypad.ts`, `src/components/Lesson.tsx` | Fixes a shipped control that disagrees with itself |
| Recording the two unrendered fields | `src/curriculum/recorded-output.ts` | Widens the review surface every future unit is gated by |

The content work is one new module plus its test file, and touches nothing else except the
registry line that imports it and the counts that follow from it.

### 2. The sign key is offered when a negative is *plausible*, not only when it is correct

`docs/roadmap.md` item 14 says to declare `keypad: { allowNegative: true }` on problems whose
answers are negative "and only those". That cannot be reconciled with the content contract,
and the conflict is not a matter of taste:

- `docs/curriculum.md` names 6.3's wall as "added magnitudes, kept sign". For `−3 + 5` that
  mistake is `−8`. Under the narrow rule the answer is `2`, so no sign key, so the unit's
  documented wall misconception is unenterable on the problem it describes.
- 6.5 is the major wall and must carry two distinct surviving diagnoses on **every** problem.
  For `a − (−b)` with a digits-only pad there is exactly one enterable wrong value, `a − b`.
  Every other mistake a learner makes here — negating the result, keeping the subtraction and
  going below zero — is negative.
- 6.8's only real mistake is keeping the sign, which is negative by definition.

And the cost is not just a missed diagnosis. A pad with no sign key **tells the learner the
answer is not negative**, at exactly the three skills whose question is what sign the answer
has.

So: a problem permits a sign when a negative value is a plausible answer to it — the correct
answer or a predicted mistake. Implemented by computing the answer and the predictions first
and deriving the declaration from them, so the two cannot drift.

**Consequence, stated rather than discovered later:** every Unit 6 problem answered on the
pad ends up offering the sign. The per-problem mechanism is still the mechanism — Unit 8's
fractions will use it to say something different — it is simply the case that every keypad
problem in this unit qualifies. `negatives-numberline` and `compare-negatives` have no pad at
all.

*Alternative rejected:* follow the roadmap and invent a weaker second misconception for 6.5
so the wall rule is satisfied on paper. That is authoring a diagnosis nobody makes in order
to pass a test whose purpose is to guarantee real ones.

*Alternative rejected:* declare it stage-wide. `answer-entry` already forbids this, and the
reasoning holds: a generator knows the shape of what it just computed and nothing above it
does.

`docs/roadmap.md` item 14 is corrected in this change rather than left contradicting the
implementation.

### 3. One function owns the minus glyph

`tickLabel` in `number-line.ts` is `format(tick)` with the hyphen swapped for `−`.
`Lesson.tsx` needs the same swap for a typed entry. Rather than a second copy, the swap moves
to `entryLabel` in `src/lib/keypad.ts` — the module that owns what the pad emits, beside
`applyKey` which produced the string — and `tickLabel` becomes `entryLabel(tickEntry(tick))`,
which it already was by another name.

*Alternative rejected:* leave the duplication and add a second one-liner. Two owners of a
notation rule is precisely the defect this is fixing, one level up.

*Alternative rejected:* normalise the entry to `−` and teach `parseInput` to read it. That
puts a display concern into the checker and makes every stored entry ambiguous.

What is submitted, checked, and diagnosed is untouched: `entryLabel` is applied where the
entry is *shown*, in the keypad branch of `Lesson.tsx`'s `visibleEntry`, next to the choice
and number-line branches that already do their own translation there.

### 4. Distance from zero carries its value rather than being evaluated

`|−7|` is not arithmetic — the independent evaluator throws on `|`, correctly, because
inventing a rule for it would make the checker agree with a generator by construction. And a
bare `−7` display would recompute to −7 against an answer of 7.

So `absolute-value` displays `|−7|` and carries `{ operation: 'absolute-value', value: -7 }`,
taking the branch `divide-remainder` established: the answer is a *property* of what is
shown, so verification derives it from the carried value and checks the display was built
from that same value. `sourceValues` needs no case — its default already reports `[value]`,
which is the number the difficulty ladder grows.

### 5. Unit 6's shapes stay in `unit-06-negatives.ts`

Signed rendering, the four signed operations, and the mistakes each invites are unit-private.
Unit 4 set this rule for number theory and Unit 5 restated it for expressions: a helper
reaches `engine/` when a *second unit* needs it. Unit 13's `distribute-negative` is the next
plausible consumer and is nine units away; a shape promoted now is a shape guessed at.

### 6. Operands are composed, not filtered

Every collision is excluded by construction rather than drawn and rejected:

- `a ≠ b` wherever a prediction is `a − b` or `−(b − a)`, so it cannot land on the answer.
- `a × b` with `(2, 2)` excluded on the both-negative multiplication, the one pair where
  `a + b` equals `a × b` and the predicted addition collides with the answer.
- Division composed from the quotient outward — draw `q` and `d`, display `±(q × d) ÷ ±d` —
  so exactness is structural rather than a filter over dividends, which is the idiom `pemdas`
  used for the same reason.
- The number line is symmetric about zero, so the mirrored tick is always a real tick, and
  the target is never zero, so the mirror is never the answer.

### 7. The misconceptions each generator must predict

Named here because `openspec/config.yaml` requires it of a design, and because the wall
skills are where this change is most likely to ship something that looks right and diagnoses
nothing. ⚠️ marks a wall in `docs/curriculum.md`; ⚠️⚠️ the major wall.

| Skill | Tag | Value | The mistake |
| --- | --- | --- | --- |
| 6.1 `negatives-numberline` | `mirrored-across-zero` | `−t` | Counted the right distance on the wrong side of zero |
| | `counted-the-zero` | `t − sign(t)` | Counted zero itself as the first step |
| 6.2 `compare-negatives` ⚠️ | `reversed-comparison` | `−relation` | "Bigger digit means bigger number" — the documented wall |
| | `called-equal` | `0` | Two negatives read as interchangeable |
| 6.3 `add-neg-pos` ⚠️ | `added-magnitudes` | `−(a + b)` | Added the magnitudes and kept the sign — the documented wall |
| | `wrong-sign` | `a − b` | Right distance apart, sign taken from the wrong operand |
| 6.4 `add-two-negs` | `dropped-the-signs` | `a + b` | Added as though both were positive |
| | `subtracted-instead` | `−\|a − b\|` | Applied the opposite-signs rule to two like signs |
| 6.5 `sub-negatives` ⚠️⚠️ | `still-subtracted` | `a − b` / `−(a + b)` | Two minus signs read as one — the major wall |
| | `negated-the-whole` | `−(a + b)` | The double sign taken to negate the result |
| | `dropped-both-signs` | `a − b` | Read the line as though no sign were written |
| 6.6 `mult-negatives` | `wrong-sign` | `−(answer)` | The sign rule inverted — the whole subject of the skill |
| | `added-instead` | signed `a + b` | 6.4's rule carried into multiplication |
| 6.7 `div-negatives` | `wrong-sign` | `−(answer)` | The sign rule inverted |
| | `multiplied-instead` | signed `dividend × divisor` | Ran the inverse operation |
| 6.8 `absolute-value` | `kept-the-sign` | `−\|v\|` | Read it as "make it negative" rather than "how far from zero" |
| 6.9 `negatives-mixed` | — | — | Inherits whichever shape it drew |

6.5 carries three tags across its two shapes and exactly two on any one problem:
`a − (−b)` predicts `still-subtracted` and `negated-the-whole`; `−a − (−b)` predicts
`still-subtracted` and `dropped-both-signs`. Both shapes are drawn, so all three tags reach a
learner and `alwaysFiltered` stays quiet.

### 8. The name and blurb each generator must carry, verbatim

`coverage.test.ts` fails any generator whose `name` or `blurb` differs from its manifest
entry, and blurbs over 32 characters. Copied here from `src/curriculum/manifest/stage-c.ts`
so the implementation transcribes rather than invents — several of these blurbs contain a
typographic minus, which is exactly the character a retyped version gets wrong.

| Id | `name` | `blurb` |
| --- | --- | --- |
| `negatives-numberline` | Below Zero | Read values below zero |
| `compare-negatives` | Comparing Negatives | −7 < −3 |
| `add-neg-pos` | Negative Plus Positive | −3 + 5 |
| `add-two-negs` | Adding Two Negatives | −3 + −5 |
| `sub-negatives` | Subtracting a Negative | 5 − (−3) |
| `mult-negatives` | Multiplying Negatives | The sign rules |
| `div-negatives` | Dividing Negatives | The same sign rules |
| `absolute-value` | Absolute Value | Distance from zero |
| `negatives-mixed` | Mixed Negatives | Interleaved review |

### 9. `negatives-mixed` reuses the builders rather than re-authoring them

6.9 draws one of the shapes 6.3–6.8 and calls the same private builder the standalone skill
calls. Written twice, a reworded diagnosis would land on the standalone skill and silently
not on the review — the failure Unit 5 avoided by writing `sameTier` once for both of its
same-precedence families. It includes the distance-from-zero shape too: `prompt` is already
per problem, so a review that asks two kinds of question costs nothing, and Unit 6's surface
is both.

### 10. The unit's own gate reads its displays independently

`unit-06-negatives.test.ts` writes its own reader for the unit's displays rather than
importing the generator's rendering or reusing `generators.test.ts`'s evaluator — the third
copy, on purpose, exactly as Unit 5's `evaluateText` is. Unit 5's comment on that function
already anticipates this unit: it throws on a symbol it does not know rather than guessing,
so `|` reaching it would be loud.

## Risks / Trade-offs

- **A prediction silently equal to the answer on a fraction of problems** → the composition
  rules in decision 6, plus a per-unit sweep asserting every skill's surviving tag count on
  every problem of a wide seed set, not only the five recorded seeds.
- **Rewiring `tickLabel` touches shipped, tested behaviour** → it is a rename of an existing
  derivation, not a change to it; `number-line-input`'s own suite and the Lesson tests both
  cover the tick labels and must stay green untouched.
- **Adding two keys to `RENDERED_KEYS` re-records nothing** for Units 0–5, since no generator
  there sets either field — but if any snapshot outside Unit 6 moves, that is a real finding
  about a field being set unnoticed, not churn to accept.
- **The difficulty ladder is measured on `|answer|`** for the arithmetic skills, and two
  answers here are *differences* of two growing operands: `add-neg-pos`'s `b − a`, and
  `sub-negatives`' second shape `b − a`. A ladder that widens both operands symmetrically can
  leave the mean difference flat → the ladder widens the gap between the bands, not only
  their span, and the sweep asserts the measured growth rather than trusting the numbers to
  look wider.
- **Opening Stage C changes what several counting assertions mean** → each is updated to the
  new count with its premise re-read, not silently re-recorded; the "number line unlocked
  nothing" case keeps its property by narrowing to Stage D, which is still true and still
  worth pinning.
