## Context

See `proposal.md` for the learner problem. Increment 25a already made `teachingLine`
temporary optional generator metadata, validates it at its authored source, presents a stable
`generateProblem(skill, 1, 1)` example before first practice, persists `introSeen`, and keeps
Review intro separate from the active lesson session. Increments 25b and 25c established the
content-only rollout pattern through Stage D.

All 62 Stage E and F skills are playable. Their generators are split across one module per
unit and already expose the structured math, equation, coordinate, polynomial, and function
data used by independent answer checks. Adding the last teaching lines means every one of the
173 playable generators carries the metadata, which is the point where temporary type
optionality can end.

## Goals / Non-Goals

**Goals:**

- Keep each teaching line beside the generator whose intro presents it.
- Pin every reviewed line and independently verify every stable Stage E and F intro answer.
- Preserve generated output, lesson behavior, progress state, answer controls, and wall
  diagnoses.
- Extend staged content coverage and phone-layout proof from Stages A–D through Stage F.
- Make omission of intro content a compile-time error for every future generator.

**Non-Goals:**

- New intro infrastructure, display rendering, progress fields, sync behavior, capabilities,
  or vocabulary terms.
- Authored worked-example operands or a second source for example answers.
- Rewording generated prompts, hints, worked steps, choices, story frames, or
  misconceptions.
- Adding Stage G or H generators before their roadmap items.

## Decisions

### Treat 25d as all 62 manifest skills

The change follows manifest-authoritative Stage E and F membership: 34 plus 28 skills. The
six-generator content limit does not split this increment because no generator is added; this
change adds authored metadata to existing playable generators, exactly as the roadmap's
stage-wide intro increment requires.

Splitting the work by generator count was rejected because that rule limits new generated
problem content, while this change changes no problem draw or output. Shipping a partial unit
was rejected because it would leave roadmap item 25 incomplete and preserve the temporary
optional type for another change.

### Add content at the existing generator owner, then require it

Each direct `defineSkill` declaration gains the exact line assigned by its unit delta spec.
After all 62 declarations carry the field, `teachingLine` becomes required on both
`SkillConfig` and `SkillGenerator`, and `defineSkill` continues to copy it without another
registry or lookup.

A separate intro registry was rejected because it would repeat 62 skill ids and allow
teaching content to drift from the generator that supplies its example. Leaving the field
optional was rejected because the staged exception ends here and future Stage G or H content
must not compile without its promised intro.

This type closure changes no stored data or runtime answer behavior. `introSeen` remains the
same optional presentation field because old and synced progress records still need read-time
defaulting; teaching metadata and seen state have different compatibility needs.

### Use the reviewed lines verbatim and keep the vocabulary authority unchanged

The eight unit delta specs are the source for all 62 reviewed lines. Every line states one
rule or action, uses one sentence, and avoids later-unit terms. Coverage derives Stage E and F
ids from the manifest, requires teaching lines on every playable generator, runs
`checkTeachingLine` on every line, and pins these current-unit term sequences:

- Unit 12: `exponent` on seven lines and `square root` on one line.
- Unit 13: `variable` on two lines, `like terms` on two, and `distribute` on two.
- Unit 14: `equation` on two lines.
- Unit 15: `inequality` on three lines.
- Unit 16: `coordinate`, `quadrant`, `slope` on three lines, and `intercept`.
- Unit 17: no newly introduced tracked term.
- Unit 18: `polynomial` on two lines, `binomial`, and `quadratic`.
- Unit 19: `function` and `domain`.

A hand-written 173-id coverage roster was rejected because the manifest already owns
membership and order. Adding synonyms to `VOCABULARY` was rejected because its deliberate
scope is technical curriculum terms, and every term these lines need is already present.

### Reuse the fixed generated example and each unit's semantic checks

No worked-example data is added. The intro continues to call the public generator at
difficulty 1 with fixed seed 1, so each line activates the existing renderer, answer label,
solution list, persistence, and review flow.

Each unit test holds its exact line table and checks the matching generator plus
`checkTeachingLine`. It then generates every fixed intro example and reuses that unit's
independent verification path:

- Unit 12 rebuilds factor counts, powers, roots, exponent rules, reciprocals, scientific
  values, and operation order from `PowerData`.
- Unit 13 parses the visible term or phrase and independently resolves numeric, choice,
  expanded-expression, and exact-factored answers.
- Unit 14 derives balanced values, equation solutions, solution-count choices, word-problem
  values, and rearranged expressions from displayed equations and their semantic data.
- Unit 15 derives readings, graph descriptions, solved relations, and satisfying-value counts
  from the displayed relation and inequality payload.
- Unit 16 derives target points, quadrants, slopes, intercepts, matching lines, and line
  expressions from coordinate-plane data and rendered line points.
- Unit 17 solves the two structured equations or carried pass-sale quantities to recover the
  intersection point.
- Unit 18 rebuilds expanded and factored expressions and unordered root pairs from
  `PolynomialData` and visible coefficients.
- Unit 19 resolves input-output, evaluation, domain/range, linearity, and cross-representation
  comparisons from equation and coordinate data.

Authored operands were rejected because they would create a second example source. Comparing
an intro answer only to the generator's declared answer was rejected because it would trust
the value under test. Teaching metadata remains outside `Problem`, so recorded-output
snapshots must remain byte-identical.

### Keep every existing wall diagnosis unchanged

Adding metadata does not touch any problem draw or returned problem field. Existing focused
and sampled gates remain the proof for every Stage E and F wall:

- `evaluate-powers`: multiplying base by exponent and swapping base with exponent.
- `power-of-power`: adding exponents and ignoring the outer exponent.
- `words-to-expression`: reversing operand order and using addition.
- `combine-like-terms`: folding the constant into the coefficient and dropping the variable.
- `distributive`: multiplying only the first term and multiplying only the second term.
- `distribute-negative`: not flipping the second sign, multiplying only the first term, and
  dropping the outside sign.
- `two-step`: undoing in the wrong order and using the wrong sign.
- `flip-the-sign`: not reversing the relation, losing the boundary sign, and doing both.
- `plot-points`: reversing coordinate order and reversing vertical direction.
- `slope-from-points`: inconsistent subtraction order and using run over rise.
- `elimination`: not scaling the right side and eliminating before scaling.
- `sub-polynomials`: subtracting only the first term and adding the polynomials.
- `factor-trinomial`: satisfying only the product and satisfying only the sum.
- `function-notation`: reading the notation as multiplication and reversing input with
  output.

No snapshot update or prediction rewrite is expected. Any generated-output diff is a
regression to fix, not an artifact of this change.

### Validate every advanced composition at the installed phone size

The scripted Chromium gate opens all 62 Stage E and F intros at 375 by 812 pixels and checks
the exact teaching line, generated example, labelled answer, complete worked steps, actions,
and absence of horizontal or page overflow. It exercises representative notation, equation,
coordinate-plane, expression-answer, and root-pair intros; captures and visually inspects a
passing full quadratic-formula intro; clears its IndexedDB state; and stops any server it
started.

A new component-layout harness was rejected because real Chromium owns responsive
composition and visual inspection. Repeating the progress and sync matrix was rejected
because this change adds no state or mutation path.

## Risks / Trade-offs

- **[Risk] A concise line teaches a shortcut that is not true for every generated shape**:
  pin exact reviewed lines beside fixed examples and retain full generator sweeps.
- **[Risk] One of 62 example-and-solution combinations exceeds the phone height**: exercise
  every new intro at 375 by 812 pixels and treat hidden actions or page overflow as failure.
- **[Risk] Dense notation, a coordinate plane, or two root slots clip inside the intro**:
  exercise every new intro, cover each advanced representation explicitly, and visually
  inspect the fullest quadratic example.
- **[Risk] A wording edit introduces multiple current-unit terms or a later concept**: run
  the authored-source check on every line and pin the expected term sequences.
- **[Risk] Metadata work changes seeded output**: retain all recorded-output snapshots and
  reject any diff.
- **[Trade-off] Existing learners see 62 newly supplied intros once as they revisit skills**:
  this is the established harmless migration direction; existing `introSeen` values and the
  opaque sync path already preserve prior choices.

## Migration Plan

1. Ship all 62 lines, required generator typing, source and fixed-example tests, complete
   coverage, and documentation together; partial Stage E or F intro coverage is not an
   accepted state.
2. Do not change progress schema or sync. Existing and restored records with no true seen
   flag show each newly supplied intro once.
3. On rollback, restoring optional generator typing and removing these lines returns Stages E
   and F to their prior warm-up-first flow. Older code ignores but preserves existing
   `introSeen` values, so reapplying the change restores saved seen state.
