## Why

Stage H has six planned skills and no playable content. Roadmap increment 30a opens Unit 22
with calculator practice, formula-sheet practice, and two mixed reviews, using the lesson
and display capabilities already built.

## What Changes

- Add `calculator-skills`, `formula-sheet`, `review-quantitative`, and `review-algebraic`
  in manifest order. These four lessons remain untimed; the full-length forms belong to 30b.
- Repair the shared numeric keypad so permitted fraction and decimal forms both have usable
  keys, including the existing Unit 9 conversion pair. Preserve digit positions and entry rules.
- Teach TI-30XS key sequences through text, choices, and the numeric keypad. Cover negation
  versus subtraction, parentheses, and exact/decimal answer form. Bound inline displays to
  18 characters; carry typed keys so verification can rebuild the sequence and result.
- Teach formula selection using a labelled geometry figure and its existing pair of structured
  formula references. Learners choose a formula by its existing accessible label. Add
  measurement and correct-member metadata beside the existing references, including both
  Pythagorean missing-side variants. Keep the reference pairs unchanged.
- Use one formula-question shape. Vary valid figure dimensions for display variety and
  formula complexity for difficulty. Exclude similar figures and composite area, whose
  reference pairs do not offer a single distinct formula for the requested measurement.
- Extend existing answer-frame handling for formula-choice diagrams and calculator sequence
  choices. Their choice buttons own the answer; no empty numeric equality appears beside them.
  These are narrow integrations of built displays and input modes, not new capabilities.
- Make each mixed review a delegating generator used by the standard lesson loop. Quantitative
  review samples Units 0–11, 20 and 21; algebraic review samples Units 12–19. This pool split is
  a proposal decision informed by the curriculum coverage table. Draw uniformly with replacement,
  keep each problem's source identity, and credit attempts and completion to the review skill.
- Keep width checks over delegated displays under their source identity. Exclude the two
  review generators from exactly two aggregate measurements — the always-filtered misconception
  diagnostic, and the unpaired difficulty ladder, which they replace with a paired same-seed
  measurement. Every source still receives both in full under its own id, and every other
  content, correctness and layout gate remains.
- Add teaching lines, stable worked examples, independent checks, and recorded-output snapshots
  for all four skills. A review intro shows one representative source problem, in that source's
  own practice representation, beside the review's teaching line.
- Declare Stage H's inherited content capabilities plus its retained `timed` requirement.
  Update curriculum completion and documentation to 199 of 201 playable skills. Preserve Stage G
  completion and keep roadmap item 30 open until its two timed forms ship.

## Capabilities

### New Capabilities

- `unit-22-test-preparation`: Four untimed preparation skills, mixed-review pools and credit,
  teaching examples, and the boundary before full-length forms.

### Modified Capabilities

- `problem-generation`: Typed calculator verification, symbolic formula selection, delegation,
  source-aware gate coverage, and the explicit geometry-choice answer contract.
- `diagram-rendering`: Formula-choice figures retain accessible formulas and fit with choice
  controls at 375 pixels without a numeric answer frame.
- `curriculum-manifest`: Stage H's inherited requirements and four playable skills; replacement
  of obsolete total-count requirements while retaining Stage G completion.
- `skill-intros`: Stage H's four intros, including a mixed review whose stable example is a
  delegated source's problem in that source's own representation.

## Impact

Application work is limited to the new Unit 22 module, existing geometry metadata, problem data
types, the two answer-frame integrations in `ProblemView`, the shared `Keypad` key visibility
fix, registration, and Stage H's capability declaration. Verification touches the generator, coverage, recorded-output, component and Unit 22
tests, plus curriculum and status documentation. The run's already-recorded forward-only
workflow amendment also requires aligning the roadmap validator and the Codex/Pi preparation
adapters with the shared contract before the full test gate can pass.

Opening Stage H also makes Unit 22 the first partly built unit inside the playable course tree,
which two existing test files must be re-expressed for. `src/lib/skip.test.ts` currently uses
`unit-22` and `stage-h` as the block nobody can play, and `src/components/StageList.test.tsx`
counts seven stages and asserts exactly one stage is missing from the tree. Both are re-expressed
against the new reality; no skip-ahead or navigation behavior changes, and no coverage is dropped.

Through unchanged skip-ahead rules, Unit 22 becomes a unit that can be marked known and Stage H
becomes a fresh-start stage. Marking either raises only the four playable skills and leaves both
timed forms planned and locked, which is the existing contract rather than a new behavior.

No runtime service, dependency, persisted-progress field, API, or sync format changes. No new
manifest capability, display kind, renderer, or answer control is required.

## Non-goals

A calculator emulator, a full browsable formula sheet, formula-only identification questions,
new geometry drawings, timed practice forms, score-estimator changes, review scheduling,
skip-ahead changes, and a second lesson mode are outside this increment.
