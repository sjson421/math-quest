## Why

Stage D ends with `ratio-words`, the remaining planned skill in Unit 11 and the first
unchecked increment on the roadmap. The learner has practised writing ratios and now needs
to identify whether adult-context prose asks for a part-to-part or part-to-whole comparison.

## What Changes

- Add the `ratio-words` generator for Stage D, Unit 11.7, using fixed authored story frames
  and exact fraction-form answers.
- Carry both category counts and the requested comparison in structured ratio data so the
  visible story and answer can be independently reconstructed.
- Diagnose the wall's two required comprehension errors: choosing the other comparison type
  and reversing the requested order.
- Source-check every ratio story frame, add focused generator and verifier coverage, record
  representative output, and update playable curriculum and roadmap status.
- Add no rendering, input, answer, or other product capability; the existing story display,
  fraction keypad, and exact rational answers are sufficient.

### Non-goals

- Do not add colon-form ratio entry or a new ratio answer type.
- Do not change prerequisite, mastery, lesson, progress, or sync behavior.
- Do not implement any Stage E skill or roadmap item 20 capability work.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-11-ratios-proportions`: Make `ratio-words` playable and define its two comparison
  modes, exact answer contract, difficulty ladder, and wall diagnostics.
- `word-problem-phrasing`: Add authored, seeded, source-checked ratio story frames whose
  structured quantities distinguish part-to-part from part-to-whole questions.

## Impact

The change affects the Unit 11 generator and tests, ratio display metadata and exhaustive
verification/recording switches, the phrasing-bank registry and tests, and the curriculum,
README, and roadmap status documents. It adds no dependency and requires no stored-data
migration.
