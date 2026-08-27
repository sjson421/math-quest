## Context

See `proposal.md` for the learner problem. Increment 25a already made `teachingLine`
optional generator metadata, validates it at its authored source, presents a stable
`generateProblem(skill, 1, 1)` example before first practice, persists `introSeen`, and
keeps Review intro separate from the active lesson session. Increment 25b established the
content-only rollout pattern for a full stage.

All Stage C and D skills are playable. Their 59 generators are split across one module per
unit and already carry structured display data used by independent answer checks. The
roadmap's 25c line says 57 skills, but the manifest authority defines nine Stage C skills and
50 Stage D skills. No repository source identifies two skills to omit.

## Goals / Non-Goals

**Goals:**

- Keep each teaching line beside the generator whose intro presents it.
- Pin every reviewed line and independently verify every stable Stage C and D intro answer.
- Preserve generated output, lesson behavior, progress state, answer controls, and wall
  diagnoses.
- Extend staged coverage and phone-layout proof from Stages A and B to Stages A through D.
- Prove the existing intro composition handles diagram examples without a second renderer.

**Non-Goals:**

- New intro infrastructure, display rendering, progress fields, sync behavior, or
  capabilities.
- New vocabulary authority; Units 6–11 already have every tracked term these lines use.
- Making `teachingLine` required before increment 25d completes the playable course.
- Rewording generated prompts, hints, worked steps, choices, story frames, or
  misconceptions.

## Decisions

### Treat 25c as all 59 manifest skills

The change follows the manifest-authoritative membership for Stage C and Stage D: nine plus
50 skills. It also corrects the roadmap's 57-skill label to 59. The six-generator content
limit does not split this increment because no generator is added; this change adds authored
metadata to existing playable generators, exactly as the roadmap's stage-wide intro increment
requires.

Shipping a literal 57 was rejected because no authority names two exclusions and the result
could not satisfy “Stages C and D.” Splitting the increment by generator count was rejected
because that limit governs adding generated content, while this work changes no generated
problem.

### Add content at the existing generator owner

Each direct `defineSkill` call gains the exact line assigned by its unit delta spec. A
separate intro registry was rejected because it would repeat 59 skill ids and allow teaching
content to drift from the generator that supplies its example. `teachingLine` remains optional
on the public generator type until 25d; making it required now would turn this ordered rollout
into unrelated Stage E and F edits.

### Use the reviewed lines verbatim and the existing vocabulary checker unchanged

The six unit delta specs are the reviewed source for all 59 lines. Every line states one
concrete rule or action, uses one sentence, and avoids later-unit terms. The existing
vocabulary authority already owns every tracked term used here, so changing it would add no
protection.

Coverage derives Stage C and D ids from the manifest, requires teaching lines on exactly
Stages A through D, runs `checkTeachingLine` on every line, and pins these current-unit term
sequences:

- Unit 6: `absolute value`.
- Unit 7: `equivalent fraction`, `lowest terms`, `denominator`, `denominator`.
- Unit 8: `common denominator` on three lines, then `improper fraction`, `mixed number`, and
  `reciprocal`.
- Unit 9: `decimal` on nine lines.
- Unit 10: `percent` on eight lines.
- Unit 11: `ratio` on three lines, plus `unit rate` and `proportion`.

A hand-written coverage roster was rejected because the manifest already owns membership and
order. Adding untracked synonyms to the vocabulary map was rejected because the map
deliberately covers technical terms, not every mathematical word.

### Reuse the fixed generated example and existing semantic checks

No worked-example data is added. The intro continues to call the public generator at
difficulty 1 with fixed seed 1, so each new line activates the existing renderer, answer
label, solution list, persistence, and review flow.

Each unit test holds its exact line table and checks the matching generator plus
`checkTeachingLine`. It then generates every fixed intro example and reuses that unit's
independent visible-data logic:

- Unit 6 reads drawn whole-number shapes, comparison metadata, and number-line targets.
- Unit 7 derives exact fractions from notation or shaded counts and resolves choice labels.
- Unit 8 calculates from structured fraction operations or carried story quantities and
  checks required fraction, mixed-number, and lowest-terms forms.
- Unit 9 calculates from structured decimal, fraction, column, choice, or carried money data
  and checks required decimal or fraction forms.
- Unit 10 calculates percent relations, changes, money totals, and interest from structured
  visible quantities.
- Unit 11 calculates directed ratios, unit prices, proportions, scale directions, and unit
  conversions from structured visible quantities.

Authored operands were rejected because they would create a second example source. Comparing
the intro answer only to the generator's answer was rejected because it would trust the value
under test. Teaching metadata is outside `Problem`, so recorded-output snapshots must remain
byte-identical.

### Keep every existing wall diagnosis unchanged

Adding metadata does not touch any problem draw or returned problem field. Existing focused
and sampled gates remain the proof for every Stage C and D wall:

- `compare-negatives`: reversed comparison and false equality.
- `add-neg-pos`: adding magnitudes and keeping the wrong sign.
- `sub-negatives`: still subtracting, dropping both signs, or negating the whole expression,
  according to the generated subtraction shape.
- `simplify-fractions`: reducing only the numerator or only the denominator.
- `compare-diff-den`: comparing numerators only and false equality.
- `add-frac-same-den`: adding denominators and copying one addend.
- `add-frac-diff-den`: adding straight across and leaving scaled numerators unchanged.
- `sub-mixed`: reversing the fraction subtraction without borrowing and borrowing one piece
  instead of one whole.
- `div-fractions`: flipping the first fraction and multiplying without flipping.
- `compare-decimals`: treating the longer numeral as larger and false equality.
- `mult-decimals`: placing the point with too few or too many decimal places.
- `div-by-decimal`: shifting only the divisor or only the dividend.
- `decimal-to-percent`: leaving the point unmoved and shifting it one place.
- `find-the-percent`: leaving the part-to-whole ratio unscaled and dividing whole by part.
- `find-the-whole`: applying the percent again and treating the percent as a whole number.
- `ratio-words`: confusing part-to-part with part-to-whole and reversing the requested order.

No snapshot update or prediction rewrite is expected. Any generated-output diff is a
regression to fix, not an artifact of this change.

### Validate every new composition at the installed phone size

The scripted Chromium gate opens all 59 Stage C and D intros at 375 by 812 pixels and checks
the teaching line, generated example, labelled answer, complete worked steps, actions, and
absence of horizontal or page overflow. It starts practice on a Stage C intro and reviews the
same intro from the active lesson to prove the metadata reaches the established flow. It also
captures and visually inspects a passing Unit 7 diagram intro, clears its IndexedDB state,
and stops any server it started.

A new component-layout harness was rejected because real Chromium already owns responsive
composition and visual inspection. Repeating the full progress and sync matrix was rejected
because this change adds no state or mutation path.

## Risks / Trade-offs

- **[Risk] A concise line teaches a shortcut that is not true for every generated shape**:
  pin exact reviewed lines beside fixed examples and retain full generator sweeps.
- **[Risk] One of 59 example-and-solution combinations exceeds the phone height**: exercise
  every new intro at 375 by 812 pixels and treat hidden actions or page overflow as failure.
- **[Risk] A diagram intro loses labels or clips its shape**: exercise both diagram-bearing
  skills and visually inspect a passing diagram screenshot.
- **[Risk] A wording edit introduces multiple current-unit terms or a later concept**: run
  the existing authored-source check on every line and pin expected vocabulary use.
- **[Risk] Metadata work changes seeded output**: retain all recorded-output snapshots and
  reject any diff.
- **[Trade-off] Existing learners see 59 newly supplied intros once as they revisit skills**:
  this is the established harmless migration direction; the optional seen flag and opaque
  sync path already preserve prior choices.

## Migration Plan

1. Ship all 59 lines, their source and fixed-example tests, staged coverage, and
   documentation together; partial Stage C or D intro coverage is not an accepted state.
2. Do not change progress schema or sync. Existing and restored records with no true seen flag
   show each newly supplied intro once.
3. On rollback, older code ignores but preserves existing `introSeen` values and Stages C and
   D return to their prior warm-up-first flow. Reapplying the change restores saved seen state.
