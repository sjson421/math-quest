## 1. Typed exercise data and independent checks

Each task is scoped to less than two hours. Generator authoring and its independent tests are
separate tasks. No implementation task includes audit, committing, pushing or archiving.

- [x] 1.1 Add calculator operation/key/candidate types to the inline display in
  `src/lib/types.ts`. Split `Display`'s single diagram arm into two `kind: 'diagram'` members on
  the pattern of the existing `story` and `math` arms, and put the formula-selection discriminant
  on the geometry member so it cannot reach a shaded shape. Narrow `Of<'diagram'>` where
  `ProblemView` now receives a union. Do not add a display kind, input mode, persisted field, or
  duplicate formula measurement/index.
- [x] 1.2 Add the geometry measurement/correct-member/distractor helper in
  `src/lib/geometry-diagram.ts` using the operation and Pythagorean missing-side role from
  design.md. Keep `geometryFormulaReferences` and all existing pairs unchanged. Test every
  supported mapping independently, both side variants, and rejection of excluded operations.
- [x] 1.3 Extend `src/curriculum/generators.test.ts` with independent calculator key evaluation,
  visible-text reconstruction, all-candidate target checks and form/keypad checks. Put calculator
  dispatch before generic inline handling in both `recompute` and `sourceMagnitude`.
  Add malformed-key, changed-text, changed-target, duplicate-target and wrong-answer fixtures.
- [x] 1.4 Add independent formula-selection verification before generic math/diagram handling
  in `recompute` and `sourceMagnitude`. Reuse independent figure/reference reconstruction;
  derive measurement and correct member with an independent operation/variant oracle.
  Measure correct-formula node count. Test wrong prompt, side-role disagreement, changed label,
  ambiguous choices, excluded figures and wrong answers; retain numeric geometry rejection
  when the formula-selection declaration is absent.
- [x] 1.5 Extend `formatDisplay` in `src/curriculum/recorded-output.ts` to record all calculator
  operation data and the formula-selection declaration, retaining full geometry recording.
  Add focused record fixtures for each new arm. `RENDERED_KEYS` remains the top-level key guard.

## 2. Existing answer surfaces

- [x] 2.1 Extend `src/components/ProblemView.tsx` so formula-selection diagrams and calculator
  sequence-choice displays use the existing choice-owned answer-frame policy. Omit the entire
  trailing numeric equality/frame for these cases; preserve ordinary inline and diagram modes,
  geometry keypad entry and read-only behavior. No MathView or new renderer is needed.
- [x] 2.2 Add static component regressions for both new choice combinations, numeric calculator
  and geometry frames, unchanged ordinary displays, and read-only examples. Assert preserved
  figure/formula accessible names and absence of an empty entry frame in choice exercises.

- [x] 2.3 Repair `src/components/Keypad.tsx` so fraction and decimal permission exposes both
  keys, using the empty bottom-left cell for the decimal point where available. When a sign
  or mixed space occupies it, reduce Backspace to row 1, column 4 and place the decimal point
  in row 2, column 4, keeping the grid at four rows with full-size targets. Preserve digit
  positions, Check's box, Backspace's origin, single-form layouts, implied fraction permission
  and entry/answer rules. Replace
  the regression that requires hiding the decimal key; cover both-form pads with and without
  a sign or mixed space in `Keypad.test.tsx`, plus actual Unit 9 and Unit 22 declarations.
  Run the keypad component and entry suites before and after the fix.

## 3. Unit 22 content

- [x] 3.1 Create `src/curriculum/unit-22-test-preparation.ts` and its two pools through direct
  Unit 0–21 imports: Units 0–11, 20 and 21 quantitative; Units 12–19 algebraic. Explain the
  import direction. Add the pool partition/registration/no-Unit-22 test in the new unit test file.
- [x] 3.2 Write `calculator-skills` with all three operations, a teaching line, bounded key
  formatting and exact arithmetic. Use the bounded templates and operand bands in design.md;
  cite the TI-30XS MultiView guide for the supported key legend and toggle behavior.
  Predict the valid sign/subtraction and parentheses alternatives; keep every operand at
  least 2, which is what rules out a prediction equal to its answer, and keep every inline
  display and candidate label at most 18 characters.
- [x] 3.3 Write independent `calculator-skills` tests across all difficulty bands: all operations
  appear, keys and candidates recompute, unique target choice holds, numeric/form/keypad rules
  agree, intended diagnoses survive, content limits pass, width stays bounded and operand
  magnitude grows. Verify both accepted forms and right-value wrong-form responses.
- [x] 3.4 Write `formula-sheet` with its teaching line and single figure-to-formula question.
  Reuse valid difficulty-1 diagrams from Unit 20 source generators, existing reference pairs
  and the semantic helper. Use bounded rejection for excluded operations and the five
  notation-node bands in design.md. Offer the two existing labels and diagnose the other
  measurement. Do not copy draw builders or source numeric answers.
- [x] 3.5 Write independent `formula-sheet` tests: all included operations and both Pythagorean
  side roles are reachable, no excluded figure appears, exactly one formula matches,
  notation/labels/order match unchanged Unit 20 references, prompts and diagnoses agree,
  every band has eligible draws, more than twenty distinct displays appear and mean formula
  node count grows from difficulty 1 to 5.
- [x] 3.6 Write `review-quantitative` as a plain generator with its teaching line, seeded uniform
  pool selection, unchanged difficulty and unchanged source problem identity. Select the source
  before difficulty is used, so one seed holds the source still across difficulties. Explain why
  `defineSkill` cannot be used for delegation. A hand-built generator object still faces the
  name/blurb check in `coverage.test.ts:178-188`, so match the manifest entry exactly.
- [x] 3.7 Write independent `review-quantitative` tests for pool membership, same-seed equality
  with the selected source, difficulty passthrough, and paired difficulty growth holding the seed
  and varying difficulty. Assert one seed selects the same source at difficulty 1 and 5. Use
  controlled seeds to demonstrate multiple reachable sources and permitted repeated sources.
- [x] 3.8 Write `review-algebraic` with the same delegation contract and its own teaching line,
  using its algebraic pool and the existing RNG, under the same name/blurb and seed rules.
- [x] 3.9 Write independent `review-algebraic` tests for source equality, membership, difficulty
  passthrough and paired growth, reproducibility, multiple reachable sources and permitted repeats.

## 4. Source-aware gates and teaching examples

- [x] 4.1 Make inline width measurements in `coverage.test.ts` group samples by source
  `problem.skillId`, keeping exactly the existing reading exceptions. Add a synthetic test
  that an over-wide delegated arithmetic display fails while delegated reading keeps its
  existing policy. Do not exempt review or calculator ids, or change equation-width coverage.
- [x] 4.2 Create explicit exclusion sets containing only the two review ids for two aggregate
  measurements in `generators.test.ts`: the `alwaysFiltered` diagnostic and the unpaired
  `scalingProblems` ladder. Explain thin per-source collision sampling for the first and
  differing per-difficulty seeds comparing two source mixes for the second, assert both sets are
  closed, and preserve both measurements in full for every pool member under its own id. Leave
  all per-problem content, correctness and other generator checks active for the reviews.
- [x] 4.3 Add the Unit 22 recorded-output harness using `sample(generator).toMatchSnapshot()`
  for each of the four generators, plus `unrenderedKeys` coverage. Snapshot all calculator
  operations, formula choice variants and representative delegated output; use focused
  deterministic samples where the standard sample omits a variant.
- [x] 4.4 Check all four teaching lines and seed-1/difficulty-1 worked examples against the
  `skill-intros` delta. Add static automatic/review intro tests with read-only displays, worked
  answers and steps, covering the calculator sequence, the formula figure with both references
  and choice labels, and a delegated review example rendered in its source's representation.
  Assert each review's example equals its representative source draw, carries the source's
  identity, and appears beside the review teaching line, and that no source progress changes.
- [x] 4.5 Add pure session regression cases for each mixed review: slots retain the review
  generator as owner, misses requeue the exact source problem object, and unseen slots use
  adjusted difficulty. Keep DOM interaction and actual progress credit for the browser gate.

## 5. Registration and current authorities

- [x] 5.1 Register the four generators in `src/curriculum/index.ts` in manifest order.
  Update Stage H's `requires` and rationale in `manifest/stage-h.ts` to inherited content
  needs plus retained `timed`; preserve ids, memberships, prerequisites, pacing and
  `AVAILABLE_CAPABILITIES`.
- [x] 5.2 Add capability evidence in `coverage.test.ts` by deterministic sampling of every
  pool source and both newly authored generators. Map inputs, displays, embedded notation and
  fraction keypad declarations as design.md specifies. Record a witness per observed
  capability and prove observed content union `timed` equals Stage H's declared set.
  Do not infer timed behavior from these untimed samples.
- [x] 5.3 Mark curriculum rows 22.1–22.4 complete and update its Stage H build-order prose.
  Also update the two status prose spots this change falsifies at `docs/curriculum.md:570-571`
  ("6 of 201 skills are planned") and `:578-579` ("All 195 playable skills through Stage G carry
  authored intro lines"). Update coverage counts, Stage H generator/planned/tree assertions,
  exact teaching-line stage/unit coverage and stale test titles/comments: the `195` assertions at
  `coverage.test.ts:84, 462, 528, 637, 676, 677` and `:751`; `:674`, whose `stageH?.requires`
  equals `['timed']` until task 5.1 widens it; the whole of `:774-808`, which pins the course to
  seven stages and twenty-two units ending at `unit-21` under a title naming twenty-one; and the
  stale texts at `:191` ("through Stage G"), `:640` ("leaving only Stage H planned"), `:703`
  ("all 195 generators") and `:749` ("the other 6 skills"). Preserve six manifest members, 201 total ids, all Stage G
  assertions and the document/manifest cross-check; only two skills remain planned.
- [x] 5.4 Update README playable/intro coverage and Stage H status prose, and roadmap status
  including the statement around lines 64–65 that all Stage H skills are planned. Record
  30a as shipped after implementation, state 199 playable skills, retain Stage G completion,
  and leave item 30 unchecked for 30b. Reconcile the general generated-answer explanation
  with symbolic references and delegation without weakening numeric answer derivation.
- [x] 5.5 Re-express the two existing fixtures that assumed a block nobody can play, changing no
  application code. In `src/lib/skip.test.ts`, repoint the `!unit` guard case at `:107` to an
  unknown id, keep the `'not-a-block'` misses, and replace the planned-block cases at `:85`
  (`playableBlockSkills`), `:146` (`selectCheckSkills`) and `:345-352` (`markKnown`) with the
  partly built unit: `playableBlockSkills` returns the four course ids rather than the manifest's
  six, `selectCheckSkills` fills its eight from those four, and `markKnown` on `unit-22` and
  `stage-h` raises exactly those four while both timed forms stay planned, locked and absent from
  the record. In `src/components/StageList.test.tsx`, update the button count and order chain for
  eight stages and delete the omission case rather than re-staging it on a trimmed `course` prop,
  following the precedent and reasoning already recorded at `src/components/UnitList.test.tsx:38-46`;
  name `manifest/resolve.test.ts:285-288` and `coverage.test.ts:774-808`
  ("no stage or unit that has nothing to play") as where that rule is tested.
  Update the now-false file-header comments at `StageList.test.tsx:4` and `skip.test.ts:9,47`.

## 6. Verification

- [x] 6.1 Run `npm test`, update only expected snapshots, and read the new recorded output and
  intro cases. First align the stale rewind assertions in `scripts/validate-roadmap-skills.mjs`
  and the `prepare-roadmap` adapters in `.agents/skills` and `.pi/skills` with the run's recorded
  forward-only contract. Preserve every other workflow gate. Confirm existing Unit 20
  reference/renderer snapshots remain unchanged except
  any specifically justified new fixtures.
- [x] 6.2 Run `npm run build` and `npm run lint`. The build must include `tsc -b`; standalone
  `tsc --noEmit` is not the type gate.
- [x] 6.3 Script real-app browser validation per `docs/environment.md`, using isolated local
  progress. Play all four skills to completion; cover all calculator operations, both answer
  forms, the wrong-form response followed by successful completion of the unchanged requeued
  problem, and both Pythagorean missing-side formula choices using
  reproducible fixtures/seeds. Confirm each review credits its own attempts/mastery/completion
  and leaves source skill records unchanged. Verify intro opening/start does not count as an
  answer, missed review problems return unchanged, source draws belong to the right pools,
  Stage H offers four cards, and no lesson has a timer or form score. Check that Unit 22's
  "I already know this" offer and a Stage H fresh start raise only the four playable skills and
  leave both timed forms locked. At 375 by 812 pixels, open all four Stage H intros — including
  a mixed-review intro showing its delegated example — and confirm each keeps its teaching line on
  screen with no horizontal or page overflow, and both action buttons measured inside the 812-pixel
  viewport rather than merely present in the markup. The delegated example is taller than the
  surface: confirm its display, correct answer and every worked step stay reachable through the
  worked-example scroll region already in `SkillIntro.tsx`, which this change does not modify. At 375 pixels,
  check longest calculator sequences and formula labels, complete feedback, keyboard choice
  operation and no horizontal overflow. Capture and inspect screenshots of the calculator
  and formula layouts after a green run and describe what they show. Source diversity in
  any one random lesson is not a pass condition.
  Exercise both Unit 9 conversion directions with the actual pad: requested-form acceptance,
  other-form feedback, both keys visible and no horizontal overflow. Measure fixed digit
  positions and usable key targets against the corresponding single-form pad. For synthetic
  both-form declarations with a sign or mixed space, mount the real `Keypad` with the app
  stylesheet in the scratch browser harness, without adding an application route or generator.
  Check both keys' handlers, unchanged digit/Check boxes, Backspace's origin and 64-pixel height,
  and horizontal and vertical viewport containment at 375 by 812. Capture the decimal-form calculator pad
  with both form keys visible as well as the calculator and formula layouts.
