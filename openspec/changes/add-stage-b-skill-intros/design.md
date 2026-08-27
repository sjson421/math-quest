## Context

See `proposal.md` for the learner problem. Increment 25a already made `teachingLine`
optional generator metadata, validates it at its authored source, presents a stable
`generateProblem(skill, 1, 1)` example before first practice, persists `introSeen`, and
keeps Review intro separate from the active lesson session.

All 44 Stage B skills are playable. Their generators are split across one module per unit.
Most use `defineSkill` directly; seven fixed multiplication-table skills pass through the
existing `tableSkill` helper. Their generated problems already satisfy independent answer,
content, misconception, recorded-output, and coverage gates. This increment must add teaching
metadata without changing those problems or forcing Stages C–F to ship early.

## Goals / Non-Goals

**Goals:**

- Keep each teaching line beside the generator whose intro presents it.
- Pin every reviewed line and independently verify every stable Stage B intro answer.
- Preserve generated output, lesson behavior, progress state, answer controls, and wall
  diagnoses.
- Extend staged coverage and phone-layout proof from Stage A to Stages A and B.

**Non-Goals:**

- New intro infrastructure, display rendering, progress fields, sync behavior, or capabilities.
- New vocabulary authority beyond the Unit 4 terms already present.
- Making `teachingLine` required before increments 25c and 25d finish the playable course.
- Rewording generated prompts, hints, worked steps, choices, or misconceptions.

## Decisions

### Add content at the existing generator owner

Each direct `defineSkill` call gains the exact line assigned by its unit delta spec. Unit 3's
`TableSkillConfig` gains a required `teachingLine` field and `tableSkill` passes it to
`defineSkill`, so each of its seven table declarations remains the single owner of its id,
name, blurb, teaching line, and table-specific behavior.

A separate intro registry was rejected because it would repeat 44 skill ids and allow the
intro text to drift from the generator that renders its example. Bypassing `tableSkill` for
the seven fixed tables was rejected because it would duplicate their shared generation logic.
`teachingLine` remains optional on the public generator type until 25d; making it required
now would turn the ordered rollout into unrelated Stage C–F edits.

### Use the reviewed lines verbatim and the existing vocabulary checker unchanged

The five unit delta specs are the reviewed source for all 44 lines. Each line states one
concrete rule or action, uses one sentence, and avoids later-unit terms. Unit 4 uses exactly
one tracked current-unit term on each line that needs one: `remainder`, `factor`,
`multiple`, or `prime`. The other 40 Stage B lines use no tracked current-unit term.
The existing vocabulary authority already introduces those terms in Unit 4, so changing the
map would add no protection.

Coverage derives Stage B ids from the manifest, requires teaching lines on exactly Stages A
and B, runs `checkTeachingLine` on every line, and pins the expected vocabulary count. A
hand-written coverage roster was rejected because the manifest already owns membership and
order.

### Reuse the fixed generated example and verify its answer independently

No worked-example data is added. The intro continues to call the public generator at
difficulty 1 with fixed seed 1, so each new line automatically activates the same renderer,
answer label, solution list, persistence, and review flow proved in 25a.

Each unit test holds its exact line table and checks the matching generator plus
`checkTeachingLine`. It then generates every fixed intro example and recomputes the answer
without trusting the declared answer:

- Units 1 and 2 read inline or column operands and apply the visible operation; story examples
  use their carried operands and operation.
- Unit 3 reads inline or column operands and multiplies them; story examples use their carried
  equal-group quantities.
- Unit 4 parses displayed divisions, derives remainder or whole quotient where requested, and
  derives the correct factor, multiple, or prime choice label from the displayed number.
- Unit 5 evaluates the visible expression with the test's independent precedence evaluator.

Authored operands were rejected because they would create a second example source and violate
the roadmap's generated-example rule. Merely comparing the intro answer to the generator's
answer was rejected because it would repeat the value under test rather than verify it.
Teaching metadata is outside `Problem`, so existing recorded-output snapshots remain
byte-identical and must not be re-recorded.

### Keep misconception behavior byte-identical

Adding metadata does not touch any problem draw or returned problem field. Existing focused
and sampled gates therefore remain the proof for every wall:

- `add-2digit-carry`: forgotten carry and writing the full ones total.
- `sub-2digit-borrow`: flipped columns, unreduced tens, and skipped upper subtraction.
- `sub-across-zero`: flipped columns, an unpaid borrow, and a chain stopped at the lender.
- `times-7-8`: one equal group too few or too many.
- `mult-2by1`: forgotten carry and adding the carry before multiplying.
- `mult-2by2`: missing tens-row placeholder and stopping after the first partial product.
- `long-div-1digit`: forgotten bring-down and ignored step remainder.
- `long-div-2digit`: a leading estimate one place too low or high.
- `two-operations`: wrong written-order evaluation and stopping after the priority
  operation.

No snapshot update or prediction rewrite is expected. Any generated-output diff is a
regression to fix, not an artifact of this change.

### Validate every new intro at the installed phone size

The scripted Chromium gate opens all 44 Stage B intros at 375 by 812 pixels and checks the
teaching line, generated example, labelled answer, complete worked steps, actions, and absence
of horizontal or page overflow. One representative unseen intro also exercises leave and
return, Start practice, dismissal persistence, Review intro, active-problem continuity, and
feedback exclusivity; 25a already owns the generic interaction contract, while all 44 new
content combinations need layout proof.

The run captures and visually inspects at least one passing Stage B screenshot, clears its
IndexedDB state, and stops any server it started.

## Risks / Trade-offs

- **[Risk] A concise line teaches a shortcut that is not true for every generated shape**:
  pin exact reviewed lines beside independent example checks and retain full generator sweeps.
- **[Risk] One of 44 example-and-solution combinations exceeds the phone height**: exercise
  every Stage B intro at 375 by 812 pixels and treat hidden actions or page overflow as a
  failure.
- **[Risk] A wording edit introduces two Unit 4 technical terms or a later concept**: run the
  existing authored-source check on every line and pin the expected vocabulary count.
- **[Risk] Metadata work accidentally changes seeded output**: retain all recorded-output
  snapshots and reject any diff.
- **[Trade-off] Existing learners see 44 newly supplied intros once as they revisit skills**:
  this is the established harmless migration direction; the optional seen flag and opaque
  sync path already preserve prior choices.

## Migration Plan

1. Ship all 44 lines, their source and fixed-example tests, staged coverage, and documentation
   together; partial Stage B intro coverage is not an accepted state.
2. Do not change progress schema or sync. Existing and restored records with no true seen flag
   show each newly supplied intro once.
3. On rollback, older code ignores but preserves existing `introSeen` values and Stage B
   returns to its prior warm-up-first flow. Reapplying the change restores the saved seen state.
